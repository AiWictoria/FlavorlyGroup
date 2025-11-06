namespace RestRoutes;

using OrchardCore.ContentManagement;
using Microsoft.AspNetCore.Mvc;
using RestRoutes.Constants;
using RestRoutes.Services.ContentMutation;
using RestRoutes.Services.Response;
using System.Linq;

public static class PostRoutes
{
    public static void MapPostRoutes(this WebApplication app)
    {
        app.MapPost("api/{contentType}", async (
            string contentType,
            [FromBody] Dictionary<string, object>? body,
            [FromServices] IContentManager contentManager,
            [FromServices] YesSql.ISession session,
            [FromServices] ContentMutationService mutationService,
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
                    return ResponseBuilder.Error("Cannot read request body", 400);
                }

                // Validate fields
                var validFields = await FieldValidator.GetValidFieldsAsync(contentType, contentManager, session);
                var (isValid, invalidFields) = FieldValidator.ValidateFields(body, validFields, ReservedFields.Fields, contentType);

                if (!isValid)
                {
                    return ResponseBuilder.ValidationError(invalidFields, validFields.ToList());
                }

                var contentItem = await contentManager.NewAsync(contentType);

                // Set metadata and apply fields
                mutationService.SetContentItemMetadata(contentItem, body, context.User?.Identity?.Name);
                mutationService.ApplyFieldsToContentItem(contentItem, contentType, body);

                await contentManager.CreateAsync(contentItem, VersionOptions.Published);
                await session.SaveChangesAsync();

                return ResponseBuilder.Created(new
                {
                    id = contentItem.ContentItemId,
                    title = contentItem.DisplayText
                });
            }
            catch (Exception ex)
            {
                return ResponseBuilder.InternalServerError(ex.Message);
            }
        });
    }
}
