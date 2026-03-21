using SportActivityOrganizer.Domain.Common;

namespace SportActivityOrganizer.Domain.Entities;

public class EventRating : BaseEntity
{
    public int EventId { get; set; }
    public int ReviewerId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public SportEvent Event { get; set; } = null!;
    public User Reviewer { get; set; } = null!;
}
