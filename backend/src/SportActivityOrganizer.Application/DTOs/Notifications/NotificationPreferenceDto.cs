namespace SportActivityOrganizer.Application.DTOs.Notifications;

public record NotificationPreferenceDto(
    bool EmailOnApplication,
    bool EmailOnApproval,
    bool EmailOnEventUpdate,
    bool EmailOnEventReminder,
    bool EmailOnNewComment);
