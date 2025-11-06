namespace RestRoutes.Services.ContentQuery;

using RestRoutes.Services.Response;

public class ContentQueryService
{
    public IResult FindItemById(
        List<Dictionary<string, object>> items,
        string id,
        string idField = "id")
    {
        var item = items.FirstOrDefault(obj =>
            obj.ContainsKey(idField) && obj[idField]?.ToString() == id);

        if (item == null)
        {
            // Return null JSON response for backward compatibility
            return Results.Json((object?)null, statusCode: 404);
        }

        return ResponseBuilder.Success(item);
    }

    public IResult FindItemByContentItemId(
        List<Dictionary<string, object>> items,
        string id)
    {
        var item = items.FirstOrDefault(obj =>
            obj.ContainsKey("ContentItemId") && obj["ContentItemId"]?.ToString() == id);

        if (item == null)
        {
            // Return null JSON response for backward compatibility
            return Results.Json((object?)null, statusCode: 404);
        }

        return ResponseBuilder.Success(item);
    }

    public IResult ReturnItems(List<Dictionary<string, object>> items)
    {
        return ResponseBuilder.Success(items);
    }
}

