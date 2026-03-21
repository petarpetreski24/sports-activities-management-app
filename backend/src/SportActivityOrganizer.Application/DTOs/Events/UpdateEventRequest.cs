namespace SportActivityOrganizer.Application.DTOs.Events;

public record UpdateEventRequest(
    int SportId,
    string Title,
    string? Description,
    DateTime EventDate,
    int DurationMinutes,
    string LocationAddress,
    double LocationLat,
    double LocationLng,
    int MaxParticipants,
    string? MinSkillLevel);
