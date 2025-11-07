namespace RestRoutes.Services;

using OrchardCore.ContentManagement;

/// <summary>
/// Service responsible for mapping request body fields to content item structure.
/// Follows Single Responsibility Principle - only handles field mapping.
/// Uses FieldMapper internally to avoid duplication.
/// </summary>
public class ContentItemFieldMapperService
{
    private readonly HashSet<string> _reservedFields;

    public ContentItemFieldMapperService()
    {
        _reservedFields = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
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

    /// <summary>
    /// Maps all fields from the request body to the content item.
    /// Skips reserved fields and handles special cases (like "items" for BagPart).
    /// </summary>
    public void MapAllFields(ContentItem contentItem, string contentType, Dictionary<string, object> body)
    {
        // Initialize the content type section if it doesn't exist
        if (!contentItem.Content.ContainsKey(contentType))
        {
            contentItem.Content[contentType] = new Dictionary<string, object>();
        }

        // Map all non-reserved fields
        foreach (var kvp in body)
        {
            // Skip reserved fields
            if (_reservedFields.Contains(kvp.Key))
                continue;

            // Map the field using FieldMapper
            FieldMapper.MapFieldToContentItem(contentItem, contentType, kvp.Key, kvp.Value);
        }
    }

    /// <summary>
    /// Gets the set of reserved fields that should not be mapped as regular fields.
    /// </summary>
    public HashSet<string> GetReservedFields() => _reservedFields;
}

