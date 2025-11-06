namespace RestRoutes.Services.ContentCleaning;

using System.Text.Json;
using RestRoutes.Services.FieldExtraction;

public class RecipeCleaner : IContentTypeCleaner
{
    public bool CanClean(string contentType)
    {
        return contentType == "Recipe";
    }

    public Dictionary<string, object> Clean(
        Dictionary<string, JsonElement> obj,
        string contentType,
        ContentCleaningContext context)
    {
        var clean = new Dictionary<string, object>();

        // Get basic fields
        if (obj.TryGetValue("ContentItemId", out var id))
            clean["id"] = id.GetString()!;

        if (obj.TryGetValue("DisplayText", out var title))
            clean["title"] = title.GetString()!;

        // Extract slug from AutoroutePart.Path
        if (obj.TryGetValue("AutoroutePart", out var autoroutePart) &&
            autoroutePart.ValueKind == JsonValueKind.Object)
        {
            var autorouteDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(autoroutePart.GetRawText());
            if (autorouteDict != null && autorouteDict.TryGetValue("Path", out var path) &&
                path.ValueKind == JsonValueKind.String)
            {
                clean["slug"] = path.GetString() ?? "";
            }
        }

        // Check for Part sections (e.g., "Recipe")
        if (obj.TryGetValue(contentType, out var typeSection) && typeSection.ValueKind == JsonValueKind.Object)
        {
            var typeDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(typeSection.GetRawText());
            if (typeDict != null)
            {
                var fieldContext = context.CreateFieldExtractionContext();
                var factory = new FieldExtractorFactory();

                foreach (var kvp in typeDict)
                {
                    var fieldName = context.ToCamelCaseFunc(kvp.Key);

                    // Special handling for Recipe.Author - return only {id, username}
                    if (fieldName == "author" && kvp.Value.ValueKind == JsonValueKind.Object)
                    {
                        var authorDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(kvp.Value.GetRawText());
                        if (authorDict != null && (authorDict.ContainsKey("UserIds") || authorDict.ContainsKey("userIds")))
                        {
                            var userIdsKey = authorDict.ContainsKey("UserIds") ? "UserIds" : "userIds";
                            var userNamesKey = authorDict.ContainsKey("UserNames") ? "UserNames" : "userNames";

                            var userIds = authorDict[userIdsKey];
                            var userNames = authorDict.ContainsKey(userNamesKey) ? authorDict[userNamesKey] : default;

                            if (userIds.ValueKind == JsonValueKind.Array)
                            {
                                var idsList = userIds.EnumerateArray()
                                    .Where(x => x.ValueKind == JsonValueKind.String)
                                    .Select(x => x.GetString())
                                    .Where(x => !string.IsNullOrEmpty(x))
                                    .ToList();

                                // Try to use UserPickerFieldExtractor first for enriched data
                                var (extractedValue, _) = factory.ExtractField(kvp.Value, fieldContext);

                                if (extractedValue != null)
                                {
                                    // If extractor returns an object, map it to userAuthor
                                    if (extractedValue is Dictionary<string, object> extractedDict)
                                    {
                                        // Map id to userId for frontend compatibility
                                        var userAuthor = new Dictionary<string, object>();
                                        if (extractedDict.TryGetValue("id", out var idObj))
                                        {
                                            userAuthor["userId"] = idObj;
                                        }
                                        if (extractedDict.TryGetValue("username", out var usernameObj))
                                        {
                                            userAuthor["username"] = usernameObj;
                                        }
                                        // Copy any other fields (email, phone, etc.)
                                        foreach (var field in extractedDict)
                                        {
                                            if (field.Key != "id" && field.Key != "username")
                                            {
                                                userAuthor[field.Key] = field.Value;
                                            }
                                        }
                                        clean["userAuthor"] = userAuthor;
                                        clean["author"] = extractedValue; // Also keep author for backward compatibility
                                    }
                                    else if (extractedValue is List<object> extractedList && extractedList.Count > 0)
                                    {
                                        // If it's a list, take the first item
                                        if (extractedList[0] is Dictionary<string, object> firstItem)
                                        {
                                            var userAuthor = new Dictionary<string, object>();
                                            if (firstItem.TryGetValue("id", out var idObj))
                                            {
                                                userAuthor["userId"] = idObj;
                                            }
                                            if (firstItem.TryGetValue("username", out var usernameObj))
                                            {
                                                userAuthor["username"] = usernameObj;
                                            }
                                            clean["userAuthor"] = userAuthor;
                                            clean["author"] = extractedList[0];
                                        }
                                    }
                                }
                                else if (idsList.Count > 0)
                                {
                                    // Fallback: create basic userAuthor object
                                    var userAuthor = new Dictionary<string, object>
                                    {
                                        ["userId"] = idsList[0]!
                                    };

                                    // Add username if available
                                    if (userNames.ValueKind == JsonValueKind.Array)
                                    {
                                        var namesList = userNames.EnumerateArray()
                                            .Where(x => x.ValueKind == JsonValueKind.String)
                                            .Select(x => x.GetString())
                                            .Where(x => !string.IsNullOrEmpty(x))
                                            .ToList();

                                        if (namesList.Count > 0)
                                        {
                                            userAuthor["username"] = namesList[0]!;
                                        }
                                    }

                                    clean["userAuthor"] = userAuthor;
                                    // Also create author for backward compatibility
                                    clean["author"] = new Dictionary<string, object>
                                    {
                                        ["id"] = idsList[0]!,
                                        ["username"] = userAuthor.ContainsKey("username") ? userAuthor["username"] : ""
                                    };
                                }
                            }
                        }
                        continue;
                    }

                    var (value, isIdReference) = factory.ExtractField(kvp.Value, fieldContext);
                    if (value != null)
                    {
                        // If it's an ID reference from ContentItemIds, append "Id" to field name
                        if (isIdReference)
                        {
                            fieldName = fieldName + "Id";
                        }
                        clean[fieldName] = value;
                    }
                }
            }
        }

        // Also check for RecipePart
        var partName = contentType + "Part";
        if (obj.TryGetValue(partName, out var partSection) && partSection.ValueKind == JsonValueKind.Object)
        {
            var partDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(partSection.GetRawText());
            if (partDict != null)
            {
                var fieldContext = context.CreateFieldExtractionContext();
                var factory = new FieldExtractorFactory();

                foreach (var kvp in partDict)
                {
                    var fieldName = context.ToCamelCaseFunc(kvp.Key);

                    // Special handling for RecipePart.Author - return only {id, username}
                    if (fieldName == "author" && kvp.Value.ValueKind == JsonValueKind.Object)
                    {
                        var authorDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(kvp.Value.GetRawText());
                        if (authorDict != null && (authorDict.ContainsKey("UserIds") || authorDict.ContainsKey("userIds")))
                        {
                            var userIdsKey = authorDict.ContainsKey("UserIds") ? "UserIds" : "userIds";
                            var userNamesKey = authorDict.ContainsKey("UserNames") ? "UserNames" : "userNames";

                            var userIds = authorDict[userIdsKey];
                            var userNames = authorDict.ContainsKey(userNamesKey) ? authorDict[userNamesKey] : default;

                            if (userIds.ValueKind == JsonValueKind.Array)
                            {
                                var idsList = userIds.EnumerateArray()
                                    .Where(x => x.ValueKind == JsonValueKind.String)
                                    .Select(x => x.GetString())
                                    .Where(x => !string.IsNullOrEmpty(x))
                                    .ToList();

                                // Try to use UserPickerFieldExtractor first for enriched data
                                var (extractedValue, _) = factory.ExtractField(kvp.Value, fieldContext);

                                if (extractedValue != null)
                                {
                                    // If extractor returns an object, map it to userAuthor
                                    if (extractedValue is Dictionary<string, object> extractedDict)
                                    {
                                        // Map id to userId for frontend compatibility
                                        var userAuthor = new Dictionary<string, object>();
                                        if (extractedDict.TryGetValue("id", out var idObj))
                                        {
                                            userAuthor["userId"] = idObj;
                                        }
                                        if (extractedDict.TryGetValue("username", out var usernameObj))
                                        {
                                            userAuthor["username"] = usernameObj;
                                        }
                                        // Copy any other fields (email, phone, etc.)
                                        foreach (var field in extractedDict)
                                        {
                                            if (field.Key != "id" && field.Key != "username")
                                            {
                                                userAuthor[field.Key] = field.Value;
                                            }
                                        }
                                        clean["userAuthor"] = userAuthor;
                                        clean["author"] = extractedValue; // Also keep author for backward compatibility
                                    }
                                    else if (extractedValue is List<object> extractedList && extractedList.Count > 0)
                                    {
                                        // If it's a list, take the first item
                                        if (extractedList[0] is Dictionary<string, object> firstItem)
                                        {
                                            var userAuthor = new Dictionary<string, object>();
                                            if (firstItem.TryGetValue("id", out var idObj))
                                            {
                                                userAuthor["userId"] = idObj;
                                            }
                                            if (firstItem.TryGetValue("username", out var usernameObj))
                                            {
                                                userAuthor["username"] = usernameObj;
                                            }
                                            clean["userAuthor"] = userAuthor;
                                            clean["author"] = extractedList[0];
                                        }
                                    }
                                }
                                else if (idsList.Count > 0)
                                {
                                    // Fallback: create basic userAuthor object
                                    var userAuthor = new Dictionary<string, object>
                                    {
                                        ["userId"] = idsList[0]!
                                    };

                                    // Add username if available
                                    if (userNames.ValueKind == JsonValueKind.Array)
                                    {
                                        var namesList = userNames.EnumerateArray()
                                            .Where(x => x.ValueKind == JsonValueKind.String)
                                            .Select(x => x.GetString())
                                            .Where(x => !string.IsNullOrEmpty(x))
                                            .ToList();

                                        if (namesList.Count > 0)
                                        {
                                            userAuthor["username"] = namesList[0]!;
                                        }
                                    }

                                    clean["userAuthor"] = userAuthor;
                                    // Also create author for backward compatibility
                                    clean["author"] = new Dictionary<string, object>
                                    {
                                        ["id"] = idsList[0]!,
                                        ["username"] = userAuthor.ContainsKey("username") ? userAuthor["username"] : ""
                                    };
                                }
                            }
                        }
                        continue;
                    }

                    // RecipeImage → image
                    if (fieldName == "recipeImage" && kvp.Value.ValueKind == JsonValueKind.Object)
                    {
                        var mediaDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(kvp.Value.GetRawText());
                        if (mediaDict != null && mediaDict.TryGetValue("Paths", out var paths) &&
                            paths.ValueKind == JsonValueKind.Array)
                        {
                            var pathsArray = paths.EnumerateArray()
                                .Where(x => x.ValueKind == JsonValueKind.String)
                                .Select(x => x.GetString())
                                .Where(x => x != null)
                                .ToList();

                            if (pathsArray.Count > 0)
                            {
                                clean["image"] = pathsArray[0]!;
                            }
                        }
                        continue;
                    }

                    // Category → category (array of {id, name}) - will be expanded in post-processing
                    if (fieldName == "category" && kvp.Value.ValueKind == JsonValueKind.Object)
                    {
                        var categoryDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(kvp.Value.GetRawText());
                        if (categoryDict != null && categoryDict.TryGetValue("TermContentItemIds", out var termIds) &&
                            termIds.ValueKind == JsonValueKind.Array)
                        {
                            var ids = termIds.EnumerateArray()
                                .Where(x => x.ValueKind == JsonValueKind.String)
                                .Select(x => x.GetString())
                                .Where(x => x != null)
                                .ToList();

                            if (ids.Count > 0)
                            {
                                // Store IDs for post-processing - they will be expanded to {id, name} objects
                                clean["_categoryIds"] = ids;
                            }
                        }
                        continue;
                    }

                    var (value, isIdReference) = factory.ExtractField(kvp.Value, fieldContext);
                    if (value != null)
                    {
                        // If it's an ID reference from ContentItemIds, append "Id" to field name
                        if (isIdReference)
                        {
                            fieldName = fieldName + "Id";
                        }
                        clean[fieldName] = value;
                    }
                }
            }
        }

        // Handle Ingredients (BagPart for Recipe)
        HandleIngredients(obj, clean, context);

        return clean;
    }

    private static void HandleIngredients(
        Dictionary<string, JsonElement> obj,
        Dictionary<string, object> clean,
        ContentCleaningContext context)
    {
        if (obj.TryGetValue("Ingredients", out var ingredients) && ingredients.ValueKind == JsonValueKind.Object)
        {
            var ingredientsDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(ingredients.GetRawText());
            if (ingredientsDict != null && ingredientsDict.TryGetValue("ContentItems", out var contentItems) &&
                contentItems.ValueKind == JsonValueKind.Array)
            {
                var itemsList = new List<object>();

                foreach (var item in contentItems.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.Object)
                    {
                        var itemDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                        if (itemDict != null && itemDict.TryGetValue("ContentType", out var itemTypeElement))
                        {
                            var itemType = itemTypeElement.GetString();
                            if (itemType != null)
                            {
                                var cleanedItem = context.CleanObjectFunc(itemDict, itemType);
                                // Include contentType for roundtripping
                                cleanedItem["contentType"] = itemType;
                                itemsList.Add(cleanedItem);
                            }
                        }
                    }
                }

                if (itemsList.Count > 0)
                {
                    clean["ingredients"] = itemsList;
                }
            }
        }
    }
}

