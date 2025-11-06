namespace RestRoutes.Services.Response;

public static class ResponseBuilder
{
    public static IResult Success(object data, int statusCode = 200)
    {
        return Results.Json(data, statusCode: statusCode);
    }

    public static IResult Error(string message, int statusCode = 400, object? additionalData = null)
    {
        var response = new Dictionary<string, object>
        {
            ["error"] = message
        };

        if (additionalData != null)
        {
            foreach (var prop in additionalData.GetType().GetProperties())
            {
                response[prop.Name] = prop.GetValue(additionalData) ?? "";
            }
        }

        return Results.Json(response, statusCode: statusCode);
    }

    public static IResult ValidationError(List<string> invalidFields, List<string> validFields)
    {
        return Error(
            "Invalid fields provided",
            statusCode: 400,
            new
            {
                invalidFields = invalidFields,
                validFields = validFields.OrderBy(f => f).ToList()
            }
        );
    }

    public static IResult NotFound(string message = "Resource not found")
    {
        return Error(message, statusCode: 404);
    }

    public static IResult Created(object data)
    {
        return Success(data, statusCode: 201);
    }

    public static IResult InternalServerError(string message = "An error occurred")
    {
        return Error(message, statusCode: 500);
    }
}

