namespace RestRoutes.Services.ContentMutation;

using System.Text.Json;
using RestRoutes.Services.Shared;

public static class BagPartBuilder
{
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

            var pascalKey = NameConversionService.ToPascalCase(prop.Name);
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
                    obj[NameConversionService.ToPascalCase(nestedProp.Name)] = JsonElementConverter.ConvertJsonElementToPascal(nestedProp.Value);
                }
                typeSection[pascalKey] = obj;
            }
        }

        return bagItem;
    }

    public static Dictionary<string, object> BuildBagPart(JsonElement itemsElement)
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
            return new Dictionary<string, object>
            {
                ["ContentItems"] = bagItems
            };
        }

        return new Dictionary<string, object>();
    }
}

