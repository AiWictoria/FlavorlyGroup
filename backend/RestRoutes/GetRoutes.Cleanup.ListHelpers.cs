namespace RestRoutes;

using System.Text.Json;

public static partial class GetRoutes
{
    // Create a list of objects from a list of content items
    private static void CopyListPart(
        Dictionary<string, JsonElement> src,
        string partKey,
        string outputKey,
        Dictionary<string, object> dest)
    {
        if (src.TryGetValue(partKey, out var part) && part.ValueKind == JsonValueKind.Object)
        {
            var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(part.GetRawText());
            if (dict != null && dict.TryGetValue("ContentItems", out var items) && items.ValueKind == JsonValueKind.Array)
            {
                var cleaned = CleanContentItemsArray(items);
                dest[outputKey] = cleaned;
            }
        }
    }

    // Clean the content items array
    private static List<object> CleanContentItemsArray(JsonElement items)
    {
        var list = new List<object>();
        foreach (var item in items.EnumerateArray())
        {
            if (item.ValueKind == JsonValueKind.Object)
            {
                var itemDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                if (itemDict != null)
                {
                    string? itemType = null;
                    if (itemDict.TryGetValue("ContentType", out var ct))
                        itemType = ct.GetString();
                    list.Add(CleanObject(itemDict, itemType ?? ""));
                }
            }
        }
        return list;
    }
}


