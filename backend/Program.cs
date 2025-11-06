using OrchardCore.Logging;
using RestRoutes;
using RestRoutes.Services;

namespace backend
{
    class Program
    {
        static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Host.UseNLogHost();

            builder.Services.AddOrchardCms();
            builder.Services.AddRestRouteServices();

            var app = builder.Build();

            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }

            // our mods
            app.MapRestRoutes();

            app.UseStaticFiles();

            app.UseOrchardCore();

            app.Run();
        }
    }
}

