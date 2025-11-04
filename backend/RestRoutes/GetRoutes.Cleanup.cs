namespace RestRoutes;

using System.Text.Json;

public static partial class GetRoutes
{
    private static Dictionary<string, object> CleanObject(Dictionary<string, JsonElement> obj, string contentType)
    {
        var clean = new Dictionary<string, object>();

        // Get basic fields
        if (obj.TryGetValue("ContentItemId", out var id))
            clean["id"] = id.GetString()!;

        if (obj.TryGetValue("DisplayText", out var title))
            clean["title"] = title.GetString()!;

        // Map AutoroutePart.Path -> slug
        if (obj.TryGetValue("AutoroutePart", out var autoroute) && autoroute.ValueKind == JsonValueKind.Object)
        {
            var routeDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(autoroute.GetRawText());
            if (routeDict != null && routeDict.TryGetValue("Path", out var pathElement) && pathElement.ValueKind == JsonValueKind.String)
            {
                var slug = pathElement.GetString();
                if (!string.IsNullOrWhiteSpace(slug))
                {
                    clean["slug"] = slug!;
                }
            }
        }

        // Get the content type section (e.g., "Recipe")
        if (obj.TryGetValue(contentType, out var typeSection) && typeSection.ValueKind == JsonValueKind.Object)
        {
            var typeDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(typeSection.GetRawText());
            if (typeDict != null)
            {
                foreach (var kvp in typeDict)
                {
                    // Skip meta-fields (but keep Author for Comment content type)
                    var isMeta = IsOrchardMetaKey(kvp.Key);
                    if (isMeta && !(string.Equals(contentType, "Comment", StringComparison.OrdinalIgnoreCase) && kvp.Key == "Author"))
                        continue;

                    var (value, isIdReference) = ExtractFieldValueWithContext(kvp.Value);
                    var fieldName = ToCamelCase(kvp.Key);
                    if (value != null)
                    {
                        if (isIdReference)
                        {
                            fieldName = fieldName + "Id";
                        }
                        clean[fieldName] = value;
                    }
                }

                // Expose full RecipePart payload (nested), preserving embedded objects
                if (string.Equals(contentType, "Recipe", StringComparison.OrdinalIgnoreCase))
                {
                    if (obj.TryGetValue("RecipePart", out var recipePartEl) && recipePartEl.ValueKind == JsonValueKind.Object)
                    {
                        var recipePartDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(recipePartEl.GetRawText());
                        if (recipePartDict != null)
                        {
                            var recipePart = new Dictionary<string, object>();

                            // Special handling for Category: prefer TagNames, fallback to first TermContentItemId or first TermItem title
                            if (recipePartDict.TryGetValue("Category", out var categoryEl) && categoryEl.ValueKind == JsonValueKind.Object)
                            {
                                string? categoryValue = null;
                                var categoryDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(categoryEl.GetRawText());
                                if (categoryDict != null)
                                {
                                    if (categoryDict.TryGetValue("TagNames", out var tagNamesEl) && tagNamesEl.ValueKind == JsonValueKind.Array)
                                    {
                                        var firstTag = tagNamesEl.EnumerateArray().FirstOrDefault(e => e.ValueKind == JsonValueKind.String);
                                        if (firstTag.ValueKind == JsonValueKind.String)
                                        {
                                            categoryValue = firstTag.GetString();
                                        }
                                    }

                                    if (string.IsNullOrWhiteSpace(categoryValue) && categoryDict.TryGetValue("TermContentItemIds", out var termIdsEl) && termIdsEl.ValueKind == JsonValueKind.Array)
                                    {
                                        var firstId = termIdsEl.EnumerateArray().FirstOrDefault(e => e.ValueKind == JsonValueKind.String);
                                        if (firstId.ValueKind == JsonValueKind.String)
                                        {
                                            categoryValue = firstId.GetString();
                                        }
                                    }

                                    // If populated: TermItems is present; derive a readable name from first term
                                    if (string.IsNullOrWhiteSpace(categoryValue) && categoryDict.TryGetValue("TermItems", out var termItemsEl) && termItemsEl.ValueKind == JsonValueKind.Array)
                                    {
                                        var firstItem = termItemsEl.EnumerateArray().FirstOrDefault(e => e.ValueKind == JsonValueKind.Object);
                                        if (firstItem.ValueKind == JsonValueKind.Object)
                                        {
                                            var firstItemDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(firstItem.GetRawText());
                                            if (firstItemDict != null)
                                            {
                                                // Prefer DisplayText; fallback to TitlePart.Title; else id
                                                if (firstItemDict.TryGetValue("DisplayText", out var displayTextEl) && displayTextEl.ValueKind == JsonValueKind.String)
                                                {
                                                    categoryValue = displayTextEl.GetString();
                                                }
                                                else if (firstItemDict.TryGetValue("TitlePart", out var titlePartEl) && titlePartEl.ValueKind == JsonValueKind.Object)
                                                {
                                                    var titlePartDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(titlePartEl.GetRawText());
                                                    if (titlePartDict != null && titlePartDict.TryGetValue("Title", out var titleEl) && titleEl.ValueKind == JsonValueKind.String)
                                                    {
                                                        categoryValue = titleEl.GetString();
                                                    }
                                                }
                                                else if (firstItemDict.TryGetValue("ContentItemId", out var termIdEl) && termIdEl.ValueKind == JsonValueKind.String)
                                                {
                                                    categoryValue = termIdEl.GetString();
                                                }
                                            }
                                        }
                                    }
                                }

                                if (!string.IsNullOrWhiteSpace(categoryValue))
                                {
                                    recipePart["category"] = categoryValue!;
                                    clean["category"] = categoryValue!;
                                }
                            }

                            foreach (var kvp in recipePartDict)
                            {
                                var isMetaInner = IsOrchardMetaKey(kvp.Key);
                                if (isMetaInner) continue;

                                // Skip Category here because we handled it above
                                if (kvp.Key == "Category") continue;

                                var nestedValue = ExtractFieldValue(kvp.Value);
                                if (nestedValue != null)
                                {
                                    recipePart[ToCamelCase(kvp.Key)] = nestedValue;
                                }
                            }

                            if (recipePart.Count > 0)
                            {
                                clean["recipePart"] = recipePart;
                            }
                        }
                    }
                }

                // Derive ingredientName/ingredientId if populated ingredient object is available
                if (clean.TryGetValue("Ingredient", out var ingredientObj) && ingredientObj is Dictionary<string, object> ingredientDict)
                {
                    if (ingredientDict.TryGetValue("title", out var ingredientTitle) && ingredientTitle is string titleStr && !string.IsNullOrWhiteSpace(titleStr))
                    {
                        clean["ingredientName"] = titleStr;
                    }
                    if (ingredientDict.TryGetValue("id", out var ingredientIdVal) && ingredientIdVal is string ingredientIdStr && !string.IsNullOrWhiteSpace(ingredientIdStr))
                    {
                        clean["ingredientId"] = ingredientIdStr;
                    }

                    // Remove embedded object to match target shape
                    clean.Remove("Ingredient");
                }

                // Derive unitCode/unitName and unitId if populated unit object is available
                if (clean.TryGetValue("Unit", out var unitObj) && unitObj is Dictionary<string, object> unitDict)
                {
                    // Prefer explicit code if available
                    if (unitDict.TryGetValue("code", out var unitCodeVal) && unitCodeVal is string codeStr && !string.IsNullOrWhiteSpace(codeStr))
                    {
                        clean["unitCode"] = codeStr;
                    }
                    else if (unitDict.TryGetValue("title", out var unitTitleVal) && unitTitleVal is string unitTitleStr && !string.IsNullOrWhiteSpace(unitTitleStr))
                    {
                        // Fall back to a readable name
                        clean["unitName"] = unitTitleStr;
                    }
                    else if (unitDict.TryGetValue("name", out var unitNameVal) && unitNameVal is string unitNameStr && !string.IsNullOrWhiteSpace(unitNameStr))
                    {
                        clean["unitName"] = unitNameStr;
                    }

                    if (unitDict.TryGetValue("id", out var unitIdVal) && unitIdVal is string unitIdStr && !string.IsNullOrWhiteSpace(unitIdStr))
                    {
                        clean["unitId"] = unitIdStr;
                    }

                    // Remove embedded object to match target shape
                    clean.Remove("Unit");
                }

                // For comments, derive a simple author string from Author.UserNames[0]
                if (string.Equals(contentType, "Comment", StringComparison.OrdinalIgnoreCase))
                {
                    if (clean.TryGetValue("author", out var authorVal))
                    {
                        if (authorVal is Dictionary<string, object> authorDict)
                        {
                            if (authorDict.TryGetValue("userNames", out var namesVal))
                            {
                                if (namesVal is IEnumerable<object> namesEnum)
                                {
                                    var first = namesEnum.OfType<string>().FirstOrDefault(s => !string.IsNullOrWhiteSpace(s));
                                    if (!string.IsNullOrWhiteSpace(first))
                                    {
                                        clean["author"] = first!;
                                    }
                                }
                                else if (namesVal is string singleName && !string.IsNullOrWhiteSpace(singleName))
                                {
                                    clean["author"] = singleName;
                                }
                            }
                        }
                    }
                }
            }
        }


        CopyListPart(obj, "Ingredients", "ingredients", clean);

        // RecipeInstructions
        CopyListPart(obj, "RecipeInstructions", "instructions", clean);

        // Comments/CommentList (support both shapes)
        if (obj.ContainsKey("Comments") || obj.ContainsKey("CommentList"))
        {
            CopyListPart(obj, obj.ContainsKey("Comments") ? "Comments" : "CommentList", "comments", clean);
        }


        return clean;
    }
}
