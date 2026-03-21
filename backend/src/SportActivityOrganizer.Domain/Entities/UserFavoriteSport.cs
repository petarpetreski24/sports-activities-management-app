using SportActivityOrganizer.Domain.Common;
using SportActivityOrganizer.Domain.Enums;

namespace SportActivityOrganizer.Domain.Entities;

public class UserFavoriteSport : BaseEntity
{
    public int UserId { get; set; }
    public int SportId { get; set; }
    public SkillLevel SkillLevel { get; set; } = SkillLevel.Beginner;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public Sport Sport { get; set; } = null!;
}
