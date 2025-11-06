namespace RestRoutes.Services.PostProcessing;

public static class RecipeIngredientPostProcessor
{
    public static List<Dictionary<string, object>> Process(List<Dictionary<string, object>> objects)
    {
        var result = new List<Dictionary<string, object>>();

        foreach (var obj in objects)
        {
            var processed = ProcessRecursive(obj);
            result.Add(processed);
        }

        return result;
    }

    private static Dictionary<string, object> ProcessRecursive(Dictionary<string, object> obj)
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
                processed[kvp.Key] = ProcessRecursive(nestedDict);
            }
            else if (kvp.Value is List<object> list)
            {
                var processedList = new List<object>();
                foreach (var item in list)
                {
                    if (item is Dictionary<string, object> itemDict)
                    {
                        processedList.Add(ProcessRecursive(itemDict));
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
}

