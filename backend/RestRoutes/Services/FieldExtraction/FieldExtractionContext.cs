namespace RestRoutes.Services.FieldExtraction;

using System.Text.Json;

public class FieldExtractionContext
{
    public Dictionary<string, JsonElement>? UsersDictionary { get; set; }

    public Func<Dictionary<string, JsonElement>, string, Dictionary<string, object>>? CleanObjectFunc { get; set; }

    public Func<Dictionary<string, JsonElement>, Dictionary<string, JsonElement>?, Dictionary<string, object>>? CleanUserProfileForUserFunc { get; set; }

    public Func<Dictionary<string, object>, Dictionary<string, object>>? RemoveMetadataFieldsFunc { get; set; }

    public Func<string, string>? ToCamelCaseFunc { get; set; }
}

