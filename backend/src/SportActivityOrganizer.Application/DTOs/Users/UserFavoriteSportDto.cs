namespace SportActivityOrganizer.Application.DTOs.Users;

public record UserFavoriteSportDto(
    int Id,
    int SportId,
    string SportName,
    string? SportIcon,
    string SkillLevel,
    double? AvgRating = null);
