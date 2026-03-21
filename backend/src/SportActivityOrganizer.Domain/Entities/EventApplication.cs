using SportActivityOrganizer.Domain.Common;
using SportActivityOrganizer.Domain.Enums;

namespace SportActivityOrganizer.Domain.Entities;

public class EventApplication : BaseAuditableEntity
{
    public int EventId { get; set; }
    public int UserId { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }

    // Navigation properties
    public SportEvent Event { get; set; } = null!;
    public User User { get; set; } = null!;
}
