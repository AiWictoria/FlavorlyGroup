namespace WebApp;

public static class ImageUpload
{
  public static void Start()
  {
    App.MapPost("/api/imageUpload", async (HttpContext context) =>
    {
      var form = await context.Request.ReadFormAsync();
      var img = form.Files.GetFile("image");
      var recipeId = form["id"].ToString();

      string relativeUrl;

      if (string.IsNullOrWhiteSpace(recipeId))
        return RestResult.Parse(context, new { error = "Recipe ID is required" });

      if (img == null || img.Length == 0)
        return RestResult.Parse(context, new { error = "No image file provided" });

      else
      {
        var allowedTypes = new[] { ".jpeg", ".png", ".jpg", ".webp" };
        var ext = Path.GetExtension(img.FileName).ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(ext) || !allowedTypes.Contains(ext))
          return RestResult.Parse(context, new { error = "Only .jpeg, .png, .jpg and .webp types are allowed" });

        var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "public", "images", "recipes");

        if (!Directory.Exists(uploadPath))
          Directory.CreateDirectory(uploadPath);

        var fileName = $"{recipeId}{ext}";
        var filePath = Path.Combine(uploadPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
          await img.CopyToAsync(stream);
        }

        relativeUrl = $"/images/recipes/{fileName}";
        var sql = "UPDATE recipes SET imageUrl = $imageUrl WHERE id = $id";
        var parameters = new { imageUrl = relativeUrl, id = recipeId };
        SQLQueryOne(sql, parameters, context);

        return RestResult.Parse(context, new { imageUrl = relativeUrl });
      }
    });
  }
}