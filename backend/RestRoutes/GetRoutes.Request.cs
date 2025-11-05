namespace RestRoutes;

using OrchardCore.ContentManagement;
using OrchardCore.ContentManagement.Records;
using YesSql.Services;
using System.Text.Json;
using RestRoutes.Services.ContentFetching;
using RestRoutes.Services.ContentPopulation;
using RestRoutes.Services.PostProcessing;

public static partial class GetRoutes
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
    };

    // Extract existing logic into reusable method
    public static async Task<List<Dictionary<string, object>>> FetchCleanContent(
        string contentType,
        YesSql.ISession session,
        bool populate = true,
        bool denormalize = false)
    {
        var fetchingService = new ContentFetchingService();
        var plainObjects = await fetchingService.FetchRawContentItemsAsync(contentType, session);
        if (plainObjects.Count == 0) return new List<Dictionary<string, object>>();

        var result = await ProcessContentItemsAsync(plainObjects, contentType, session, populate, denormalize, includeRecipeIngredientPostProcess: true);
        return result.cleanObjects;
    }

    private static async Task<(List<Dictionary<string, object>> cleanObjects, Dictionary<string, JsonElement>? usersDictionary)> ProcessContentItemsAsync(
        List<Dictionary<string, JsonElement>> plainObjects,
        string contentType,
        YesSql.ISession session,
        bool populate,
        bool denormalize,
        bool includeRecipeIngredientPostProcess = true)
    {

        // Only populate if requested
        Dictionary<string, JsonElement>? usersDictionary = null;
        if (populate)
        {
            var populationService = new PopulationService();
            await populationService.PopulateReferencedItemsAsync(plainObjects, session, denormalize);
            usersDictionary = await populationService.PopulateUserDataAsync(plainObjects, session);
        }

        // Clean up the bullshit
        var cleanObjects = plainObjects.Select(obj => CleanObject(obj, contentType, usersDictionary))
            .Select(obj => RemoveMetadataFields(obj))
            .ToList();

        // Second population pass: cleanup may have introduced new ID fields (e.g., from BagPart items)
        if (populate && cleanObjects.Count > 0)
        {
            // Convert cleanObjects to JsonElement for processing
            var cleanJsonString = JsonSerializer.Serialize(cleanObjects);
            var cleanPlainObjects = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(cleanJsonString);

            if (cleanPlainObjects != null)
            {
                // Collect any new IDs that appeared during cleanup
                var newReferencedIds = new HashSet<string>();
                foreach (var obj in cleanPlainObjects)
                {
                    IdCollector.CollectContentItemIds(obj, newReferencedIds);
                }

                if (newReferencedIds.Count > 0)
                {
                    // Fetch the newly referenced items
                    var newReferencedItems = await session
                        .Query()
                        .For<ContentItem>()
                        .With<ContentItemIndex>(x => x.ContentItemId.IsIn(newReferencedIds))
                        .ListAsync();

                    var newRefJsonString = JsonSerializer.Serialize(newReferencedItems, JsonOptions);
                    var plainNewRefItems = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(newRefJsonString);

                    if (plainNewRefItems != null)
                    {
                        // Create dictionary with cleaned items
                        var newItemsDictionary = new Dictionary<string, Dictionary<string, object>>();
                        foreach (var item in plainNewRefItems)
                        {
                            if (item.TryGetValue("ContentItemId", out var idElement) &&
                                item.TryGetValue("ContentType", out var typeElement))
                            {
                                var id = idElement.GetString();
                                var type = typeElement.GetString();
                                if (id != null && type != null)
                                {
                                    // Clean the item before adding to dictionary
                                    newItemsDictionary[id] = CleanObject(item, type, usersDictionary);
                                }
                            }
                        }

                        // Populate the IDs in cleaned data with cleaned items
                        cleanObjects = PopulateWithCleanedItems(cleanPlainObjects, newItemsDictionary, denormalize);

                        // Post-process RecipeIngredient objects to reduce ingredient/unit to {id, name}
                        if (includeRecipeIngredientPostProcess)
                        {
                            cleanObjects = PostProcessingService.ProcessRecipeIngredientsStatic(cleanObjects);
                        }
                    }
                }
            }
        }

        // Post-process RecipeIngredient objects even if no new population was needed
        if (includeRecipeIngredientPostProcess)
        {
            cleanObjects = PostProcessingService.ProcessRecipeIngredientsStatic(cleanObjects);
        }

        // Post-process Category taxonomy terms to expand with names
        // Always run this (not just when populate=true) since it only looks up taxonomy terms
        var categoryProcessor = new PostProcessingService();
        cleanObjects = await categoryProcessor.ProcessCategoryTermsAsync(cleanObjects, session);

        return (cleanObjects, usersDictionary);
    }

    // Fetch clean content and also return raw data keyed by ContentItemId
    public static async Task<(List<Dictionary<string, object>> cleanObjects, Dictionary<string, Dictionary<string, JsonElement>> rawById)> FetchCleanContentWithRaw(
        string contentType,
        YesSql.ISession session,
        bool populate = true,
        bool denormalize = false)
    {
        var fetchingService = new ContentFetchingService();
        var plainObjects = await fetchingService.FetchRawContentItemsAsync(contentType, session);
        if (plainObjects.Count == 0) return (new List<Dictionary<string, object>>(), new Dictionary<string, Dictionary<string, JsonElement>>());

        // Build rawById dictionary before any modifications
        var rawById = fetchingService.BuildRawByIdDictionary(plainObjects);

        var result = await ProcessContentItemsAsync(plainObjects, contentType, session, populate, denormalize, includeRecipeIngredientPostProcess: false);
        return (result.cleanObjects, rawById);
    }


    // Helper to populate ID fields with already-cleaned items
    private static List<Dictionary<string, object>> PopulateWithCleanedItems(
        List<Dictionary<string, JsonElement>> objects,
        Dictionary<string, Dictionary<string, object>> cleanedItemsDictionary,
        bool denormalize = false)
    {
        var result = new List<Dictionary<string, object>>();

        foreach (var obj in objects)
        {
            var populated = PopulateObjectWithCleanedItems(obj, cleanedItemsDictionary, denormalize);
            result.Add(populated);
        }

        return result;
    }

    private static Dictionary<string, object> PopulateObjectWithCleanedItems(
        Dictionary<string, JsonElement> obj,
        Dictionary<string, Dictionary<string, object>> cleanedItemsDictionary,
        bool denormalize = false)
    {
        var result = new Dictionary<string, object>();

        foreach (var kvp in obj)
        {
            var key = kvp.Key;
            var value = kvp.Value;

            // Handle singular ID fields (e.g., "ingredientId" -> "ingredient"), but skip "id" itself
            if (key != "id" && key.EndsWith("Id") && value.ValueKind == JsonValueKind.String)
            {
                var idStr = value.GetString();
                if (idStr != null && cleanedItemsDictionary.TryGetValue(idStr, out var cleanedItem))
                {
                    // Remove "Id" suffix from key name
                    var newKey = key.Substring(0, key.Length - 2);
                    result[newKey] = cleanedItem;
                    if (denormalize)
                    {
                        // Keep the original ID field when denormalizing
                        result[key] = idStr;
                    }
                    continue;
                }
                // If not found in dictionary, keep the original ID field
                result[key] = JsonElementToObject(value);
                continue;
            }

            // Recursively handle nested objects
            if (value.ValueKind == JsonValueKind.Object)
            {
                var nested = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(value.GetRawText());
                if (nested != null)
                {
                    result[key] = PopulateObjectWithCleanedItems(nested, cleanedItemsDictionary, denormalize);
                }
                else
                {
                    result[key] = JsonElementToObject(value);
                }
                continue;
            }

            // Recursively handle arrays
            if (value.ValueKind == JsonValueKind.Array)
            {
                var array = new List<object>();
                foreach (var item in value.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.Object)
                    {
                        var nested = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                        if (nested != null)
                        {
                            array.Add(PopulateObjectWithCleanedItems(nested, cleanedItemsDictionary, denormalize));
                        }
                    }
                    else
                    {
                        array.Add(JsonElementToObject(item));
                    }
                }
                result[key] = array;
                continue;
            }

            // Handle primitive values (including "id")
            result[key] = JsonElementToObject(value);
        }

        return result;
    }

    // Fetch raw content without cleanup (for debugging/edge cases)
    public static async Task<List<Dictionary<string, object>>> FetchRawContent(
        string contentType,
        YesSql.ISession session)
    {
        var contentItems = await session
            .Query()
            .For<ContentItem>()
            .With<ContentItemIndex>(x => x.ContentType == contentType && x.Published)
            .ListAsync();

        var jsonString = JsonSerializer.Serialize(contentItems, JsonOptions);

        // Deserialize to JsonElement first, then convert to object
        var jsonDoc = JsonDocument.Parse(jsonString);
        var rawObjects = new List<Dictionary<string, object>>();

        foreach (var element in jsonDoc.RootElement.EnumerateArray())
        {
            rawObjects.Add(JsonElementToDictionary(element));
        }

        return rawObjects;
    }

    private static Dictionary<string, object> JsonElementToDictionary(JsonElement element)
    {
        var dict = new Dictionary<string, object>();

        foreach (var property in element.EnumerateObject())
        {
            dict[property.Name] = JsonElementToObject(property.Value);
        }

        return dict;
    }

    private static object JsonElementToObject(JsonElement element)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.Object:
                return JsonElementToDictionary(element);
            case JsonValueKind.Array:
                var list = new List<object>();
                foreach (var item in element.EnumerateArray())
                {
                    list.Add(JsonElementToObject(item));
                }
                return list;
            case JsonValueKind.String:
                return element.GetString() ?? "";
            case JsonValueKind.Number:
                return element.GetDouble();
            case JsonValueKind.True:
            case JsonValueKind.False:
                return element.GetBoolean();
            case JsonValueKind.Null:
                return null!;
            default:
                return element.ToString();
        }
    }
}
