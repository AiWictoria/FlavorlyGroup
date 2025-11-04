namespace RestRoutes;

using OrchardCore.ContentManagement;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Newtonsoft.Json.Linq;

public static class PostRoutes
{
    private static readonly HashSet<string> RESERVED_FIELDS = new(StringComparer.OrdinalIgnoreCase)
    {
        "id",
        "contentItemId",
        "title",
        "displayText",
        "owner",
        "author",
        "createdUtc",
        "modifiedUtc",
        "publishedUtc",
        "contentType",
        "published",
        "latest"
    };

    public static void MapPostRoutes(this WebApplication app)
    {
        app.MapPost("api/{contentType}", async (
            string contentType,
            [FromBody] Dictionary<string, object>? body,
            [FromServices] IContentManager contentManager,
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            try
            {
                // Check permissions
                var permissionCheck = await PermissionsACL.CheckPermissions(contentType, "POST", context, session);
                if (permissionCheck != null) return permissionCheck;

                // Check if body is null or empty
                if (body == null || body.Count == 0)
                {
                    return Results.Json(new
                    {
                        error = "Cannot read request body"
                    }, statusCode: 400);
                }

                // Validate fields
                var validFields = await FieldValidator.GetValidFieldsAsync(contentType, contentManager, session);
                var (isValid, invalidFields) = FieldValidator.ValidateFields(body, validFields, RESERVED_FIELDS);

                if (!isValid)
                {
                    return Results.Json(new
                    {
                        error = "Invalid fields provided",
                        invalidFields = invalidFields,
                        validFields = validFields.OrderBy(f => f).ToList()
                    }, statusCode: 400);
                }

                var contentItem = await contentManager.NewAsync(contentType);

                // Extract and handle special fields explicitly
                contentItem.DisplayText = body.ContainsKey("title")
                    ? body["title"].ToString()
                    : "Untitled";

                contentItem.Owner = context.User?.Identity?.Name ?? "anonymous";
                contentItem.Author = contentItem.Owner;

                // Build content in plain dictionaries/lists to avoid type issues with dynamic Json
                var root = new Dictionary<string, object>();
                var section = new Dictionary<string, object>();
                root[contentType] = section;

                // Build content directly into the content item
                foreach (var kvp in body)
                {
                    // Skip all reserved fields
                    if (RESERVED_FIELDS.Contains(kvp.Key))
                        continue;

                    var pascalKey = ToPascalCase(kvp.Key);
                    var value = kvp.Value;
                    // Map slug to AutoroutePart.Path
                    if (string.Equals(kvp.Key, "slug", StringComparison.OrdinalIgnoreCase))
                    {
                        var slugVal = value is JsonElement sje && sje.ValueKind == JsonValueKind.String ? sje.GetString() : value?.ToString();
                        if (!string.IsNullOrWhiteSpace(slugVal))
                        {
                            root["AutoroutePart"] = new Dictionary<string, object> { { "Path", slugVal! } };
                        }
                        continue;
                    }

                    // Contained: Ingredients (RecipeIngredient[])
                    if (string.Equals(kvp.Key, "ingredients", StringComparison.OrdinalIgnoreCase) && value is JsonElement ingEl && ingEl.ValueKind == JsonValueKind.Array)
                    {
                        var contentItems = new List<object>();
                        foreach (var ing in ingEl.EnumerateArray())
                        {
                            if (ing.ValueKind != JsonValueKind.Object) continue;
                            var part = new Dictionary<string, object>();

                            foreach (var prop in ing.EnumerateObject())
                            {
                                if (string.Equals(prop.Name, "ingredientId", StringComparison.OrdinalIgnoreCase) && prop.Value.ValueKind == JsonValueKind.String)
                                {
                                    part["Ingredient"] = new Dictionary<string, object> { { "ContentItemIds", new List<string> { prop.Value.GetString()! } } };
                                }
                                else if (string.Equals(prop.Name, "unitId", StringComparison.OrdinalIgnoreCase) && prop.Value.ValueKind == JsonValueKind.String)
                                {
                                    part["Unit"] = new Dictionary<string, object> { { "ContentItemIds", new List<string> { prop.Value.GetString()! } } };
                                }
                                else if (string.Equals(prop.Name, "quantity", StringComparison.OrdinalIgnoreCase) && prop.Value.ValueKind == JsonValueKind.Number)
                                {
                                    part["Quantity"] = new Dictionary<string, object> { { "Value", prop.Value.GetDouble() } };
                                }
                            }

                            var ingredientObj = new Dictionary<string, object>
                            {
                                { "ContentType", "RecipeIngredient" },
                                { "RecipeIngredient", part }
                            };
                            contentItems.Add(ingredientObj);
                        }

                        root["Ingredients"] = new Dictionary<string, object> { { "ContentItems", contentItems } };
                        continue;
                    }

                    // Contained: Instructions (Instruction[])
                    if (string.Equals(kvp.Key, "instructions", StringComparison.OrdinalIgnoreCase) && value is JsonElement instrEl && instrEl.ValueKind == JsonValueKind.Array)
                    {
                        var contentItems = new List<object>();
                        foreach (var instr in instrEl.EnumerateArray())
                        {
                            if (instr.ValueKind != JsonValueKind.Object) continue;
                            var part = new Dictionary<string, object>();

                            foreach (var prop in instr.EnumerateObject())
                            {
                                if (string.Equals(prop.Name, "content", StringComparison.OrdinalIgnoreCase) && prop.Value.ValueKind == JsonValueKind.String)
                                {
                                    part["Content"] = new Dictionary<string, object> { { "Text", prop.Value.GetString()! } };
                                }
                                else if (string.Equals(prop.Name, "order", StringComparison.OrdinalIgnoreCase) && prop.Value.ValueKind == JsonValueKind.Number)
                                {
                                    part["Order"] = new Dictionary<string, object> { { "Value", prop.Value.GetDouble() } };
                                }
                            }

                            var instrObj = new Dictionary<string, object>
                            {
                                { "ContentType", "Instruction" },
                                { "Instruction", part }
                            };
                            contentItems.Add(instrObj);
                        }

                        root["RecipeInstructions"] = new Dictionary<string, object> { { "ContentItems", contentItems } };
                        continue;
                    }


                    // Special handling: recipePart nested mapping to Orchard shapes
                    if (string.Equals(kvp.Key, "recipePart", StringComparison.OrdinalIgnoreCase) && value is JsonElement rpEl && rpEl.ValueKind == JsonValueKind.Object)
                    {
                        if (!((root[contentType] as Dictionary<string, object>)!.ContainsKey("RecipePart")))
                        {
                            section["RecipePart"] = new Dictionary<string, object>();
                        }
                        var rp = (Dictionary<string, object>)section["RecipePart"];

                        foreach (var prop in rpEl.EnumerateObject())
                        {
                            var childKey = ToPascalCase(prop.Name);
                            var childVal = prop.Value;

                            if (string.Equals(prop.Name, "description", StringComparison.OrdinalIgnoreCase) && childVal.ValueKind == JsonValueKind.String)
                            {
                                rp["Description"] = new Dictionary<string, object> { { "Markdown", childVal.GetString()! } };
                            }
                            else if ((string.Equals(prop.Name, "prepTimeMinutes", StringComparison.OrdinalIgnoreCase)
                                    || string.Equals(prop.Name, "cookTimeMinutes", StringComparison.OrdinalIgnoreCase)
                                    || string.Equals(prop.Name, "servings", StringComparison.OrdinalIgnoreCase))
                                    && childVal.ValueKind == JsonValueKind.Number)
                            {
                                rp[childKey] = new Dictionary<string, object> { { "Value", childVal.GetDouble() } };
                            }
                            else if (string.Equals(prop.Name, "recipeImage", StringComparison.OrdinalIgnoreCase) && childVal.ValueKind == JsonValueKind.Object)
                            {
                                var img = new Dictionary<string, object>();
                                foreach (var imgProp in childVal.EnumerateObject())
                                {
                                    if ((string.Equals(imgProp.Name, "paths", StringComparison.OrdinalIgnoreCase)
                                        || string.Equals(imgProp.Name, "mediaTexts", StringComparison.OrdinalIgnoreCase))
                                        && imgProp.Value.ValueKind == JsonValueKind.Array)
                                    {
                                        var arr = new List<string>();
                                        foreach (var a in imgProp.Value.EnumerateArray())
                                        {
                                            if (a.ValueKind == JsonValueKind.String) arr.Add(a.GetString()!);
                                        }
                                        img[ToPascalCase(imgProp.Name)] = arr;
                                    }
                                }
                                rp["RecipeImage"] = img;
                            }
                            else if (string.Equals(prop.Name, "category", StringComparison.OrdinalIgnoreCase) && childVal.ValueKind == JsonValueKind.Array)
                            {
                                var ids = new List<string>();
                                foreach (var idEl in childVal.EnumerateArray())
                                {
                                    if (idEl.ValueKind == JsonValueKind.String)
                                    {
                                        var s = idEl.GetString();
                                        if (s != null) ids.Add(s);
                                    }
                                }
                                if (!rp.ContainsKey("Category")) rp["Category"] = new Dictionary<string, object>();
                                ((Dictionary<string, object>)rp["Category"])["TermContentItemIds"] = ids;
                            }
                            else
                            {
                                // Fallback: generic conversion with PascalCase key
                                rp[childKey] = ConvertJsonElementToPlain(childVal);
                            }
                        }
                        continue;
                    }

                    // Special handling: top-level category as taxonomy terms
                    if (string.Equals(kvp.Key, "category", StringComparison.OrdinalIgnoreCase) && value is JsonElement catEl && catEl.ValueKind == JsonValueKind.Array)
                    {
                        if (!section.ContainsKey("RecipePart") || section["RecipePart"] is not Dictionary<string, object>)
                        {
                            section["RecipePart"] = new Dictionary<string, object>();
                        }
                        var rp = (Dictionary<string, object>)section["RecipePart"];
                        if (!rp.ContainsKey("Category") || rp["Category"] is not Dictionary<string, object>)
                        {
                            rp["Category"] = new Dictionary<string, object>();
                        }
                        var ids = new List<string>();
                        foreach (var idEl in catEl.EnumerateArray())
                        {
                            if (idEl.ValueKind == JsonValueKind.String)
                            {
                                var s = idEl.GetString();
                                if (s != null) ids.Add(s);
                            }
                        }
                        ((Dictionary<string, object>)rp["Category"])["TermContentItemIds"] = ids;
                        continue;
                    }

                    // Handle fields ending with "Id" - these are content item references
                    if (kvp.Key.EndsWith("Id", StringComparison.OrdinalIgnoreCase) &&
                        kvp.Key.Length > 2)
                    {
                        // Transform "ownerId" → "Owner" with ContentItemIds
                        var fieldName = pascalKey.Substring(0, pascalKey.Length - 2); // Remove "Id"
                        var idValue = value is JsonElement jsonEl && jsonEl.ValueKind == JsonValueKind.String
                            ? jsonEl.GetString()
                            : value.ToString();

                        // Assign as a List<string> to avoid wrapping
                        if (idValue != null)
                        {
                            if (!section.ContainsKey(fieldName) || section[fieldName] is not Dictionary<string, object>)
                            {
                                section[fieldName] = new Dictionary<string, object>();
                            }
                            ((Dictionary<string, object>)section[fieldName])["ContentItemIds"] = new List<string> { idValue };
                        }
                    }
                    else if (value is JsonElement jsonElement)
                    {
                        // Extract the actual string value, not a wrapped JObject
                        if (jsonElement.ValueKind == JsonValueKind.String)
                        {
                            if (!section.ContainsKey(pascalKey) || section[pascalKey] is not Dictionary<string, object>)
                            {
                                section[pascalKey] = new Dictionary<string, object>();
                            }
                            ((Dictionary<string, object>)section[pascalKey])["Text"] = jsonElement.GetString()!;
                        }
                        else if (jsonElement.ValueKind == JsonValueKind.Number)
                        {
                            if (!section.ContainsKey(pascalKey) || section[pascalKey] is not Dictionary<string, object>)
                            {
                                section[pascalKey] = new Dictionary<string, object>();
                            }
                            ((Dictionary<string, object>)section[pascalKey])["Value"] = jsonElement.GetDouble();
                        }
                        else if (jsonElement.ValueKind == JsonValueKind.True || jsonElement.ValueKind == JsonValueKind.False)
                        {
                            if (!section.ContainsKey(pascalKey) || section[pascalKey] is not Dictionary<string, object>)
                            {
                                section[pascalKey] = new Dictionary<string, object>();
                            }
                            ((Dictionary<string, object>)section[pascalKey])["Value"] = jsonElement.GetBoolean();
                        }
                        else if (jsonElement.ValueKind == JsonValueKind.Object)
                        {
                            // Handle objects - convert keys to PascalCase
                            var obj = new Dictionary<string, object>();
                            foreach (var prop in jsonElement.EnumerateObject())
                            {
                                obj[ToPascalCase(prop.Name)] = ConvertJsonElementToPlain(prop.Value);
                            }
                            section[pascalKey] = obj;
                        }
                        else if (jsonElement.ValueKind == JsonValueKind.Array)
                        {
                            // Handle arrays - could be ContentItemIds or Values
                            var arrayData = new List<string>();
                            foreach (var item in jsonElement.EnumerateArray())
                            {
                                if (item.ValueKind == JsonValueKind.String)
                                {
                                    var str = item.GetString();
                                    if (str != null) arrayData.Add(str);
                                }
                            }

                            // Detect if array contains ContentItemIds (26-char alphanumeric strings)
                            var isContentItemIds = arrayData.Count > 0 &&
                                arrayData.All(id => id.Length > 20 && id.All(c => char.IsLetterOrDigit(c)));

                            if (!section.ContainsKey(pascalKey) || section[pascalKey] is not Dictionary<string, object>)
                            {
                                section[pascalKey] = new Dictionary<string, object>();
                            }
                            if (isContentItemIds)
                            {
                                ((Dictionary<string, object>)section[pascalKey])["ContentItemIds"] = arrayData;
                            }
                            else
                            {
                                ((Dictionary<string, object>)section[pascalKey])["Values"] = arrayData.Cast<object>().ToList();
                            }
                        }
                        else
                        {
                            section[pascalKey] = ConvertJsonElementToPlain(jsonElement);
                        }
                    }
                    else if (value is string strValue)
                    {
                        if (!section.ContainsKey(pascalKey) || section[pascalKey] is not Dictionary<string, object>)
                        {
                            section[pascalKey] = new Dictionary<string, object>();
                        }
                        ((Dictionary<string, object>)section[pascalKey])["Text"] = strValue;
                    }
                    else if (value is int or long or double or float or decimal)
                    {
                        section[pascalKey] = new Dictionary<string, object>
                        {
                            { "Value", value }
                        };
                    }
                }

                // Apply built content into the dynamic ContentItem content
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
                return Results.Json(new
                {
                    error = ex.Message
                }, statusCode: 500);
            }
        });
    }

    private static string ToPascalCase(string str)
    {
        if (string.IsNullOrEmpty(str) || char.IsUpper(str[0]))
            return str;
        return char.ToUpper(str[0]) + str.Substring(1);
    }

    private static JToken ConvertJsonElement(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.String)
        {
            return new JObject { ["Text"] = element.GetString() };
        }
        else if (element.ValueKind == JsonValueKind.Number)
        {
            return new JObject { ["Value"] = element.GetDouble() };
        }
        else if (element.ValueKind == JsonValueKind.True || element.ValueKind == JsonValueKind.False)
        {
            return new JObject { ["Value"] = element.GetBoolean() };
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            // Wrap arrays in {"values": [...]} pattern for Orchard Core list fields
            var arrayValues = new JArray();
            foreach (var item in element.EnumerateArray())
            {
                // Convert each item to appropriate JToken
                if (item.ValueKind == JsonValueKind.String)
                    arrayValues.Add(item.GetString());
                else if (item.ValueKind == JsonValueKind.Number)
                    arrayValues.Add(item.GetDouble());
                else if (item.ValueKind == JsonValueKind.True || item.ValueKind == JsonValueKind.False)
                    arrayValues.Add(item.GetBoolean());
                else
                    arrayValues.Add(JToken.Parse(item.GetRawText()));
            }
            return new JObject { ["values"] = arrayValues };
        }

        // For complex types, just wrap as-is
        return new JObject { ["Text"] = element.ToString() };
    }

    private static JToken ConvertJsonElementToPascal(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.String)
        {
            return JToken.FromObject(element.GetString()!);
        }
        else if (element.ValueKind == JsonValueKind.Number)
        {
            return JToken.FromObject(element.GetDouble());
        }
        else if (element.ValueKind == JsonValueKind.True || element.ValueKind == JsonValueKind.False)
        {
            return JToken.FromObject(element.GetBoolean());
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            var arr = new JArray();
            foreach (var item in element.EnumerateArray())
            {
                arr.Add(ConvertJsonElementToPascal(item));
            }
            return arr;
        }
        else if (element.ValueKind == JsonValueKind.Object)
        {
            var obj = new JObject();
            foreach (var prop in element.EnumerateObject())
            {
                obj[ToPascalCase(prop.Name)] = ConvertJsonElementToPascal(prop.Value);
            }
            return obj;
        }

        return JToken.Parse(element.GetRawText());
    }

    private static object ConvertJsonElementToPlain(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.String => new Dictionary<string, object> { { "Text", element.GetString()! } },
            JsonValueKind.Number => new Dictionary<string, object> { { "Value", element.GetDouble() } },
            JsonValueKind.True or JsonValueKind.False => new Dictionary<string, object> { { "Value", element.GetBoolean() } },
            JsonValueKind.Array => new Dictionary<string, object> { { "values", element.EnumerateArray().Select(e => e.ValueKind == JsonValueKind.String ? (object)(e.GetString()!) : e.ValueKind == JsonValueKind.Number ? e.GetDouble() : e.ValueKind == JsonValueKind.True || e.ValueKind == JsonValueKind.False ? (object)e.GetBoolean() : (object)e.ToString()).ToList() } },
            JsonValueKind.Object => element.EnumerateObject().ToDictionary(p => ToPascalCase(p.Name), p => ConvertJsonElementToPlain(p.Value)),
            _ => element.ToString()
        };
    }
}
