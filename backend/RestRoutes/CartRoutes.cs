namespace RestRoutes;

using OrchardCore.ContentManagement;
using Microsoft.AspNetCore.Mvc;
using RestRoutes.Services;

/// <summary>
/// Specific routes for Cart content type.
/// Handles Cart creation, deletion, and management.
/// </summary>
public static class CartRoutes
{
  public static void MapCartRoutes(this WebApplication app)
  {
    // POST /api/Cart - Create a new empty cart for a user
    app.MapPost("api/Cart", CreateCart);

    // DELETE /api/Cart/{cartId} - Delete an existing cart
    app.MapDelete("api/Cart/{cartId}", DeleteCart);
  }

  private static async Task<IResult> CreateCart(
      [FromBody] Dictionary<string, object>? body,
      [FromServices] IContentManager contentManager,
      [FromServices] YesSql.ISession session,
      [FromServices] ContentItemMetadataService metadataService,
      [FromServices] ContentItemFieldMapperService fieldMapperService,
      HttpContext context)
  {
    try
    {
      // Check permissions
      var permissionCheck = await PermissionsACL.CheckPermissions("Cart", "POST", context, session);
      if (permissionCheck != null) return permissionCheck;

      // Create new Cart content item
      var contentItem = await contentManager.NewAsync("Cart");

      // Prepare body with title if not provided
      var bodyWithTitle = body ?? new();
      if (!bodyWithTitle.ContainsKey("title"))
      {
        bodyWithTitle["title"] = "Cart";
      }

      // Set metadata (owner, author, title)
      metadataService.SetMetadata(contentItem, bodyWithTitle, context.User?.Identity?.Name);

      // Map user data using FieldMapper
      fieldMapperService.MapAllFields(contentItem, "Cart", bodyWithTitle);

      // Create empty BagPart with empty ContentItems
      contentItem.Content["BagPart"] = new Dictionary<string, object>
      {
        ["ContentItems"] = new List<object>()
      };

      // Handle CartPart with User info
      // Extract user info from body if provided
      if (body != null && body.ContainsKey("user"))
      {
        var userArray = body["user"];

        if (userArray is System.Collections.IList userList && userList.Count > 0)
        {
          var userIds = new List<string>();
          var userNames = new List<string>();

          foreach (var userItem in userList)
          {
            if (userItem is System.Collections.Generic.Dictionary<string, object> userDict)
            {
              if (userDict.ContainsKey("id"))
                userIds.Add(userDict["id"].ToString() ?? "");
              if (userDict.ContainsKey("username"))
                userNames.Add(userDict["username"].ToString() ?? "");
            }
          }

          // Create CartPart with proper User structure
          contentItem.Content["CartPart"] = new Dictionary<string, object>
          {
            ["User"] = new Dictionary<string, object>
            {
              ["UserIds"] = userIds,
              ["UserNames"] = userNames
            }
          };

          Console.WriteLine($"[CREATE CART] Set CartPart.User with {userIds.Count} user(s)");
        }
      }

      // Create as draft first
      await contentManager.CreateAsync(contentItem, VersionOptions.Draft);

      // Publish the content item
      await contentManager.PublishAsync(contentItem);

      // Save changes
      await session.SaveChangesAsync();

      Console.WriteLine($"[CREATE CART] New cart created: {contentItem.ContentItemId}, Owner: {contentItem.Owner}");

      // Build clean response
      var cleanResponse = await ResponseBuilder.BuildCleanResponse(
          "Cart",
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
      Console.WriteLine($"[CREATE CART] Error: {ex.Message}");
      return Results.Json(new { error = ex.Message }, statusCode: 500);
    }
  }

  private static async Task<IResult> DeleteCart(
      string cartId,
      [FromServices] IContentManager contentManager,
      [FromServices] YesSql.ISession session,
      HttpContext context)
  {
    try
    {
      // Check permissions
      var permissionCheck = await PermissionsACL.CheckPermissions("Cart", "DELETE", context, session);
      if (permissionCheck != null) return permissionCheck;

      // Get the cart
      var contentItem = await contentManager.GetAsync(cartId, VersionOptions.Published);

      if (contentItem == null || contentItem.ContentType != "Cart")
      {
        return Results.Json(new { error = "Cart not found" }, statusCode: 404);
      }

      // Delete the cart
      await contentManager.RemoveAsync(contentItem);
      await session.SaveChangesAsync();

      Console.WriteLine($"[DELETE CART] Cart deleted: {cartId}");

      return Results.Json(new
      {
        success = true,
        id = cartId
      }, statusCode: 200);
    }
    catch (Exception ex)
    {
      Console.WriteLine($"[DELETE CART] Error: {ex.Message}");
      return Results.Json(new { error = ex.Message }, statusCode: 500);
    }
  }
}
