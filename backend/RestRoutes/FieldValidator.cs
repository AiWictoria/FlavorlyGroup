namespace RestRoutes;

using OrchardCore.ContentManagement;
using YesSql.Services;

public static class FieldValidator
{
    public static async Task<HashSet<string>> GetValidFieldsAsync(
        string contentType,
        IContentManager contentManager,
        YesSql.ISession session)
    {
        // Try to get existing items first
        var cleanObjects = await GetRoutes.FetchCleanContent(contentType, session, populate: false, denormalize: false);

        HashSet<string> validFields;

        if (cleanObjects.Any())
        {
            // Collect ALL unique fields from ALL items (handles optional fields)
            validFields = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var item in cleanObjects)
            {
                foreach (var key in item.Keys)
                {
                    validFields.Add(key);
                }
            }
        }
        else
        {
            // No existing items - create a temporary one to get the schema
            var tempItem = await contentManager.NewAsync(contentType);
            tempItem.DisplayText = "_temp_schema_item";

            await contentManager.CreateAsync(tempItem, VersionOptions.Published);
            await session.SaveChangesAsync();

            // Get the cleaned version to extract fields
            cleanObjects = await GetRoutes.FetchCleanContent(contentType, session, populate: false, denormalize: false);
            validFields = cleanObjects.First().Keys.ToHashSet(StringComparer.OrdinalIgnoreCase);

            // Delete the temporary item
            await contentManager.RemoveAsync(tempItem);
            await session.SaveChangesAsync();
        }

        // Add special fields that are always valid for content types that use BagPart/Items
        // These fields are mapped from BagPart/Items in raw data but may not appear in cleaned responses
        var contentTypesWithItems = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "ShoppingList",
            "Order"
            // Add other content types that use BagPart/Items here
        };

        if (contentTypesWithItems.Contains(contentType))
        {
            validFields.Add("items");
        }

        // Add special fields for content types that use UserPickerField in Part sections
        // These fields are mapped from Part.User.UserIds/UserNames in raw data but may not appear in cleaned responses
        var contentTypesWithUserField = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "ShoppingList",
            "Order"
            // Add other content types that use UserPickerField in Part sections here
        };

        if (contentTypesWithUserField.Contains(contentType))
        {
            validFields.Add("user");
        }

        return validFields;
    }

    public static (bool isValid, List<string> invalidFields) ValidateFields(
        Dictionary<string, object> body,
        HashSet<string> validFields,
        HashSet<string> reservedFields,
        string? contentType = null)
    {
        // Field aliases - allow alternative names for fields
        var fieldAliases = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            // userId is an alias for user (used in POST, but GET returns "user")
            { "userId", "user" }
        };

        // Special fields that are always valid for certain content types (fallback)
        var alwaysValidFields = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        if (!string.IsNullOrEmpty(contentType))
        {
            var contentTypesWithItems = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "ShoppingList",
                "Order"
            };
            var contentTypesWithUserField = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "ShoppingList",
                "Order"
            };

            if (contentTypesWithItems.Contains(contentType))
            {
                alwaysValidFields.Add("items");
            }
            if (contentTypesWithUserField.Contains(contentType))
            {
                alwaysValidFields.Add("user");
            }
        }

        var invalidFields = body.Keys
            .Where(key =>
            {
                // Skip reserved fields
                if (reservedFields.Contains(key))
                    return false;

                // Check if field is valid directly
                if (validFields.Contains(key))
                    return false;

                // Check if field is in always-valid list (fallback)
                if (alwaysValidFields.Contains(key))
                    return false;

                // Check if field has an alias that is valid
                if (fieldAliases.TryGetValue(key, out var alias))
                {
                    if (validFields.Contains(alias) || alwaysValidFields.Contains(alias))
                        return false;
                }

                // Field is invalid
                return true;
            })
            .ToList();

        return (invalidFields.Count == 0, invalidFields);
    }
}
