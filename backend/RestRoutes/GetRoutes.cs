global using Dyndata;
global using static Dyndata.Factory;

namespace RestRoutes;

using OrchardCore.ContentManagement;
using OrchardCore.ContentManagement.Records;
using Microsoft.AspNetCore.Mvc;
using YesSql.Services;
using System.Text.Json;
using System.Text.RegularExpressions;
using RestRoutes.Services.ContentQuery;

public static partial class GetRoutes
{
    public static void MapGetRoutes(this WebApplication app)
    {
        // Get single item by ID (with population)
        app.MapGet("api/expand/{contentType}/{id}", async (
            string contentType,
            string id,
            [FromServices] YesSql.ISession session,
            [FromServices] ContentQueryService queryService,
            HttpContext context) =>
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Get clean populated data
            var cleanObjects = await FetchCleanContent(contentType, session, populate: true, denormalize: true);

            // Find the item with matching id
            return queryService.FindItemById(cleanObjects, id);
        });

        // Get all items with population (with optional filters)
        app.MapGet("api/expand/{contentType}", async (
            string contentType,
            [FromServices] YesSql.ISession session,
            [FromServices] ContentQueryService queryService,
            HttpContext context) =>
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Get clean populated data
            var cleanObjects = await FetchCleanContent(contentType, session, populate: true, denormalize: true);

            // Apply query filters
            var filteredData = ApplyQueryFilters(context.Request.Query, cleanObjects);

            return queryService.ReturnItems(filteredData);
        });

        // Get single item by ID (without population)
        app.MapGet("api/{contentType}/{id}", async (
            string contentType,
            string id,
            [FromServices] YesSql.ISession session,
            [FromServices] ContentQueryService queryService,
            HttpContext context) =>
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Get clean data without population
            var cleanObjects = await FetchCleanContent(contentType, session, populate: false);

            // Find the item with matching id
            return queryService.FindItemById(cleanObjects, id);
        });

        // Get all items without population (with optional filters)
        app.MapGet("api/{contentType}", async (
            string contentType,
            [FromServices] YesSql.ISession session,
            [FromServices] ContentQueryService queryService,
            HttpContext context) =>
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Get clean data without population
            var cleanObjects = await FetchCleanContent(contentType, session, populate: false);

            // Apply query filters
            var filteredData = ApplyQueryFilters(context.Request.Query, cleanObjects);

            return queryService.ReturnItems(filteredData);
        });

        // Get single raw item by ID (no cleanup, no population)
        app.MapGet("api/raw/{contentType}/{id}", async (
            string contentType,
            string id,
            [FromServices] YesSql.ISession session,
            [FromServices] ContentQueryService queryService,
            HttpContext context) =>
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Get raw data
            var rawObjects = await FetchRawContent(contentType, session);

            // Find the item with matching ContentItemId
            return queryService.FindItemByContentItemId(rawObjects, id);
        });

        // Get all raw items (no cleanup, no population, but with filters)
        app.MapGet("api/raw/{contentType}", async (
            string contentType,
            [FromServices] YesSql.ISession session,
            [FromServices] ContentQueryService queryService,
            HttpContext context) =>
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Get raw data
            var rawObjects = await FetchRawContent(contentType, session);

            // Apply query filters (filtering works on raw data too)
            var filteredData = ApplyQueryFilters(context.Request.Query, rawObjects);

            return queryService.ReturnItems(filteredData);
        });
    }
}
