namespace RestRoutes.Services.ContentCleaning;

using System.Text.Json;
using RestRoutes.Services.FieldExtraction;

public class ContentCleaningContext
{
    public Dictionary<string, JsonElement>? UsersDictionary { get; set; }

    public Func<Dictionary<string, JsonElement>, string, Dictionary<string, object>> CleanObjectFunc { get; set; } = null!;

    public Func<Dictionary<string, JsonElement>, Dictionary<string, JsonElement>?, Dictionary<string, object>>? CleanUserProfileForUserFunc { get; set; }

    public Func<Dictionary<string, object>, Dictionary<string, object>>? RemoveMetadataFieldsFunc { get; set; }

    public Func<string, string> ToCamelCaseFunc { get; set; } = null!;

    public FieldExtractionContext CreateFieldExtractionContext()
    {
        return new FieldExtractionContext
        {
            UsersDictionary = UsersDictionary,
            CleanObjectFunc = CleanObjectFunc,
            CleanUserProfileForUserFunc = CleanUserProfileForUserFunc,
            RemoveMetadataFieldsFunc = RemoveMetadataFieldsFunc,
            ToCamelCaseFunc = ToCamelCaseFunc
        };
    }
}

