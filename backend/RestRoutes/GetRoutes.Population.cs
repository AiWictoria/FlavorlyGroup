namespace RestRoutes;

using System.Text.Json;
using RestRoutes.Services.ContentPopulation;

public static partial class GetRoutes
{
    // Delegate to services - kept for backward compatibility
    private static void CollectContentItemIds(Dictionary<string, JsonElement> obj, HashSet<string> ids)
    {
        IdCollector.CollectContentItemIds(obj, ids);
    }

    private static void CollectUserIds(Dictionary<string, JsonElement> obj, HashSet<string> userIds)
    {
        IdCollector.CollectUserIds(obj, userIds);
    }

    private static void PopulateContentItemIds(
        Dictionary<string, JsonElement> obj,
        Dictionary<string, Dictionary<string, JsonElement>> itemsDictionary,
        bool denormalize = false)
    {
        ContentItemPopulator.PopulateContentItemIds(obj, itemsDictionary, denormalize);
    }
}
