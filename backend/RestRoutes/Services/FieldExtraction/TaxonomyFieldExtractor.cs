namespace RestRoutes.Services.FieldExtraction;

using System.Text.Json;

public class TaxonomyFieldExtractor : IFieldExtractor
{
    public bool CanExtract(JsonElement element)
    {
        if (element.ValueKind != JsonValueKind.Object) return false;

        var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
        if (dict == null) return false;

        // TaxonomyField: { "TermContentItemIds": [...] }
        return dict.ContainsKey("TermContentItemIds") && dict["TermContentItemIds"].ValueKind == JsonValueKind.Array;
    }

    public (object? value, bool isIdReference) Extract(JsonElement element, FieldExtractionContext context)
    {
        var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
        if (dict == null) return (null, false);

        if (!dict.ContainsKey("TermContentItemIds") || dict["TermContentItemIds"].ValueKind != JsonValueKind.Array)
        {
            return (null, false);
        }

        var termIds = dict["TermContentItemIds"];
        var termIdsList = new List<string>();
        foreach (var termIdElement in termIds.EnumerateArray())
        {
            if (termIdElement.ValueKind == JsonValueKind.String)
            {
                var termIdStr = termIdElement.GetString();
                if (termIdStr != null) termIdsList.Add(termIdStr);
            }
        }

        // Return as array (not as ID reference, since these are taxonomy terms)
        if (termIdsList.Count > 0)
        {
            return (termIdsList.ToArray(), false);
        }

        return (null, false); // Empty array
    }
}

