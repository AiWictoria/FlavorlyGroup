namespace RestRoutes.Services;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using OrchardCore.ContentManagement;

public class ContentItemFieldMapperService
{
    private readonly HashSet<string> _reservedFields;

    public ContentItemFieldMapperService()
    {
        _reservedFields = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "id","contentItemId","title","displayText","createdUtc","modifiedUtc",
            "publishedUtc","contentType","published","latest","slug"
        };
    }

    /// <summary>
    /// Maps all fields from the request body to the content item.
    /// For Recipe, maps to Orchard's actual parts; otherwise uses the generic FieldMapper.
    /// </summary>
    public void MapAllFields(ContentItem contentItem, string contentType, Dictionary<string, object> body)
    {
        if (string.Equals(contentType, "Recipe", StringComparison.OrdinalIgnoreCase))
        {
            MapRecipe(contentItem, body);
            return;
        }

        // === Existing generic behavior for other types ===
        // IMPORTANT: Do not cast Content; let your existing FieldMapper handle it.
        foreach (var kvp in body)
        {
            if (_reservedFields.Contains(kvp.Key))
                continue;

            FieldMapper.MapFieldToContentItem(contentItem, contentType, kvp.Key, kvp.Value);
        }
    }

    // ------------------ Recipe mapping ------------------
    private void MapRecipe(ContentItem item, Dictionary<string, object> body)
    {
        T? Get<T>(string key)
        {
            if (!body.TryGetValue(key, out var v) || v is null) return default;

            if (v is T t) return t;

            // Handle System.Text.Json-backed values
            try
            {
                var json = JsonSerializer.Serialize(v);
                return JsonSerializer.Deserialize<T>(json);
            }
            catch
            {
                return default;
            }
        }

        var title = Get<string>("title") ?? "Untitled";
        var description = Get<string>("description") ?? "";
        var prep = Get<int?>("prepTimeMinutes") ?? 0;
        var cook = Get<int?>("cookTimeMinutes") ?? 0;
        var servings = Get<int?>("servings") ?? 0;
        var recipeImage = Get<RecipeImageDto>("recipeImage");
        var userArr = Get<List<UserDto>>("user") ?? new();
        var items = Get<List<ItemDto>>("items") ?? new();
        var slug = Get<string>("slug");

        item.DisplayText = title;

        // ✅ Treat Content as dynamic (System.Text.Json dynamic supports property assignment)
        dynamic content = item.Content;

        // Build child collections as anonymous objects
        var ingredientObjs = items
            .Where(i => string.Equals(i.contentType, "RecipeItem", StringComparison.OrdinalIgnoreCase))
            .Select(i => new
            {
                ContentType = "RecipeItem",
                RecipeItemPart = new
                {
                    Ingredient = new { ContentItemIds = new[] { i.ingredientId } },
                    Quantity = new { Value = i.quantity ?? 0 },
                    Unit = new { ContentItemIds = new[] { i.unitId } }
                }
            })
            .ToList();

        var instructionObjs = items
            .Where(i => string.Equals(i.contentType, "Instruction", StringComparison.OrdinalIgnoreCase))
            .Select(i => new
            {
                ContentType = "Instruction",
                Instruction = new
                {
                    Content = new { Text = i.text ?? "" },
                    Order = new { Value = i.order ?? 0 }
                }
            })
            .ToList();

        var commentObjs = items
            .Where(i => string.Equals(i.contentType, "Comment", StringComparison.OrdinalIgnoreCase))
            .Select(i => new
            {
                ContentType = "Comment",
                Comment = new
                {
                    Content = new { Text = i.content ?? "" },
                    User = new
                    {
                        UserIds = new[] { i.user?.FirstOrDefault()?.id },
                        UserNames = new[] { i.user?.FirstOrDefault()?.username }
                    }
                }
            })
            .ToList();

        // Parts
        content.TitlePart = new { Title = title };

        content.RecipePart = new
        {
            Description = new { Markdown = description },
            RecipeImage = new
            {
                Paths = recipeImage?.paths ?? Array.Empty<string>(),
                MediaTexts = recipeImage?.mediaTexts ?? Array.Empty<string>()
            },
            PrepTimeMinutes = new { Value = prep },
            CookTimeMinutes = new { Value = cook },
            Servings = new { Value = servings },
            User = new
            {
                UserIds = new[] { userArr.FirstOrDefault()?.id },
                UserNames = new[] { userArr.FirstOrDefault()?.username }
            }
        };

        content.RecipeIngredients = new { ContentItems = ingredientObjs };
        content.RecipeInstructions = new { ContentItems = instructionObjs };
        content.RecipeComments = new { ContentItems = commentObjs };

        // Also populate a root BagPart with all items so generic cleaners/consumers can find them under 'items'
        // This is additive and does not replace named BagParts.
        var allItems = ingredientObjs.Concat(instructionObjs).Concat(commentObjs).ToList();
        content.BagPart = new
        {
            ContentItems = allItems
        };

        if (!string.IsNullOrWhiteSpace(slug))
        {
            content.AutoroutePart = new
            {
                SetHomepage = false,
                Disabled = false,
                RouteContainedItems = false,
                Absolute = false,
                Path = slug
            };
        }
    }

    // DTOs matching your payload
    private record RecipeImageDto(string[] paths, string[] mediaTexts);
    private record UserDto(string id, string username);
    private record ItemDto(
        string contentType,
        string? ingredientId,
        int? quantity,
        string? unitId,
        string? text,
        int? order,
        string? content,
        List<UserDto>? user
    );

    public HashSet<string> GetReservedFields() => _reservedFields;
}
