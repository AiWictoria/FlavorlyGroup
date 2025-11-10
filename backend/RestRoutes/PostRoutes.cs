namespace RestRoutes;

using OrchardCore.ContentManagement;
using Microsoft.AspNetCore.Mvc;
using RestRoutes.Services;

/// <summary>
/// POST routes for creating new content items.
/// Refactored to follow SOLID principles:
/// - Single Responsibility: Only orchestrates the POST request flow
/// - Open/Closed: Easy to extend by adding new services
/// - Dependency Inversion: Depends on service abstractions
/// - DRY: No duplicated code, all logic in dedicated services
/// </summary>
public static class PostRoutes
{
    public static void MapPostRoutes(this WebApplication app)
    {
        app.MapPost("api/{contentType}", async (
            string contentType,
            [FromBody] Dictionary<string, object>? body,
            [FromServices] IContentManager contentManager,
            [FromServices] YesSql.ISession session,
            [FromServices] PostRequestValidator validator,
            [FromServices] ContentItemCreationService creationService,
            HttpContext context) =>
        {
            try
            {
                // Step 1: Check permissions
                var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "POST", context, session);
                if (permissionCheck != null) return permissionCheck;

                // Step 2: Validate request body
                var (isValidBody, bodyError) = validator.ValidateRequestBody(body);
                if (!isValidBody) return bodyError!;

                // Step 3: Validate fields
                var (isValidFields, fieldsError) = await validator.ValidateFieldsAsync(
                    contentType, body!, contentManager, session);
                if (!isValidFields) return fieldsError!;

                // Step 4: Create content item
                var userName = context.User?.Identity?.Name;
                var contentItem = await creationService.CreateContentItemAsync(
                    contentType, body!, userName, contentManager, session);

                // Step 5: Build and return clean, populated response
                var cleanResponse = await ResponseBuilder.BuildCleanResponse(
                    contentType,
                    contentItem.ContentItemId,
                    session,
                    populate: true);

                if (cleanResponse == null)
                {
                    return Results.Json(new
                    {
                        error = "Response builder failed",
                        id = contentItem.ContentItemId
                    }, statusCode: 500);
                }

                return Results.Json(cleanResponse, statusCode: 201);
            }
            catch (Exception ex)
            {
                return Results.Json(new
                {
                    error = ex.Message
                }, statusCode: 500);
            }
        });
    }
}
