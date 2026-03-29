namespace SportActivityOrganizer.Application.DTOs.Admin;

public record AdminCreateEventRequest(
    int OrganizerId,
    int SportId,
    string Title,
    string? Description,
    DateTime EventDate,
    int DurationMinutes,
    string LocationAddress,
    double LocationLat,
    double LocationLng,
    int MaxParticipants,
    string? MinSkillLevel,
    List<int>? ConfirmedParticipantIds);
