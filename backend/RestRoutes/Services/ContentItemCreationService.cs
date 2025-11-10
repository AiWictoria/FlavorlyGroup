namespace RestRoutes.Services;

using OrchardCore.ContentManagement;
using YesSql;

/// <summary>
/// Service responsible for creating new content items.
/// Follows Single Responsibility Principle - only handles content item creation logic.
///
/// Note: IContentManager and ISession are passed as parameters rather than injected
/// to avoid dependency resolution issues with OrchardCore services at registration time.
/// </summary>
public class ContentItemCreationService
{
    private readonly ContentItemMetadataService _metadataService;
    private readonly ContentItemFieldMapperService _fieldMapperService;

    public ContentItemCreationService(
        ContentItemMetadataService metadataService,
        ContentItemFieldMapperService fieldMapperService)
    {
        _metadataService = metadataService;
        _fieldMapperService = fieldMapperService;
    }

    /// <summary>
    /// Creates a new content item from the provided data.
    /// Returns the created content item or throws an exception if creation fails.
    /// </summary>
    public async Task<ContentItem> CreateContentItemAsync(
        string contentType,
        Dictionary<string, object> body,
        string? userName,
        IContentManager contentManager,
        ISession session)
    {
        // Step 1: Create new content item
        var contentItem = await contentManager.NewAsync(contentType);

        // Step 2: Set metadata (title, owner, author)
        _metadataService.SetMetadata(contentItem, body, userName);

        // Step 3: Map all fields from body to content item
        _fieldMapperService.MapAllFields(contentItem, contentType, body);

        // Step 4: Create as draft first
        await contentManager.CreateAsync(contentItem, VersionOptions.Draft);

        // Step 5: Publish the content item
        await contentManager.PublishAsync(contentItem);

        // Step 6: Save changes
        await session.SaveChangesAsync();

        return contentItem;
    }
}

