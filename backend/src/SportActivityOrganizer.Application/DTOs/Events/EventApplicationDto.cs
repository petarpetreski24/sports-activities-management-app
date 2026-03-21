namespace SportActivityOrganizer.Application.DTOs.Events;

public record EventApplicationDto(
    int Id,
    int EventId,
    int UserId,
    string UserName,
    string? UserPhotoUrl,
    double? UserAvgRating,
    string? UserSkillLevel,
    string Status,
    DateTime AppliedAt,
    DateTime? ResolvedAt);
