namespace RestRoutes.Services.FieldExtraction;

using System.Text.Json;

public class UserPickerFieldExtractor : IFieldExtractor
{
    public bool CanExtract(JsonElement element)
    {
        if (element.ValueKind != JsonValueKind.Object) return false;

        var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
        if (dict == null) return false;

        // UserPickerField: { "UserIds": [...], "UserNames": [...] }
        return ((dict.ContainsKey("UserIds") || dict.ContainsKey("userIds")) &&
                (dict.ContainsKey("UserNames") || dict.ContainsKey("userNames")));
    }

    public (object? value, bool isIdReference) Extract(JsonElement element, FieldExtractionContext context)
    {
        var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
        if (dict == null) return (null, false);

        var userIdsKey = dict.ContainsKey("UserIds") ? "UserIds" : "userIds";
        var userNamesKey = dict.ContainsKey("UserNames") ? "UserNames" : "userNames";

        if (!dict.ContainsKey(userIdsKey) || !dict.ContainsKey(userNamesKey))
        {
            return (null, false);
        }

        var userIds = dict[userIdsKey];
        var userNames = dict[userNamesKey];

        if (userIds.ValueKind != JsonValueKind.Array || userNames.ValueKind != JsonValueKind.Array)
        {
            return (null, false);
        }

        var idsList = userIds.EnumerateArray()
            .Where(x => x.ValueKind == JsonValueKind.String)
            .Select(x => x.GetString())
            .Where(x => x != null)
            .ToList();

        var namesList = userNames.EnumerateArray()
            .Where(x => x.ValueKind == JsonValueKind.String)
            .Select(x => x.GetString())
            .Where(x => x != null)
            .ToList();

        // Zip the IDs and usernames together into an array of objects
        var users = new List<Dictionary<string, object>>();
        for (int i = 0; i < Math.Min(idsList.Count, namesList.Count); i++)
        {
            var user = new Dictionary<string, object>
            {
                ["id"] = idsList[i]!,
                ["username"] = namesList[i]!
            };

            // Enrich with data from usersDictionary if available
            if (context.UsersDictionary != null && context.UsersDictionary.TryGetValue(idsList[i]!, out var userData))
            {
                if (userData.TryGetProperty("Email", out var email) && email.ValueKind == JsonValueKind.String)
                {
                    var emailStr = email.GetString();
                    if (emailStr != null) user["email"] = emailStr;
                }

                if (userData.TryGetProperty("PhoneNumber", out var phone) && phone.ValueKind == JsonValueKind.String)
                {
                    var phoneStr = phone.GetString();
                    if (phoneStr != null) user["phone"] = phoneStr;
                }

                // Handle UserProfile ContentItem FIRST (before Properties, since it might be in Properties)
                // Check both top-level and in Properties
                JsonElement? userProfileElement = null;
                if (userData.TryGetProperty("UserProfile", out var userProfile) && userProfile.ValueKind == JsonValueKind.Object)
                {
                    userProfileElement = userProfile;
                }
                else if (userData.TryGetProperty("Properties", out var propsCheck) &&
                         propsCheck.ValueKind == JsonValueKind.Object)
                {
                    var propsDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(propsCheck.GetRawText());
                    if (propsDict != null && propsDict.TryGetValue("UserProfile", out var userProfileFromProps) &&
                        userProfileFromProps.ValueKind == JsonValueKind.Object)
                    {
                        userProfileElement = userProfileFromProps;
                    }
                }

                if (userProfileElement.HasValue && context.CleanUserProfileForUserFunc != null)
                {
                    var userProfileDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(userProfileElement.Value.GetRawText());
                    if (userProfileDict != null)
                    {
                        // Check if it's a ContentItem (has ContentItemId)
                        if (userProfileDict.ContainsKey("ContentItemId"))
                        {
                            // For UserProfile in User context, only get contact information, no relations
                            var cleanedUserProfile = context.CleanUserProfileForUserFunc(userProfileDict, context.UsersDictionary);
                            if (context.RemoveMetadataFieldsFunc != null)
                            {
                                cleanedUserProfile = context.RemoveMetadataFieldsFunc(cleanedUserProfile);
                            }
                            user["userProfile"] = cleanedUserProfile;
                        }
                        else
                        {
                            // Not a ContentItem, just add as-is but clean metadata
                            var userProfileMetadataObj = JsonSerializer.Deserialize<Dictionary<string, object>>(userProfileElement.Value.GetRawText());
                            if (userProfileMetadataObj != null && context.RemoveMetadataFieldsFunc != null)
                            {
                                user["userProfile"] = context.RemoveMetadataFieldsFunc(userProfileMetadataObj);
                            }
                        }
                    }
                }

                // Spread Properties object (contains firstName, lastName, etc.)
                // Skip UserProfile if it was already handled above
                if (userData.TryGetProperty("Properties", out var props) && props.ValueKind == JsonValueKind.Object)
                {
                    foreach (var prop in props.EnumerateObject())
                    {
                        // Convert property name to camelCase (FirstName -> firstName)
                        var propName = context.ToCamelCaseFunc != null
                            ? context.ToCamelCaseFunc(prop.Name)
                            : char.ToLower(prop.Name[0]) + prop.Name.Substring(1);

                        // Skip UserProfile if it's in Properties (it was already handled above)
                        if (propName.Equals("userProfile", StringComparison.OrdinalIgnoreCase) ||
                            prop.Name.Equals("UserProfile", StringComparison.OrdinalIgnoreCase))
                            continue;

                        if (prop.Value.ValueKind == JsonValueKind.String)
                        {
                            var propValue = prop.Value.GetString();
                            if (propValue != null) user[propName] = propValue;
                        }
                        else if (prop.Value.ValueKind != JsonValueKind.Null)
                        {
                            // Handle non-string property values
                            var deserializedValue = JsonSerializer.Deserialize<object>(prop.Value.GetRawText());
                            if (deserializedValue != null)
                            {
                                user[propName] = deserializedValue;
                            }
                        }
                    }
                }
            }

            // Remove metadata from user object before adding
            if (context.RemoveMetadataFieldsFunc != null)
            {
                user = context.RemoveMetadataFieldsFunc(user);
            }

            // Extra safety: explicitly clean userProfile if it exists
            if (user.TryGetValue("userProfile", out var userProfileValue) &&
                userProfileValue is Dictionary<string, object> userProfileObj)
            {
                // Remove recipes field completely - not relevant for User contact info
                if (userProfileObj.ContainsKey("recipes"))
                {
                    userProfileObj.Remove("recipes");
                }
                if (context.RemoveMetadataFieldsFunc != null)
                {
                    user["userProfile"] = context.RemoveMetadataFieldsFunc(userProfileObj);
                }
            }

            users.Add(user);
        }

        // If only one user, return as object (singular relation), otherwise return array
        if (users.Count == 1)
        {
            return (users[0], false);
        }
        return (users, false);
    }
}

