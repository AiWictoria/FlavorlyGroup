namespace RestRoutes;

using OrchardCore.ContentManagement;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

public static class PutRoutes
{
    private static readonly HashSet<string> RESERVED_FIELDS = new(StringComparer.OrdinalIgnoreCase)
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

    public static void MapPutRoutes(this WebApplication app)
    {
        app.MapPut("api/{contentType}/{id}", async (
            string contentType,
            string id,
            [FromBody] Dictionary<string, object>? body,
            [FromServices] IContentManager contentManager,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            try
            {
                // Check permissions
                var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "PUT", context, session);
                if (permissionCheck != null) return permissionCheck;

                // Check if body is null or empty
                if (body == null || body.Count == 0)
                {
                    return Results.Json(new {
                        error = "Cannot read request body"
                    }, statusCode: 400);
                }

                // Get the existing content item
                var contentItem = await contentManager.GetAsync(id, VersionOptions.Published);

                if (contentItem == null || contentItem.ContentType != contentType)
                {
                    return Results.Json(new { error = "Content item not found" }, statusCode: 404);
                }

                // Validate fields
                var validFields = await FieldValidator.GetValidFieldsAsync(contentType, contentManager, session);
                var (isValid, invalidFields) = FieldValidator.ValidateFields(body, validFields, RESERVED_FIELDS);

                if (!isValid)
                {
                    return Results.Json(new {
                        error = "Invalid fields provided",
                        invalidFields = invalidFields,
                        validFields = validFields.OrderBy(f => f).ToList()
                    }, statusCode: 400);
                }

                // Update title if provided
                if (body.ContainsKey("title"))
                {
                    contentItem.DisplayText = body["title"].ToString() ?? contentItem.DisplayText;
                }

                // Update fields - only the ones provided in the body using FieldMapper
                foreach (var kvp in body)
                {
                    // Skip all reserved fields
                    if (RESERVED_FIELDS.Contains(kvp.Key))
                        continue;

                    FieldMapper.MapFieldToContentItem(contentItem, contentType, kvp.Key, kvp.Value);
                }

                await contentManager.UpdateAsync(contentItem);
                await contentManager.PublishAsync(contentItem);
                await session.SaveChangesAsync();

                // Build and return clean, populated response
                var cleanResponse = await ResponseBuilder.BuildCleanResponse(
                    contentType,
                    contentItem.ContentItemId,
                    session,
                    populate: true);

                if (cleanResponse == null)
                {
                    // Fallback if response builder fails (shouldn't happen, but safety check)
                    return Results.Json(new {
                        id = contentItem.ContentItemId,
                        title = contentItem.DisplayText
                    }, statusCode: 200);
                }

                return Results.Json(cleanResponse, statusCode: 200);
            }
            catch (Exception ex)
            {
                return Results.Json(new {
                    error = ex.Message
                }, statusCode: 500);
            }
        });
    }
}
