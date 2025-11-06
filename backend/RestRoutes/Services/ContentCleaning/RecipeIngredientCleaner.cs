namespace RestRoutes.Services.ContentCleaning;

using System.Text.Json;

public class RecipeIngredientCleaner : IContentTypeCleaner
{
    public bool CanClean(string contentType)
    {
        return contentType == "RecipeIngredient";
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

        // Handle RecipeIngredientPart fields
        if (obj.TryGetValue("RecipeIngredient", out var recipeIngredientPart) && recipeIngredientPart.ValueKind == JsonValueKind.Object)
        {
            var riDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(recipeIngredientPart.GetRawText());
            if (riDict != null)
            {
                // Handle Quantity
                if (riDict.TryGetValue("Quantity", out var quantity) && quantity.ValueKind == JsonValueKind.Object)
                {
                    var qtyDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(quantity.GetRawText());
                    if (qtyDict != null && qtyDict.TryGetValue("Value", out var value))
                    {
                        if (value.ValueKind == JsonValueKind.Number)
                        {
                            clean["quantity"] = value.GetDouble();
                        }
                    }
                }

                // Ingredient and Unit will be populated later, but we need to mark them as ID references
                // They will be handled in post-processing after population
                if (riDict.TryGetValue("Ingredient", out var ingredientField) && ingredientField.ValueKind == JsonValueKind.Object)
                {
                    var ingDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(ingredientField.GetRawText());
                    if (ingDict != null && ingDict.TryGetValue("ContentItemIds", out var ingIds) &&
                        ingIds.ValueKind == JsonValueKind.Array)
                    {
                        var ids = ingIds.EnumerateArray()
                            .Where(x => x.ValueKind == JsonValueKind.String)
                            .Select(x => x.GetString())
                            .Where(x => x != null)
                            .ToList();

                        if (ids.Count > 0)
                        {
                            clean["ingredientId"] = ids[0]!;
                        }
                    }
                }

                if (riDict.TryGetValue("Unit", out var unitField) && unitField.ValueKind == JsonValueKind.Object)
                {
                    var unitDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(unitField.GetRawText());
                    if (unitDict != null && unitDict.TryGetValue("ContentItemIds", out var unitIds) &&
                        unitIds.ValueKind == JsonValueKind.Array)
                    {
                        var ids = unitIds.EnumerateArray()
                            .Where(x => x.ValueKind == JsonValueKind.String)
                            .Select(x => x.GetString())
                            .Where(x => x != null)
                            .ToList();

                        if (ids.Count > 0)
                        {
                            clean["unitId"] = ids[0]!;
                        }
                    }
                }
            }
        }

        // Return early - RecipeIngredient will be post-processed after population
        return clean;
    }
}

