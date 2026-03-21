using SportActivityOrganizer.Domain.Common;

namespace SportActivityOrganizer.Domain.Entities;

public class EventComment : BaseEntity
{
    public int EventId { get; set; }
    public int UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public SportEvent Event { get; set; } = null!;
    public User User { get; set; } = null!;
}
