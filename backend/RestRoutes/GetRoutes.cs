global using Dyndata;
global using static Dyndata.Factory;

namespace RestRoutes;

using OrchardCore.ContentManagement;
using OrchardCore.ContentManagement.Records;
using Microsoft.AspNetCore.Mvc;
using YesSql.Services;
using System.Text.Json;
using System.Text.RegularExpressions;

public static partial class GetRoutes
{
    public static void MapGetRoutes(this WebApplication app)
    {
        // DEBUG: Get populated but not cleaned data
        app.MapGet("api/debug/populated/{contentType}/{id}", async (
            string contentType,
            string id,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            // Get populated but NOT cleaned data
            var contentItems = await session
                .Query()
                .For<ContentItem>()
                .With<ContentItemIndex>(x => x.ContentType == contentType && x.Published)
                .ListAsync();

            var jsonOptions = new JsonSerializerOptions
            {
                ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
            };
            var jsonString = JsonSerializer.Serialize(contentItems, jsonOptions);
            var plainObjects = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(jsonString);
            if (plainObjects == null) return Results.Json(null);

            // Populate
            var allReferencedIds = new HashSet<string>();
            foreach (var obj in plainObjects)
            {
                CollectContentItemIds(obj, allReferencedIds);
            }

            if (allReferencedIds.Count > 0)
            {
                var referencedItems = await session
                    .Query()
                    .For<ContentItem>()
                    .With<ContentItemIndex>(x => x.ContentItemId.IsIn(allReferencedIds))
                    .ListAsync();

                var refJsonString = JsonSerializer.Serialize(referencedItems, jsonOptions);
                var plainRefItems = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(refJsonString);
                if (plainRefItems != null)
                {
                    var itemsDictionary = new Dictionary<string, Dictionary<string, JsonElement>>();
                    foreach (var item in plainRefItems)
                    {
                        if (item.TryGetValue("ContentItemId", out var idElement))
                        {
                            var itemId = idElement.GetString();
                            if (itemId != null) itemsDictionary[itemId] = item;
                        }
                    }

                    foreach (var obj in plainObjects)
                    {
                        PopulateContentItemIds(obj, itemsDictionary, 1, 2);
                    }
                }
            }

            // Find the item with matching id
            var debugItem = plainObjects.FirstOrDefault(obj => obj.TryGetValue("ContentItemId", out var idEl) && idEl.GetString() == id);

            return Results.Json(debugItem);
        });

        // Get single item by ID (with population)
        app.MapGet("api/expand/{contentType}/{id}", async (
            string contentType,
            string id,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Parse query parameters
            var depthParam = context.Request.Query["depth"].FirstOrDefault();
            var maxDepth = int.TryParse(depthParam, out var d) ? d : 2;

            var legacyParam = context.Request.Query["legacyCleaning"].FirstOrDefault();
            var useLegacy = bool.TryParse(legacyParam, out var l) && l;

            // Get clean populated data
            var cleanObjects = await FetchCleanContent(contentType, session, populate: true, useNewCleaner: !useLegacy, maxPopulationDepth: maxDepth);

            // Find the item with matching id
            var item = cleanObjects.FirstOrDefault(obj => obj.ContainsKey("id") && obj["id"]?.ToString() == id);

            if (item == null)
            {
                context.Response.StatusCode = 404;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("null");
                return Results.Empty;
            }

            return Results.Json(item);
        });

        // Get all items with population (with optional filters)
        app.MapGet("api/expand/{contentType}", async (
            string contentType,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Parse query parameters
            var depthParam = context.Request.Query["depth"].FirstOrDefault();
            var maxDepth = int.TryParse(depthParam, out var d) ? d : 2;

            var legacyParam = context.Request.Query["legacyCleaning"].FirstOrDefault();
            var useLegacy = bool.TryParse(legacyParam, out var l) && l;

            // Get clean populated data
            var cleanObjects = await FetchCleanContent(contentType, session, populate: true, useNewCleaner: !useLegacy, maxPopulationDepth: maxDepth);

            // Apply query filters
            var filteredData = ApplyQueryFilters(context.Request.Query, cleanObjects);

            return Results.Json(filteredData);
        });

        // Get single item by ID (unpopulated - minimal depth)
        app.MapGet("api/{contentType}/{id}", async (
            string contentType,
            string id,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Parse query parameters
            var legacyParam = context.Request.Query["legacyCleaning"].FirstOrDefault();
            var useLegacy = bool.TryParse(legacyParam, out var l) && l;

            // Get clean data with population (depth 2 for population, but cleaner limits output to depth 1)
            var cleanObjects = await FetchCleanContent(contentType, session, populate: true, useNewCleaner: !useLegacy, maxPopulationDepth: 2);

            // Find the item with matching id
            var item = cleanObjects.FirstOrDefault(obj => obj.ContainsKey("id") && obj["id"]?.ToString() == id);

            if (item == null)
            {
                context.Response.StatusCode = 404;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("null");
                return Results.Empty;
            }

            return Results.Json(item);
        });

        // Get all items unpopulated (with optional filters) - minimal depth
        app.MapGet("api/{contentType}", async (
            string contentType,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Parse query parameters
            var legacyParam = context.Request.Query["legacyCleaning"].FirstOrDefault();
            var useLegacy = bool.TryParse(legacyParam, out var l) && l;

            // Get clean data with population (depth 2 for population, but cleaner limits output to depth 1)
            var cleanObjects = await FetchCleanContent(contentType, session, populate: true, useNewCleaner: !useLegacy, maxPopulationDepth: 2);

            // Apply query filters
            var filteredData = ApplyQueryFilters(context.Request.Query, cleanObjects);

            return Results.Json(filteredData);
        });

        // Get single raw item by ID (no cleanup, no population)
        app.MapGet("api/raw/{contentType}/{id}", async (
            string contentType,
            string id,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Get raw data
            var rawObjects = await FetchRawContent(contentType, session);

            // Find the item with matching ContentItemId
            var item = rawObjects.FirstOrDefault(obj =>
                obj.ContainsKey("ContentItemId") && obj["ContentItemId"]?.ToString() == id);

            if (item == null)
            {
                context.Response.StatusCode = 404;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("null");
                return Results.Empty;
            }

            return Results.Json(item);
        });

        // Get all raw items (no cleanup, no population, but with filters)
        app.MapGet("api/raw/{contentType}", async (
            string contentType,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Get raw data
            var rawObjects = await FetchRawContent(contentType, session);

            // Apply query filters (filtering works on raw data too)
            var filteredData = ApplyQueryFilters(context.Request.Query, rawObjects);

            return Results.Json(filteredData);
        });
    }
}
