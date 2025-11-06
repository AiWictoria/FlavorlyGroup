namespace RestRoutes.Constants;

public static class ReservedFields
{
    public static readonly HashSet<string> Fields = new(StringComparer.OrdinalIgnoreCase)
    {
        "id",
        "contentItemId",
        "title",
        "displayText",
        "createdUtc",
        "modifiedUtc",
        "publishedUtc",
        "contentType",
        "published",
        "latest"
    };
}

