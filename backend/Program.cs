using OrchardCore.Logging;
using RestRoutes;
using DotNetEnv;
using Stripe;

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

            var app = builder.Build();

            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }

            // our mods
            app.MapRestRoutes();

            // Behöver denna vara här då jag har  StripeRoutes i RestRoutes mappen?
            app.MapStripeRoutes();

            app.UseStaticFiles();

            app.UseOrchardCore();

            app.Run();

        }
    }
}

