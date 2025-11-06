namespace RestRoutes.Services.FieldExtraction;

using System.Text.Json;
using System.Text.Json.Serialization;

public class TextFieldExtractor : IFieldExtractor
{
    public bool CanExtract(JsonElement element)
    {
        if (element.ValueKind != JsonValueKind.Object) return false;

        var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
        if (dict == null) return false;

        // Text field: { "Text": "value" }
        if (dict.ContainsKey("Text") && dict.Count == 1)
        {
            return true;
        }

        // Markdown field: { "Markdown": "value" }
        if (dict.ContainsKey("Markdown") && dict.Count == 1)
        {
            return true;
        }

        return false;
    }

    public (object? value, bool isIdReference) Extract(JsonElement element, FieldExtractionContext context)
    {
        var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
        if (dict == null) return (null, false);

        // Handle Text field
        if (dict.ContainsKey("Text"))
        {
            var textElement = dict["Text"];
            // Handle both string and array (in case of POST-created items)
            if (textElement.ValueKind == JsonValueKind.String)
            {
                return (textElement.GetString(), false);
            }
            else if (textElement.ValueKind == JsonValueKind.Array)
            {
                // If it's an array, try to get the first element
                var arr = textElement.EnumerateArray().ToList();
                if (arr.Count > 0 && arr[0].ValueKind == JsonValueKind.String)
                {
                    return (arr[0].GetString(), false);
                }
            }
            return (null, false);
        }

        // Handle Markdown field
        if (dict.ContainsKey("Markdown"))
        {
            var markdownElement = dict["Markdown"];
            if (markdownElement.ValueKind == JsonValueKind.String)
            {
                return (markdownElement.GetString(), false);
            }
        }

        return (null, false);
    }
}

