namespace RestRoutes.Services;

using Microsoft.Extensions.DependencyInjection;
using RestRoutes.Services.ContentMutation;
using RestRoutes.Services.ContentQuery;

public static class ServiceRegistration
{
    public static IServiceCollection AddRestRouteServices(this IServiceCollection services)
    {
        services.AddScoped<ContentMutationService>();
        services.AddScoped<ContentQueryService>();

        return services;
    }
}

