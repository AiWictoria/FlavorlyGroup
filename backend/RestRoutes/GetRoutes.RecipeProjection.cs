namespace RestRoutes;

using System.Text.Json;

public static partial class GetRoutes
{
    internal static Dictionary<string, object> ProjectRecipe(
        Dictionary<string, object> cleanedItem,
        Dictionary<string, JsonElement> rawItem,
        Dictionary<string, Dictionary<string, object>> ingredientsDict,
        Dictionary<string, Dictionary<string, object>> unitsDict)
    {
        var projected = new Dictionary<string, object>();

        // Basic fields from cleaned item
        if (cleanedItem.TryGetValue("id", out var id))
            projected["id"] = id;

        if (cleanedItem.TryGetValue("title", out var title))
            projected["title"] = title;

        // Slug from AutoroutePart.Path
        if (rawItem.TryGetValue("AutoroutePart", out var autoroutePart) &&
            autoroutePart.ValueKind == JsonValueKind.Object)
        {
            var autorouteDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(autoroutePart.GetRawText());
            if (autorouteDict != null && autorouteDict.TryGetValue("Path", out var path))
            {
                if (path.ValueKind == JsonValueKind.String)
                {
                    projected["slug"] = path.GetString() ?? "";
                }
            }
        }

        // Author from Recipe.Author (first user)
        if (rawItem.TryGetValue("Recipe", out var recipePart) &&
            recipePart.ValueKind == JsonValueKind.Object)
        {
            var recipeDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(recipePart.GetRawText());
            if (recipeDict != null && recipeDict.TryGetValue("Author", out var author))
            {
                var authorDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(author.GetRawText());
                if (authorDict != null)
                {
                    var userIds = new List<string>();
                    var userNames = new List<string>();

                    if (authorDict.TryGetValue("UserIds", out var userIdsElement) &&
                        userIdsElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var userId in userIdsElement.EnumerateArray())
                        {
                            if (userId.ValueKind == JsonValueKind.String)
                            {
                                var userIdStr = userId.GetString();
                                if (userIdStr != null) userIds.Add(userIdStr);
                            }
                        }
                    }

                    if (authorDict.TryGetValue("UserNames", out var userNamesElement) &&
                        userNamesElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var userName in userNamesElement.EnumerateArray())
                        {
                            if (userName.ValueKind == JsonValueKind.String)
                            {
                                var userNameStr = userName.GetString();
                                if (userNameStr != null) userNames.Add(userNameStr);
                            }
                        }
                    }

                    if (userIds.Count > 0 && userNames.Count > 0)
                    {
                        projected["author"] = new Dictionary<string, object>
                        {
                            ["id"] = userIds[0],
                            ["username"] = userNames[0]
                        };
                    }
                }
            }
        }

        // RecipePart fields
        if (rawItem.TryGetValue("RecipePart", out var recipePartField) &&
            recipePartField.ValueKind == JsonValueKind.Object)
        {
            var recipePartDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(recipePartField.GetRawText());
            if (recipePartDict != null)
            {
                // Image from RecipeImage.Paths[0]
                if (recipePartDict.TryGetValue("RecipeImage", out var recipeImage) &&
                    recipeImage.ValueKind == JsonValueKind.Object)
                {
                    var imageDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(recipeImage.GetRawText());
                    if (imageDict != null && imageDict.TryGetValue("Paths", out var paths) &&
                        paths.ValueKind == JsonValueKind.Array)
                    {
                        var pathsList = new List<string>();
                        foreach (var path in paths.EnumerateArray())
                        {
                            if (path.ValueKind == JsonValueKind.String)
                            {
                                var pathStr = path.GetString();
                                if (pathStr != null) pathsList.Add(pathStr);
                            }
                        }
                        if (pathsList.Count > 0)
                        {
                            projected["image"] = pathsList[0];
                        }
                    }
                }

                // Description from Description.Markdown
                if (recipePartDict.TryGetValue("Description", out var description) &&
                    description.ValueKind == JsonValueKind.Object)
                {
                    var descDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(description.GetRawText());
                    if (descDict != null && descDict.TryGetValue("Markdown", out var markdown))
                    {
                        if (markdown.ValueKind == JsonValueKind.String)
                        {
                            projected["description"] = markdown.GetString() ?? "";
                        }
                    }
                }

                // CategoryIds from Category.TermContentItemIds
                if (recipePartDict.TryGetValue("Category", out var category) &&
                    category.ValueKind == JsonValueKind.Object)
                {
                    var catDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(category.GetRawText());
                    if (catDict != null && catDict.TryGetValue("TermContentItemIds", out var termIds) &&
                        termIds.ValueKind == JsonValueKind.Array)
                    {
                        var categoryIds = new List<string>();
                        foreach (var termId in termIds.EnumerateArray())
                        {
                            if (termId.ValueKind == JsonValueKind.String)
                            {
                                var termIdStr = termId.GetString();
                                if (termIdStr != null) categoryIds.Add(termIdStr);
                            }
                        }
                        projected["categoryIds"] = categoryIds;
                    }
                }

                // PrepTimeMinutes, CookTimeMinutes, Servings from *.Value
                if (recipePartDict.TryGetValue("PrepTimeMinutes", out var prepTime) &&
                    prepTime.ValueKind == JsonValueKind.Object)
                {
                    var prepDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(prepTime.GetRawText());
                    if (prepDict != null && prepDict.TryGetValue("Value", out var prepValue))
                    {
                        if (prepValue.ValueKind == JsonValueKind.Number)
                        {
                            projected["prepTimeMinutes"] = prepValue.GetInt32();
                        }
                    }
                }

                if (recipePartDict.TryGetValue("CookTimeMinutes", out var cookTime) &&
                    cookTime.ValueKind == JsonValueKind.Object)
                {
                    var cookDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(cookTime.GetRawText());
                    if (cookDict != null && cookDict.TryGetValue("Value", out var cookValue))
                    {
                        if (cookValue.ValueKind == JsonValueKind.Number)
                        {
                            projected["cookTimeMinutes"] = cookValue.GetInt32();
                        }
                    }
                }

                if (recipePartDict.TryGetValue("Servings", out var servings) &&
                    servings.ValueKind == JsonValueKind.Object)
                {
                    var servingsDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(servings.GetRawText());
                    if (servingsDict != null && servingsDict.TryGetValue("Value", out var servingsValue))
                    {
                        if (servingsValue.ValueKind == JsonValueKind.Number)
                        {
                            projected["servings"] = servingsValue.GetInt32();
                        }
                    }
                }
            }
        }

        // Ingredients from Ingredients.ContentItems[*].RecipeIngredient
        var ingredients = new List<Dictionary<string, object>>();
        if (rawItem.TryGetValue("Ingredients", out var ingredientsPart) &&
            ingredientsPart.ValueKind == JsonValueKind.Object)
        {
            var ingredientsPartDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(ingredientsPart.GetRawText());
            if (ingredientsPartDict != null && ingredientsPartDict.TryGetValue("ContentItems", out var contentItems) &&
                contentItems.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in contentItems.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.Object)
                    {
                        var itemDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                        if (itemDict != null && itemDict.TryGetValue("RecipeIngredient", out var recipeIngredient) &&
                            recipeIngredient.ValueKind == JsonValueKind.Object)
                        {
                            var riDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(recipeIngredient.GetRawText());
                            if (riDict != null)
                            {
                                var ingredient = new Dictionary<string, object>();

                                // IngredientId and populated ingredient object from Ingredient.ContentItemIds[0]
                                if (riDict.TryGetValue("Ingredient", out var ingredientField) &&
                                    ingredientField.ValueKind == JsonValueKind.Object)
                                {
                                    var ingDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(ingredientField.GetRawText());
                                    if (ingDict != null && ingDict.TryGetValue("ContentItemIds", out var ingIdsArr) &&
                                        ingIdsArr.ValueKind == JsonValueKind.Array)
                                    {
                                        foreach (var ingId in ingIdsArr.EnumerateArray())
                                        {
                                            if (ingId.ValueKind == JsonValueKind.String)
                                            {
                                                var ingIdStr = ingId.GetString() ?? "";
                                                ingredient["ingredientId"] = ingIdStr;

                                                // Populate ingredient object if available
                                                if (ingredientsDict.TryGetValue(ingIdStr, out var ingObj))
                                                {
                                                    ingredient["ingredient"] = ingObj;
                                                }
                                                break; // Take first
                                            }
                                        }
                                    }
                                }

                                // Quantity from Quantity.Value
                                if (riDict.TryGetValue("Quantity", out var quantity) &&
                                    quantity.ValueKind == JsonValueKind.Object)
                                {
                                    var qtyDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(quantity.GetRawText());
                                    if (qtyDict != null && qtyDict.TryGetValue("Value", out var qtyValue))
                                    {
                                        if (qtyValue.ValueKind == JsonValueKind.Number)
                                        {
                                            ingredient["quantity"] = qtyValue.GetInt32();
                                        }
                                    }
                                }

                                // UnitId and populated unit object from Unit.ContentItemIds[0]
                                if (riDict.TryGetValue("Unit", out var unit) &&
                                    unit.ValueKind == JsonValueKind.Object)
                                {
                                    var unitDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(unit.GetRawText());
                                    if (unitDict != null && unitDict.TryGetValue("ContentItemIds", out var unitIdsArr) &&
                                        unitIdsArr.ValueKind == JsonValueKind.Array)
                                    {
                                        foreach (var unitId in unitIdsArr.EnumerateArray())
                                        {
                                            if (unitId.ValueKind == JsonValueKind.String)
                                            {
                                                var unitIdStr = unitId.GetString() ?? "";
                                                ingredient["unitId"] = unitIdStr;

                                                // Populate unit object if available
                                                if (unitsDict.TryGetValue(unitIdStr, out var unitObj))
                                                {
                                                    ingredient["unit"] = unitObj;
                                                }
                                                break; // Take first
                                            }
                                        }
                                    }
                                }

                                if (ingredient.ContainsKey("ingredientId") &&
                                    ingredient.ContainsKey("quantity") &&
                                    ingredient.ContainsKey("unitId"))
                                {
                                    ingredients.Add(ingredient);
                                }
                            }
                        }
                    }
                }
            }
        }
        projected["ingredients"] = ingredients;

        // Instructions from RecipeInstructions.ContentItems[*].Instruction (sorted by Order)
        var instructions = new List<Dictionary<string, object>>();
        if (rawItem.TryGetValue("RecipeInstructions", out var instructionsPart) &&
            instructionsPart.ValueKind == JsonValueKind.Object)
        {
            var instructionsDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(instructionsPart.GetRawText());
            if (instructionsDict != null && instructionsDict.TryGetValue("ContentItems", out var instContentItems) &&
                instContentItems.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in instContentItems.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.Object)
                    {
                        var itemDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                        if (itemDict != null && itemDict.TryGetValue("Instruction", out var instruction) &&
                            instruction.ValueKind == JsonValueKind.Object)
                        {
                            var instDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(instruction.GetRawText());
                            if (instDict != null)
                            {
                                var instructionObj = new Dictionary<string, object>();

                                // Order from Order.Value
                                if (instDict.TryGetValue("Order", out var order) &&
                                    order.ValueKind == JsonValueKind.Object)
                                {
                                    var orderDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(order.GetRawText());
                                    if (orderDict != null && orderDict.TryGetValue("Value", out var orderValue))
                                    {
                                        if (orderValue.ValueKind == JsonValueKind.Number)
                                        {
                                            instructionObj["order"] = orderValue.GetInt32();
                                        }
                                    }
                                }

                                // Text from Content.Text
                                if (instDict.TryGetValue("Content", out var content) &&
                                    content.ValueKind == JsonValueKind.Object)
                                {
                                    var contentDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(content.GetRawText());
                                    if (contentDict != null && contentDict.TryGetValue("Text", out var text))
                                    {
                                        if (text.ValueKind == JsonValueKind.String)
                                        {
                                            instructionObj["text"] = text.GetString() ?? "";
                                        }
                                    }
                                }

                                if (instructionObj.ContainsKey("order") && instructionObj.ContainsKey("text"))
                                {
                                    instructions.Add(instructionObj);
                                }
                            }
                        }
                    }
                }
            }
        }
        // Sort instructions by order
        instructions = instructions.OrderBy(i =>
        {
            if (i.TryGetValue("order", out var order) && order is int orderInt)
                return orderInt;
            return int.MaxValue;
        }).ToList();
        projected["instructions"] = instructions;

        // Comments from Comments.ContentItems[*].Comment
        var comments = new List<Dictionary<string, object>>();
        if (rawItem.TryGetValue("Comments", out var commentsPart) &&
            commentsPart.ValueKind == JsonValueKind.Object)
        {
            var commentsDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(commentsPart.GetRawText());
            if (commentsDict != null && commentsDict.TryGetValue("ContentItems", out var commentContentItems) &&
                commentContentItems.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in commentContentItems.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.Object)
                    {
                        var itemDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                        if (itemDict != null && itemDict.TryGetValue("Comment", out var comment) &&
                            comment.ValueKind == JsonValueKind.Object)
                        {
                            var commentDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(comment.GetRawText());
                            if (commentDict != null)
                            {
                                var commentObj = new Dictionary<string, object>();

                                // Text from Content.Text
                                if (commentDict.TryGetValue("Content", out var content) &&
                                    content.ValueKind == JsonValueKind.Object)
                                {
                                    var contentDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(content.GetRawText());
                                    if (contentDict != null && contentDict.TryGetValue("Text", out var text))
                                    {
                                        if (text.ValueKind == JsonValueKind.String)
                                        {
                                            commentObj["text"] = text.GetString() ?? "";
                                        }
                                    }
                                }

                                // AuthorUsername from Author.UserNames[0]
                                if (commentDict.TryGetValue("Author", out var author) &&
                                    author.ValueKind == JsonValueKind.Object)
                                {
                                    var authorDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(author.GetRawText());
                                    if (authorDict != null && authorDict.TryGetValue("UserNames", out var userNames) &&
                                        userNames.ValueKind == JsonValueKind.Array)
                                    {
                                        foreach (var userName in userNames.EnumerateArray())
                                        {
                                            if (userName.ValueKind == JsonValueKind.String)
                                            {
                                                commentObj["authorUsername"] = userName.GetString() ?? "";
                                                break; // Take first
                                            }
                                        }
                                    }
                                }

                                if (commentObj.ContainsKey("text") && commentObj.ContainsKey("authorUsername"))
                                {
                                    comments.Add(commentObj);
                                }
                            }
                        }
                    }
                }
            }
        }
        projected["comments"] = comments;

        return projected;
    }
}

