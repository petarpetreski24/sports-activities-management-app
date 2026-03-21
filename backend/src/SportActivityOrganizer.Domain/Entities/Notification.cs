using SportActivityOrganizer.Domain.Common;
using SportActivityOrganizer.Domain.Enums;

namespace SportActivityOrganizer.Domain.Entities;

public class Notification : BaseEntity
{
    public int UserId { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int? ReferenceEventId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public SportEvent? ReferenceEvent { get; set; }
}
