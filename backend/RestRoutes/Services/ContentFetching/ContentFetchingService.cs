namespace RestRoutes.Services.ContentFetching;

using OrchardCore.ContentManagement;
using OrchardCore.ContentManagement.Records;
using YesSql.Services;
using System.Text.Json;
using RestRoutes;

public class ContentFetchingService
{
    private readonly JsonSerializerOptions _jsonOptions;

    public ContentFetchingService()
    {
        _jsonOptions = new JsonSerializerOptions
        {
            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
        };
    }

    public async Task<List<Dictionary<string, JsonElement>>> FetchRawContentItemsAsync(
        string contentType,
        YesSql.ISession session)
    {
        var contentItems = await session
            .Query()
            .For<ContentItem>()
            .With<ContentItemIndex>(x => x.ContentType == contentType && x.Published)
            .ListAsync();

        var jsonString = JsonSerializer.Serialize(contentItems, _jsonOptions);
        var plainObjects = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(jsonString);
        return plainObjects ?? new List<Dictionary<string, JsonElement>>();
    }

    public Dictionary<string, Dictionary<string, JsonElement>> BuildRawByIdDictionary(
        List<Dictionary<string, JsonElement>> plainObjects)
    {
        var rawById = new Dictionary<string, Dictionary<string, JsonElement>>();
        foreach (var obj in plainObjects)
        {
            if (obj.TryGetValue("ContentItemId", out var idElement))
            {
                var id = idElement.GetString();
                if (id != null)
                {
                    // Create a deep copy to avoid modifications affecting the raw data
                    var rawJsonString = JsonSerializer.Serialize(obj, _jsonOptions);
                    var rawCopy = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(rawJsonString);
                    if (rawCopy != null)
                    {
                        rawById[id] = rawCopy;
                    }
                }
            }
        }
        return rawById;
    }
}

