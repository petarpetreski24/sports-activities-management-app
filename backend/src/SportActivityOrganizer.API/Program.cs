using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SportActivityOrganizer.Application.Interfaces;
using SportActivityOrganizer.Application.Interfaces.Persistence;
using SportActivityOrganizer.Infrastructure.Data;
using SportActivityOrganizer.Infrastructure.Persistence;
using SportActivityOrganizer.Infrastructure.Services;
using SportActivityOrganizer.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Database — parse Railway's DATABASE_URL if present, otherwise use appsettings
string GetConnectionString()
{
    var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
    if (!string.IsNullOrEmpty(databaseUrl))
    {
        var uri = new Uri(databaseUrl);
        var userInfo = uri.UserInfo.Split(':');
        return $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Disable";
    }
    return builder.Configuration.GetConnectionString("DefaultConnection")!;
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(GetConnectionString()));

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// AutoMapper
builder.Services.AddAutoMapper(typeof(SportActivityOrganizer.Application.Mapping.UserMappingProfile).Assembly);

// Unit of Work & Repositories
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ISportService, SportService>();
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<IEventApplicationService, EventApplicationService>();
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<IRatingService, RatingService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IAdminService, AdminService>();

// Background services
builder.Services.AddHostedService<EventBackgroundService>();

// Controllers
builder.Services.AddControllers();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
            ?? new[] { "http://localhost:3000", "http://localhost:5173" };

        // Also allow APP_FRONTEND_URL env var (for Railway / production)
        var frontendUrl = Environment.GetEnvironmentVariable("APP_FRONTEND_URL");
        if (!string.IsNullOrEmpty(frontendUrl))
        {
            allowedOrigins = allowedOrigins.Append(frontendUrl.TrimEnd('/')).Distinct().ToArray();
        }

        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Sport Activity Organizer API",
        Version = "v1",
        Description = "API за систем за организирање на спортски активности"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Apply migrations on startup and seed data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    await DataSeeder.SeedAsync(db);

    // One-time cleanup: remove petarpetreski24 aliases and promote user1 to admin
    var petarUsers = await db.Users
        .Where(u => u.Email.Contains("petarpetreski"))
        .ToListAsync();
    if (petarUsers.Any())
    {
        // Remove related data first
        var petarIds = petarUsers.Select(u => u.Id).ToList();
        db.Notifications.RemoveRange(db.Notifications.Where(n => petarIds.Contains(n.UserId)));
        db.NotificationPreferences.RemoveRange(db.NotificationPreferences.Where(np => petarIds.Contains(np.UserId)));
        db.EventApplications.RemoveRange(db.EventApplications.Where(ea => petarIds.Contains(ea.UserId)));
        db.EventComments.RemoveRange(db.EventComments.Where(ec => petarIds.Contains(ec.UserId)));
        db.EventRatings.RemoveRange(db.EventRatings.Where(er => petarIds.Contains(er.ReviewerId)));
        db.ParticipantRatings.RemoveRange(db.ParticipantRatings.Where(pr => petarIds.Contains(pr.RaterId) || petarIds.Contains(pr.ParticipantId)));
        db.Set<SportActivityOrganizer.Domain.Entities.UserFavoriteSport>()
            .RemoveRange(db.Set<SportActivityOrganizer.Domain.Entities.UserFavoriteSport>().Where(fs => petarIds.Contains(fs.UserId)));
        db.Users.RemoveRange(petarUsers);
        await db.SaveChangesAsync();
        Console.WriteLine($"Cleaned up {petarUsers.Count} petarpetreski user(s).");
    }

    // Promote user1 to Admin if not already
    var user1 = await db.Users.FirstOrDefaultAsync(u => u.Email == "user1@sportactivityorganizer.com");
    if (user1 != null && user1.Role != SportActivityOrganizer.Domain.Enums.UserRole.Admin)
    {
        user1.Role = SportActivityOrganizer.Domain.Enums.UserRole.Admin;
        await db.SaveChangesAsync();
        Console.WriteLine("Promoted user1 to Admin.");
    }
}

// Middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

// Serve uploaded files
app.UseStaticFiles();

app.MapControllers();

app.Run();
