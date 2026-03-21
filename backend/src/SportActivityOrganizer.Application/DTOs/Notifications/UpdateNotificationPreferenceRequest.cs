namespace SportActivityOrganizer.Application.DTOs.Notifications;

public record UpdateNotificationPreferenceRequest(
    bool EmailOnApplication,
    bool EmailOnApproval,
    bool EmailOnEventUpdate,
    bool EmailOnEventReminder,
    bool EmailOnNewComment);
