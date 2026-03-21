namespace SportActivityOrganizer.Application.DTOs.Notifications;

public record NotificationDto(
    int Id,
    string Type,
    string Title,
    string Message,
    int? ReferenceEventId,
    bool IsRead,
    DateTime CreatedAt);
