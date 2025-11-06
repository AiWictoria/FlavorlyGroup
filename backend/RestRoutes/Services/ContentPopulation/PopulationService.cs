namespace RestRoutes.Services.ContentPopulation;

using OrchardCore.ContentManagement;
using OrchardCore.ContentManagement.Records;
using YesSql.Services;
using System.Text.Json;

public class PopulationService
{
    private readonly JsonSerializerOptions _jsonOptions;

    public PopulationService()
    {
        _jsonOptions = new JsonSerializerOptions
        {
            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
        };
    }

    public async Task<Dictionary<string, Dictionary<string, JsonElement>>> PopulateReferencedItemsAsync(
        List<Dictionary<string, JsonElement>> plainObjects,
        YesSql.ISession session,
        bool denormalize = false)
    {
        var allReferencedIds = new HashSet<string>();
        foreach (var obj in plainObjects)
        {
            IdCollector.CollectContentItemIds(obj, allReferencedIds);
        }

        if (allReferencedIds.Count == 0)
        {
            return new Dictionary<string, Dictionary<string, JsonElement>>();
        }

        var referencedItems = await session
            .Query()
            .For<ContentItem>()
            .With<ContentItemIndex>(x => x.ContentItemId.IsIn(allReferencedIds))
            .ListAsync();

        var refJsonString = JsonSerializer.Serialize(referencedItems, _jsonOptions);
        var plainRefItems = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(refJsonString);

        if (plainRefItems == null)
        {
            return new Dictionary<string, Dictionary<string, JsonElement>>();
        }

        var itemsDictionary = new Dictionary<string, Dictionary<string, JsonElement>>();
        foreach (var item in plainRefItems)
        {
            if (item.TryGetValue("ContentItemId", out var idElement))
            {
                var id = idElement.GetString();
                if (id != null) itemsDictionary[id] = item;
            }
        }

        foreach (var obj in plainObjects)
        {
            ContentItemPopulator.PopulateContentItemIds(obj, itemsDictionary, denormalize);
        }

        return itemsDictionary;
    }

    public async Task<Dictionary<string, JsonElement>> PopulateUserDataAsync(
        List<Dictionary<string, JsonElement>> plainObjects,
        YesSql.ISession session)
    {
        var allUserIds = new HashSet<string>();
        foreach (var obj in plainObjects)
        {
            IdCollector.CollectUserIds(obj, allUserIds);
        }

        if (allUserIds.Count == 0)
        {
            return new Dictionary<string, JsonElement>();
        }

        // Query UserIndex to get user data
        var users = await session
            .Query()
            .For<OrchardCore.Users.Models.User>()
            .With<OrchardCore.Users.Indexes.UserIndex>(x => x.UserId.IsIn(allUserIds))
            .ListAsync();

        if (!users.Any())
        {
            return new Dictionary<string, JsonElement>();
        }

        var usersJsonString = JsonSerializer.Serialize(users, _jsonOptions);
        var plainUsers = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(usersJsonString);

        if (plainUsers == null)
        {
            return new Dictionary<string, JsonElement>();
        }

        var usersDictionary = new Dictionary<string, JsonElement>();
        foreach (var user in plainUsers)
        {
            if (user.TryGetValue("UserId", out var userIdElement))
            {
                var userId = userIdElement.GetString();
                if (userId != null)
                {
                    usersDictionary[userId] = JsonSerializer.SerializeToElement(user);
                }
            }
        }

        return usersDictionary;
    }
}

