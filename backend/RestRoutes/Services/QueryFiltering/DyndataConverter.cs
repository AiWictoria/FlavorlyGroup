global using Dyndata;
global using static Dyndata.Factory;

namespace RestRoutes.Services.QueryFiltering;

public static class DyndataConverter
{
    public static Obj ConvertToObj(Dictionary<string, object> dict)
    {
        var obj = Obj();
        foreach (var kvp in dict)
        {
            if (kvp.Value is Dictionary<string, object> nestedDict)
            {
                obj[kvp.Key] = ConvertToObj(nestedDict);  // Recursive for nested objects
            }
            else if (kvp.Value is List<object> list)
            {
                // Handle arrays (if any)
                var arr = Arr();
                foreach (var item in list)
                {
                    if (item is Dictionary<string, object> itemDict)
                    {
                        arr.Push(ConvertToObj(itemDict));
                    }
                    else
                    {
                        arr.Push(item);
                    }
                }
                obj[kvp.Key] = arr;
            }
            else
            {
                obj[kvp.Key] = kvp.Value;
            }
        }
        return obj;
    }

    public static List<Dictionary<string, object>> ConvertFromArr(Arr arr)
    {
        var result = new List<Dictionary<string, object>>();
        foreach (Obj item in arr)
        {
            result.Add(ConvertFromObj(item));
        }
        return result;
    }

    public static Dictionary<string, object> ConvertFromObj(Obj obj)
    {
        var dict = new Dictionary<string, object>();
        foreach (var key in obj.GetKeys())
        {
            var value = obj[key];
            if (value is Obj nestedObj)
            {
                dict[key] = ConvertFromObj(nestedObj);  // Recursive!
            }
            else if (value is Arr nestedArr)
            {
                var list = new List<object>();
                foreach (var item in nestedArr)
                {
                    if (item is Obj itemObj)
                    {
                        list.Add(ConvertFromObj(itemObj));
                    }
                    else
                    {
                        list.Add(item);
                    }
                }
                dict[key] = list;
            }
            else
            {
                dict[key] = value;
            }
        }
        return dict;
    }
}

