using SportActivityOrganizer.Domain.Common;

namespace SportActivityOrganizer.Domain.Entities;

public class Sport : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<UserFavoriteSport> FavoredByUsers { get; set; } = new List<UserFavoriteSport>();
    public ICollection<SportEvent> Events { get; set; } = new List<SportEvent>();
}
