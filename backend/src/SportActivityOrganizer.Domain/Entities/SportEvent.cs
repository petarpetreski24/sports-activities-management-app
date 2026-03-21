using SportActivityOrganizer.Domain.Common;
using SportActivityOrganizer.Domain.Enums;

namespace SportActivityOrganizer.Domain.Entities;

public class SportEvent : BaseAuditableEntity
{
    public int OrganizerId { get; set; }
    public int SportId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public int DurationMinutes { get; set; }
    public string LocationAddress { get; set; } = string.Empty;
    public decimal LocationLat { get; set; }
    public decimal LocationLng { get; set; }
    public int MaxParticipants { get; set; }
    public SkillLevel? MinSkillLevel { get; set; }
    public EventStatus Status { get; set; } = EventStatus.Open;
    public decimal? AvgRating { get; set; }

    // Navigation properties
    public User Organizer { get; set; } = null!;
    public Sport Sport { get; set; } = null!;
    public ICollection<EventApplication> Applications { get; set; } = new List<EventApplication>();
    public ICollection<EventComment> Comments { get; set; } = new List<EventComment>();
    public ICollection<EventRating> Ratings { get; set; } = new List<EventRating>();
    public ICollection<ParticipantRating> ParticipantRatings { get; set; } = new List<ParticipantRating>();
}
