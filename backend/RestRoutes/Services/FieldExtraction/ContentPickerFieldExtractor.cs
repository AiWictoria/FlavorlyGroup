namespace RestRoutes.Services.FieldExtraction;

using System.Text.Json;

public class ContentPickerFieldExtractor : IFieldExtractor
{
    public bool CanExtract(JsonElement element)
    {
        if (element.ValueKind != JsonValueKind.Object) return false;

        var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
        if (dict == null) return false;

        // ContentItemIds array (non-populated relations)
        return dict.ContainsKey("ContentItemIds") && dict["ContentItemIds"].ValueKind == JsonValueKind.Array;
    }

    public (object? value, bool isIdReference) Extract(JsonElement element, FieldExtractionContext context)
    {
        var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
        if (dict == null) return (null, false);

        if (!dict.ContainsKey("ContentItemIds") || dict["ContentItemIds"].ValueKind != JsonValueKind.Array)
        {
            return (null, false);
        }

        var ids = dict["ContentItemIds"];
        var idsList = new List<string>();
        foreach (var idElement in ids.EnumerateArray())
        {
            if (idElement.ValueKind == JsonValueKind.String)
            {
                var idStr = idElement.GetString();
                if (idStr != null) idsList.Add(idStr);
            }
        }

        // Single ID: return as string with isIdReference=true (appends "Id" to field name)
        // Multiple IDs: return as array with isIdReference=true (appends "Id" to field name)
        if (idsList.Count == 1)
        {
            return (idsList[0], true);
        }
        else if (idsList.Count > 1)
        {
            return (idsList.ToArray(), true);
        }

        return (null, false); // Empty array
    }
}

