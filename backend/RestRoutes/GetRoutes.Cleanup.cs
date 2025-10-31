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
                    var isMeta = IsOrchardMetaKey(kvp.Key) || IsTaxonomyMetaKey(kvp.Key);
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
                        // Fall back to a human-readable name
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
