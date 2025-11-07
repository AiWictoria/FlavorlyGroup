namespace RestRoutes;

using OrchardCore.ContentManagement;
using System.Text.Json;

public static class FieldMapper
{
    /// <summary>
    /// Maps a field from the request body to the content item structure.
    /// Handles all field types: Text, Numeric, ContentItemIds, Taxonomy, UserPicker, Media, BagPart.
    /// </summary>
    public static void MapFieldToContentItem(
        ContentItem contentItem,
        string contentType,
        string fieldName,
        object value)
    {
        var pascalKey = ToPascalCase(fieldName);

        // Handle "items" field - this should become BagPart
        if (fieldName == "items" && value is JsonElement itemsElement && itemsElement.ValueKind == JsonValueKind.Array)
        {
            var bagItems = new List<object>();
            foreach (var item in itemsElement.EnumerateArray())
            {
                if (item.ValueKind == JsonValueKind.Object)
                {
                    // Get contentType first
                    string? itemType = null;
                    if (item.TryGetProperty("contentType", out var ctProp) && ctProp.ValueKind == JsonValueKind.String)
                    {
                        itemType = ctProp.GetString();
                    }

                    if (!string.IsNullOrEmpty(itemType))
                    {
                        var bagItem = CreateBagPartItem(item, itemType);
                        bagItems.Add(bagItem);
                    }
                }
            }

            if (bagItems.Count > 0)
            {
                contentItem.Content["BagPart"] = new Dictionary<string, object>
                {
                    ["ContentItems"] = bagItems
                };
            }
            return;
        }

        // Handle fields ending with "Id" - these are content item references
        if (fieldName.EndsWith("Id", StringComparison.OrdinalIgnoreCase) &&
            fieldName.Length > 2)
        {
            // Transform "ownerId" → "Owner" with ContentItemIds
            var fieldNameWithoutId = pascalKey.Substring(0, pascalKey.Length - 2); // Remove "Id"

            // Handle both single IDs (string) and multiple IDs (array)
            if (value is JsonElement jsonEl)
            {
                if (jsonEl.ValueKind == JsonValueKind.String)
                {
                    var idValue = jsonEl.GetString();
                    if (idValue != null)
                    {
                        contentItem.Content[contentType][fieldNameWithoutId]["ContentItemIds"] = new List<string> { idValue };
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
                        contentItem.Content[contentType][fieldNameWithoutId]["ContentItemIds"] = idList;
                    }
                }
            }
            else if (value is string strValue)
            {
                contentItem.Content[contentType][fieldNameWithoutId]["ContentItemIds"] = new List<string> { strValue };
            }
            return;
        }

        // Handle JsonElement values
        if (value is JsonElement jsonElement)
        {
            MapJsonElementToContentItem(contentItem, contentType, pascalKey, jsonElement);
            return;
        }

        // Handle string values
        if (value is string strVal)
        {
            contentItem.Content[contentType][pascalKey]["Text"] = strVal;
            return;
        }

        // Handle numeric values
        if (value is int or long or double or float or decimal)
        {
            contentItem.Content[contentType][pascalKey] = new Dictionary<string, object>
            {
                ["Value"] = value
            };
        }
    }

    private static void MapJsonElementToContentItem(
        ContentItem contentItem,
        string contentType,
        string pascalKey,
        JsonElement jsonElement)
    {
        // Extract the actual string value, not a wrapped JObject
        if (jsonElement.ValueKind == JsonValueKind.String)
        {
            contentItem.Content[contentType][pascalKey]["Text"] = jsonElement.GetString();
        }
        else if (jsonElement.ValueKind == JsonValueKind.Number)
        {
            contentItem.Content[contentType][pascalKey]["Value"] = jsonElement.GetDouble();
        }
        else if (jsonElement.ValueKind == JsonValueKind.True || jsonElement.ValueKind == JsonValueKind.False)
        {
            contentItem.Content[contentType][pascalKey]["Value"] = jsonElement.GetBoolean();
        }
        else if (jsonElement.ValueKind == JsonValueKind.Object)
        {
            // Detect Taxonomy object shape and map to Orchard fields
            if ((jsonElement.TryGetProperty("termContentItemIds", out var termIdsLower) || jsonElement.TryGetProperty("TermContentItemIds", out termIdsLower)) ||
                (jsonElement.TryGetProperty("taxonomyContentItemId", out var taxIdLower) || jsonElement.TryGetProperty("TaxonomyContentItemId", out taxIdLower)))
            {
                var taxonomyDict = new Dictionary<string, object>();

                if (jsonElement.TryGetProperty("termContentItemIds", out var termIds) || jsonElement.TryGetProperty("TermContentItemIds", out termIds))
                {
                    var ids = new List<string>();
                    if (termIds.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var idEl in termIds.EnumerateArray())
                        {
                            if (idEl.ValueKind == JsonValueKind.String)
                            {
                                var idStr = idEl.GetString();
                                if (idStr != null) ids.Add(idStr);
                            }
                        }
                    }
                    taxonomyDict["TermContentItemIds"] = ids;
                }

                if (jsonElement.TryGetProperty("taxonomyContentItemId", out var taxId) || jsonElement.TryGetProperty("TaxonomyContentItemId", out taxId))
                {
                    if (taxId.ValueKind == JsonValueKind.String)
                    {
                        var taxIdStr = taxId.GetString();
                        if (taxIdStr != null) taxonomyDict["TaxonomyContentItemId"] = taxIdStr;
                    }
                }

                contentItem.Content[contentType][pascalKey] = taxonomyDict;
                return;
            }

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
                contentItem.Content[contentType][pascalKey]["Paths"] = paths;
                contentItem.Content[contentType][pascalKey]["MediaTexts"] = mediaTexts;
                return;
            }

            // Handle other objects - convert keys to PascalCase
            var obj = new Dictionary<string, object>();
            foreach (var prop in jsonElement.EnumerateObject())
            {
                obj[ToPascalCase(prop.Name)] = ConvertJsonElementToPascal(prop.Value);
            }
            contentItem.Content[contentType][pascalKey] = obj;
        }
        else if (jsonElement.ValueKind == JsonValueKind.Array)
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

                contentItem.Content[contentType][pascalKey]["UserIds"] = userIds;
                contentItem.Content[contentType][pascalKey]["UserNames"] = userNames;
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
                    contentItem.Content[contentType][pascalKey]["ContentItemIds"] = arrayData;
                }
                else
                {
                    contentItem.Content[contentType][pascalKey]["Values"] = arrayData;
                }
            }
        }
        else
        {
            contentItem.Content[contentType][pascalKey] = ConvertJsonElement(jsonElement);
        }
    }

    public static Dictionary<string, object> CreateBagPartItem(JsonElement itemElement, string contentType)
    {
        var bagItem = new Dictionary<string, object>
        {
            ["ContentType"] = contentType,
            [contentType] = new Dictionary<string, object>()
        };

        var typeSection = (Dictionary<string, object>)bagItem[contentType];

        foreach (var prop in itemElement.EnumerateObject())
        {
            // Skip reserved fields and contentType itself
            if (prop.Name == "contentType" || prop.Name == "id" || prop.Name == "title")
                continue;

            var pascalKey = ToPascalCase(prop.Name);
            var value = prop.Value;

            // Handle fields ending with "Id" - these are content item references
            if (prop.Name.EndsWith("Id", StringComparison.OrdinalIgnoreCase) && prop.Name.Length > 2)
            {
                var fieldName = pascalKey.Substring(0, pascalKey.Length - 2);
                if (value.ValueKind == JsonValueKind.String)
                {
                    var idValue = value.GetString();
                    if (idValue != null)
                    {
                        typeSection[fieldName] = new Dictionary<string, object>
                        {
                            ["ContentItemIds"] = new List<string> { idValue }
                        };
                    }
                }
            }
            else if (value.ValueKind == JsonValueKind.String)
            {
                typeSection[pascalKey] = new Dictionary<string, object> { ["Text"] = value.GetString()! };
            }
            else if (value.ValueKind == JsonValueKind.Number)
            {
                typeSection[pascalKey] = new Dictionary<string, object> { ["Value"] = value.GetDouble() };
            }
            else if (value.ValueKind == JsonValueKind.True || value.ValueKind == JsonValueKind.False)
            {
                typeSection[pascalKey] = new Dictionary<string, object> { ["Value"] = value.GetBoolean() };
            }
            else if (value.ValueKind == JsonValueKind.Array)
            {
                var arrayData = new List<string>();
                foreach (var item in value.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.String)
                    {
                        var str = item.GetString();
                        if (str != null) arrayData.Add(str);
                    }
                }
                typeSection[pascalKey] = new Dictionary<string, object> { ["Values"] = arrayData };
            }
            else if (value.ValueKind == JsonValueKind.Object)
            {
                var obj = new Dictionary<string, object>();
                foreach (var nestedProp in value.EnumerateObject())
                {
                    obj[ToPascalCase(nestedProp.Name)] = ConvertJsonElementToPascal(nestedProp.Value);
                }
                typeSection[pascalKey] = obj;
            }
        }

        return bagItem;
    }

    private static string ToPascalCase(string str)
    {
        if (string.IsNullOrEmpty(str) || char.IsUpper(str[0]))
            return str;
        return char.ToUpper(str[0]) + str.Substring(1);
    }

    private static Dictionary<string, object> ConvertJsonElement(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.String)
        {
            return new Dictionary<string, object> { ["Text"] = element.GetString()! };
        }
        else if (element.ValueKind == JsonValueKind.Number)
        {
            return new Dictionary<string, object> { ["Value"] = element.GetDouble() };
        }
        else if (element.ValueKind == JsonValueKind.True || element.ValueKind == JsonValueKind.False)
        {
            return new Dictionary<string, object> { ["Value"] = element.GetBoolean() };
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            // Wrap arrays in {"values": [...]} pattern for Orchard Core list fields
            var arrayValues = new List<object>();
            foreach (var item in element.EnumerateArray())
            {
                // Convert each item to appropriate type
                if (item.ValueKind == JsonValueKind.String)
                    arrayValues.Add(item.GetString()!);
                else if (item.ValueKind == JsonValueKind.Number)
                    arrayValues.Add(item.GetDouble());
                else if (item.ValueKind == JsonValueKind.True || item.ValueKind == JsonValueKind.False)
                    arrayValues.Add(item.GetBoolean());
                else
                    arrayValues.Add(JsonSerializer.Deserialize<object>(item.GetRawText())!);
            }
            return new Dictionary<string, object> { ["values"] = arrayValues };
        }

        // For complex types, just wrap as-is
        return new Dictionary<string, object> { ["Text"] = element.ToString() };
    }

    private static object ConvertJsonElementToPascal(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.String)
        {
            return element.GetString()!;
        }
        else if (element.ValueKind == JsonValueKind.Number)
        {
            return element.GetDouble();
        }
        else if (element.ValueKind == JsonValueKind.True || element.ValueKind == JsonValueKind.False)
        {
            return element.GetBoolean();
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            var arr = new List<object>();
            foreach (var item in element.EnumerateArray())
            {
                arr.Add(ConvertJsonElementToPascal(item));
            }
            return arr;
        }
        else if (element.ValueKind == JsonValueKind.Object)
        {
            var obj = new Dictionary<string, object>();
            foreach (var prop in element.EnumerateObject())
            {
                obj[ToPascalCase(prop.Name)] = ConvertJsonElementToPascal(prop.Value);
            }
            return obj;
        }

        return JsonSerializer.Deserialize<object>(element.GetRawText())!;
    }
}

