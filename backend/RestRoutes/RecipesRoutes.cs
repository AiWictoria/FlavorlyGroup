namespace RestRoutes;

using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using OrchardCore.ContentManagement;

public static class RecipesRoutes
{
    public static void MapRecipeRoutes(this WebApplication app)
    {
        app.MapPost("api/recipes", async (
            [FromBody] CreateRecipeRequest dto,
            [FromServices] IContentManager contentManager,
            [FromServices] YesSql.ISession session,
            HttpContext httpContext) =>
        {
            try
            {
                // Permissions for Recipe creation
                var permissionCheck = await PermissionsACL.CheckPermissions("Recipe", "POST", httpContext, session);
                if (permissionCheck != null) return permissionCheck;

                // DataAnnotations validation
                var validationResults = new List<ValidationResult>();
                var validationContext = new ValidationContext(dto);
                if (!Validator.TryValidateObject(dto, validationContext, validationResults, validateAllProperties: true))
                {
                    return Results.ValidationProblem(validationResults
                        .GroupBy(r => r.MemberNames.FirstOrDefault() ?? string.Empty)
                        .ToDictionary(g => g.Key, g => g.Select(r => r.ErrorMessage ?? "Invalid").ToArray()));
                }

                var contentItem = await contentManager.NewAsync("Recipe");

                contentItem.DisplayText = dto.Title;
                contentItem.Owner = httpContext.User?.Identity?.Name ?? "anonymous";
                contentItem.Author = contentItem.Owner;

                // Root structure to mirror Orchard parts (GET expects RecipePart at root)
                var root = new Dictionary<string, object>();

                // AutoroutePart (slug)
                if (!string.IsNullOrWhiteSpace(dto.Slug))
                {
                    root["AutoroutePart"] = new Dictionary<string, object>
                    {
                        { "Path", dto.Slug! }
                    };
                }

                // RecipePart mapping
                var recipePart = new Dictionary<string, object>();
                if (dto.RecipePart != null)
                {
                    if (!string.IsNullOrWhiteSpace(dto.RecipePart.Description))
                    {
                        recipePart["Description"] = new Dictionary<string, object> { { "Markdown", dto.RecipePart.Description! } };
                    }
                    if (dto.RecipePart.PrepTimeMinutes.HasValue)
                    {
                        recipePart["PrepTimeMinutes"] = new Dictionary<string, object> { { "Value", (double)dto.RecipePart.PrepTimeMinutes.Value } };
                    }
                    if (dto.RecipePart.CookTimeMinutes.HasValue)
                    {
                        recipePart["CookTimeMinutes"] = new Dictionary<string, object> { { "Value", (double)dto.RecipePart.CookTimeMinutes.Value } };
                    }
                    if (dto.RecipePart.Servings.HasValue)
                    {
                        recipePart["Servings"] = new Dictionary<string, object> { { "Value", (double)dto.RecipePart.Servings.Value } };
                    }

                    if (dto.RecipePart.RecipeImage != null)
                    {
                        var img = new Dictionary<string, object>();
                        if (dto.RecipePart.RecipeImage.Paths != null)
                        {
                            img["Paths"] = dto.RecipePart.RecipeImage.Paths;
                        }
                        if (dto.RecipePart.RecipeImage.MediaTexts != null)
                        {
                            img["MediaTexts"] = dto.RecipePart.RecipeImage.MediaTexts;
                        }
                        if (img.Count > 0)
                        {
                            recipePart["RecipeImage"] = img;
                        }
                    }

                    if (dto.RecipePart.Category != null && dto.RecipePart.Category.Count > 0)
                    {
                        recipePart["Category"] = new Dictionary<string, object>
                        {
                            { "TermContentItemIds", dto.RecipePart.Category }
                        };
                    }
                }

                if (recipePart.Count > 0)
                {
                    root["RecipePart"] = recipePart;
                }

                // Ingredients (Contained Items)
                if (dto.Ingredients != null && dto.Ingredients.Count > 0)
                {
                    var contentItems = new List<object>();
                    foreach (var ing in dto.Ingredients)
                    {
                        var part = new Dictionary<string, object>();
                        if (!string.IsNullOrWhiteSpace(ing.IngredientId))
                        {
                            part["Ingredient"] = new Dictionary<string, object>
                            {
                                { "ContentItemIds", new List<string> { ing.IngredientId! } }
                            };
                        }
                        if (!string.IsNullOrWhiteSpace(ing.UnitId))
                        {
                            part["Unit"] = new Dictionary<string, object>
                            {
                                { "ContentItemIds", new List<string> { ing.UnitId! } }
                            };
                        }
                        part["Quantity"] = new Dictionary<string, object>
                        {
                            { "Value", ing.Quantity }
                        };

                        var ingredientObj = new Dictionary<string, object>
                        {
                            { "ContentType", "RecipeIngredient" },
                            { "RecipeIngredient", part }
                        };
                        contentItems.Add(ingredientObj);
                    }
                    root["Ingredients"] = new Dictionary<string, object> { { "ContentItems", contentItems } };
                }

                // Instructions (Contained Items)
                if (dto.Instructions != null && dto.Instructions.Count > 0)
                {
                    var contentItems = new List<object>();
                    foreach (var ins in dto.Instructions)
                    {
                        var part = new Dictionary<string, object>();
                        if (!string.IsNullOrWhiteSpace(ins.Content))
                        {
                            part["Content"] = new Dictionary<string, object> { { "Text", ins.Content! } };
                        }
                        part["Order"] = new Dictionary<string, object> { { "Value", (double)ins.Order } };

                        var insObj = new Dictionary<string, object>
                        {
                            { "ContentType", "Instruction" },
                            { "Instruction", part }
                        };
                        contentItems.Add(insObj);
                    }
                    root["RecipeInstructions"] = new Dictionary<string, object> { { "ContentItems", contentItems } };
                }

                // Apply built content
                foreach (var kv in root)
                {
                    contentItem.Content[kv.Key] = kv.Value;
                }

                await contentManager.CreateAsync(contentItem, VersionOptions.Published);
                await session.SaveChangesAsync();

                return Results.Json(new
                {
                    id = contentItem.ContentItemId,
                    title = contentItem.DisplayText
                }, statusCode: 201);
            }
            catch (Exception ex)
            {
                return Results.Json(new { error = ex.Message }, statusCode: 500);
            }
        });
    }
}

public sealed class CreateRecipeRequest
{
    [Required]
    public string Title { get; set; } = string.Empty;
    public string? Slug { get; set; }
    [Required]
    public RecipePartDto RecipePart { get; set; } = new();
    public List<IngredientDto>? Ingredients { get; set; }
    public List<InstructionDto>? Instructions { get; set; }
}

public sealed class RecipePartDto
{
    public string? Description { get; set; }
    public int? PrepTimeMinutes { get; set; }
    public int? CookTimeMinutes { get; set; }
    public int? Servings { get; set; }
    public ImageDto? RecipeImage { get; set; }
    public List<string>? Category { get; set; }
}

public sealed class ImageDto
{
    public List<string>? Paths { get; set; }
    public List<string>? MediaTexts { get; set; }
}

public sealed class IngredientDto
{
    [Required]
    public string IngredientId { get; set; } = string.Empty;
    [Required]
    public string UnitId { get; set; } = string.Empty;
    [Range(0.0, double.MaxValue)]
    public double Quantity { get; set; }
}

public sealed class InstructionDto
{
    [Required]
    public string Content { get; set; } = string.Empty;
    [Range(0, int.MaxValue)]
    public int Order { get; set; }
}


