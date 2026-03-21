using SportActivityOrganizer.Domain.Common;

namespace SportActivityOrganizer.Domain.Entities;

public class ParticipantRating : BaseEntity
{
    public int EventId { get; set; }
    public int RaterId { get; set; }
    public int ParticipantId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public SportEvent Event { get; set; } = null!;
    public User Rater { get; set; } = null!;
    public User Participant { get; set; } = null!;
}
