namespace RestRoutes.Services.ContentCleaning;

using System.Text.Json;
using RestRoutes.Services.FieldExtraction;

public class DefaultContentTypeCleaner : IContentTypeCleaner
{
    public bool CanClean(string contentType)
    {
        // Default cleaner handles all content types except Recipe and RecipeIngredient
        return contentType != "Recipe" && contentType != "RecipeIngredient";
    }

    public Dictionary<string, object> Clean(
        Dictionary<string, JsonElement> obj,
        string contentType,
        ContentCleaningContext context)
    {
        var clean = new Dictionary<string, object>();

        // Get basic fields
        if (obj.TryGetValue("ContentItemId", out var id))
            clean["id"] = id.GetString()!;

        if (obj.TryGetValue("DisplayText", out var title))
            clean["title"] = title.GetString()!;

        // Extract slug from AutoroutePart.Path
        if (obj.TryGetValue("AutoroutePart", out var autoroutePart) &&
            autoroutePart.ValueKind == JsonValueKind.Object)
        {
            var autorouteDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(autoroutePart.GetRawText());
            if (autorouteDict != null && autorouteDict.TryGetValue("Path", out var path) &&
                path.ValueKind == JsonValueKind.String)
            {
                clean["slug"] = path.GetString() ?? "";
            }
        }

        // Check for Part sections (e.g., "ShoppingListPart", "OrderPart")
        if (obj.TryGetValue(contentType, out var typeSection) && typeSection.ValueKind == JsonValueKind.Object)
        {
            var typeDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(typeSection.GetRawText());
            if (typeDict != null)
            {
                var fieldContext = context.CreateFieldExtractionContext();
                var factory = new FieldExtractorFactory();

                foreach (var kvp in typeDict)
                {
                    var fieldName = context.ToCamelCaseFunc(kvp.Key);
                    var (value, isIdReference) = factory.ExtractField(kvp.Value, fieldContext);
                    if (value != null)
                    {
                        // If it's an ID reference from ContentItemIds, append "Id" to field name
                        if (isIdReference)
                        {
                            fieldName = fieldName + "Id";
                        }
                        clean[fieldName] = value;
                    }
                }
            }
        }

        // Also check for Part sections (e.g., "ShoppingListPart", "OrderPart")
        var partName = contentType + "Part";
        if (obj.TryGetValue(partName, out var partSection) && partSection.ValueKind == JsonValueKind.Object)
        {
            var partDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(partSection.GetRawText());
            if (partDict != null)
            {
                var fieldContext = context.CreateFieldExtractionContext();
                var factory = new FieldExtractorFactory();

                foreach (var kvp in partDict)
                {
                    var fieldName = context.ToCamelCaseFunc(kvp.Key);

                    // Special handling for User field (UserPickerField) - extract userId directly
                    // Focus on just getting userId for linking to the user who created the list
                    if ((fieldName.Equals("user", StringComparison.OrdinalIgnoreCase) ||
                         fieldName.Equals("User", StringComparison.OrdinalIgnoreCase)) &&
                        kvp.Value.ValueKind == JsonValueKind.Object)
                    {
                        var userDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(kvp.Value.GetRawText());
                        if (userDict != null)
                        {
                            // Try both "UserIds" and "userIds" (case-insensitive)
                            JsonElement userIds;
                            if (userDict.TryGetValue("UserIds", out userIds) ||
                                userDict.TryGetValue("userIds", out userIds))
                            {
                                if (userIds.ValueKind == JsonValueKind.Array)
                                {
                                    // Extract first userId from array
                                    var firstUserId = userIds.EnumerateArray()
                                        .Where(x => x.ValueKind == JsonValueKind.String)
                                        .Select(x => x.GetString())
                                        .Where(x => !string.IsNullOrEmpty(x))
                                        .FirstOrDefault();

                                    if (firstUserId != null)
                                    {
                                        // Return userId as a simple string field
                                        clean["userId"] = firstUserId;
                                    }
                                }
                            }
                        }
                        continue;
                    }

                    var (value, isIdReference) = factory.ExtractField(kvp.Value, fieldContext);
                    if (value != null)
                    {
                        // If it's an ID reference from ContentItemIds, append "Id" to field name
                        if (isIdReference)
                        {
                            fieldName = fieldName + "Id";
                        }
                        clean[fieldName] = value;
                    }
                }
            }
        }

        // Handle BagPart (many-to-many with extra fields)
        // Also handle "Items" which is used in some content types (e.g., ShoppingList, Order)
        HandleBagPart(obj, clean, context);

        return clean;
    }

    private static void HandleBagPart(
        Dictionary<string, JsonElement> obj,
        Dictionary<string, object> clean,
        ContentCleaningContext context)
    {
        JsonElement? bagPartOrItems = null;
        string? bagPartFieldName = null;

        if (obj.TryGetValue("BagPart", out var bagPart) && bagPart.ValueKind == JsonValueKind.Object)
        {
            bagPartOrItems = bagPart;
            bagPartFieldName = "items";
        }
        else if (obj.TryGetValue("Items", out var items) && items.ValueKind == JsonValueKind.Object)
        {
            bagPartOrItems = items;
            bagPartFieldName = "items";
        }

        if (bagPartOrItems.HasValue && bagPartFieldName != null)
        {
            var bagDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(bagPartOrItems.Value.GetRawText());
            if (bagDict != null && bagDict.TryGetValue("ContentItems", out var contentItems) &&
                contentItems.ValueKind == JsonValueKind.Array)
            {
                var itemsList = new List<object>();
                foreach (var item in contentItems.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.Object)
                    {
                        var itemDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                        if (itemDict != null && itemDict.TryGetValue("ContentType", out var itemTypeElement))
                        {
                            var itemType = itemTypeElement.GetString();
                            if (itemType != null)
                            {
                                var cleanedItem = context.CleanObjectFunc(itemDict, itemType);
                                // Include contentType for roundtripping
                                cleanedItem["contentType"] = itemType;
                                itemsList.Add(cleanedItem);
                            }
                        }
                    }
                }

                if (itemsList.Count > 0)
                {
                    clean[bagPartFieldName] = itemsList;
                }
            }
        }
    }
}

