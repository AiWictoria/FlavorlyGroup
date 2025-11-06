namespace RestRoutes.Services.ContentPopulation;

using System.Text.Json;

public static class ContentItemPopulator
{
    public static void PopulateContentItemIds(
        Dictionary<string, JsonElement> obj,
        Dictionary<string, Dictionary<string, JsonElement>> itemsDictionary,
        bool denormalize = false)
    {
        var keysToProcess = obj.Keys.ToList();

        foreach (var key in keysToProcess)
        {
            // Skip if key was removed during recursive processing
            if (!obj.TryGetValue(key, out var value)) continue;

            if (key == "ContentItemIds" && value.ValueKind == JsonValueKind.Array)
            {
                var items = new List<Dictionary<string, JsonElement>>();
                foreach (var id in value.EnumerateArray())
                {
                    if (id.ValueKind == JsonValueKind.String)
                    {
                        var idStr = id.GetString();
                        if (idStr != null && itemsDictionary.TryGetValue(idStr, out var item))
                        {
                            items.Add(item);
                        }
                    }
                }

                obj["Items"] = JsonSerializer.SerializeToElement(items);
                if (!denormalize)
                {
                    obj.Remove("ContentItemIds");
                }
            }
            // Handle singular ID fields (e.g., "ingredientId" -> "ingredient"), but skip "id" and "ContentItemId"
            else if (key != "id" && key != "ContentItemId" && key.EndsWith("Id") && value.ValueKind == JsonValueKind.String)
            {
                var idStr = value.GetString();
                if (idStr != null && itemsDictionary.TryGetValue(idStr, out var item))
                {
                    // Remove "Id" suffix from key name
                    var newKey = key.Substring(0, key.Length - 2);
                    obj[newKey] = JsonSerializer.SerializeToElement(item);
                    if (!denormalize)
                    {
                        obj.Remove(key);
                    }
                }
            }
            else if (value.ValueKind == JsonValueKind.Object)
            {
                var nested = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(value.GetRawText());
                if (nested != null)
                {
                    PopulateContentItemIds(nested, itemsDictionary, denormalize);
                    obj[key] = JsonSerializer.SerializeToElement(nested);
                }
            }
            else if (value.ValueKind == JsonValueKind.Array)
            {
                var populatedArray = new List<object>();
                foreach (var item in value.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.Object)
                    {
                        var nested = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                        if (nested != null)
                        {
                            PopulateContentItemIds(nested, itemsDictionary, denormalize);
                            populatedArray.Add(nested);
                        }
                    }
                    else
                    {
                        // Non-object items (strings, numbers, etc.) - keep as-is
                        populatedArray.Add(JsonSerializer.Deserialize<object>(item.GetRawText())!);
                    }
                }
                obj[key] = JsonSerializer.SerializeToElement(populatedArray);
            }
        }
    }
}

