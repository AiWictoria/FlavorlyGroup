namespace RestRoutes.Services.ContentCleaning;

using System.Text.Json;

public interface IContentTypeCleaner
{
    bool CanClean(string contentType);

    Dictionary<string, object> Clean(
        Dictionary<string, JsonElement> obj,
        string contentType,
        ContentCleaningContext context);
}

