using OrchardCore.Logging;
using backend;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseNLogHost();

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