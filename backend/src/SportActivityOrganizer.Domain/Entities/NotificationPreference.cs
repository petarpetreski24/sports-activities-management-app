using SportActivityOrganizer.Domain.Common;

namespace SportActivityOrganizer.Domain.Entities;

public class NotificationPreference : BaseAuditableEntity
{
    public int UserId { get; set; }
    public bool EmailOnApplication { get; set; } = true;
    public bool EmailOnApproval { get; set; } = true;
    public bool EmailOnEventUpdate { get; set; } = true;
    public bool EmailOnEventReminder { get; set; } = true;
    public bool EmailOnNewComment { get; set; } = true;

    // Navigation properties
    public User User { get; set; } = null!;
}
