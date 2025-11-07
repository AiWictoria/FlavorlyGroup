namespace RestRoutes;

using System.Text.Json;

/// <summary>
/// Configurable content cleaner with depth-aware cleaning logic.
/// Uses CleaningConfiguration to determine which fields to include at each depth level.
/// </summary>
public static class ConfigurableContentCleaner
{
    /// <summary>
    /// Cleans a content item with depth awareness and field whitelisting.
    /// </summary>
    public static Dictionary<string, object> CleanWithDepth(
        Dictionary<string, JsonElement> obj,
        string contentType,
        CleaningConfiguration config,
        int currentDepth = 1,
        int maxDepth = 2,
        Dictionary<string, JsonElement>? usersDictionary = null)
    {
        var clean = new Dictionary<string, object>();
        var allowedFields = config.GetAllowedFields(contentType, currentDepth);
        var hasWhitelist = allowedFields != null;

        // Always include id and title if present
        if (obj.TryGetValue("ContentItemId", out var id))
        {
            clean["id"] = id.GetString()!;
        }

        if (obj.TryGetValue("DisplayText", out var title) && (!hasWhitelist || allowedFields.Contains("title")))
        {
            var titleStr = title.GetString();
            clean["title"] = titleStr;
        }

        // Get the content type section (e.g., "Recipe", "Product", etc.)
        // Prefer {ContentType}Part (e.g., "RecipePart", "ProductPart") as that's where fields usually are
        var typeSectionKey = contentType;
        var typePartKey = contentType + "Part";

        JsonElement? typeSection = null;
        // Try {ContentType}Part first (e.g., "RecipePart")
        if (obj.TryGetValue(typePartKey, out var tp) && tp.ValueKind == JsonValueKind.Object)
        {
            typeSection = tp;
        }
        // Fall back to {ContentType} (e.g., "Recipe")
        else if (obj.TryGetValue(typeSectionKey, out var ts) && ts.ValueKind == JsonValueKind.Object)
        {
            typeSection = ts;
        }

        if (typeSection.HasValue)
        {
            var typeDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(typeSection.Value.GetRawText());
            if (typeDict != null)
            {
                foreach (var kvp in typeDict)
                {
                    var fieldName = ToCamelCase(kvp.Key);

                    // Check if field is allowed in whitelist (if whitelist exists)
                    if (hasWhitelist && !allowedFields.Contains(fieldName))
                        continue;

                    // Get special handling for this field
                    var handlingType = config.GetFieldHandling(fieldName);

                    var (value, isIdReference) = ExtractFieldValueWithDepth(
                        kvp.Value,
                        config,
                        currentDepth,
                        maxDepth,
                        handlingType,
                        usersDictionary);

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

        // Special handling for Unit content type: normalize 'code' to 'unitCode'
        if (contentType == "Unit" && clean.ContainsKey("code") && !clean.ContainsKey("unitCode"))
        {
            clean["unitCode"] = clean["code"];
            clean.Remove("code");
        }

        // Special handling for Ingredient: use TitlePart.Title or DisplayText as 'name'
        if (contentType == "Ingredient" && !clean.ContainsKey("name"))
        {
            // Try TitlePart.Title first
            if (obj.TryGetValue("TitlePart", out var titlePart) && titlePart.ValueKind == JsonValueKind.Object)
            {
                var titleDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(titlePart.GetRawText());
                if (titleDict != null && titleDict.TryGetValue("Title", out var titleValue))
                {
                    clean["name"] = titleValue.GetString() ?? "";
                }
            }
            // Fallback to DisplayText
            else if (obj.TryGetValue("DisplayText", out var displayText))
            {
                clean["name"] = displayText.GetString() ?? "";
            }
        }

        // Special handling for OrderItem: extract Price from OrderItemPart.Price
        if (contentType == "OrderItem")
        {
            if (obj.TryGetValue("OrderItemPart", out var orderItemPart) && orderItemPart.ValueKind == JsonValueKind.Object)
            {
                var partDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(orderItemPart.GetRawText());
                if (partDict != null && partDict.TryGetValue("Price", out var priceEl))
                {
                    // Extract Price.Value field
                    if (priceEl.ValueKind == JsonValueKind.Object)
                    {
                        var priceDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(priceEl.GetRawText());
                        if (priceDict != null && priceDict.TryGetValue("Value", out var valueEl))
                        {
                            if (valueEl.ValueKind == JsonValueKind.Number)
                            {
                                clean["price"] = valueEl.GetDecimal();
                            }
                        }
                    }
                }
            }
        }

        // Special handling for Instruction: map Order.Value to 'step' and Content.Text to 'text'
        if (contentType == "Instruction")
        {
            if (obj.TryGetValue("Instruction", out var instrPart) && instrPart.ValueKind == JsonValueKind.Object)
            {
                var instrDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(instrPart.GetRawText());
                if (instrDict != null)
                {
                    // Map Order.Value to step
                    if (instrDict.TryGetValue("Order", out var orderEl) && orderEl.ValueKind == JsonValueKind.Object)
                    {
                        var orderDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(orderEl.GetRawText());
                        if (orderDict != null && orderDict.TryGetValue("Value", out var valueEl))
                        {
                            if (valueEl.ValueKind == JsonValueKind.Number)
                            {
                                clean["step"] = valueEl.GetInt32();
                            }
                        }
                    }

                    // Map Content.Text to text
                    if (instrDict.TryGetValue("Content", out var contentEl) && contentEl.ValueKind == JsonValueKind.Object)
                    {
                        var contentDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(contentEl.GetRawText());
                        if (contentDict != null && contentDict.TryGetValue("Text", out var textEl))
                        {
                            clean["text"] = textEl.GetString() ?? "";
                        }
                    }
                }
            }
        }

        // Handle BagPart (many-to-many with extra fields) - items like RecipeIngredient, Instructions, Comments
        if ((!hasWhitelist || allowedFields.Contains("items")) &&
            obj.TryGetValue("BagPart", out var bagPart) &&
            bagPart.ValueKind == JsonValueKind.Object)
        {
            var bagDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(bagPart.GetRawText());
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
                                // BagPart items are at same depth level (they're part of the parent)
                                var cleanedItem = CleanWithDepth(itemDict, itemType, config, currentDepth, maxDepth, usersDictionary);
                                // Include contentType for roundtripping
                                cleanedItem["contentType"] = itemType;
                                itemsList.Add(cleanedItem);
                            }
                        }
                    }
                }

                if (itemsList.Count > 0)
                {
                    clean["items"] = itemsList;
                }
            }
        }

        // Handle named BagParts (Ingredients, RecipeInstructions, Comments, etc.)
        // These function like BagPart but with specific names
        var processedNamedBags = false;
        foreach (var kvp in obj)
        {
            // Skip if this is already handled or not an object
            if (kvp.Key == "BagPart" ||
                kvp.Key == contentType ||
                kvp.Key == contentType + "Part" ||
                kvp.Value.ValueKind != JsonValueKind.Object)
                continue;

            // Check if this object has ContentItems array (looks like a BagPart)
            var potentialBagDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(kvp.Value.GetRawText());
            if (potentialBagDict != null &&
                potentialBagDict.TryGetValue("ContentItems", out var namedBagItems) &&
                namedBagItems.ValueKind == JsonValueKind.Array &&
                namedBagItems.GetArrayLength() > 0)
            {
                // This is a named BagPart! Process it if whitelist allows items
                if (!hasWhitelist || allowedFields.Contains("items"))
                {
                    var itemsList = new List<object>();
                    foreach (var item in namedBagItems.EnumerateArray())
                    {
                        if (item.ValueKind == JsonValueKind.Object)
                        {
                            var itemDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                            if (itemDict != null && itemDict.TryGetValue("ContentType", out var itemTypeElement))
                            {
                                var itemType = itemTypeElement.GetString();
                                if (itemType != null)
                                {
                                    // Clean the item at same depth (BagPart items are part of parent)
                                    var cleanedItem = CleanWithDepth(itemDict, itemType, config, currentDepth, maxDepth, usersDictionary);
                                    cleanedItem["contentType"] = itemType;
                                    itemsList.Add(cleanedItem);
                                }
                            }
                        }
                    }

                    if (itemsList.Count > 0)
                    {
                        // Merge with existing items if any
                        if (clean.ContainsKey("items") && clean["items"] is List<object> existingItems)
                        {
                            existingItems.AddRange(itemsList);
                        }
                        else
                        {
                            clean["items"] = itemsList;
                        }
                        processedNamedBags = true;
                    }
                }
            }
        }

        // Handle any generic Part fields that might be in the whitelist
        foreach (var kvp in obj)
        {
            // Check if this is a Part that ends with "Part"
            // Skip {ContentType}Part as it's already handled as the type section
            var isContentTypePart = kvp.Key.Equals(contentType + "Part", StringComparison.OrdinalIgnoreCase);

            if (kvp.Key.EndsWith("Part", StringComparison.OrdinalIgnoreCase) &&
                kvp.Key != "BagPart" && // Already handled
                kvp.Key != "TitlePart" && // Handled via DisplayText
                !isContentTypePart && // Already handled as type section
                kvp.Value.ValueKind == JsonValueKind.Object)
            {
                var partName = ToCamelCase(kvp.Key);

                // Only process if the part name is in the allowed fields (or no whitelist exists)
                if (!hasWhitelist || allowedFields.Contains(partName))
                {
                    var partDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(kvp.Value.GetRawText());
                    if (partDict != null && partDict.Count > 0)
                    {
                        var partFields = new Dictionary<string, object>();
                        foreach (var partKvp in partDict)
                        {
                            var fieldName = ToCamelCase(partKvp.Key);
                            var (value, isIdReference) = ExtractFieldValueWithDepth(
                                partKvp.Value,
                                config,
                                currentDepth,
                                maxDepth,
                                FieldHandlingType.Normal,
                                usersDictionary);

                            if (value != null)
                            {
                                if (isIdReference)
                                {
                                    fieldName = fieldName + "Id";
                                }
                                partFields[fieldName] = value;
                            }
                        }

                        if (partFields.Count > 0)
                        {
                            clean[partName] = partFields;
                        }
                    }
                }
            }
        }

        return clean;
    }

    private static (object? value, bool isIdReference) ExtractFieldValueWithDepth(
        JsonElement element,
        CleaningConfiguration config,
        int currentDepth,
        int maxDepth,
        FieldHandlingType handlingType,
        Dictionary<string, JsonElement>? usersDictionary = null)
    {
        // Handle Text fields: { "Text": "value" } → "value"
        if (element.ValueKind == JsonValueKind.Object)
        {
            var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
            if (dict != null)
            {
                // Handle Taxonomy reference objects (categories)
                // Check for both TermContentItemIds (unpopulated) and TaxonomyContentItemId (populated with Items)
                if (handlingType == FieldHandlingType.TaxonomyReference &&
                    (dict.ContainsKey("TermContentItemIds") || dict.ContainsKey("TaxonomyContentItemId")))
                {
                    return ExtractTaxonomyReference(dict, config, currentDepth, maxDepth, usersDictionary);
                }

                // Handle Text field
                if (dict.ContainsKey("Text") && dict.Count == 1)
                {
                    var textElement = dict["Text"];
                    if (textElement.ValueKind == JsonValueKind.String)
                    {
                        return (textElement.GetString(), false);
                    }
                    else if (textElement.ValueKind == JsonValueKind.Array)
                    {
                        var arr = textElement.EnumerateArray().ToList();
                        if (arr.Count > 0 && arr[0].ValueKind == JsonValueKind.String)
                        {
                            return (arr[0].GetString(), false);
                        }
                    }
                    return (null, false);
                }

                // Handle Markdown field: { "Markdown": "value" } → "value"
                if (dict.ContainsKey("Markdown") && dict.Count <= 2) // Markdown + maybe Html
                {
                    var markdown = dict["Markdown"];
                    if (markdown.ValueKind == JsonValueKind.String)
                    {
                        return (markdown.GetString(), false);
                    }
                }

                // Handle MediaField: { "Paths": [...], "MediaTexts": [...] }
                if (dict.ContainsKey("Paths") && dict.ContainsKey("MediaTexts"))
                {
                    var mediaObj = new Dictionary<string, object>();

                    if (dict["Paths"].ValueKind == JsonValueKind.Array)
                    {
                        var paths = new List<string>();
                        foreach (var path in dict["Paths"].EnumerateArray())
                        {
                            if (path.ValueKind == JsonValueKind.String)
                            {
                                paths.Add(path.GetString() ?? "");
                            }
                        }
                        mediaObj["paths"] = paths.ToArray();
                    }

                    if (dict["MediaTexts"].ValueKind == JsonValueKind.Array)
                    {
                        var texts = new List<string>();
                        foreach (var text in dict["MediaTexts"].EnumerateArray())
                        {
                            if (text.ValueKind == JsonValueKind.String)
                            {
                                texts.Add(text.GetString() ?? "");
                            }
                        }
                        mediaObj["mediaTexts"] = texts.ToArray();
                    }

                    return (mediaObj, false);
                }

                // Handle UserPickerField (UserIds + UserNames arrays) - always minimal
                if (handlingType == FieldHandlingType.UserReference &&
                    (dict.ContainsKey("UserIds") || dict.ContainsKey("userIds")))
                {
                    return ExtractUserReference(dict, usersDictionary);
                }

                // Handle Items array (populated relations) - CHECK THIS FIRST before ContentItemIds
                // After population, ContentPickerFields will have Items array instead of just ContentItemIds
                if (dict.ContainsKey("Items"))
                {
                    var items = dict["Items"];
                    if (items.ValueKind == JsonValueKind.Array)
                    {
                        // If we're at max depth, don't populate further
                        if (currentDepth >= maxDepth)
                        {
                            return (null, false);
                        }

                        var itemsList = new List<object>();
                        foreach (var item in items.EnumerateArray())
                        {
                            if (item.ValueKind == JsonValueKind.Object)
                            {
                                var itemDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                                if (itemDict != null)
                                {
                                    string? itemType = null;
                                    if (itemDict.TryGetValue("ContentType", out var ct))
                                    {
                                        itemType = ct.GetString();
                                    }

                                    if (itemType != null)
                                    {
                                        // Increment depth for nested items
                                        var cleanedItem = CleanWithDepth(
                                            itemDict,
                                            itemType,
                                            config,
                                            currentDepth + 1,
                                            maxDepth,
                                            usersDictionary);
                                        itemsList.Add(cleanedItem);
                                    }
                                }
                            }
                        }

                        var result = itemsList.Count == 0 ? null :
                                     itemsList.Count == 1 ? itemsList[0] :
                                     itemsList;
                        return (result, false);
                    }
                }

                // Handle ContentItemIds array (non-populated relations) - FALLBACK if Items not present
                // This happens when ContentPickerField hasn't been populated yet
                if (dict.ContainsKey("ContentItemIds"))
                {
                    var ids = dict["ContentItemIds"];
                    if (ids.ValueKind == JsonValueKind.Array)
                    {
                        var idsList = new List<string>();
                        foreach (var idElement in ids.EnumerateArray())
                        {
                            if (idElement.ValueKind == JsonValueKind.String)
                            {
                                var idStr = idElement.GetString();
                                if (idStr != null) idsList.Add(idStr);
                            }
                        }

                        // If we're at max depth, return IDs instead of populating
                        if (currentDepth >= maxDepth)
                        {
                            if (idsList.Count == 1)
                                return (idsList[0], true);
                            else if (idsList.Count > 1)
                                return (idsList.ToArray(), true);
                            return (null, false);
                        }

                        // Single ID: return as string with isIdReference=true
                        // Multiple IDs: return as array with isIdReference=true
                        if (idsList.Count == 1)
                        {
                            return (idsList[0], true);
                        }
                        else if (idsList.Count > 1)
                        {
                            return (idsList.ToArray(), true);
                        }
                        return (null, false);
                    }
                }

                // Handle MediaField (paths and mediaTexts)
                if (dict.ContainsKey("Paths") && dict.ContainsKey("MediaTexts"))
                {
                    var mediaObj = new Dictionary<string, object>();

                    if (dict.TryGetValue("Paths", out var pathsEl) && pathsEl.ValueKind == JsonValueKind.Array)
                    {
                        var paths = new List<string>();
                        foreach (var path in pathsEl.EnumerateArray())
                        {
                            if (path.ValueKind == JsonValueKind.String)
                            {
                                var pathStr = path.GetString();
                                if (pathStr != null) paths.Add(pathStr);
                            }
                        }
                        mediaObj["paths"] = paths;
                    }

                    if (dict.TryGetValue("MediaTexts", out var textsEl) && textsEl.ValueKind == JsonValueKind.Array)
                    {
                        var mediaTexts = new List<string>();
                        foreach (var text in textsEl.EnumerateArray())
                        {
                            if (text.ValueKind == JsonValueKind.String)
                            {
                                var textStr = text.GetString();
                                if (textStr != null) mediaTexts.Add(textStr);
                            }
                        }
                        mediaObj["mediaTexts"] = mediaTexts;
                    }

                    return (mediaObj, false);
                }

                // Handle numeric Value field
                if (dict.ContainsKey("Value") && dict.Count == 1)
                {
                    var valueElement = dict["Value"];
                    if (valueElement.ValueKind == JsonValueKind.Number)
                    {
                        return (valueElement.GetDouble(), false);
                    }
                    else if (valueElement.ValueKind == JsonValueKind.True || valueElement.ValueKind == JsonValueKind.False)
                    {
                        return (valueElement.GetBoolean(), false);
                    }
                }

                // Otherwise return the whole object cleaned (for complex nested structures)
                var cleaned = new Dictionary<string, object>();
                foreach (var kvp in dict)
                {
                    var value = ExtractSimpleFieldValue(kvp.Value);
                    if (value != null)
                    {
                        cleaned[ToCamelCase(kvp.Key)] = value;
                    }
                }

                // Unwrap single-property objects
                if (cleaned.Count == 1)
                {
                    return (cleaned.Values.First(), false);
                }

                return (cleaned, false);
            }
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            var list = new List<object>();
            foreach (var item in element.EnumerateArray())
            {
                var value = ExtractSimpleFieldValue(item);
                if (value != null)
                {
                    list.Add(value);
                }
            }
            return (list, false);
        }
        else if (element.ValueKind == JsonValueKind.String)
        {
            return (element.GetString(), false);
        }
        else if (element.ValueKind == JsonValueKind.Number)
        {
            return (element.GetDouble(), false);
        }
        else if (element.ValueKind == JsonValueKind.True || element.ValueKind == JsonValueKind.False)
        {
            return (element.GetBoolean(), false);
        }

        return (null, false);
    }

    private static (object? value, bool isIdReference) ExtractTaxonomyReference(
        Dictionary<string, JsonElement> dict,
        CleaningConfiguration config,
        int currentDepth,
        int maxDepth,
        Dictionary<string, JsonElement>? usersDictionary)
    {
        // CRITICAL FIX: Only return ASSIGNED terms, not the entire taxonomy
        // This eliminates the massive over-fetching issue (82% size reduction for ShoppingList)


        // Get the list of assigned term IDs
        List<string>? assignedTermIds = null;
        if (dict.TryGetValue("TermContentItemIds", out var termIdsEl) && termIdsEl.ValueKind == JsonValueKind.Array)
        {
            assignedTermIds = new List<string>();
            foreach (var idEl in termIdsEl.EnumerateArray())
            {
                if (idEl.ValueKind == JsonValueKind.String)
                {
                    var idStr = idEl.GetString();
                    if (idStr != null) assignedTermIds.Add(idStr);
                }
            }
        }

        // If no assigned terms, return null (no categories)
        if (assignedTermIds == null || assignedTermIds.Count == 0)
        {
            return (null, false);
        }

        // If at max depth (unpopulated), return just the IDs as a string array
        if (currentDepth >= maxDepth)
        {
            // Return array of IDs with isIdReference=true so they get named "categoryIds"
            return (assignedTermIds.ToArray(), true);
        }

        // If populated (depth > 0), get ONLY the assigned terms (not the entire taxonomy!)
        if (dict.TryGetValue("Items", out var itemsEl) && itemsEl.ValueKind == JsonValueKind.Array)
        {
            var assignedTermsSet = new HashSet<string>(assignedTermIds);
            var minimalCategories = new List<object>();

            foreach (var item in itemsEl.EnumerateArray())
            {
                if (item.ValueKind == JsonValueKind.Object)
                {
                    var itemDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                    if (itemDict != null && itemDict.TryGetValue("ContentItemId", out var itemIdEl))
                    {
                        var itemId = itemIdEl.GetString();

                        // CRITICAL: Only include this term if it's in the assigned list
                        if (itemId != null && assignedTermsSet.Contains(itemId))
                        {
                            // Create minimal category object: {id, title}
                            var minimalCategory = new Dictionary<string, object>();
                            minimalCategory["id"] = itemId;

                            if (itemDict.TryGetValue("DisplayText", out var displayTextEl) &&
                                displayTextEl.ValueKind == JsonValueKind.String)
                            {
                                var title = displayTextEl.GetString();
                                if (title != null)
                                {
                                    minimalCategory["title"] = title;
                                }
                            }

                            minimalCategories.Add(minimalCategory);
                        }
                    }
                }
            }

            // Return the minimal categories array
            return (minimalCategories.Count > 0 ? minimalCategories : null, false);
        }

        // Fallback: if Items not present but we have IDs, return null
        // (Category will not be populated - skip it for now)
        return (null, false);
    }

    private static (object? value, bool isIdReference) ExtractUserReference(
        Dictionary<string, JsonElement> dict,
        Dictionary<string, JsonElement>? usersDictionary)
    {
        var userIdsKey = dict.ContainsKey("UserIds") ? "UserIds" : "userIds";
        var userNamesKey = dict.ContainsKey("UserNames") ? "UserNames" : "userNames";

        if (!dict.ContainsKey(userIdsKey) || !dict.ContainsKey(userNamesKey))
            return (null, false);

        var userIds = dict[userIdsKey];
        var userNames = dict[userNamesKey];

        if (userIds.ValueKind == JsonValueKind.Array && userNames.ValueKind == JsonValueKind.Array)
        {
            var idsList = userIds.EnumerateArray()
                .Where(x => x.ValueKind == JsonValueKind.String)
                .Select(x => x.GetString())
                .Where(x => x != null)
                .ToList();

            var namesList = userNames.EnumerateArray()
                .Where(x => x.ValueKind == JsonValueKind.String)
                .Select(x => x.GetString())
                .Where(x => x != null)
                .ToList();

            // Zip the IDs and usernames together - MINIMAL USER DATA ONLY
            var users = new List<Dictionary<string, object>>();
            for (int i = 0; i < Math.Min(idsList.Count, namesList.Count); i++)
            {
                var user = new Dictionary<string, object>
                {
                    ["id"] = idsList[i]!,
                    ["username"] = namesList[i]!
                };

                users.Add(user);
            }

            // Return single user object or array
            if (users.Count == 1)
                return (users[0], false);
            else if (users.Count > 1)
                return (users, false);
        }

        return (null, false);
    }

    private static object? ExtractSimpleFieldValue(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.String)
        {
            return element.GetString();
        }
        else if (element.ValueKind == JsonValueKind.Number)
        {
            return element.GetDouble();
        }
        else if (element.ValueKind == JsonValueKind.True || element.ValueKind == JsonValueKind.False)
        {
            return element.GetBoolean();
        }
        else if (element.ValueKind == JsonValueKind.Object)
        {
            var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
            if (dict != null)
            {
                var cleaned = new Dictionary<string, object>();
                foreach (var kvp in dict)
                {
                    var value = ExtractSimpleFieldValue(kvp.Value);
                    if (value != null)
                    {
                        cleaned[ToCamelCase(kvp.Key)] = value;
                    }
                }
                return cleaned;
            }
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            var list = new List<object>();
            foreach (var item in element.EnumerateArray())
            {
                var value = ExtractSimpleFieldValue(item);
                if (value != null)
                {
                    list.Add(value);
                }
            }
            return list;
        }

        return null;
    }

    private static string ToCamelCase(string str)
    {
        if (string.IsNullOrEmpty(str) || char.IsLower(str[0]))
            return str;
        return char.ToLower(str[0]) + str.Substring(1);
    }
}

