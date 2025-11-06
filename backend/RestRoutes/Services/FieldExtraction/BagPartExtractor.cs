namespace RestRoutes.Services.FieldExtraction;

using System.Text.Json;

public class BagPartExtractor : IFieldExtractor
{
    public bool CanExtract(JsonElement element)
    {
        if (element.ValueKind != JsonValueKind.Object) return false;

        var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
        if (dict == null) return false;

        // BagPart: { "Items": [...] } (populated relations)
        return dict.ContainsKey("Items") && dict["Items"].ValueKind == JsonValueKind.Array;
    }

    public (object? value, bool isIdReference) Extract(JsonElement element, FieldExtractionContext context)
    {
        var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
        if (dict == null) return (null, false);

        if (!dict.ContainsKey("Items") || dict["Items"].ValueKind != JsonValueKind.Array)
        {
            return (null, false);
        }

        var items = dict["Items"];
        var itemsList = new List<object>();
        foreach (var item in items.EnumerateArray())
        {
            if (item.ValueKind == JsonValueKind.Object)
            {
                var itemDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                if (itemDict != null && context.CleanObjectFunc != null)
                {
                    // Get the content type from the item
                    string? itemType = null;
                    if (itemDict.TryGetValue("ContentType", out var ct))
                    {
                        itemType = ct.GetString();
                    }
                    itemsList.Add(context.CleanObjectFunc(itemDict, itemType ?? ""));
                }
            }
        }

        // Return null (serializes to remove key) if 0 items, object if one item otherwise array
        var result = itemsList.Count == 0 ? null : itemsList.Count == 1 ? itemsList[0] : itemsList;
        return (result, false);
    }
}

