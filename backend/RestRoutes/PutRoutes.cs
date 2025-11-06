namespace RestRoutes;

using OrchardCore.ContentManagement;
using Microsoft.AspNetCore.Mvc;
using RestRoutes.Constants;
using RestRoutes.Services.ContentMutation;
using RestRoutes.Services.Response;

public static class PutRoutes
{
    public static void MapPutRoutes(this WebApplication app)
    {
        app.MapPut("api/{contentType}/{id}", async (
            string contentType,
            string id,
            [FromBody] Dictionary<string, object>? body,
            [FromServices] IContentManager contentManager,
            [FromServices] YesSql.ISession session,
            [FromServices] ContentMutationService mutationService,
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
                    return ResponseBuilder.Error("Cannot read request body", 400);
                }

                // Get the existing content item
                var contentItem = await contentManager.GetAsync(id, VersionOptions.Published);

                if (contentItem == null || contentItem.ContentType != contentType)
                {
                    return ResponseBuilder.NotFound("Content item not found");
                }

                // Validate fields
                var validFields = await FieldValidator.GetValidFieldsAsync(contentType, contentManager, session);
                var (isValid, invalidFields) = FieldValidator.ValidateFields(body, validFields, ReservedFields.Fields, contentType);

                if (!isValid)
                {
                    return ResponseBuilder.ValidationError(invalidFields, validFields.ToList());
                }

                // Update title if provided
                if (body.ContainsKey("title"))
                {
                    contentItem.DisplayText = body["title"].ToString() ?? contentItem.DisplayText;
                }

                // Update fields - only the ones provided in the body
                mutationService.ApplyFieldsToContentItem(contentItem, contentType, body);

                await contentManager.UpdateAsync(contentItem);
                await contentManager.PublishAsync(contentItem);
                await session.SaveChangesAsync();

                return ResponseBuilder.Success(new
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
