namespace RestRoutes.Services;

using OrchardCore.ContentManagement;
using YesSql;

/// <summary>
/// Service responsible for validating POST requests.
/// Follows Single Responsibility Principle - only handles validation.
/// </summary>
public class PostRequestValidator
{
    private readonly HashSet<string> _reservedFields;

    public PostRequestValidator()
    {
        _reservedFields = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "id",
            "contentItemId",
            "title",
            "displayText",
            "createdUtc",
            "modifiedUtc",
            "publishedUtc",
            "contentType",
            "published",
            "latest"
        };
    }

    /// <summary>
    /// Validates the request body is not null or empty.
    /// </summary>
    public (bool isValid, IResult? errorResult) ValidateRequestBody(Dictionary<string, object>? body)
    {
        if (body == null || body.Count == 0)
        {
            return (false, Results.Json(new
            {
                error = "Cannot read request body"
            }, statusCode: 400));
        }

        return (true, null);
    }

    /// <summary>
    /// Validates that all fields in the request body are valid for the content type.
    /// </summary>
    public async Task<(bool isValid, IResult? errorResult)> ValidateFieldsAsync(
        string contentType,
        Dictionary<string, object> body,
        IContentManager contentManager,
        ISession session)
    {
        var validFields = await FieldValidator.GetValidFieldsAsync(contentType, contentManager, session);
        var (isValid, invalidFields) = FieldValidator.ValidateFields(body, validFields, _reservedFields);

        if (!isValid)
        {
            return (false, Results.Json(new
            {
                error = "Invalid fields provided",
                invalidFields = invalidFields,
                validFields = validFields.OrderBy(f => f).ToList()
            }, statusCode: 400));
        }

        return (true, null);
    }
}

