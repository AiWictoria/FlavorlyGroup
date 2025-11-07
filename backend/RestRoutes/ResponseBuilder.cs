namespace RestRoutes;

using YesSql;

public static class ResponseBuilder
{
    /// <summary>
    /// Builds a clean, populated response for a single content item by ID.
    /// Uses FetchCleanContent() to get all items and filters by ID.
    /// </summary>
    /// <param name="contentType">The content type to fetch</param>
    /// <param name="id">The ContentItemId to find</param>
    /// <param name="session">The YesSql session</param>
    /// <param name="populate">Whether to populate referenced items (default: true)</param>
    /// <returns>The cleaned, populated object, or null if not found</returns>
    public static async Task<Dictionary<string, object>?> BuildCleanResponse(
        string contentType,
        string id,
        ISession session,
        bool populate = true,
        bool useNewCleaner = true,
        int maxPopulationDepth = 2)
    {
        // Use FetchCleanContent() to get all clean items
        var cleanObjects = await GetRoutes.FetchCleanContent(
            contentType,
            session,
            populate,
            useNewCleaner,
            maxPopulationDepth);

        // Find the item with matching id
        var item = cleanObjects.FirstOrDefault(obj =>
            obj.ContainsKey("id") && obj["id"]?.ToString() == id);

        return item;
    }
}

