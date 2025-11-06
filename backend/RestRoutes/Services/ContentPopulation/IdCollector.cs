namespace RestRoutes.Services.ContentPopulation;

using System.Text.Json;

public static class IdCollector
{
    public static void CollectIds<T>(
        Dictionary<string, JsonElement> obj,
        HashSet<string> ids,
        string arrayKey,
        Func<string, bool>? keyFilter = null)
    {
        foreach (var kvp in obj)
        {
            if (kvp.Key == arrayKey && kvp.Value.ValueKind == JsonValueKind.Array)
            {
                foreach (var id in kvp.Value.EnumerateArray())
                {
                    if (id.ValueKind == JsonValueKind.String)
                    {
                        var idStr = id.GetString();
                        if (idStr != null) ids.Add(idStr);
                    }
                }
            }
            // Also collect from singular ID fields (e.g., "ingredientId"), but skip "id" and "ContentItemId"
            else if (keyFilter != null && keyFilter(kvp.Key) && kvp.Value.ValueKind == JsonValueKind.String)
            {
                var idStr = kvp.Value.GetString();
                if (idStr != null) ids.Add(idStr);
            }
            else if (kvp.Value.ValueKind == JsonValueKind.Object)
            {
                var nested = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(kvp.Value.GetRawText());
                if (nested != null) CollectIds<T>(nested, ids, arrayKey, keyFilter);
            }
            else if (kvp.Value.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in kvp.Value.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.Object)
                    {
                        var nested = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                        if (nested != null) CollectIds<T>(nested, ids, arrayKey, keyFilter);
                    }
                }
            }
        }
    }

    public static void CollectContentItemIds(Dictionary<string, JsonElement> obj, HashSet<string> ids)
    {
        CollectIds<object>(obj, ids, "ContentItemIds", key =>
            key != "id" && key != "ContentItemId" && key.EndsWith("Id"));
    }

    public static void CollectUserIds(Dictionary<string, JsonElement> obj, HashSet<string> userIds)
    {
        CollectIds<object>(obj, userIds, "UserIds", null);
    }
}

