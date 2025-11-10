using OrchardCore.Logging;
using RestRoutes;
using RestRoutes.Services;
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

            // Register POST route services (SOLID refactoring)
            // These services depend on OrchardCore services (IContentManager, ISession)
            // which are registered by AddOrchardCms(), so we register them after
            builder.Services.AddScoped<PostRequestValidator>();
            builder.Services.AddScoped<ContentItemMetadataService>();
            builder.Services.AddScoped<ContentItemFieldMapperService>();
            builder.Services.AddScoped<ContentItemCreationService>();

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