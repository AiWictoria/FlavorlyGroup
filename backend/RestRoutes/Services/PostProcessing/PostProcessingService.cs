namespace RestRoutes.Services.PostProcessing;

using YesSql.Services;

public class PostProcessingService
{
    private readonly CategoryTermPostProcessor _categoryTermProcessor;

    public PostProcessingService()
    {
        _categoryTermProcessor = new CategoryTermPostProcessor();
    }

    public List<Dictionary<string, object>> ProcessRecipeIngredients(
        List<Dictionary<string, object>> objects)
    {
        return RecipeIngredientPostProcessor.Process(objects);
    }

    public static List<Dictionary<string, object>> ProcessRecipeIngredientsStatic(
        List<Dictionary<string, object>> objects)
    {
        return RecipeIngredientPostProcessor.Process(objects);
    }

    public async Task<List<Dictionary<string, object>>> ProcessCategoryTermsAsync(
        List<Dictionary<string, object>> objects,
        YesSql.ISession session)
    {
        return await _categoryTermProcessor.ProcessAsync(objects, session);
    }
}

