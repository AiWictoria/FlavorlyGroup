namespace RestRoutes.Services.FieldExtraction;

using System.Text.Json;

public class MediaFieldExtractor : IFieldExtractor
{
    public bool CanExtract(JsonElement element)
    {
        if (element.ValueKind != JsonValueKind.Object) return false;

        var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
        if (dict == null) return false;

        // MediaField: { "Paths": [...] }
        return dict.ContainsKey("Paths") && dict["Paths"].ValueKind == JsonValueKind.Array;
    }

    public (object? value, bool isIdReference) Extract(JsonElement element, FieldExtractionContext context)
    {
        var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
        if (dict == null) return (null, false);

        if (!dict.ContainsKey("Paths") || dict["Paths"].ValueKind != JsonValueKind.Array)
        {
            return (null, false);
        }

        var paths = dict["Paths"];
        var pathsList = new List<string>();
        foreach (var path in paths.EnumerateArray())
        {
            if (path.ValueKind == JsonValueKind.String)
            {
                var pathStr = path.GetString();
                if (pathStr != null) pathsList.Add(pathStr);
            }
        }

        // Return first path as string (most common case for single image)
        if (pathsList.Count > 0)
        {
            return (pathsList[0], false);
        }

        return (null, false);
    }
}

