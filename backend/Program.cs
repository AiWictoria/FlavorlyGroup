using OrchardCore.Logging;
using RestRoutes;
using DotNetEnv;
using Stripe;
using RestRoutes.Services;

namespace backend
{
    class Program
    {
        static void Main(string[] args)
        {
            Env.Load();

            StripeConfiguration.ApiKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");

            var builder = WebApplication.CreateBuilder(args);

            builder.Host.UseNLogHost();

            builder.Services.AddOrchardCms();

            // CORS (för frontend på annan port)
            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(policy =>
                {
                    policy.WithOrigins("http://localhost:5173")
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });
            builder.Services.AddRestRouteServices();

            var app = builder.Build();

            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }

            app.UseCors();

            // our mods
            app.MapRestRoutes();

            app.MapStripeRoutes();

            app.UseStaticFiles();

            app.UseOrchardCore();

            app.Run();

        }
    }
}

// Make Program class accessible to test projects
public partial class Program { }