namespace RestRoutes.Services.ContentCleaning;

public class ContentTypeCleanerFactory
{
    private readonly List<IContentTypeCleaner> _cleaners;

    public ContentTypeCleanerFactory()
    {
        _cleaners = new List<IContentTypeCleaner>
        {
            new RecipeCleaner(),
            new RecipeIngredientCleaner(),
            new DefaultContentTypeCleaner() // Must be last as it handles all other types
        };
    }

    public IContentTypeCleaner GetCleaner(string contentType)
    {
        foreach (var cleaner in _cleaners)
        {
            if (cleaner.CanClean(contentType))
            {
                return cleaner;
            }
        }

        // Fallback to default
        return _cleaners.Last();
    }
}

