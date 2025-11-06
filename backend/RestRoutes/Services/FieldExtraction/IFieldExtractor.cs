namespace RestRoutes.Services.FieldExtraction;

using System.Text.Json;

public interface IFieldExtractor
{
    bool CanExtract(JsonElement element);

    (object? value, bool isIdReference) Extract(JsonElement element, FieldExtractionContext context);
}

