namespace OrchardCore.Backend;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddOrchardCms();

        var app = builder.Build();

        if (!app.Environment.IsDevelopment())
        {
            app.UseExceptionHandler("/Error");
            app.UseHsts();
        }

        app.MapAuthEndpoints();

        app.UseStaticFiles();

        app.UseOrchardCore();

        app.Run();
    }
}

