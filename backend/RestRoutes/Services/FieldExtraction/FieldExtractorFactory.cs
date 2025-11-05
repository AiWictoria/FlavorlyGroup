namespace RestRoutes.Services.FieldExtraction;

using System.Text.Json;

public class FieldExtractorFactory
{
    private readonly List<IFieldExtractor> _extractors;

    public FieldExtractorFactory()
    {
        // Order matters - more specific extractors should come first
        _extractors = new List<IFieldExtractor>
        {
            new TextFieldExtractor(),
            new MediaFieldExtractor(),
            new UserPickerFieldExtractor(),
            new TaxonomyFieldExtractor(),
            new ContentPickerFieldExtractor(),
            new BagPartExtractor(),
            new ValuesFieldExtractor()
        };
    }

    public (object? value, bool isIdReference) ExtractField(JsonElement element, FieldExtractionContext context)
    {
        // Try each extractor in order
        foreach (var extractor in _extractors)
        {
            if (extractor.CanExtract(element))
            {
                return extractor.Extract(element, context);
            }
        }

        // If no extractor matches, handle primitive types and arrays
        return ExtractPrimitiveOrArray(element, context);
    }

    private static (object? value, bool isIdReference) ExtractPrimitiveOrArray(JsonElement element, FieldExtractionContext context)
    {
        if (element.ValueKind == JsonValueKind.String)
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
        else if (element.ValueKind == JsonValueKind.Array)
        {
            var list = new List<object>();
            foreach (var item in element.EnumerateArray())
            {
                var factory = new FieldExtractorFactory();
                var result = factory.ExtractField(item, context);
                if (result.value != null)
                {
                    list.Add(result.value);
                }
            }
            return (list, false);
        }
        else if (element.ValueKind == JsonValueKind.Object)
        {
            // Fallback: try to extract as generic object
            return ExtractGenericObject(element, context);
        }

        return (null, false);
    }

    private static (object? value, bool isIdReference) ExtractGenericObject(JsonElement element, FieldExtractionContext context)
    {
        var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
        if (dict == null) return (null, false);

        var cleaned = new Dictionary<string, object>();
        var factory = new FieldExtractorFactory();

        foreach (var kvp in dict)
        {
            var fieldName = context.ToCamelCaseFunc != null
                ? context.ToCamelCaseFunc(kvp.Key)
                : ToCamelCase(kvp.Key);

            var result = factory.ExtractField(kvp.Value, context);
            if (result.value != null)
            {
                // If it's an ID reference from ContentItemIds, append "Id" to field name
                if (result.isIdReference)
                {
                    fieldName = fieldName + "Id";
                }
                cleaned[fieldName] = result.value;
            }
        }

        // Unwrap single-property objects (e.g., {"value": 42} → 42)
        if (cleaned.Count == 1)
        {
            return (cleaned.Values.First(), false);
        }

        return (cleaned, false);
    }

    private static string ToCamelCase(string str)
    {
        if (string.IsNullOrEmpty(str) || char.IsLower(str[0]))
            return str;
        return char.ToLower(str[0]) + str.Substring(1);
    }
}

