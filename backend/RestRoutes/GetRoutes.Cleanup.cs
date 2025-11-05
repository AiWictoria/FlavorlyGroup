namespace RestRoutes;

using System.Text.Json;

public static partial class GetRoutes
{
    private static readonly HashSet<string> OC_METADATA_FIELDS = new(StringComparer.OrdinalIgnoreCase)
    {
        "ContentItemId",
        "ContentItemVersionId",
        "ContentType",
        "DisplayText",
        "Latest",
        "Published",
        "ModifiedUtc",
        "PublishedUtc",
        "CreatedUtc",
        "Owner",
        "Author",
        "TitlePart",
        "TermPart",
        "@WeldedPartSettings",
        // Also include camelCase versions
        "contentItemId",
        "contentItemVersionId",
        "contentType",
        "displayText",
        "latest",
        "published",
        "modifiedUtc",
        "publishedUtc",
        "createdUtc",
        "owner",
        "author",
        "titlePart",
        "termPart"
    };

    private static Dictionary<string, object> CleanObject(
        Dictionary<string, JsonElement> obj,
        string contentType,
        Dictionary<string, JsonElement>? usersDictionary = null)
    {
        var clean = new Dictionary<string, object>();

        // Get basic fields
        if (obj.TryGetValue("ContentItemId", out var id))
            clean["id"] = id.GetString()!;

        if (obj.TryGetValue("DisplayText", out var title))
            clean["title"] = title.GetString()!;

        // Special handling for RecipeIngredient - reduce nested ContentPickerFields to {id, name}
        if (contentType == "RecipeIngredient")
        {
            // Handle RecipeIngredientPart fields
            if (obj.TryGetValue("RecipeIngredient", out var recipeIngredientPart) && recipeIngredientPart.ValueKind == JsonValueKind.Object)
            {
                var riDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(recipeIngredientPart.GetRawText());
                if (riDict != null)
                {
                    // Handle Quantity
                    if (riDict.TryGetValue("Quantity", out var quantity) && quantity.ValueKind == JsonValueKind.Object)
                    {
                        var qtyDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(quantity.GetRawText());
                        if (qtyDict != null && qtyDict.TryGetValue("Value", out var value))
                        {
                            if (value.ValueKind == JsonValueKind.Number)
                            {
                                clean["quantity"] = value.GetDouble();
                            }
                        }
                    }

                    // Ingredient and Unit will be populated later, but we need to mark them as ID references
                    // They will be handled in post-processing after population
                    if (riDict.TryGetValue("Ingredient", out var ingredientField) && ingredientField.ValueKind == JsonValueKind.Object)
                    {
                        var ingDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(ingredientField.GetRawText());
                        if (ingDict != null && ingDict.TryGetValue("ContentItemIds", out var ingIds) &&
                            ingIds.ValueKind == JsonValueKind.Array)
                        {
                            var ids = ingIds.EnumerateArray()
                                .Where(x => x.ValueKind == JsonValueKind.String)
                                .Select(x => x.GetString())
                                .Where(x => x != null)
                                .ToList();

                            if (ids.Count > 0)
                            {
                                clean["ingredientId"] = ids[0]!;
                            }
                        }
                    }

                    if (riDict.TryGetValue("Unit", out var unitField) && unitField.ValueKind == JsonValueKind.Object)
                    {
                        var unitDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(unitField.GetRawText());
                        if (unitDict != null && unitDict.TryGetValue("ContentItemIds", out var unitIds) &&
                            unitIds.ValueKind == JsonValueKind.Array)
                        {
                            var ids = unitIds.EnumerateArray()
                                .Where(x => x.ValueKind == JsonValueKind.String)
                                .Select(x => x.GetString())
                                .Where(x => x != null)
                                .ToList();

                            if (ids.Count > 0)
                            {
                                clean["unitId"] = ids[0]!;
                            }
                        }
                    }
                }
            }

            // Return early - RecipeIngredient will be post-processed after population
            return clean;
        }

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

        // Also check for Part sections (e.g., "ShoppingListPart", "OrderPart")
        if (obj.TryGetValue(contentType, out var typeSection) && typeSection.ValueKind == JsonValueKind.Object)
        {
            var typeDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(typeSection.GetRawText());
            if (typeDict != null)
            {
                foreach (var kvp in typeDict)
                {
                    var fieldName = ToCamelCase(kvp.Key);

                    // Special handling for Recipe.Author - return only {id, username}
                    if (contentType == "Recipe" && fieldName == "author" && kvp.Value.ValueKind == JsonValueKind.Object)
                    {
                        var authorDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(kvp.Value.GetRawText());
                        if (authorDict != null && authorDict.ContainsKey("UserIds") && authorDict.ContainsKey("UserNames"))
                        {
                            var userIds = authorDict["UserIds"];
                            var userNames = authorDict["UserNames"];
                            if (userIds.ValueKind == JsonValueKind.Array && userNames.ValueKind == JsonValueKind.Array)
                            {
                                var idsList = userIds.EnumerateArray().Where(x => x.ValueKind == JsonValueKind.String).Select(x => x.GetString()).Where(x => x != null).ToList();
                                var namesList = userNames.EnumerateArray().Where(x => x.ValueKind == JsonValueKind.String).Select(x => x.GetString()).Where(x => x != null).ToList();

                                if (idsList.Count > 0 && namesList.Count > 0)
                                {
                                    // Return first user as {id, username}
                                    clean["author"] = new Dictionary<string, object>
                                    {
                                        ["id"] = idsList[0]!,
                                        ["username"] = namesList[0]!
                                    };
                                }
                            }
                        }
                        continue;
                    }

                    var (value, isIdReference) = ExtractFieldValueWithContext(kvp.Value, usersDictionary);
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

        // Also check for Part sections (e.g., "ShoppingListPart", "OrderPart", "RecipePart")
        var partName = contentType + "Part";
        if (obj.TryGetValue(partName, out var partSection) && partSection.ValueKind == JsonValueKind.Object)
        {
            var partDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(partSection.GetRawText());
            if (partDict != null)
            {
                foreach (var kvp in partDict)
                {
                    var fieldName = ToCamelCase(kvp.Key);

                    // Special handling for RecipePart fields
                    if (contentType == "Recipe")
                    {
                        // RecipeImage → image
                        if (fieldName == "recipeImage" && kvp.Value.ValueKind == JsonValueKind.Object)
                        {
                            var mediaDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(kvp.Value.GetRawText());
                            if (mediaDict != null && mediaDict.TryGetValue("Paths", out var paths) &&
                                paths.ValueKind == JsonValueKind.Array)
                            {
                                var pathsArray = paths.EnumerateArray()
                                    .Where(x => x.ValueKind == JsonValueKind.String)
                                    .Select(x => x.GetString())
                                    .Where(x => x != null)
                                    .ToList();

                                if (pathsArray.Count > 0)
                                {
                                    clean["image"] = pathsArray[0]!;
                                }
                            }
                            continue;
                        }

                        // Category → category (array of {id, name}) - will be expanded in post-processing
                        if (fieldName == "category" && kvp.Value.ValueKind == JsonValueKind.Object)
                        {
                            var categoryDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(kvp.Value.GetRawText());
                            if (categoryDict != null && categoryDict.TryGetValue("TermContentItemIds", out var termIds) &&
                                termIds.ValueKind == JsonValueKind.Array)
                            {
                                var ids = termIds.EnumerateArray()
                                    .Where(x => x.ValueKind == JsonValueKind.String)
                                    .Select(x => x.GetString())
                                    .Where(x => x != null)
                                    .ToList();

                                if (ids.Count > 0)
                                {
                                    // Store IDs for post-processing - they will be expanded to {id, name} objects
                                    clean["_categoryIds"] = ids;
                                }
                            }
                            continue;
                        }
                    }

                    var (value, isIdReference) = ExtractFieldValueWithContext(kvp.Value, usersDictionary);
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
        // Also handle "Ingredients" which is used in Recipe
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
        else if (obj.TryGetValue("Ingredients", out var ingredients) && ingredients.ValueKind == JsonValueKind.Object)
        {
            bagPartOrItems = ingredients;
            bagPartFieldName = "ingredients";
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
                                var cleanedItem = CleanObject(itemDict, itemType, usersDictionary);
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

        return clean;
    }

    // Helper to clean UserProfile for User context - only contact information, no relations
    private static Dictionary<string, object> CleanUserProfileForUser(
        Dictionary<string, JsonElement> obj,
        Dictionary<string, JsonElement>? usersDictionary = null)
    {
        var clean = new Dictionary<string, object>();

        // Get basic fields
        if (obj.TryGetValue("ContentItemId", out var id))
            clean["id"] = id.GetString()!;

        if (obj.TryGetValue("DisplayText", out var title))
            clean["title"] = title.GetString()!;

        // Get UserProfilePart fields (contact information only)
        if (obj.TryGetValue("UserProfile", out var userProfilePart) && userProfilePart.ValueKind == JsonValueKind.Object)
        {
            var userProfileDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(userProfilePart.GetRawText());
            if (userProfileDict != null)
            {
                foreach (var kvp in userProfileDict)
                {
                    var fieldName = ToCamelCase(kvp.Key);
                    var value = kvp.Value;

                    // Skip ContentPickerField for Recipes completely - not relevant for User contact info
                    if (fieldName.Equals("recipes", StringComparison.OrdinalIgnoreCase) ||
                        fieldName.Equals("Recipes", StringComparison.OrdinalIgnoreCase))
                    {
                        // Don't include recipes at all in UserProfile when used in User context
                        continue;
                    }

                    // Handle MediaField (Avatar) - extract first path
                    if (fieldName.Equals("avatar", StringComparison.OrdinalIgnoreCase) && value.ValueKind == JsonValueKind.Object)
                    {
                        var mediaDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(value.GetRawText());
                        if (mediaDict != null && mediaDict.TryGetValue("Paths", out var paths) &&
                            paths.ValueKind == JsonValueKind.Array)
                        {
                            var pathsArray = paths.EnumerateArray()
                                .Where(x => x.ValueKind == JsonValueKind.String)
                                .Select(x => x.GetString())
                                .Where(x => x != null)
                                .ToList();

                            if (pathsArray.Count > 0)
                            {
                                clean["avatar"] = pathsArray[0]!;
                            }
                        }
                        continue;
                    }

                    // Handle TextField (firstname, lastName, street, zipCode, city)
                    if (value.ValueKind == JsonValueKind.Object)
                    {
                        var textDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(value.GetRawText());
                        if (textDict != null && textDict.TryGetValue("Text", out var textValue) &&
                            textValue.ValueKind == JsonValueKind.String)
                        {
                            var textStr = textValue.GetString();
                            if (textStr != null)
                            {
                                clean[fieldName] = textStr;
                            }
                        }
                    }
                }
            }
        }

        return clean;
    }

    // Helper to remove OC metadata fields from nested objects
    private static Dictionary<string, object> RemoveMetadataFields(Dictionary<string, object> obj)
    {
        var cleaned = new Dictionary<string, object>();
        foreach (var kvp in obj)
        {
            // Skip OC metadata fields
            if (OC_METADATA_FIELDS.Contains(kvp.Key))
                continue;

            // Recursively clean nested objects
            if (kvp.Value is Dictionary<string, object> nestedDict)
            {
                cleaned[kvp.Key] = RemoveMetadataFields(nestedDict);
            }
            // Recursively clean arrays of objects
            else if (kvp.Value is List<object> list)
            {
                var cleanedList = new List<object>();
                foreach (var item in list)
                {
                    if (item is Dictionary<string, object> itemDict)
                    {
                        cleanedList.Add(RemoveMetadataFields(itemDict));
                    }
                    else
                    {
                        cleanedList.Add(item);
                    }
                }
                cleaned[kvp.Key] = cleanedList;
            }
            else
            {
                cleaned[kvp.Key] = kvp.Value;
            }
        }
        return cleaned;
    }

    private static (object? value, bool isIdReference) ExtractFieldValueWithContext(
        JsonElement element,
        Dictionary<string, JsonElement>? usersDictionary = null)
    {
        // Handle Text fields: { "Text": "value" } → "value"
        if (element.ValueKind == JsonValueKind.Object)
        {
            var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
            if (dict != null)
            {
                // Check for Text field
                if (dict.ContainsKey("Text") && dict.Count == 1)
                {
                    var textElement = dict["Text"];
                    // Handle both string and array (in case of POST-created items)
                    if (textElement.ValueKind == JsonValueKind.String)
                    {
                        return (textElement.GetString(), false);
                    }
                    else if (textElement.ValueKind == JsonValueKind.Array)
                    {
                        // If it's an array, try to get the first element
                        var arr = textElement.EnumerateArray().ToList();
                        if (arr.Count > 0 && arr[0].ValueKind == JsonValueKind.String)
                        {
                            return (arr[0].GetString(), false);
                        }
                    }
                    return (null, false);
                }

                // Check for Markdown field
                if (dict.ContainsKey("Markdown") && dict.Count == 1)
                {
                    var markdownElement = dict["Markdown"];
                    if (markdownElement.ValueKind == JsonValueKind.String)
                    {
                        return (markdownElement.GetString(), false);
                    }
                }

                // Check for UserPickerField (UserIds + UserNames arrays)
                if ((dict.ContainsKey("UserIds") || dict.ContainsKey("userIds")) &&
                    (dict.ContainsKey("UserNames") || dict.ContainsKey("userNames")))
                {
                    var userIdsKey = dict.ContainsKey("UserIds") ? "UserIds" : "userIds";
                    var userNamesKey = dict.ContainsKey("UserNames") ? "UserNames" : "userNames";

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

                        // Zip the IDs and usernames together into an array of objects
                        var users = new List<Dictionary<string, object>>();
                        for (int i = 0; i < Math.Min(idsList.Count, namesList.Count); i++)
                        {
                            var user = new Dictionary<string, object>
                            {
                                ["id"] = idsList[i]!,
                                ["username"] = namesList[i]!
                            };

                            // Enrich with data from usersDictionary if available
                            if (usersDictionary != null && usersDictionary.TryGetValue(idsList[i]!, out var userData))
                            {
                                if (userData.TryGetProperty("Email", out var email) && email.ValueKind == JsonValueKind.String)
                                {
                                    var emailStr = email.GetString();
                                    if (emailStr != null) user["email"] = emailStr;
                                }

                                if (userData.TryGetProperty("PhoneNumber", out var phone) && phone.ValueKind == JsonValueKind.String)
                                {
                                    var phoneStr = phone.GetString();
                                    if (phoneStr != null) user["phone"] = phoneStr;
                                }

                                // Handle UserProfile ContentItem FIRST (before Properties, since it might be in Properties)
                                // Check both top-level and in Properties
                                JsonElement? userProfileElement = null;
                                if (userData.TryGetProperty("UserProfile", out var userProfile) && userProfile.ValueKind == JsonValueKind.Object)
                                {
                                    userProfileElement = userProfile;
                                }
                                else if (userData.TryGetProperty("Properties", out var propsCheck) &&
                                         propsCheck.ValueKind == JsonValueKind.Object)
                                {
                                    var propsDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(propsCheck.GetRawText());
                                    if (propsDict != null && propsDict.TryGetValue("UserProfile", out var userProfileFromProps) &&
                                        userProfileFromProps.ValueKind == JsonValueKind.Object)
                                    {
                                        userProfileElement = userProfileFromProps;
                                    }
                                }

                                if (userProfileElement.HasValue)
                                {
                                    var userProfileDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(userProfileElement.Value.GetRawText());
                                    if (userProfileDict != null)
                                    {
                                        // Check if it's a ContentItem (has ContentItemId)
                                        if (userProfileDict.ContainsKey("ContentItemId"))
                                        {
                                            // For UserProfile in User context, only get contact information, no relations
                                            var cleanedUserProfile = CleanUserProfileForUser(userProfileDict, usersDictionary);
                                            cleanedUserProfile = RemoveMetadataFields(cleanedUserProfile);
                                            user["userProfile"] = cleanedUserProfile;
                                        }
                                        else
                                        {
                                            // Not a ContentItem, just add as-is but clean metadata
                                            var userProfileMetadataObj = JsonSerializer.Deserialize<Dictionary<string, object>>(userProfileElement.Value.GetRawText());
                                            if (userProfileMetadataObj != null)
                                            {
                                                user["userProfile"] = RemoveMetadataFields(userProfileMetadataObj);
                                            }
                                        }
                                    }
                                }

                                // Spread Properties object (contains firstName, lastName, etc.)
                                // Skip UserProfile if it was already handled above
                                if (userData.TryGetProperty("Properties", out var props) && props.ValueKind == JsonValueKind.Object)
                                {
                                    foreach (var prop in props.EnumerateObject())
                                    {
                                        // Convert property name to camelCase (FirstName -> firstName)
                                        var propName = char.ToLower(prop.Name[0]) + prop.Name.Substring(1);

                                        // Skip UserProfile if it's in Properties (it was already handled above)
                                        if (propName.Equals("userProfile", StringComparison.OrdinalIgnoreCase) ||
                                            prop.Name.Equals("UserProfile", StringComparison.OrdinalIgnoreCase))
                                            continue;

                                        if (prop.Value.ValueKind == JsonValueKind.String)
                                        {
                                            var propValue = prop.Value.GetString();
                                            if (propValue != null) user[propName] = propValue;
                                        }
                                        else if (prop.Value.ValueKind != JsonValueKind.Null)
                                        {
                                            // Handle non-string property values
                                            var deserializedValue = JsonSerializer.Deserialize<object>(prop.Value.GetRawText());
                                            if (deserializedValue != null)
                                            {
                                                user[propName] = deserializedValue;
                                            }
                                        }
                                    }
                                }
                            }

                            // Remove metadata from user object before adding
                            user = RemoveMetadataFields(user);

                            // Extra safety: explicitly clean userProfile if it exists
                            if (user.TryGetValue("userProfile", out var userProfileValue) &&
                                userProfileValue is Dictionary<string, object> userProfileObj)
                            {
                                // Remove recipes field completely - not relevant for User contact info
                                if (userProfileObj.ContainsKey("recipes"))
                                {
                                    userProfileObj.Remove("recipes");
                                }
                                user["userProfile"] = RemoveMetadataFields(userProfileObj);
                            }

                            users.Add(user);
                        }

                        // If only one user, return as object (singular relation), otherwise return array
                        if (users.Count == 1)
                        {
                            return (users[0], false);
                        }
                        return (users, false);
                    }
                }

                // Check for MediaField (Paths + MediaTexts arrays)
                if (dict.ContainsKey("Paths") && dict["Paths"].ValueKind == JsonValueKind.Array)
                {
                    var paths = dict["Paths"];
                    var pathsList = new List<string>();
                    foreach (var path in paths.EnumerateArray())
                    {
                        if (path.ValueKind == JsonValueKind.String)
                        {
                            var pathStr = path.GetString();
                            if (pathStr != null) pathsList.Add(pathStr);
                        }
                    }
                    // Return first path as string (most common case for single image)
                    if (pathsList.Count > 0)
                    {
                        return (pathsList[0], false);
                    }
                }

                // Check for ContentItemIds array (non-populated relations)
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
                        // Single ID: return as string with isIdReference=true (appends "Id" to field name)
                        // Multiple IDs: return as array with isIdReference=true (appends "Id" to field name)
                        if (idsList.Count == 1)
                        {
                            return (idsList[0], true);
                        }
                        else if (idsList.Count > 1)
                        {
                            return (idsList.ToArray(), true);
                        }
                        return (null, false); // Empty array
                    }
                }

                // Check for TermContentItemIds array (TaxonomyField)
                if (dict.ContainsKey("TermContentItemIds"))
                {
                    var termIds = dict["TermContentItemIds"];
                    if (termIds.ValueKind == JsonValueKind.Array)
                    {
                        var termIdsList = new List<string>();
                        foreach (var termIdElement in termIds.EnumerateArray())
                        {
                            if (termIdElement.ValueKind == JsonValueKind.String)
                            {
                                var termIdStr = termIdElement.GetString();
                                if (termIdStr != null) termIdsList.Add(termIdStr);
                            }
                        }
                        // Return as array (not as ID reference, since these are taxonomy terms)
                        if (termIdsList.Count > 0)
                        {
                            return (termIdsList.ToArray(), false);
                        }
                        return (null, false); // Empty array
                    }
                }

                // Check for Items array (populated relations)
                if (dict.ContainsKey("Items"))
                {
                    var items = dict["Items"];
                    if (items.ValueKind == JsonValueKind.Array)
                    {
                        var itemsList = new List<object>();
                        foreach (var item in items.EnumerateArray())
                        {
                            if (item.ValueKind == JsonValueKind.Object)
                            {
                                var itemDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                                if (itemDict != null)
                                {
                                    // Get the content type from the item
                                    string? itemType = null;
                                    if (itemDict.TryGetValue("ContentType", out var ct))
                                    {
                                        itemType = ct.GetString();
                                    }
                                    itemsList.Add(CleanObject(itemDict, itemType ?? "", usersDictionary));
                                }
                            }
                        }
                        // Return null (serializes to remove key) if 0 items, object if one item otherwise array
                        var result = itemsList.Count == 0 ? null : itemsList.Count == 1 ? itemsList[0] : itemsList;
                        return (result, false);
                    }
                }

                // Check for { "values": [...] } pattern (common in OrchardCore list fields)
                if (dict.Count == 1 && (dict.ContainsKey("values") || dict.ContainsKey("Values")))
                {
                    var valuesKey = dict.ContainsKey("values") ? "values" : "Values";
                    var values = dict[valuesKey];
                    if (values.ValueKind == JsonValueKind.Array)
                    {
                        var valuesList = new List<object>();
                        foreach (var val in values.EnumerateArray())
                        {
                            var extractedValue = ExtractFieldValue(val, usersDictionary);
                            if (extractedValue != null)
                            {
                                valuesList.Add(extractedValue);
                            }
                        }
                        return (valuesList, false);
                    }
                }

                // Otherwise return the whole object cleaned
                var cleaned = new Dictionary<string, object>();
                foreach (var kvp in dict)
                {
                    var value = ExtractFieldValue(kvp.Value, usersDictionary);
                    if (value != null)
                    {
                        cleaned[ToCamelCase(kvp.Key)] = value;
                    }
                }

                // Unwrap single-property objects (e.g., {"value": 42} → 42)
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
                var value = ExtractFieldValue(item, usersDictionary);
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

    private static object? ExtractFieldValue(
        JsonElement element,
        Dictionary<string, JsonElement>? usersDictionary = null)
    {
        // Handle Text fields: { "Text": "value" } → "value"
        if (element.ValueKind == JsonValueKind.Object)
        {
            var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText());
            if (dict != null)
            {
                // Check for Text field
                if (dict.ContainsKey("Text") && dict.Count == 1)
                {
                    return dict["Text"].GetString();
                }

                // Check for ContentItemIds array (non-populated relations)
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
                        // Return single ID string if exactly one item, array for multiple items
                        if (idsList.Count == 1)
                        {
                            return idsList[0];
                        }
                        else if (idsList.Count > 1)
                        {
                            return idsList.ToArray();
                        }
                        return null; // Empty array
                    }
                }

                // Check for Items array (populated relations)
                if (dict.ContainsKey("Items"))
                {
                    var items = dict["Items"];
                    if (items.ValueKind == JsonValueKind.Array)
                    {
                        var itemsList = new List<object>();
                        foreach (var item in items.EnumerateArray())
                        {
                            if (item.ValueKind == JsonValueKind.Object)
                            {
                                var itemDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(item.GetRawText());
                                if (itemDict != null)
                                {
                                    // Get the content type from the item
                                    string? itemType = null;
                                    if (itemDict.TryGetValue("ContentType", out var ct))
                                    {
                                        itemType = ct.GetString();
                                    }
                                    itemsList.Add(CleanObject(itemDict, itemType ?? "", usersDictionary));
                                }
                            }
                        }
                        // Return null (serializes to remove key) if 0 items, object if one item otherwise array
                        return itemsList.Count == 0 ? null : itemsList.Count == 1 ? itemsList[0] : itemsList;
                    }
                }

                // Otherwise return the whole object cleaned
                var cleaned = new Dictionary<string, object>();
                foreach (var kvp in dict)
                {
                    var value = ExtractFieldValue(kvp.Value, usersDictionary);
                    if (value != null)
                    {
                        cleaned[ToCamelCase(kvp.Key)] = value;
                    }
                }

                // Unwrap single-property objects (e.g., {"value": 42} → 42)
                if (cleaned.Count == 1)
                {
                    return cleaned.Values.First();
                }

                return cleaned;
            }
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            var list = new List<object>();
            foreach (var item in element.EnumerateArray())
            {
                var value = ExtractFieldValue(item, usersDictionary);
                if (value != null)
                {
                    list.Add(value);
                }
            }
            return list;
        }
        else if (element.ValueKind == JsonValueKind.String)
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

        return null;
    }

    private static string ToCamelCase(string str)
    {
        if (string.IsNullOrEmpty(str) || char.IsLower(str[0]))
            return str;
        return char.ToLower(str[0]) + str.Substring(1);
    }
}
