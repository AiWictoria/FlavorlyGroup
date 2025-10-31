namespace RestRoutes;

using System.Text.Json;

public static partial class GetRoutes
{
    private static (object? value, bool isIdReference) ExtractFieldValueWithContext(JsonElement element)
    {
        return ExtractFieldValueCore(element, true);
    }

    private static object? ExtractFieldValue(JsonElement element)
    {
        var (value, _) = ExtractFieldValueCore(element, false);
        return value;
    }

    private static (object? value, bool isIdReference) ExtractFieldValueCore(JsonElement element, bool withContext)
    {
        // Handle Text/Markdown fields and various OrchardCore shapes
        if (element.ValueKind == JsonValueKind.Object)
        {
            var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
            if (dict != null)
            {
                // Taxonomy shortcut: TagNames wins
                if (dict.ContainsKey("TagNames"))
                {
                    var tagNames = dict["TagNames"];
                    if (tagNames.ValueKind == JsonValueKind.Array)
                    {
                        var vals = tagNames.EnumerateArray().Where(e => e.ValueKind == JsonValueKind.String).Select(e => e.GetString()!).ToList();
                        if (vals.Count == 0) return (null, false);
                        return (vals.Count == 1 ? vals[0] : vals.ToArray(), false);
                    }
                }

                // Text/Markdown single value
                if ((dict.ContainsKey("Text") || dict.ContainsKey("Markdown")) && dict.Count == 1)
                {
                    var key = dict.ContainsKey("Text") ? "Text" : "Markdown";
                    var textElement = dict[key];
                    if (textElement.ValueKind == JsonValueKind.String)
                    {
                        return (textElement.GetString(), false);
                    }
                    else if (textElement.ValueKind == JsonValueKind.Array)
                    {
                        var arr = textElement.EnumerateArray().ToList();
                        if (arr.Count > 0 && arr[0].ValueKind == JsonValueKind.String)
                        {
                            return (arr[0].GetString(), false);
                        }
                        return (null, false);
                    }
                }

                // Non-populated relations: ContentItemIds
                if (dict.ContainsKey("ContentItemIds"))
                {
                    var ids = dict["ContentItemIds"];
                    if (ids.ValueKind == JsonValueKind.Array)
                    {
                        var idsList = new List<string>();
                        foreach (var idElement in ids.EnumerateArray())
                        {
                            if (idElement.ValueKind == JsonValueKind.String)
                            {
                                var idStr = idElement.GetString();
                                if (idStr != null) idsList.Add(idStr);
                            }
                        }
                        if (idsList.Count == 1)
                        {
                            // When withContext=true, signal field rename (append Id)
                            return (idsList[0], withContext);
                        }
                        else if (idsList.Count > 1)
                        {
                            return (idsList.ToArray(), false);
                        }
                        return (null, false);
                    }
                }

                // Populated relations: Items
                if (dict.ContainsKey("Items"))
                {
                    var items = dict["Items"];
                    if (items.ValueKind == JsonValueKind.Array)
                    {
                        var itemsList = new List<object>();
                        foreach (var item in items.EnumerateArray())
                        {
                            if (item.ValueKind == JsonValueKind.Object)
                            {
                                var itemDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                                if (itemDict != null)
                                {
                                    string? itemType = null;
                                    if (itemDict.TryGetValue("ContentType", out var ct))
                                    {
                                        itemType = ct.GetString();
                                    }
                                    itemsList.Add(CleanObject(itemDict, itemType ?? ""));
                                }
                            }
                        }
                        var result = itemsList.Count == 0 ? null : itemsList.Count == 1 ? itemsList[0] : itemsList;
                        return (result, false);
                    }
                }

                // OrchardCore list fields: { values: [...] }
                if (dict.Count == 1 && (dict.ContainsKey("values") || dict.ContainsKey("Values")))
                {
                    var valuesKey = dict.ContainsKey("values") ? "values" : "Values";
                    var values = dict[valuesKey];
                    if (values.ValueKind == JsonValueKind.Array)
                    {
                        var valuesList = new List<object>();
                        foreach (var val in values.EnumerateArray())
                        {
                            var (extracted, _) = ExtractFieldValueCore(val, withContext);
                            if (extracted != null)
                            {
                                valuesList.Add(extracted);
                            }
                        }
                        return (valuesList, false);
                    }
                }

                // Otherwise: clean nested object
                var cleaned = new Dictionary<string, object>();
                foreach (var kvp in dict)
                {
                    if (IsOrchardMetaKey(kvp.Key) || IsTaxonomyMetaKey(kvp.Key)) continue;

                    var (value, isIdRef) = ExtractFieldValueCore(kvp.Value, withContext);
                    if (value != null)
                    {
                        var keyName = ToCamelCase(kvp.Key);
                        if (withContext && isIdRef)
                        {
                            keyName = keyName + "Id";
                        }
                        cleaned[keyName] = value;
                    }
                }

                if (cleaned.Count == 1)
                {
                    return (cleaned.Values.First(), false);
                }

                return (cleaned, false);
            }
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            var list = new List<object>();
            foreach (var item in element.EnumerateArray())
            {
                var (value, _) = ExtractFieldValueCore(item, withContext);
                if (value != null)
                {
                    list.Add(value);
                }
            }
            return (list, false);
        }
        else if (element.ValueKind == JsonValueKind.String)
        {
            return (element.GetString(), false);
        }
        else if (element.ValueKind == JsonValueKind.Number)
        {
            return (element.GetDouble(), false);
        }
        else if (element.ValueKind == JsonValueKind.True || element.ValueKind == JsonValueKind.False)
        {
            return (element.GetBoolean(), false);
        }

        return (null, false);
    }
}


