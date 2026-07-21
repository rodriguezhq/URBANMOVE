using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using URBANMOVE_Proyecto.Server.Middlewares;
using URBANMOVE_Proyecto.Server.Models.Database;
using URBANMOVE_Proyecto.Server.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddOpenApi();

// db context
builder.Services.AddDbContext<AppDbContext>(
    (options) =>
        options.UseSqlite(
            builder.Configuration.GetConnectionString("DefaultConnection"),
            x => x.UseNetTopologySuite()
            )
    );

builder.Services.AddIdentity<Usuario, IdentityRole>(options =>
    {
        options.Password.RequireDigit = false;
        options.Password.RequiredLength = 6;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = false;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// cookies
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "UrbanMoveAuth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        options.ExpireTimeSpan = TimeSpan.FromDays(7);
        options.SlidingExpiration = true;
        options.LoginPath = "/api/auth/login";
        options.LogoutPath = "/api/auth/logout";
    });

// Email
builder.Services.Configure<EmailOptions>(
    builder.Configuration.GetSection("Email")
    );
builder.Services.AddScoped<EmailService>();

// https client
builder.Services.AddHttpClient<RoutingService>((sp, client) =>
{
    var configuration = sp.GetRequiredService<IConfiguration>();

    client.BaseAddress = new Uri(
        configuration["General:RoutingUrl"]!);

    client.Timeout = TimeSpan.FromSeconds(30);
});

// Servicios de dominio
builder.Services.AddScoped<NavegacionService>();
builder.Services.AddScoped<TicketsService>();

builder.Services.AddScoped<IncidentesService>();

builder.Services.AddScoped<DashboardService>();

builder.Services.AddScoped<FidelizacionService>();

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("ciudadano", cfg =>
    {
        cfg.Window = TimeSpan.FromMinutes(1);
        cfg.PermitLimit = 60;
        cfg.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        cfg.QueueLimit = 10;
    });

    options.AddFixedWindowLimiter("anonimo", cfg =>
    {
        cfg.Window = TimeSpan.FromMinutes(1);
        cfg.PermitLimit = 20;
        cfg.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        cfg.QueueLimit = 5;
    });

    // Supera limites de peticiones
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// frontend
builder.Services.Configure<GeneralSettings>(
    builder.Configuration.GetSection("General")
);


var app = builder.Build();


// seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<Usuario>>();
    var routingService = scope.ServiceProvider.GetRequiredService<URBANMOVE_Proyecto.Server.Services.RoutingService>();
    await DbInitializer.InitializeAsync(db, roleManager, userManager, routingService);
}

app.UseDefaultFiles();
app.MapStaticAssets();

app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

// Rate limiting middleware
app.UseRateLimiter();

app.MapControllers();

app.UseMiddleware<NetworkMiddleware>();

app.MapFallbackToFile("/index.html");

app.Run();
