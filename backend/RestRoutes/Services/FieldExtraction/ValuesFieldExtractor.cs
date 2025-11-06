namespace RestRoutes.Services.FieldExtraction;

using System.Text.Json;

public class ValuesFieldExtractor : IFieldExtractor
{
    public bool CanExtract(JsonElement element)
    {
        if (element.ValueKind != JsonValueKind.Object) return false;

        var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
        if (dict == null) return false;

        // { "values": [...] } or { "Values": [...] } pattern (common in OrchardCore list fields)
        return dict.Count == 1 && (dict.ContainsKey("values") || dict.ContainsKey("Values"));
    }

    public (object? value, bool isIdReference) Extract(JsonElement element, FieldExtractionContext context)
    {
        var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
        if (dict == null) return (null, false);

        var valuesKey = dict.ContainsKey("values") ? "values" : "Values";
        if (!dict.ContainsKey(valuesKey) || dict[valuesKey].ValueKind != JsonValueKind.Array)
        {
            return (null, false);
        }

        var values = dict[valuesKey];
        var valuesList = new List<object>();
        foreach (var val in values.EnumerateArray())
        {
            var extractedValue = ExtractValueRecursive(val, context);
            if (extractedValue != null)
            {
                valuesList.Add(extractedValue);
            }
        }
        return (valuesList, false);
    }

    private static object? ExtractValueRecursive(JsonElement element, FieldExtractionContext context)
    {
        if (element.ValueKind == JsonValueKind.String)
        {
            return element.GetString();
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
            var list = new List<object>();
            foreach (var item in element.EnumerateArray())
            {
                var value = ExtractValueRecursive(item, context);
                if (value != null)
                {
                    list.Add(value);
                }
            }
            return list;
        }
        else if (element.ValueKind == JsonValueKind.Object)
        {
            // Use the factory to extract nested objects
            var factory = new FieldExtractorFactory();
            var result = factory.ExtractField(element, context);
            return result.value;
        }

        return null;
    }
}

