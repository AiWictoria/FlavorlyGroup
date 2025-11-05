namespace RestRoutes.Services.ContentMutation;

using OrchardCore.ContentManagement;
using System.Text.Json;
using RestRoutes.Constants;

public class ContentMutationService
{
    public void ApplyFieldsToContentItem(
        ContentItem contentItem,
        string contentType,
        Dictionary<string, object> body)
    {
        // Build content directly into the content item
        foreach (var kvp in body)
        {
            // Skip all reserved fields
            if (ReservedFields.Fields.Contains(kvp.Key))
                continue;

            var value = kvp.Value;

            // Handle "items" field - this should become BagPart or Items
            if (kvp.Key == "items" && value is JsonElement itemsElement && itemsElement.ValueKind == JsonValueKind.Array)
            {
                var bagPart = BagPartBuilder.BuildBagPart(itemsElement);
                if (bagPart.Count > 0)
                {
                    // Use "Items" for ShoppingList, Order, etc. (as seen in raw data structure)
                    // Also set "BagPart" for compatibility
                    contentItem.Content["Items"] = bagPart;
                    contentItem.Content["BagPart"] = bagPart;
                }
                continue;
            }

            // Handle "user" field - map to Part.User.UserIds
            // Accept both "user" (object with id) and "userId" (string) for backward compatibility
            if (kvp.Key.Equals("user", StringComparison.OrdinalIgnoreCase) ||
                kvp.Key.Equals("userId", StringComparison.OrdinalIgnoreCase))
            {
                var partName = contentType + "Part";
                var userIds = new List<string>();

                // Handle "user" object: { id: "...", username: "..." }
                if (kvp.Key.Equals("user", StringComparison.OrdinalIgnoreCase))
                {
                    string? extractedUserId = null;

                    // Handle Dictionary<string, object> (from ASP.NET Core JSON binding)
                    if (value is Dictionary<string, object> userDict)
                    {
                        if (userDict.TryGetValue("id", out var idObj))
                        {
                            extractedUserId = idObj?.ToString();
                        }
                    }
                    // Handle JsonElement (most common case from ASP.NET Core JSON binding)
                    else if (value is JsonElement jsonEl)
                    {
                        if (jsonEl.ValueKind == JsonValueKind.Object)
                        {
                            if (jsonEl.TryGetProperty("id", out var idProp) && idProp.ValueKind == JsonValueKind.String)
                            {
                                extractedUserId = idProp.GetString();
                            }
                        }
                    }
                    // Handle JsonObject
                    else if (value is System.Text.Json.Nodes.JsonObject jsonObj)
                    {
                        if (jsonObj.TryGetPropertyValue("id", out var idNode) && idNode != null)
                        {
                            extractedUserId = idNode.ToString();
                        }
                    }

                    // Fallback: Try to serialize and deserialize as JSON (handles any other type)
                    if (string.IsNullOrEmpty(extractedUserId))
                    {
                        try
                        {
                            var jsonString = JsonSerializer.Serialize(value);
                            using var doc = JsonDocument.Parse(jsonString);
                            var userObj = doc.RootElement;
                            if (userObj.ValueKind == JsonValueKind.Object &&
                                userObj.TryGetProperty("id", out var idProp) && idProp.ValueKind == JsonValueKind.String)
                            {
                                extractedUserId = idProp.GetString();
                            }
                        }
                        catch
                        {
                            // If serialization fails, skip
                        }
                    }

                    if (!string.IsNullOrEmpty(extractedUserId))
                    {
                        userIds.Add(extractedUserId);
                    }
                }
                // Handle "userId" string or array
                else if (kvp.Key.Equals("userId", StringComparison.OrdinalIgnoreCase))
                {
                    if (value is JsonElement jsonEl)
                    {
                        if (jsonEl.ValueKind == JsonValueKind.String)
                        {
                            var idValue = jsonEl.GetString();
                            if (idValue != null) userIds.Add(idValue);
                        }
                        else if (jsonEl.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var item in jsonEl.EnumerateArray())
                            {
                                if (item.ValueKind == JsonValueKind.String)
                                {
                                    var idValue = item.GetString();
                                    if (idValue != null) userIds.Add(idValue);
                                }
                            }
                        }
                    }
                    else if (value is string strValue)
                    {
                        userIds.Add(strValue);
                    }
                }

                if (userIds.Count > 0)
                {
                    // UserPickerField requires both UserIds and UserNames
                    // Extract usernames if provided in user object
                    var userNames = new List<string>();

                    if (kvp.Key.Equals("user", StringComparison.OrdinalIgnoreCase))
                    {
                        string? extractedUsername = null;

                        // Handle Dictionary<string, object> (from ASP.NET Core JSON binding)
                        if (value is Dictionary<string, object> userDict)
                        {
                            if (userDict.TryGetValue("username", out var usernameObj))
                            {
                                extractedUsername = usernameObj?.ToString();
                            }
                        }
                        // Handle JsonElement (most common case from ASP.NET Core JSON binding)
                        else if (value is JsonElement jsonEl)
                        {
                            if (jsonEl.ValueKind == JsonValueKind.Object)
                            {
                                if (jsonEl.TryGetProperty("username", out var usernameProp) &&
                                    usernameProp.ValueKind == JsonValueKind.String)
                                {
                                    extractedUsername = usernameProp.GetString();
                                }
                            }
                            // If user is an array, extract usernames from each object
                            else if (jsonEl.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var userItem in jsonEl.EnumerateArray())
                                {
                                    if (userItem.ValueKind == JsonValueKind.Object &&
                                        userItem.TryGetProperty("username", out var usernameProp) &&
                                        usernameProp.ValueKind == JsonValueKind.String)
                                    {
                                        var username = usernameProp.GetString();
                                        if (username != null)
                                        {
                                            userNames.Add(username);
                                        }
                                    }
                                }
                            }
                        }
                        // Handle JsonObject
                        else if (value is System.Text.Json.Nodes.JsonObject jsonObj)
                        {
                            if (jsonObj.TryGetPropertyValue("username", out var usernameNode) && usernameNode != null)
                            {
                                extractedUsername = usernameNode.ToString();
                            }
                        }

                        // Fallback: Try to serialize and deserialize as JSON (handles any other type)
                        if (string.IsNullOrEmpty(extractedUsername) && userNames.Count == 0)
                        {
                            try
                            {
                                var jsonString = JsonSerializer.Serialize(value);
                                using var doc = JsonDocument.Parse(jsonString);
                                var userObj = doc.RootElement;
                                if (userObj.ValueKind == JsonValueKind.Object &&
                                    userObj.TryGetProperty("username", out var usernameProp) &&
                                    usernameProp.ValueKind == JsonValueKind.String)
                                {
                                    extractedUsername = usernameProp.GetString();
                                }
                            }
                            catch
                            {
                                // If serialization fails, skip
                            }
                        }

                        if (!string.IsNullOrEmpty(extractedUsername))
                        {
                            userNames.Add(extractedUsername);
                        }
                    }

                    // If we don't have usernames but have userIds, create empty usernames array
                    // (UserPickerField requires both, but usernames can be empty if not provided)
                    while (userNames.Count < userIds.Count)
                    {
                        userNames.Add(string.Empty);
                    }

                    // UserPickerField format: { UserIds: [...], UserNames: [...] }
                    // Create the User field structure
                    // Orchard Core UserPickerField expects List<string> for UserIds and UserNames
                    var userField = new Dictionary<string, object>
                    {
                        ["UserIds"] = userIds,
                        ["UserNames"] = userNames
                    };

                    // Ensure Part section exists in ContentItem.Content
                    if (!contentItem.Content.ContainsKey(partName))
                    {
                        contentItem.Content[partName] = new Dictionary<string, object>();
                    }

                    // Get the existing part (may be Dictionary or JsonDynamicObject)
                    var existingPart = contentItem.Content[partName];

                    // Create a new dictionary that will replace the part
                    Dictionary<string, object> newPartSection;

                    if (existingPart is Dictionary<string, object> existingDict)
                    {
                        // Copy existing values
                        newPartSection = new Dictionary<string, object>(existingDict);
                    }
                    else
                    {
                        // Try to deserialize JsonDynamicObject to Dictionary
                        try
                        {
                            var existingJson = JsonSerializer.Serialize(existingPart);
                            var deserialized = JsonSerializer.Deserialize<Dictionary<string, object>>(existingJson);
                            newPartSection = deserialized ?? new Dictionary<string, object>();
                        }
                        catch
                        {
                            // Start fresh if deserialization fails
                            newPartSection = new Dictionary<string, object>();
                        }
                    }

                    // Set the User field
                    newPartSection["User"] = userField;

                    // Set the updated part back to ContentItem.Content
                    // This will be converted to JsonDynamicObject by Orchard Core, but the structure should be preserved
                    contentItem.Content[partName] = newPartSection;
                }
                continue; // Skip mapping to main type section
            }

            // Try to map to Part section first (e.g., ShoppingListPart), then fallback to main type section
            var partNameForOther = contentType + "Part";
            var mappedToPart = TryMapToPartSection(contentItem.Content, partNameForOther, contentType, kvp.Key, value);

            if (!mappedToPart)
            {
                // Map to main type section
                ContentFieldMapper.MapFieldToContentItem(contentItem.Content, contentType, kvp.Key, value);
            }
        }
    }

    private bool TryMapToPartSection(
        Dictionary<string, object> contentItemContent,
        string partName,
        string contentType,
        string fieldKey,
        object fieldValue)
    {
        // This method is now only used for other Part-specific mappings
        // "user" and "userId" are handled directly in ApplyFieldsToContentItem

        // For now, no other fields need special Part mapping
        return false;
    }

    public void SetContentItemMetadata(
        ContentItem contentItem,
        Dictionary<string, object> body,
        string? ownerName = null)
    {
        // Extract and handle special fields explicitly
        contentItem.DisplayText = body.ContainsKey("title")
            ? body["title"].ToString() ?? "Untitled"
            : "Untitled";

        contentItem.Owner = ownerName ?? "anonymous";
        contentItem.Author = contentItem.Owner;
    }
}

