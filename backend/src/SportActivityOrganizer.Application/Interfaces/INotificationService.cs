using SportActivityOrganizer.Application.DTOs.Notifications;
using SportActivityOrganizer.Domain.Enums;

namespace SportActivityOrganizer.Application.Interfaces;

public interface INotificationService
{
    Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, int page, int pageSize);
    Task<int> GetUnreadCountAsync(int userId);
    Task MarkAsReadAsync(int userId, int notificationId);
    Task MarkAllAsReadAsync(int userId);
    Task DeleteAsync(int userId, int notificationId);
    Task CreateNotificationAsync(int userId, NotificationType type, string title, string message, int? referenceEventId);
    Task<NotificationPreferenceDto> GetPreferencesAsync(int userId);
    Task UpdatePreferencesAsync(int userId, UpdateNotificationPreferenceRequest request);
}
