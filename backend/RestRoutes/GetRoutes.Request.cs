namespace RestRoutes;

using OrchardCore.ContentManagement;
using OrchardCore.ContentManagement.Records;
using YesSql.Services;
using System.Text.Json;

public static partial class GetRoutes
{
    // Extract existing logic into reusable method
    public static async Task<List<Dictionary<string, object>>> FetchCleanContent(
        string contentType,
        YesSql.ISession session,
        bool populate = true,
        bool denormalize = false)
    {
        // Fetch all content items for the given content type
        var contentItems = await session
            .Query()
            .For<ContentItem>()
            .With<ContentItemIndex>(x => x.ContentType == contentType && x.Published)
            .ListAsync();

        // Serialize to JSON and deserialize to Dictionary<string, JsonElement>
        var jsonOptions = new JsonSerializerOptions
        {
            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
        };
        var jsonString = JsonSerializer.Serialize(contentItems, jsonOptions);
        var plainObjects = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(jsonString);
        if (plainObjects == null) return new List<Dictionary<string, object>>();

        // Only populate if requested
        if (populate)
        {
            var allReferencedIds = new HashSet<string>();
            foreach (var obj in plainObjects)
            {
                CollectContentItemIds(obj, allReferencedIds);
            }

            if (allReferencedIds.Count > 0)
            {
                var referencedItems = await session
                    .Query()
                    .For<ContentItem>()
                    .With<ContentItemIndex>(x => x.ContentItemId.IsIn(allReferencedIds))
                    .ListAsync();

                var refJsonString = JsonSerializer.Serialize(referencedItems, jsonOptions);
                var plainRefItems = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(refJsonString);
                if (plainRefItems != null)
                {
                    var itemsDictionary = new Dictionary<string, Dictionary<string, JsonElement>>();
                    foreach (var item in plainRefItems)
                    {
                        if (item.TryGetValue("ContentItemId", out var idElement))
                        {
                            var id = idElement.GetString();
                            if (id != null) itemsDictionary[id] = item;
                        }
                    }

                    foreach (var obj in plainObjects)
                    {
                        PopulateContentItemIds(obj, itemsDictionary, denormalize);
                    }
                }
            }
        }

        // Collect all UserIds for enrichment
        Dictionary<string, JsonElement>? usersDictionary = null;
        if (populate)
        {
            var allUserIds = new HashSet<string>();
            foreach (var obj in plainObjects)
            {
                CollectUserIds(obj, allUserIds);
            }

            if (allUserIds.Count > 0)
            {
                // Query UserIndex to get user data
                var users = await session
                    .Query()
                    .For<OrchardCore.Users.Models.User>()
                    .With<OrchardCore.Users.Indexes.UserIndex>(x => x.UserId.IsIn(allUserIds))
                    .ListAsync();

                if (users.Any())
                {
                    var usersJsonString = JsonSerializer.Serialize(users, jsonOptions);
                    var plainUsers = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(usersJsonString);
                    if (plainUsers != null)
                    {
                        usersDictionary = new Dictionary<string, JsonElement>();
                        foreach (var user in plainUsers)
                        {
                            if (user.TryGetValue("UserId", out var userIdElement))
                            {
                                var userId = userIdElement.GetString();
                                if (userId != null)
                                {
                                    usersDictionary[userId] = JsonSerializer.SerializeToElement(user);
                                }
                            }
                        }
                    }
                }
            }
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
                    CollectContentItemIds(obj, newReferencedIds);
                }

                if (newReferencedIds.Count > 0)
                {
                    // Fetch the newly referenced items
                    var newReferencedItems = await session
                        .Query()
                        .For<ContentItem>()
                        .With<ContentItemIndex>(x => x.ContentItemId.IsIn(newReferencedIds))
                        .ListAsync();

                    var newRefJsonString = JsonSerializer.Serialize(newReferencedItems, jsonOptions);
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
                        cleanObjects = PostProcessRecipeIngredients(cleanObjects);
                    }
                }
            }
        }

        // Post-process RecipeIngredient objects even if no new population was needed
        cleanObjects = PostProcessRecipeIngredients(cleanObjects);

        // Post-process Category taxonomy terms to expand with names
        // Always run this (not just when populate=true) since it only looks up taxonomy terms
        cleanObjects = await PostProcessCategoryTerms(cleanObjects, session);

        return cleanObjects;
    }

    // Fetch clean content and also return raw data keyed by ContentItemId
    public static async Task<(List<Dictionary<string, object>> cleanObjects, Dictionary<string, Dictionary<string, JsonElement>> rawById)> FetchCleanContentWithRaw(
        string contentType,
        YesSql.ISession session,
        bool populate = true,
        bool denormalize = false)
    {
        // Fetch all content items for the given content type
        var contentItems = await session
            .Query()
            .For<ContentItem>()
            .With<ContentItemIndex>(x => x.ContentType == contentType && x.Published)
            .ListAsync();

        // Serialize to JSON and deserialize to Dictionary<string, JsonElement>
        var jsonOptions = new JsonSerializerOptions
        {
            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
        };
        var jsonString = JsonSerializer.Serialize(contentItems, jsonOptions);
        var plainObjects = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(jsonString);
        if (plainObjects == null) return (new List<Dictionary<string, object>>(), new Dictionary<string, Dictionary<string, JsonElement>>());

        // Build rawById dictionary before any modifications
        var rawById = new Dictionary<string, Dictionary<string, JsonElement>>();
        foreach (var obj in plainObjects)
        {
            if (obj.TryGetValue("ContentItemId", out var idElement))
            {
                var id = idElement.GetString();
                if (id != null)
                {
                    // Create a deep copy to avoid modifications affecting the raw data
                    var rawJsonString = JsonSerializer.Serialize(obj, jsonOptions);
                    var rawCopy = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(rawJsonString);
                    if (rawCopy != null)
                    {
                        rawById[id] = rawCopy;
                    }
                }
            }
        }

        // Only populate if requested
        if (populate)
        {
            var allReferencedIds = new HashSet<string>();
            foreach (var obj in plainObjects)
            {
                CollectContentItemIds(obj, allReferencedIds);
            }

            if (allReferencedIds.Count > 0)
            {
                var referencedItems = await session
                    .Query()
                    .For<ContentItem>()
                    .With<ContentItemIndex>(x => x.ContentItemId.IsIn(allReferencedIds))
                    .ListAsync();

                var refJsonString = JsonSerializer.Serialize(referencedItems, jsonOptions);
                var plainRefItems = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(refJsonString);
                if (plainRefItems != null)
                {
                    var itemsDictionary = new Dictionary<string, Dictionary<string, JsonElement>>();
                    foreach (var item in plainRefItems)
                    {
                        if (item.TryGetValue("ContentItemId", out var idElement))
                        {
                            var id = idElement.GetString();
                            if (id != null) itemsDictionary[id] = item;
                        }
                    }

                    foreach (var obj in plainObjects)
                    {
                        PopulateContentItemIds(obj, itemsDictionary, denormalize);
                    }
                }
            }
        }

        // Collect all UserIds for enrichment
        Dictionary<string, JsonElement>? usersDictionary = null;
        if (populate)
        {
            var allUserIds = new HashSet<string>();
            foreach (var obj in plainObjects)
            {
                CollectUserIds(obj, allUserIds);
            }

            if (allUserIds.Count > 0)
            {
                // Query UserIndex to get user data
                var users = await session
                    .Query()
                    .For<OrchardCore.Users.Models.User>()
                    .With<OrchardCore.Users.Indexes.UserIndex>(x => x.UserId.IsIn(allUserIds))
                    .ListAsync();

                if (users.Any())
                {
                    var usersJsonString = JsonSerializer.Serialize(users, jsonOptions);
                    var plainUsers = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(usersJsonString);
                    if (plainUsers != null)
                    {
                        usersDictionary = new Dictionary<string, JsonElement>();
                        foreach (var user in plainUsers)
                        {
                            if (user.TryGetValue("UserId", out var userIdElement))
                            {
                                var userId = userIdElement.GetString();
                                if (userId != null)
                                {
                                    usersDictionary[userId] = JsonSerializer.SerializeToElement(user);
                                }
                            }
                        }
                    }
                }
            }
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
                    CollectContentItemIds(obj, newReferencedIds);
                }

                if (newReferencedIds.Count > 0)
                {
                    // Fetch the newly referenced items
                    var newReferencedItems = await session
                        .Query()
                        .For<ContentItem>()
                        .With<ContentItemIndex>(x => x.ContentItemId.IsIn(newReferencedIds))
                        .ListAsync();

                    var newRefJsonString = JsonSerializer.Serialize(newReferencedItems, jsonOptions);
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
                    }
                }
            }
        }

        // Post-process Category taxonomy terms to expand with names
        // Always run this (not just when populate=true) since it only looks up taxonomy terms
        cleanObjects = await PostProcessCategoryTerms(cleanObjects, session);

        return (cleanObjects, rawById);
    }

    // Post-process RecipeIngredient objects to reduce nested ingredient/unit to {id, name}
    private static List<Dictionary<string, object>> PostProcessRecipeIngredients(List<Dictionary<string, object>> objects)
    {
        var result = new List<Dictionary<string, object>>();

        foreach (var obj in objects)
        {
            var processed = PostProcessRecipeIngredientsRecursive(obj);
            result.Add(processed);
        }

        return result;
    }

    private static Dictionary<string, object> PostProcessRecipeIngredientsRecursive(Dictionary<string, object> obj)
    {
        var processed = new Dictionary<string, object>();

        foreach (var kvp in obj)
        {
            // Handle RecipeIngredient objects in ingredients array
            if (kvp.Key == "ingredients" && kvp.Value is List<object> ingredientsList)
            {
                var processedIngredients = new List<object>();
                foreach (var ingredient in ingredientsList)
                {
                    if (ingredient is Dictionary<string, object> ingDict)
                    {
                        var processedIng = new Dictionary<string, object>();

                        // Copy all fields
                        foreach (var ingKvp in ingDict)
                        {
                            if (ingKvp.Key == "ingredient" && ingKvp.Value is Dictionary<string, object> ingredientObj)
                            {
                                // Reduce to {id, name}
                                var reduced = new Dictionary<string, object>();
                                if (ingredientObj.TryGetValue("id", out var id))
                                    reduced["id"] = id;
                                if (ingredientObj.TryGetValue("title", out var title))
                                    reduced["name"] = title;
                                else if (ingredientObj.TryGetValue("name", out var name))
                                    reduced["name"] = name;
                                processedIng["ingredient"] = reduced;
                            }
                            else if (ingKvp.Key == "unit" && ingKvp.Value is Dictionary<string, object> unitObj)
                            {
                                // Reduce to {id, name}
                                var reduced = new Dictionary<string, object>();
                                if (unitObj.TryGetValue("id", out var id))
                                    reduced["id"] = id;
                                if (unitObj.TryGetValue("title", out var title))
                                    reduced["name"] = title;
                                else if (unitObj.TryGetValue("name", out var name))
                                    reduced["name"] = name;
                                processedIng["unit"] = reduced;
                            }
                            else
                            {
                                processedIng[ingKvp.Key] = ingKvp.Value;
                            }
                        }
                        processedIngredients.Add(processedIng);
                    }
                    else
                    {
                        processedIngredients.Add(ingredient);
                    }
                }
                processed["ingredients"] = processedIngredients;
            }
            else if (kvp.Value is Dictionary<string, object> nestedDict)
            {
                processed[kvp.Key] = PostProcessRecipeIngredientsRecursive(nestedDict);
            }
            else if (kvp.Value is List<object> list)
            {
                var processedList = new List<object>();
                foreach (var item in list)
                {
                    if (item is Dictionary<string, object> itemDict)
                    {
                        processedList.Add(PostProcessRecipeIngredientsRecursive(itemDict));
                    }
                    else
                    {
                        processedList.Add(item);
                    }
                }
                processed[kvp.Key] = processedList;
            }
            else
            {
                processed[kvp.Key] = kvp.Value;
            }
        }

        return processed;
    }

    // Post-process Category taxonomy terms to expand with names
    private static async Task<List<Dictionary<string, object>>> PostProcessCategoryTerms(
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
        var jsonOptions = new JsonSerializerOptions
        {
            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
        };

        var terms = await session
            .Query()
            .For<ContentItem>()
            .With<ContentItemIndex>(x => x.ContentItemId.IsIn(categoryTermIds) && x.Published)
            .ListAsync();

        var termsJson = JsonSerializer.Serialize(terms, jsonOptions);
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

        var jsonOptions = new JsonSerializerOptions
        {
            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
        };
        var jsonString = JsonSerializer.Serialize(contentItems, jsonOptions);

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
