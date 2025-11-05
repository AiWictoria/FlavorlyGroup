namespace RestRoutes.Services.Shared;

using System.Text.Json;

public static class JsonElementConverter
{
    public static Dictionary<string, object> ConvertJsonElement(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.String)
        {
            return new Dictionary<string, object> { ["Text"] = element.GetString()! };
        }
        else if (element.ValueKind == JsonValueKind.Number)
        {
            return new Dictionary<string, object> { ["Value"] = element.GetDouble() };
        }
        else if (element.ValueKind == JsonValueKind.True || element.ValueKind == JsonValueKind.False)
        {
            return new Dictionary<string, object> { ["Value"] = element.GetBoolean() };
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            // Wrap arrays in {"values": [...]} pattern for Orchard Core list fields
            var arrayValues = new List<object>();
            foreach (var item in element.EnumerateArray())
            {
                // Convert each item to appropriate type
                if (item.ValueKind == JsonValueKind.String)
                    arrayValues.Add(item.GetString()!);
                else if (item.ValueKind == JsonValueKind.Number)
                    arrayValues.Add(item.GetDouble());
                else if (item.ValueKind == JsonValueKind.True || item.ValueKind == JsonValueKind.False)
                    arrayValues.Add(item.GetBoolean());
                else
                    arrayValues.Add(JsonSerializer.Deserialize<object>(item.GetRawText())!);
            }
            return new Dictionary<string, object> { ["values"] = arrayValues };
        }

        // For complex types, just wrap as-is
        return new Dictionary<string, object> { ["Text"] = element.ToString() };
    }

    public static object ConvertJsonElementToPascal(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.String)
        {
            return element.GetString()!;
        }
        else if (element.ValueKind == JsonValueKind.Number)
        {
            return element.GetDouble();
        }
        else if (element.ValueKind == JsonValueKind.True || element.ValueKind == JsonValueKind.False)
        {
            return element.GetBoolean();
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            var arr = new List<object>();
            foreach (var item in element.EnumerateArray())
            {
                arr.Add(ConvertJsonElementToPascal(item));
            }
            return arr;
        }
        else if (element.ValueKind == JsonValueKind.Object)
        {
            var obj = new Dictionary<string, object>();
            foreach (var prop in element.EnumerateObject())
            {
                obj[NameConversionService.ToPascalCase(prop.Name)] = ConvertJsonElementToPascal(prop.Value);
            }
            return obj;
        }

        return JsonSerializer.Deserialize<object>(element.GetRawText())!;
    }
}

