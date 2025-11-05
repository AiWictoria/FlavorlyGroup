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

            Dictionary<string, object>? item = null;

            // For Recipe content type, use projection to transform to target format
            if (contentType == "Recipe")
            {
                var (clean, rawById) = await FetchCleanContentWithRaw(contentType, session, populate: true);

                // Find the item with matching id
                var foundItem = clean.FirstOrDefault(obj => obj.ContainsKey("id") && obj["id"]?.ToString() == id);

                if (foundItem != null && foundItem.TryGetValue("id", out var idObj) && idObj is string itemId && rawById.TryGetValue(itemId, out var raw))
                {
                    // Collect ingredient and unit IDs from this recipe
                    var ingredientIds = new HashSet<string>();
                    var unitIds = new HashSet<string>();

                    if (raw.TryGetValue("Ingredients", out var ingredientsPart) &&
                        ingredientsPart.ValueKind == JsonValueKind.Object)
                    {
                        var ingredientsPartDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(ingredientsPart.GetRawText());
                        if (ingredientsPartDict != null && ingredientsPartDict.TryGetValue("ContentItems", out var contentItems) &&
                            contentItems.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var contentItem in contentItems.EnumerateArray())
                            {
                                if (contentItem.ValueKind == JsonValueKind.Object)
                                {
                                    var contentItemDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(contentItem.GetRawText());
                                    if (contentItemDict != null && contentItemDict.TryGetValue("RecipeIngredient", out var recipeIngredient) &&
                                        recipeIngredient.ValueKind == JsonValueKind.Object)
                                    {
                                        var riDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(recipeIngredient.GetRawText());
                                        if (riDict != null)
                                        {
                                            if (riDict.TryGetValue("Ingredient", out var ingredientField) &&
                                                ingredientField.ValueKind == JsonValueKind.Object)
                                            {
                                                var ingDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(ingredientField.GetRawText());
                                                if (ingDict != null && ingDict.TryGetValue("ContentItemIds", out var ingIdsArr) &&
                                                    ingIdsArr.ValueKind == JsonValueKind.Array)
                                                {
                                                    foreach (var ingId in ingIdsArr.EnumerateArray())
                                                    {
                                                        if (ingId.ValueKind == JsonValueKind.String)
                                                        {
                                                            var ingIdStr = ingId.GetString();
                                                            if (ingIdStr != null) ingredientIds.Add(ingIdStr);
                                                        }
                                                    }
                                                }
                                            }

                                            if (riDict.TryGetValue("Unit", out var unit) &&
                                                unit.ValueKind == JsonValueKind.Object)
                                            {
                                                var unitDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(unit.GetRawText());
                                                if (unitDict != null && unitDict.TryGetValue("ContentItemIds", out var unitIdsArr) &&
                                                    unitIdsArr.ValueKind == JsonValueKind.Array)
                                                {
                                                    foreach (var unitId in unitIdsArr.EnumerateArray())
                                                    {
                                                        if (unitId.ValueKind == JsonValueKind.String)
                                                        {
                                                            var unitIdStr = unitId.GetString();
                                                            if (unitIdStr != null) unitIds.Add(unitIdStr);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Fetch Ingredient and Unit content items
                    var ingredientsDict = new Dictionary<string, Dictionary<string, object>>();
                    var unitsDict = new Dictionary<string, Dictionary<string, object>>();

                    if (ingredientIds.Count > 0)
                    {
                        var ingredients = await session
                            .Query()
                            .For<ContentItem>()
                            .With<ContentItemIndex>(x => x.ContentItemId.IsIn(ingredientIds) && x.Published)
                            .ListAsync();

                        var jsonOptions = new JsonSerializerOptions
                        {
                            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
                        };
                        var ingredientsJson = JsonSerializer.Serialize(ingredients, jsonOptions);
                        var ingredientsList = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(ingredientsJson);
                        if (ingredientsList != null)
                        {
                            foreach (var ing in ingredientsList)
                            {
                                if (ing.TryGetValue("ContentItemId", out var idElement))
                                {
                                    var ingId = idElement.GetString();
                                    if (ingId != null)
                                    {
                                        var name = "";
                                        if (ing.TryGetValue("DisplayText", out var displayText) && displayText.ValueKind == JsonValueKind.String)
                                        {
                                            name = displayText.GetString() ?? "";
                                        }
                                        else if (ing.TryGetValue("TitlePart", out var titlePart) && titlePart.ValueKind == JsonValueKind.Object)
                                        {
                                            var titleDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(titlePart.GetRawText());
                                            if (titleDict != null && titleDict.TryGetValue("Title", out var title) && title.ValueKind == JsonValueKind.String)
                                            {
                                                name = title.GetString() ?? "";
                                            }
                                        }

                                        ingredientsDict[ingId] = new Dictionary<string, object>
                                        {
                                            ["id"] = ingId,
                                            ["name"] = name
                                        };
                                    }
                                }
                            }
                        }
                    }

                    if (unitIds.Count > 0)
                    {
                        var units = await session
                            .Query()
                            .For<ContentItem>()
                            .With<ContentItemIndex>(x => x.ContentItemId.IsIn(unitIds) && x.Published)
                            .ListAsync();

                        var jsonOptions = new JsonSerializerOptions
                        {
                            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
                        };
                        var unitsJson = JsonSerializer.Serialize(units, jsonOptions);
                        var unitsList = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(unitsJson);
                        if (unitsList != null)
                        {
                            foreach (var unit in unitsList)
                            {
                                if (unit.TryGetValue("ContentItemId", out var idElement))
                                {
                                    var unitId = idElement.GetString();
                                    if (unitId != null)
                                    {
                                        var name = "";
                                        if (unit.TryGetValue("DisplayText", out var displayText) && displayText.ValueKind == JsonValueKind.String)
                                        {
                                            name = displayText.GetString() ?? "";
                                        }
                                        else if (unit.TryGetValue("TitlePart", out var titlePart) && titlePart.ValueKind == JsonValueKind.Object)
                                        {
                                            var titleDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(titlePart.GetRawText());
                                            if (titleDict != null && titleDict.TryGetValue("Title", out var title) && title.ValueKind == JsonValueKind.String)
                                            {
                                                name = title.GetString() ?? "";
                                            }
                                        }

                                        unitsDict[unitId] = new Dictionary<string, object>
                                        {
                                            ["id"] = unitId,
                                            ["name"] = name
                                        };
                                    }
                                }
                            }
                        }
                    }

                    item = ProjectRecipe(foundItem, raw, ingredientsDict, unitsDict);
                }
            }
            else
            {
                // Get clean populated data for other content types
                var cleanObjects = await FetchCleanContent(contentType, session, populate: true);

                // Find the item with matching id
                item = cleanObjects.FirstOrDefault(obj => obj.ContainsKey("id") && obj["id"]?.ToString() == id);
            }

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

            List<Dictionary<string, object>> cleanObjects;

            // For Recipe content type, use projection to transform to target format
            if (contentType == "Recipe")
            {
                var (clean, rawById) = await FetchCleanContentWithRaw(contentType, session, populate: true);

                // Collect all ingredient IDs and unit IDs from raw recipe data
                var ingredientIds = new HashSet<string>();
                var unitIds = new HashSet<string>();
                foreach (var raw in rawById.Values)
                {
                    if (raw.TryGetValue("Ingredients", out var ingredientsPart) &&
                        ingredientsPart.ValueKind == JsonValueKind.Object)
                    {
                        var ingredientsPartDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(ingredientsPart.GetRawText());
                        if (ingredientsPartDict != null && ingredientsPartDict.TryGetValue("ContentItems", out var contentItems) &&
                            contentItems.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var contentItem in contentItems.EnumerateArray())
                            {
                                if (contentItem.ValueKind == JsonValueKind.Object)
                                {
                                    var contentItemDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(contentItem.GetRawText());
                                    if (contentItemDict != null && contentItemDict.TryGetValue("RecipeIngredient", out var recipeIngredient) &&
                                        recipeIngredient.ValueKind == JsonValueKind.Object)
                                    {
                                        var riDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(recipeIngredient.GetRawText());
                                        if (riDict != null)
                                        {
                                            // Collect ingredient ID
                                            if (riDict.TryGetValue("Ingredient", out var ingredientField) &&
                                                ingredientField.ValueKind == JsonValueKind.Object)
                                            {
                                                var ingDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(ingredientField.GetRawText());
                                                if (ingDict != null && ingDict.TryGetValue("ContentItemIds", out var ingIdsArr) &&
                                                    ingIdsArr.ValueKind == JsonValueKind.Array)
                                                {
                                                    foreach (var ingId in ingIdsArr.EnumerateArray())
                                                    {
                                                        if (ingId.ValueKind == JsonValueKind.String)
                                                        {
                                                            var ingIdStr = ingId.GetString();
                                                            if (ingIdStr != null) ingredientIds.Add(ingIdStr);
                                                        }
                                                    }
                                                }
                                            }

                                            // Collect unit ID
                                            if (riDict.TryGetValue("Unit", out var unit) &&
                                                unit.ValueKind == JsonValueKind.Object)
                                            {
                                                var unitDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(unit.GetRawText());
                                                if (unitDict != null && unitDict.TryGetValue("ContentItemIds", out var unitIdsArr) &&
                                                    unitIdsArr.ValueKind == JsonValueKind.Array)
                                                {
                                                    foreach (var unitId in unitIdsArr.EnumerateArray())
                                                    {
                                                        if (unitId.ValueKind == JsonValueKind.String)
                                                        {
                                                            var unitIdStr = unitId.GetString();
                                                            if (unitIdStr != null) unitIds.Add(unitIdStr);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Fetch Ingredient and Unit content items
                var ingredientsDict = new Dictionary<string, Dictionary<string, object>>();
                var unitsDict = new Dictionary<string, Dictionary<string, object>>();

                if (ingredientIds.Count > 0)
                {
                    var ingredients = await session
                        .Query()
                        .For<ContentItem>()
                        .With<ContentItemIndex>(x => x.ContentItemId.IsIn(ingredientIds) && x.Published)
                        .ListAsync();

                    var jsonOptions = new JsonSerializerOptions
                    {
                        ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
                    };
                    var ingredientsJson = JsonSerializer.Serialize(ingredients, jsonOptions);
                    var ingredientsList = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(ingredientsJson);
                    if (ingredientsList != null)
                    {
                        foreach (var ing in ingredientsList)
                        {
                            if (ing.TryGetValue("ContentItemId", out var idElement))
                            {
                                var id = idElement.GetString();
                                if (id != null)
                                {
                                    var name = "";
                                    if (ing.TryGetValue("DisplayText", out var displayText) && displayText.ValueKind == JsonValueKind.String)
                                    {
                                        name = displayText.GetString() ?? "";
                                    }
                                    else if (ing.TryGetValue("TitlePart", out var titlePart) && titlePart.ValueKind == JsonValueKind.Object)
                                    {
                                        var titleDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(titlePart.GetRawText());
                                        if (titleDict != null && titleDict.TryGetValue("Title", out var title) && title.ValueKind == JsonValueKind.String)
                                        {
                                            name = title.GetString() ?? "";
                                        }
                                    }

                                    ingredientsDict[id] = new Dictionary<string, object>
                                    {
                                        ["id"] = id,
                                        ["name"] = name
                                    };
                                }
                            }
                        }
                    }
                }

                if (unitIds.Count > 0)
                {
                    var units = await session
                        .Query()
                        .For<ContentItem>()
                        .With<ContentItemIndex>(x => x.ContentItemId.IsIn(unitIds) && x.Published)
                        .ListAsync();

                    var jsonOptions = new JsonSerializerOptions
                    {
                        ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
                    };
                    var unitsJson = JsonSerializer.Serialize(units, jsonOptions);
                    var unitsList = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(unitsJson);
                    if (unitsList != null)
                    {
                        foreach (var unit in unitsList)
                        {
                            if (unit.TryGetValue("ContentItemId", out var idElement))
                            {
                                var id = idElement.GetString();
                                if (id != null)
                                {
                                    var name = "";
                                    if (unit.TryGetValue("DisplayText", out var displayText) && displayText.ValueKind == JsonValueKind.String)
                                    {
                                        name = displayText.GetString() ?? "";
                                    }
                                    else if (unit.TryGetValue("TitlePart", out var titlePart) && titlePart.ValueKind == JsonValueKind.Object)
                                    {
                                        var titleDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(titlePart.GetRawText());
                                        if (titleDict != null && titleDict.TryGetValue("Title", out var title) && title.ValueKind == JsonValueKind.String)
                                        {
                                            name = title.GetString() ?? "";
                                        }
                                    }

                                    unitsDict[id] = new Dictionary<string, object>
                                    {
                                        ["id"] = id,
                                        ["name"] = name
                                    };
                                }
                            }
                        }
                    }
                }

                // Project each Recipe item to target format
                var projected = new List<Dictionary<string, object>>();
                foreach (var cleaned in clean)
                {
                    if (cleaned.TryGetValue("id", out var idObj) && idObj is string id && rawById.TryGetValue(id, out var raw))
                    {
                        projected.Add(ProjectRecipe(cleaned, raw, ingredientsDict, unitsDict));
                    }
                }

                cleanObjects = projected;
            }
            else
            {
                // Get clean populated data for other content types
                cleanObjects = await FetchCleanContent(contentType, session, populate: true);
            }

            // Apply query filters
            var filteredData = ApplyQueryFilters(context.Request.Query, cleanObjects);

            return Results.Json(filteredData);
        });

        // Get single item by ID (without population)
        app.MapGet("api/{contentType}/{id}", async (
            string contentType,
            string id,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Get clean data without population
            var cleanObjects = await FetchCleanContent(contentType, session, populate: false);

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

        // Get all items without population (with optional filters)
        app.MapGet("api/{contentType}", async (
            string contentType,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            // Check permissions
            var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "GET", context, session);
            if (permissionCheck != null) return permissionCheck;

            // Get clean data without population
            var cleanObjects = await FetchCleanContent(contentType, session, populate: false);

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
