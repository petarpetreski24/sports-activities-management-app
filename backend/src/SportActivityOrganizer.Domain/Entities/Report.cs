using SportActivityOrganizer.Domain.Common;
using SportActivityOrganizer.Domain.Enums;

namespace SportActivityOrganizer.Domain.Entities;

public class Report : BaseEntity
{
    public int ReporterId { get; set; }
    public int? ReportedUserId { get; set; }
    public int? ReportedEventId { get; set; }
    public int? ReportedCommentId { get; set; }
    public ReportReason Reason { get; set; }
    public string? Description { get; set; }
    public ReportStatus Status { get; set; } = ReportStatus.Pending;
    public string? AdminNotes { get; set; }
    public int? ResolvedByUserId { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User Reporter { get; set; } = null!;
    public User? ReportedUser { get; set; }
    public SportEvent? ReportedEvent { get; set; }
    public EventComment? ReportedComment { get; set; }
    public User? ResolvedByUser { get; set; }
}
