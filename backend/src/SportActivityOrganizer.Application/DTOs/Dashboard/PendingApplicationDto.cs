namespace SportActivityOrganizer.Application.DTOs.Dashboard;

public record PendingApplicationDto(
    int ApplicationId,
    int EventId,
    string EventTitle,
    int UserId,
    string UserName,
    string? UserPhotoUrl,
    double? UserAvgRating,
    DateTime AppliedAt);
