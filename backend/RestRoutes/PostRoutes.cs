namespace RestRoutes;

using OrchardCore.ContentManagement;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

public static class PostRoutes
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

    public static void MapPostRoutes(this WebApplication app)
    {
        app.MapPost("api/{contentType}", async (
            string contentType,
            [FromBody] Dictionary<string, object>? body,
            [FromServices] IContentManager contentManager,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            try
            {
                // Check permissions
                var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "POST", context, session);
                if (permissionCheck != null) return permissionCheck;

                // Check if body is null or empty
                if (body == null || body.Count == 0)
                {
                    return Results.Json(new {
                        error = "Cannot read request body"
                    }, statusCode: 400);
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

                var contentItem = await contentManager.NewAsync(contentType);

                // Extract and handle special fields explicitly
                contentItem.DisplayText = body.ContainsKey("title")
                    ? body["title"].ToString()
                    : "Untitled";

                contentItem.Owner = context.User?.Identity?.Name ?? "anonymous";
                contentItem.Author = contentItem.Owner;

                // Build content directly into the content item using FieldMapper
                foreach (var kvp in body)
                {
                    // Skip all reserved fields
                    if (RESERVED_FIELDS.Contains(kvp.Key))
                        continue;

                    FieldMapper.MapFieldToContentItem(contentItem, contentType, kvp.Key, kvp.Value);
                }

                await contentManager.CreateAsync(contentItem, VersionOptions.Published);
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
                    }, statusCode: 201);
                }

                return Results.Json(cleanResponse, statusCode: 201);
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
