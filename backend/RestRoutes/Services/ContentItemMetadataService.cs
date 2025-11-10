namespace RestRoutes.Services;

using OrchardCore.ContentManagement;
using System.Text.Json;

/// <summary>
/// Service responsible for setting content item metadata (title, owner, author).
/// Follows Single Responsibility Principle - only handles metadata.
/// </summary>
public class ContentItemMetadataService
{
    /// <summary>
    /// Sets metadata on a content item from the request body.
    /// </summary>
    public void SetMetadata(ContentItem contentItem, Dictionary<string, object> body, string? userName)
    {
        // Set display text (title)
        contentItem.DisplayText = ExtractTitle(body);

        // Set owner and author
        contentItem.Owner = userName ?? "anonymous";
        contentItem.Author = contentItem.Owner;
    }

    /// <summary>
    /// Extracts the title from the request body, handling different value types.
    /// </summary>
    private string ExtractTitle(Dictionary<string, object> body)
    {
        if (!body.ContainsKey("title"))
        {
            return "Untitled";
        }

        var titleValue = body["title"];

        // Handle JsonElement
        if (titleValue is JsonElement jsonEl && jsonEl.ValueKind == JsonValueKind.String)
        {
            return jsonEl.GetString() ?? "Untitled";
        }

        // Handle string directly
        if (titleValue is string strValue)
        {
            return strValue;
        }

        // Handle other types by converting to string
        return titleValue?.ToString() ?? "Untitled";
    }
}

