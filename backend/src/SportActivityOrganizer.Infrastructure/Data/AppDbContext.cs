using Microsoft.EntityFrameworkCore;
using SportActivityOrganizer.Domain.Common;
using SportActivityOrganizer.Domain.Entities;
using SportActivityOrganizer.Domain.Enums;

namespace SportActivityOrganizer.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Sport> Sports => Set<Sport>();
    public DbSet<UserFavoriteSport> UserFavoriteSports => Set<UserFavoriteSport>();
    public DbSet<SportEvent> SportEvents => Set<SportEvent>();
    public DbSet<EventApplication> EventApplications => Set<EventApplication>();
    public DbSet<EventComment> EventComments => Set<EventComment>();
    public DbSet<EventRating> EventRatings => Set<EventRating>();
    public DbSet<ParticipantRating> ParticipantRatings => Set<ParticipantRating>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<NotificationPreference> NotificationPreferences => Set<NotificationPreference>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Store enums as strings
        modelBuilder.HasPostgresEnum<UserRole>();
        modelBuilder.HasPostgresEnum<SkillLevel>();
        modelBuilder.HasPostgresEnum<EventStatus>();
        modelBuilder.HasPostgresEnum<ApplicationStatus>();
        modelBuilder.HasPostgresEnum<NotificationType>();

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.FirstName).HasMaxLength(100);
            e.Property(u => u.LastName).HasMaxLength(100);
            e.Property(u => u.Email).HasMaxLength(255);
            e.Property(u => u.PasswordHash).HasMaxLength(255);
            e.Property(u => u.Phone).HasMaxLength(20);
            e.Property(u => u.ProfilePhotoUrl).HasMaxLength(500);
            e.Property(u => u.LocationCity).HasMaxLength(100);
            e.Property(u => u.LocationLat).HasPrecision(9, 6);
            e.Property(u => u.LocationLng).HasPrecision(9, 6);
            e.Property(u => u.AvgRatingAsOrganizer).HasPrecision(3, 2);
            e.Property(u => u.AvgRatingAsParticipant).HasPrecision(3, 2);
            e.Property(u => u.Role).HasConversion<string>();
        });

        // Sport
        modelBuilder.Entity<Sport>(e =>
        {
            e.HasIndex(s => s.Name).IsUnique();
            e.Property(s => s.Name).HasMaxLength(100);
            e.Property(s => s.Icon).HasMaxLength(50);
        });

        // UserFavoriteSport
        modelBuilder.Entity<UserFavoriteSport>(e =>
        {
            e.HasIndex(ufs => new { ufs.UserId, ufs.SportId }).IsUnique();
            e.HasOne(ufs => ufs.User).WithMany(u => u.FavoriteSports).HasForeignKey(ufs => ufs.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(ufs => ufs.Sport).WithMany(s => s.FavoredByUsers).HasForeignKey(ufs => ufs.SportId).OnDelete(DeleteBehavior.Cascade);
            e.Property(ufs => ufs.SkillLevel).HasConversion<string>();
        });

        // SportEvent
        modelBuilder.Entity<SportEvent>(e =>
        {
            e.Property(se => se.Title).HasMaxLength(200);
            e.Property(se => se.LocationAddress).HasMaxLength(300);
            e.Property(se => se.LocationLat).HasPrecision(9, 6);
            e.Property(se => se.LocationLng).HasPrecision(9, 6);
            e.Property(se => se.AvgRating).HasPrecision(3, 2);
            e.Property(se => se.Status).HasConversion<string>();
            e.Property(se => se.MinSkillLevel).HasConversion<string>();
            e.HasOne(se => se.Organizer).WithMany(u => u.OrganizedEvents).HasForeignKey(se => se.OrganizerId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(se => se.Sport).WithMany(s => s.Events).HasForeignKey(se => se.SportId).OnDelete(DeleteBehavior.Restrict);
        });

        // EventApplication
        modelBuilder.Entity<EventApplication>(e =>
        {
            e.HasIndex(ea => new { ea.EventId, ea.UserId }).IsUnique();
            e.Property(ea => ea.Status).HasConversion<string>();
            e.HasOne(ea => ea.Event).WithMany(se => se.Applications).HasForeignKey(ea => ea.EventId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(ea => ea.User).WithMany(u => u.Applications).HasForeignKey(ea => ea.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // EventComment
        modelBuilder.Entity<EventComment>(e =>
        {
            e.HasOne(ec => ec.Event).WithMany(se => se.Comments).HasForeignKey(ec => ec.EventId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(ec => ec.User).WithMany(u => u.Comments).HasForeignKey(ec => ec.UserId).OnDelete(DeleteBehavior.Restrict);
        });

        // EventRating
        modelBuilder.Entity<EventRating>(e =>
        {
            e.HasIndex(er => new { er.EventId, er.ReviewerId }).IsUnique();
            e.HasOne(er => er.Event).WithMany(se => se.Ratings).HasForeignKey(er => er.EventId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(er => er.Reviewer).WithMany().HasForeignKey(er => er.ReviewerId).OnDelete(DeleteBehavior.Restrict);
        });

        // ParticipantRating (peer-to-peer: any participant/organizer can rate any other)
        modelBuilder.Entity<ParticipantRating>(e =>
        {
            e.HasIndex(pr => new { pr.EventId, pr.RaterId, pr.ParticipantId }).IsUnique();
            e.HasOne(pr => pr.Event).WithMany(se => se.ParticipantRatings).HasForeignKey(pr => pr.EventId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(pr => pr.Rater).WithMany().HasForeignKey(pr => pr.RaterId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(pr => pr.Participant).WithMany().HasForeignKey(pr => pr.ParticipantId).OnDelete(DeleteBehavior.Restrict);
        });

        // Notification
        modelBuilder.Entity<Notification>(e =>
        {
            e.Property(n => n.Title).HasMaxLength(200);
            e.Property(n => n.Type).HasConversion<string>();
            e.HasOne(n => n.User).WithMany(u => u.Notifications).HasForeignKey(n => n.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(n => n.ReferenceEvent).WithMany().HasForeignKey(n => n.ReferenceEventId).OnDelete(DeleteBehavior.SetNull);
        });

        // NotificationPreference
        modelBuilder.Entity<NotificationPreference>(e =>
        {
            e.HasIndex(np => np.UserId).IsUnique();
            e.HasOne(np => np.User).WithOne(u => u.NotificationPreference).HasForeignKey<NotificationPreference>(np => np.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // Seed default sports
        modelBuilder.Entity<Sport>().HasData(
            new Sport { Id = 1, Name = "Фудбал", Icon = "sports_soccer", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Sport { Id = 2, Name = "Кошарка", Icon = "sports_basketball", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Sport { Id = 3, Name = "Одбојка", Icon = "sports_volleyball", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Sport { Id = 4, Name = "Тенис", Icon = "sports_tennis", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Sport { Id = 5, Name = "Пинг-понг", Icon = "sports_tennis", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Sport { Id = 6, Name = "Ракомет", Icon = "sports_handball", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Sport { Id = 7, Name = "Пливање", Icon = "pool", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Sport { Id = 8, Name = "Трчање", Icon = "directions_run", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Sport { Id = 9, Name = "Велосипедизам", Icon = "directions_bike", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Sport { Id = 10, Name = "Бадминтон", Icon = "sports_tennis", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        // Seed admin user (password: Admin123!)
        // Using pre-computed hash to avoid EF Core seed data instability with BCrypt
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                FirstName = "Admin",
                LastName = "Admin",
                Email = "admin@sportactivityorganizer.com",
                PasswordHash = "$2a$11$.mS05ZftnzkvItgO/3VirO2NqUC1ibyStNaYxo73iDTRvMYWynq8.",
                Role = UserRole.Admin,
                IsActive = true,
                EmailConfirmed = true,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseAuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }
        return await base.SaveChangesAsync(cancellationToken);
    }
}
