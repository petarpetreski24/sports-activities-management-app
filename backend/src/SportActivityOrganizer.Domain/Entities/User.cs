using SportActivityOrganizer.Domain.Common;
using SportActivityOrganizer.Domain.Enums;

namespace SportActivityOrganizer.Domain.Entities;

public class User : BaseAuditableEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Bio { get; set; }
    public string? ProfilePhotoUrl { get; set; }
    public string? LocationCity { get; set; }
    public decimal? LocationLat { get; set; }
    public decimal? LocationLng { get; set; }
    public UserRole Role { get; set; } = UserRole.User;
    public bool IsActive { get; set; } = true;
    public bool EmailConfirmed { get; set; }
    public string? EmailConfirmationToken { get; set; }
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiry { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }
    public decimal? AvgRatingAsOrganizer { get; set; }
    public decimal? AvgRatingAsParticipant { get; set; }

    // Navigation properties
    public ICollection<UserFavoriteSport> FavoriteSports { get; set; } = new List<UserFavoriteSport>();
    public ICollection<SportEvent> OrganizedEvents { get; set; } = new List<SportEvent>();
    public ICollection<EventApplication> Applications { get; set; } = new List<EventApplication>();
    public ICollection<EventComment> Comments { get; set; } = new List<EventComment>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public NotificationPreference? NotificationPreference { get; set; }
}
