namespace RestRoutes;

using OrchardCore.ContentManagement;
using System.Text.Json;

/// <summary>
/// Helper class for updating content items using JsonUpdateModel with Orchard's field driver pipeline.
/// JsonUpdateModel allows us to use Orchard's field driver pipeline format for complex field types.
/// </summary>
public static class ContentItemUpdater
{
    /// <summary>
    /// Updates a content item using JsonUpdateModel to leverage Orchard's field driver pipeline.
    /// This method uses JsonUpdateModel to update the content part, which formats data
    /// in the way Orchard's field drivers expect (e.g., "ContentType.FieldName" format).
    /// </summary>
    public static async Task<bool> UpdateContentItemWithJsonUpdateModel(
        ContentItem contentItem,
        string contentType,
        Dictionary<string, object> jsonData,
        HashSet<string> reservedFields)
    {
        // Filter out reserved fields
        var filteredData = jsonData
            .Where(kvp => !reservedFields.Contains(kvp.Key))
            .ToDictionary(kvp => kvp.Key, kvp => kvp.Value);

        if (filteredData.Count == 0)
        {
            return true; // Nothing to update
        }

        // Ensure the content type section exists
        if (!contentItem.Content.ContainsKey(contentType))
        {
            contentItem.Content[contentType] = new Dictionary<string, object>();
        }

        // Create JsonUpdateModel instance
        // JsonUpdateModel will convert JSON data to the format field drivers expect
        // (e.g., "Recipe.Image.Paths" format)
        var updateModel = new JsonUpdateModel(filteredData, contentType);

        // Get the content part for this content type
        var part = contentItem.Content[contentType];

        if (part != null)
        {
            // Use JsonUpdateModel to update the part
            // This uses reflection to set properties in the format that Orchard's field drivers expect
            var success = await updateModel.TryUpdateModelAsync(part, contentType);

            // Check for validation errors
            if (!success || updateModel.ModelState.ErrorCount > 0)
            {
                // ModelState contains errors - could log them if needed
                return false;
            }
        }

        return true;
    }
}

