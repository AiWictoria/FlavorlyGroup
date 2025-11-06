namespace RestRoutes.Services.PostProcessing;

using OrchardCore.ContentManagement;
using OrchardCore.ContentManagement.Records;
using YesSql.Services;
using System.Text.Json;

public class CategoryTermPostProcessor
{
    private readonly JsonSerializerOptions _jsonOptions;

    public CategoryTermPostProcessor()
    {
        _jsonOptions = new JsonSerializerOptions
        {
            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
        };
    }

    public async Task<List<Dictionary<string, object>>> ProcessAsync(
        List<Dictionary<string, object>> objects,
        YesSql.ISession session)
    {
        // Collect all category term IDs
        var categoryTermIds = new HashSet<string>();
        foreach (var obj in objects)
        {
            // Handle _categoryIds - can be various collection types
            if (obj.TryGetValue("_categoryIds", out var idsObj) && idsObj != null)
            {
                // Try to enumerate as IEnumerable
                if (idsObj is System.Collections.IEnumerable enumerable)
                {
                    foreach (var id in enumerable)
                    {
                        string? idStr = null;
                        if (id is string str)
                        {
                            idStr = str;
                        }
                        else if (id != null)
                        {
                            idStr = id.ToString();
                        }

                        if (!string.IsNullOrEmpty(idStr))
                        {
                            categoryTermIds.Add(idStr);
                        }
                    }
                }
            }
        }

        if (categoryTermIds.Count == 0)
        {
            return objects;
        }

        // Fetch taxonomy terms
        var terms = await session
            .Query()
            .For<ContentItem>()
            .With<ContentItemIndex>(x => x.ContentItemId.IsIn(categoryTermIds) && x.Published)
            .ListAsync();

        var termsJson = JsonSerializer.Serialize(terms, _jsonOptions);
        var termsList = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(termsJson);

        // Create dictionary of term ID -> {id, name}
        var termsDict = new Dictionary<string, Dictionary<string, object>>();
        if (termsList != null)
        {
            foreach (var term in termsList)
            {
                if (term.TryGetValue("ContentItemId", out var idElement))
                {
                    var termId = idElement.GetString();
                    if (termId == null) continue;

                    // Try to get name from DisplayText first, then TitlePart.Title
                    string? termName = null;

                    if (term.TryGetValue("DisplayText", out var displayText) &&
                        displayText.ValueKind == JsonValueKind.String)
                    {
                        termName = displayText.GetString();
                    }

                    // Fallback to TitlePart.Title if DisplayText is not available
                    if (string.IsNullOrEmpty(termName) &&
                        term.TryGetValue("TitlePart", out var titlePart) &&
                        titlePart.ValueKind == JsonValueKind.Object)
                    {
                        var titlePartDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(titlePart.GetRawText());
                        if (titlePartDict != null &&
                            titlePartDict.TryGetValue("Title", out var title) &&
                            title.ValueKind == JsonValueKind.String)
                        {
                            termName = title.GetString();
                        }
                    }

                    if (!string.IsNullOrEmpty(termName))
                    {
                        termsDict[termId] = new Dictionary<string, object>
                        {
                            ["id"] = termId,
                            ["name"] = termName
                        };
                    }
                }
            }
        }

        // Replace _categoryIds with expanded category objects
        var result = new List<Dictionary<string, object>>();
        foreach (var obj in objects)
        {
            var processed = new Dictionary<string, object>(obj);

            // Handle _categoryIds - can be various collection types
            if (processed.TryGetValue("_categoryIds", out var idsObj) && idsObj != null)
            {
                var categories = new List<Dictionary<string, object>>();

                // Try to enumerate as IEnumerable
                if (idsObj is System.Collections.IEnumerable enumerable)
                {
                    foreach (var id in enumerable)
                    {
                        string? idStr = null;
                        if (id is string str)
                        {
                            idStr = str;
                        }
                        else if (id != null)
                        {
                            idStr = id.ToString();
                        }

                        if (!string.IsNullOrEmpty(idStr) && termsDict.TryGetValue(idStr, out var termObj))
                        {
                            categories.Add(termObj);
                        }
                    }
                }

                if (categories.Count > 0)
                {
                    processed["category"] = categories;
                }

                processed.Remove("_categoryIds");
            }

            result.Add(processed);
        }

        return result;
    }
}

