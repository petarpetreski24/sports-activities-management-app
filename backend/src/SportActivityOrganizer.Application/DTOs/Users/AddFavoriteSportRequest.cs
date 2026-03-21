namespace SportActivityOrganizer.Application.DTOs.Users;

public record AddFavoriteSportRequest(
    int SportId,
    string SkillLevel);
