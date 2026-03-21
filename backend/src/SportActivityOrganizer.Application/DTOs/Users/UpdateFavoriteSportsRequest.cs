namespace SportActivityOrganizer.Application.DTOs.Users;

public record UpdateFavoriteSportsRequest(
    List<FavoriteSportItem> FavoriteSports);

public record FavoriteSportItem(
    int SportId,
    string SkillLevel);
