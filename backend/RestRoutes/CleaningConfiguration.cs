namespace RestRoutes;

/// <summary>
/// Configuration for cleaning content items based on content type and depth level.
/// Defines which fields should be included in the cleaned response for each content type at each depth.
/// </summary>
public class CleaningConfiguration
{
    // Whitelists per ContentType per Depth level
    // Key: ContentType, Value: Dictionary<Depth, HashSet<FieldNames>>
    private readonly Dictionary<string, Dictionary<int, HashSet<string>>> _fieldWhitelists;

    // Special types that always get minimal cleaning regardless of depth
    private readonly HashSet<string> _alwaysMinimalTypes;

    public CleaningConfiguration()
    {
        _fieldWhitelists = new Dictionary<string, Dictionary<int, HashSet<string>>>();
        _alwaysMinimalTypes = new HashSet<string> { "User", "Category" };

        InitializeWhitelists();
    }

    private void InitializeWhitelists()
    {


        // RestPermissions - used for ACL checking
        AddWhitelist("RestPermissions", 1, new[]
        {
            "id", "title", "roles", "contentTypes", "restMethods"
        });
    }

    private void AddWhitelist(string contentType, int depth, string[] fields)
    {
        if (!_fieldWhitelists.ContainsKey(contentType))
        {
            _fieldWhitelists[contentType] = new Dictionary<int, HashSet<string>>();
        }

        _fieldWhitelists[contentType][depth] = new HashSet<string>(fields, StringComparer.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Gets the allowed fields for a content type at a specific depth.
    /// </summary>
    public HashSet<string> GetAllowedFields(string contentType, int depth)
    {
        // Check if we have a specific whitelist for this type and depth
        if (_fieldWhitelists.TryGetValue(contentType, out var depthDict))
        {
            if (depthDict.TryGetValue(depth, out var fields))
            {
                return fields;
            }

            // Fallback: if depth not found, try to use the highest available depth for this type
            var maxDepth = depthDict.Keys.Max();
            if (depthDict.TryGetValue(maxDepth, out var fallbackFields))
            {
                return fallbackFields;
            }
        }

        // Default: return null to signal "no whitelist defined" - let cleaner include all fields
        // This is safer than restricting to just {id, title} for unknown types
        return null!;
    }

    /// <summary>
    /// Checks if a field is allowed for a content type at a specific depth.
    /// </summary>
    public bool IsFieldAllowed(string contentType, string fieldName, int depth)
    {
        var allowedFields = GetAllowedFields(contentType, depth);
        return allowedFields.Contains(fieldName);
    }

    /// <summary>
    /// Checks if a content type should always use minimal cleaning.
    /// </summary>
    public bool IsAlwaysMinimal(string contentType)
    {
        return _alwaysMinimalTypes.Contains(contentType);
    }

    /// <summary>
    /// Gets special handling instructions for specific field types.
    /// </summary>
    public FieldHandlingType GetFieldHandling(string fieldName)
    {
        // User references - always minimal (id + username only)
        if (fieldName.Equals("author", StringComparison.OrdinalIgnoreCase) ||
            fieldName.Equals("authorRef", StringComparison.OrdinalIgnoreCase) ||
            fieldName.Equals("user", StringComparison.OrdinalIgnoreCase) ||
            fieldName.Equals("userRef", StringComparison.OrdinalIgnoreCase))
        {
            return FieldHandlingType.UserReference;
        }

        // Taxonomy/Category references - minimal (id + title only)
        if (fieldName.Equals("category", StringComparison.OrdinalIgnoreCase) ||
            fieldName.Equals("categories", StringComparison.OrdinalIgnoreCase) ||
            fieldName.Equals("categoryRef", StringComparison.OrdinalIgnoreCase))
        {
            return FieldHandlingType.TaxonomyReference;
        }

        // Unit references
        if (fieldName.Equals("unitRef", StringComparison.OrdinalIgnoreCase) ||
            fieldName.Equals("baseUnitRef", StringComparison.OrdinalIgnoreCase))
        {
            return FieldHandlingType.UnitReference;
        }

        // BagPart items
        if (fieldName.Equals("items", StringComparison.OrdinalIgnoreCase))
        {
            return FieldHandlingType.BagPartItems;
        }

        return FieldHandlingType.Normal;
    }
}

/// <summary>
/// Types of special field handling.
/// </summary>
public enum FieldHandlingType
{
    Normal,
    UserReference,
    TaxonomyReference,
    UnitReference,
    BagPartItems
}

