namespace RestRoutes.Services.ContentMutation;

using System.Text.Json;
using RestRoutes.Services.Shared;

public static class ContentFieldMapper
{
    public static void MapFieldToContentItem(
        Dictionary<string, object> contentItemContent,
        string contentType,
        string fieldKey,
        object fieldValue)
    {
        // Ensure contentType section exists
        if (!contentItemContent.ContainsKey(contentType))
        {
            contentItemContent[contentType] = new Dictionary<string, object>();
        }

        var typeSection = (Dictionary<string, object>)contentItemContent[contentType];
        var pascalKey = NameConversionService.ToPascalCase(fieldKey);

        // Handle fields ending with "Id" - these are content item references
        if (fieldKey.EndsWith("Id", StringComparison.OrdinalIgnoreCase) && fieldKey.Length > 2)
        {
            MapContentItemReferenceField(typeSection, contentType, pascalKey, fieldValue);
            return;
        }

        // Handle JsonElement values
        if (fieldValue is JsonElement jsonElement)
        {
            MapJsonElementField(typeSection, contentType, pascalKey, jsonElement);
        }
        // Handle string values
        else if (fieldValue is string strValue)
        {
            typeSection[pascalKey] = new Dictionary<string, object> { ["Text"] = strValue };
        }
        // Handle numeric values
        else if (fieldValue is int or long or double or float or decimal)
        {
            typeSection[pascalKey] = new Dictionary<string, object> { ["Value"] = fieldValue };
        }
    }

    private static void MapContentItemReferenceField(
        Dictionary<string, object> typeSection,
        string contentType,
        string pascalKey,
        object value)
    {
        // Transform "ownerId" → "Owner" with ContentItemIds
        var fieldName = pascalKey.Substring(0, pascalKey.Length - 2); // Remove "Id"

        // Handle both single IDs (string) and multiple IDs (array)
        if (value is JsonElement jsonEl)
        {
            if (jsonEl.ValueKind == JsonValueKind.String)
            {
                var idValue = jsonEl.GetString();
                if (idValue != null)
                {
                    typeSection[fieldName] = new Dictionary<string, object>
                    {
                        ["ContentItemIds"] = new List<string> { idValue }
                    };
                }
            }
            else if (jsonEl.ValueKind == JsonValueKind.Array)
            {
                var idList = new List<string>();
                foreach (var item in jsonEl.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.String)
                    {
                        var idValue = item.GetString();
                        if (idValue != null) idList.Add(idValue);
                    }
                }
                if (idList.Count > 0)
                {
                    typeSection[fieldName] = new Dictionary<string, object>
                    {
                        ["ContentItemIds"] = idList
                    };
                }
            }
        }
        else if (value is string strValue)
        {
            typeSection[fieldName] = new Dictionary<string, object>
            {
                ["ContentItemIds"] = new List<string> { strValue }
            };
        }
    }

    private static void MapJsonElementField(
        Dictionary<string, object> typeSection,
        string contentType,
        string pascalKey,
        JsonElement jsonElement)
    {
        // Extract the actual string value, not a wrapped JObject
        if (jsonElement.ValueKind == JsonValueKind.String)
        {
            typeSection[pascalKey] = new Dictionary<string, object>
            {
                ["Text"] = jsonElement.GetString()!
            };
        }
        else if (jsonElement.ValueKind == JsonValueKind.Number)
        {
            typeSection[pascalKey] = new Dictionary<string, object>
            {
                ["Value"] = jsonElement.GetDouble()
            };
        }
        else if (jsonElement.ValueKind == JsonValueKind.True || jsonElement.ValueKind == JsonValueKind.False)
        {
            typeSection[pascalKey] = new Dictionary<string, object>
            {
                ["Value"] = jsonElement.GetBoolean()
            };
        }
        else if (jsonElement.ValueKind == JsonValueKind.Object)
        {
            MapJsonObjectField(typeSection, contentType, pascalKey, jsonElement);
        }
        else if (jsonElement.ValueKind == JsonValueKind.Array)
        {
            MapJsonArrayField(typeSection, contentType, pascalKey, jsonElement);
        }
        else
        {
            typeSection[pascalKey] = JsonElementConverter.ConvertJsonElement(jsonElement);
        }
    }

    private static void MapJsonObjectField(
        Dictionary<string, object> typeSection,
        string contentType,
        string pascalKey,
        JsonElement jsonElement)
    {
        // Check if this is a MediaField (has "paths" and "mediaTexts" properties)
        if (jsonElement.TryGetProperty("paths", out var pathsProp) && pathsProp.ValueKind == JsonValueKind.Array &&
            jsonElement.TryGetProperty("mediaTexts", out var mediaTextsProp) && mediaTextsProp.ValueKind == JsonValueKind.Array)
        {
            // Handle MediaField - use List<string> instead of JArray for System.Text.Json compatibility
            var paths = new List<string>();
            foreach (var path in pathsProp.EnumerateArray())
            {
                if (path.ValueKind == JsonValueKind.String)
                {
                    var pathStr = path.GetString();
                    if (pathStr != null) paths.Add(pathStr);
                }
            }

            var mediaTexts = new List<string>();
            foreach (var text in mediaTextsProp.EnumerateArray())
            {
                if (text.ValueKind == JsonValueKind.String)
                {
                    var textStr = text.GetString();
                    if (textStr != null) mediaTexts.Add(textStr);
                }
            }

            // Assign arrays directly - ContentItem.Content uses System.Text.Json, so use List instead of JArray
            typeSection[pascalKey] = new Dictionary<string, object>
            {
                ["Paths"] = paths,
                ["MediaTexts"] = mediaTexts
            };
        }
        else
        {
            // Handle other objects - convert keys to PascalCase
            var obj = new Dictionary<string, object>();
            foreach (var prop in jsonElement.EnumerateObject())
            {
                obj[NameConversionService.ToPascalCase(prop.Name)] = JsonElementConverter.ConvertJsonElementToPascal(prop.Value);
            }
            typeSection[pascalKey] = obj;
        }
    }

    private static void MapJsonArrayField(
        Dictionary<string, object> typeSection,
        string contentType,
        string pascalKey,
        JsonElement jsonElement)
    {
        // Check if this is a UserPickerField (array of objects with "id" and "username")
        var firstElement = jsonElement.EnumerateArray().FirstOrDefault();
        if (firstElement.ValueKind == JsonValueKind.Object &&
            firstElement.TryGetProperty("id", out _) &&
            firstElement.TryGetProperty("username", out _))
        {
            // Unzip the user objects into UserIds and UserNames arrays
            var userIds = new List<string>();
            var userNames = new List<string>();

            foreach (var userObj in jsonElement.EnumerateArray())
            {
                if (userObj.ValueKind == JsonValueKind.Object)
                {
                    if (userObj.TryGetProperty("id", out var idProp) && idProp.ValueKind == JsonValueKind.String)
                    {
                        var id = idProp.GetString();
                        if (id != null) userIds.Add(id);
                    }

                    if (userObj.TryGetProperty("username", out var usernameProp) && usernameProp.ValueKind == JsonValueKind.String)
                    {
                        var username = usernameProp.GetString();
                        if (username != null) userNames.Add(username);
                    }
                }
            }

            typeSection[pascalKey] = new Dictionary<string, object>
            {
                ["UserIds"] = userIds,
                ["UserNames"] = userNames
            };
        }
        else
        {
            // Handle arrays - could be ContentItemIds or Values
            var arrayData = new List<string>();
            foreach (var item in jsonElement.EnumerateArray())
            {
                if (item.ValueKind == JsonValueKind.String)
                {
                    var str = item.GetString();
                    if (str != null) arrayData.Add(str);
                }
            }

            // Detect if array contains ContentItemIds (26-char alphanumeric strings)
            var isContentItemIds = arrayData.Count > 0 &&
                arrayData.All(id => id.Length > 20 && id.All(c => char.IsLetterOrDigit(c)));

            if (isContentItemIds)
            {
                typeSection[pascalKey] = new Dictionary<string, object>
                {
                    ["ContentItemIds"] = arrayData
                };
            }
            else
            {
                typeSection[pascalKey] = new Dictionary<string, object>
                {
                    ["Values"] = arrayData
                };
            }
        }
    }
}

