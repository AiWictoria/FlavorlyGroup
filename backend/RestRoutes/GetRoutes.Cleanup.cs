namespace RestRoutes;

using System.Text.Json;
using RestRoutes.Services.ContentCleaning;
using RestRoutes.Services.FieldExtraction;

public static partial class GetRoutes
{
    private static readonly HashSet<string> OC_METADATA_FIELDS = new(StringComparer.OrdinalIgnoreCase)
    {
        "ContentItemId",
        "ContentItemVersionId",
        "ContentType",
        "DisplayText",
        "Latest",
        "Published",
        "ModifiedUtc",
        "PublishedUtc",
        "CreatedUtc",
        "Owner",
        "Author",
        "TitlePart",
        "TermPart",
        "@WeldedPartSettings",
        // Also include camelCase versions
        "contentItemId",
        "contentItemVersionId",
        "contentType",
        "displayText",
        "latest",
        "published",
        "modifiedUtc",
        "publishedUtc",
        "createdUtc",
        "owner",
        "author",
        "titlePart",
        "termPart"
    };

    private static Dictionary<string, object> CleanObject(
        Dictionary<string, JsonElement> obj,
        string contentType,
        Dictionary<string, JsonElement>? usersDictionary = null)
    {
        var factory = new ContentTypeCleanerFactory();
        var cleaner = factory.GetCleaner(contentType);
        var context = new ContentCleaningContext
        {
            UsersDictionary = usersDictionary,
            CleanObjectFunc = (o, ct) => CleanObject(o, ct, usersDictionary),
            CleanUserProfileForUserFunc = CleanUserProfileForUser,
            RemoveMetadataFieldsFunc = RemoveMetadataFields,
            ToCamelCaseFunc = ToCamelCase
        };
        return cleaner.Clean(obj, contentType, context);
    }

    // Helper to clean UserProfile for User context - only contact information, no relations
    private static Dictionary<string, object> CleanUserProfileForUser(
        Dictionary<string, JsonElement> obj,
        Dictionary<string, JsonElement>? usersDictionary = null)
    {
        var clean = new Dictionary<string, object>();

        // Get basic fields
        if (obj.TryGetValue("ContentItemId", out var id))
            clean["id"] = id.GetString()!;

        if (obj.TryGetValue("DisplayText", out var title))
            clean["title"] = title.GetString()!;

        // Get UserProfilePart fields (contact information only)
        if (obj.TryGetValue("UserProfile", out var userProfilePart) && userProfilePart.ValueKind == JsonValueKind.Object)
        {
            var userProfileDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(userProfilePart.GetRawText());
            if (userProfileDict != null)
            {
                foreach (var kvp in userProfileDict)
                {
                    var fieldName = ToCamelCase(kvp.Key);
                    var value = kvp.Value;

                    // Skip ContentPickerField for Recipes completely - not relevant for User contact info
                    if (fieldName.Equals("recipes", StringComparison.OrdinalIgnoreCase) ||
                        fieldName.Equals("Recipes", StringComparison.OrdinalIgnoreCase))
                    {
                        // Don't include recipes at all in UserProfile when used in User context
                        continue;
                    }

                    // Handle MediaField (Avatar) - extract first path
                    if (fieldName.Equals("avatar", StringComparison.OrdinalIgnoreCase) && value.ValueKind == JsonValueKind.Object)
                    {
                        var mediaDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(value.GetRawText());
                        if (mediaDict != null && mediaDict.TryGetValue("Paths", out var paths) &&
                            paths.ValueKind == JsonValueKind.Array)
                        {
                            var pathsArray = paths.EnumerateArray()
                                .Where(x => x.ValueKind == JsonValueKind.String)
                                .Select(x => x.GetString())
                                .Where(x => x != null)
                                .ToList();

                            if (pathsArray.Count > 0)
                            {
                                clean["avatar"] = pathsArray[0]!;
                            }
                        }
                        continue;
                    }

                    // Handle TextField (firstname, lastName, street, zipCode, city)
                    if (value.ValueKind == JsonValueKind.Object)
                    {
                        var textDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(value.GetRawText());
                        if (textDict != null && textDict.TryGetValue("Text", out var textValue) &&
                            textValue.ValueKind == JsonValueKind.String)
                        {
                            var textStr = textValue.GetString();
                            if (textStr != null)
                            {
                                clean[fieldName] = textStr;
                            }
                        }
                    }
                }
            }
        }

        return clean;
    }

    // Helper to remove OC metadata fields from nested objects
    private static Dictionary<string, object> RemoveMetadataFields(Dictionary<string, object> obj)
    {
        var cleaned = new Dictionary<string, object>();
        foreach (var kvp in obj)
        {
            // Skip OC metadata fields
            if (OC_METADATA_FIELDS.Contains(kvp.Key))
                continue;

            // Recursively clean nested objects
            if (kvp.Value is Dictionary<string, object> nestedDict)
            {
                cleaned[kvp.Key] = RemoveMetadataFields(nestedDict);
            }
            // Recursively clean arrays of objects
            else if (kvp.Value is List<object> list)
            {
                var cleanedList = new List<object>();
                foreach (var item in list)
                {
                    if (item is Dictionary<string, object> itemDict)
                    {
                        cleanedList.Add(RemoveMetadataFields(itemDict));
                    }
                    else
                    {
                        cleanedList.Add(item);
                    }
                }
                cleaned[kvp.Key] = cleanedList;
            }
            else
            {
                cleaned[kvp.Key] = kvp.Value;
            }
        }
        return cleaned;
    }

    private static FieldExtractionContext CreateFieldExtractionContext(Dictionary<string, JsonElement>? usersDictionary)
    {
        return new FieldExtractionContext
        {
            UsersDictionary = usersDictionary,
            CleanObjectFunc = (obj, contentType) => CleanObject(obj, contentType, usersDictionary),
            CleanUserProfileForUserFunc = CleanUserProfileForUser,
            RemoveMetadataFieldsFunc = RemoveMetadataFields,
            ToCamelCaseFunc = ToCamelCase
        };
    }

    private static string ToCamelCase(string str)
    {
        if (string.IsNullOrEmpty(str) || char.IsLower(str[0]))
            return str;
        return char.ToLower(str[0]) + str.Substring(1);
    }
}
