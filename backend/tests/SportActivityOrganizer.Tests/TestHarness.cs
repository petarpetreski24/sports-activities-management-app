using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Moq;
using SportActivityOrganizer.Application.Interfaces;
using SportActivityOrganizer.Application.Interfaces.Persistence;
using SportActivityOrganizer.Application.Mapping;
using SportActivityOrganizer.Domain.Entities;
using SportActivityOrganizer.Domain.Enums;
using SportActivityOrganizer.Infrastructure.Data;
using SportActivityOrganizer.Infrastructure.Persistence;

namespace SportActivityOrganizer.Tests;

/// <summary>
/// Spins up a real AppDbContext on the EF Core in-memory provider wrapped by the
/// real UnitOfWork/GenericRepository, plus a real AutoMapper and mocked external
/// adapters (notifications, email, tokens). This lets the use-case services be
/// tested through their actual persistence path without a database server.
/// </summary>
public sealed class TestHarness : IDisposable
{
    public AppDbContext Db { get; }
    public IUnitOfWork Uow { get; }
    public IMapper Mapper { get; }
    public Mock<INotificationService> Notifications { get; } = new();
    public Mock<IEmailService> Email { get; } = new();
    public Mock<ITokenService> Tokens { get; } = new();

    public TestHarness()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"sao-tests-{Guid.NewGuid()}")
            .Options;
        Db = new AppDbContext(options);
        Uow = new UnitOfWork(Db);

        Mapper = new MapperConfiguration(
            cfg => cfg.AddMaps(typeof(UserMappingProfile).Assembly)).CreateMapper();

        Tokens.Setup(t => t.GenerateAccessToken(It.IsAny<User>())).Returns("access-token");
        Tokens.Setup(t => t.GenerateRefreshToken()).Returns("refresh-token");
    }

    public User AddUser(
        string email = "user@test.com",
        bool emailConfirmed = true,
        UserRole role = UserRole.User,
        string password = "Password123!",
        bool isActive = true)
    {
        var user = new User
        {
            FirstName = "Test",
            LastName = "User",
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = role,
            IsActive = isActive,
            EmailConfirmed = emailConfirmed,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        Db.Set<User>().Add(user);
        Db.SaveChanges();
        return user;
    }

    public Sport AddSport(string name = "Football")
    {
        var sport = new Sport
        {
            Name = name,
            Icon = "icon",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        Db.Set<Sport>().Add(sport);
        Db.SaveChanges();
        return sport;
    }

    public SportEvent AddEvent(
        int organizerId,
        int sportId,
        EventStatus status = EventStatus.Open,
        int maxParticipants = 2,
        DateTime? eventDate = null,
        int durationMinutes = 60)
    {
        var sportEvent = new SportEvent
        {
            OrganizerId = organizerId,
            SportId = sportId,
            Title = "Test Event",
            Description = "desc",
            EventDate = eventDate ?? DateTime.UtcNow.AddDays(3),
            DurationMinutes = durationMinutes,
            LocationAddress = "Somewhere",
            LocationLat = 41.99m,
            LocationLng = 21.42m,
            MaxParticipants = maxParticipants,
            Status = status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        Db.Set<SportEvent>().Add(sportEvent);
        Db.SaveChanges();
        return sportEvent;
    }

    public EventApplication AddApplication(
        int eventId,
        int userId,
        ApplicationStatus status = ApplicationStatus.Pending)
    {
        var application = new EventApplication
        {
            EventId = eventId,
            UserId = userId,
            Status = status,
            AppliedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        Db.Set<EventApplication>().Add(application);
        Db.SaveChanges();
        return application;
    }

    public void Dispose() => Db.Dispose();
}
