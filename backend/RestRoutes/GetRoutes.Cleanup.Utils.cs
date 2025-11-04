namespace RestRoutes;

public static partial class GetRoutes
{
    private static string ToCamelCase(string str)
    {
        if (string.IsNullOrEmpty(str) || char.IsLower(str[0]))
            return str;
        return char.ToLower(str[0]) + str.Substring(1);
    }

    private static string ToPascalCase(string str)
    {
        if (string.IsNullOrEmpty(str) || char.IsUpper(str[0]))
            return str;
        return char.ToUpper(str[0]) + str.Substring(1);
    }

    private static bool IsOrchardMetaKey(string key)
    {
        // Vanliga OrchardCore-meta och brus
        switch (key)
        {
            case "ContentItemVersionId":
            case "Latest":
            case "Published":
            case "ModifiedUtc":
            case "PublishedUtc":
            case "CreatedUtc":
            case "Owner":
            case "Author":
            case "TitlePart": // vi använder redan DisplayText
                return true;
            default:
                return false;
        }
    }

    private static bool IsTaxonomyMetaKey(string key)
    {
        switch (key)
        {
            case "TaxonomyContentItemId":
            case "TermContentItemIds":
            case "TermItems":
            case "TaxonomyItems":
            case "TaxonomyPart":
            case "Terms":
                return true;
            default:
                return false;
        }
    }
}


