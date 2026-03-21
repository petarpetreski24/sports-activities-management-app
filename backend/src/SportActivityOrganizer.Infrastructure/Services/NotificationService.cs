using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SportActivityOrganizer.Application.DTOs.Notifications;
using SportActivityOrganizer.Application.Interfaces;
using SportActivityOrganizer.Application.Interfaces.Persistence;
using SportActivityOrganizer.Domain.Entities;
using SportActivityOrganizer.Domain.Enums;

namespace SportActivityOrganizer.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IEmailService _emailService;

    public NotificationService(IUnitOfWork unitOfWork, IMapper mapper, IEmailService emailService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _emailService = emailService;
    }

    public async Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, int page, int pageSize)
    {
        var notifications = await _unitOfWork.Notifications.Query()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return _mapper.Map<List<NotificationDto>>(notifications);
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await _unitOfWork.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task MarkAsReadAsync(int userId, int notificationId)
    {
        var notification = await _unitOfWork.Notifications.Query()
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null)
            throw new KeyNotFoundException("Notification not found.");

        notification.IsRead = true;
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        var unreadNotifications = await _unitOfWork.Notifications.Query()
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var notification in unreadNotifications)
        {
            notification.IsRead = true;
        }

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeleteAsync(int userId, int notificationId)
    {
        var notification = await _unitOfWork.Notifications.Query()
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null)
            throw new KeyNotFoundException("Notification not found.");

        _unitOfWork.Notifications.Remove(notification);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task CreateNotificationAsync(int userId, NotificationType type, string title, string message, int? referenceEventId)
    {
        var notification = new Notification
        {
            UserId = userId,
            Type = type,
            Title = title,
            Message = message,
            ReferenceEventId = referenceEventId,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Notifications.AddAsync(notification);
        await _unitOfWork.SaveChangesAsync();

        // Check user notification preferences and send email if enabled
        await SendEmailNotificationIfEnabled(userId, type, title, message);
    }

    public async Task<NotificationPreferenceDto> GetPreferencesAsync(int userId)
    {
        var preferences = await _unitOfWork.NotificationPreferences.Query()
            .FirstOrDefaultAsync(np => np.UserId == userId);

        if (preferences == null)
        {
            // Return default preferences
            return new NotificationPreferenceDto(
                EmailOnApplication: true,
                EmailOnApproval: true,
                EmailOnEventUpdate: true,
                EmailOnEventReminder: true,
                EmailOnNewComment: true);
        }

        return _mapper.Map<NotificationPreferenceDto>(preferences);
    }

    public async Task UpdatePreferencesAsync(int userId, UpdateNotificationPreferenceRequest request)
    {
        var preferences = await _unitOfWork.NotificationPreferences.Query()
            .FirstOrDefaultAsync(np => np.UserId == userId);

        if (preferences == null)
        {
            preferences = new NotificationPreference
            {
                UserId = userId,
                EmailOnApplication = request.EmailOnApplication,
                EmailOnApproval = request.EmailOnApproval,
                EmailOnEventUpdate = request.EmailOnEventUpdate,
                EmailOnEventReminder = request.EmailOnEventReminder,
                EmailOnNewComment = request.EmailOnNewComment,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _unitOfWork.NotificationPreferences.AddAsync(preferences);
        }
        else
        {
            preferences.EmailOnApplication = request.EmailOnApplication;
            preferences.EmailOnApproval = request.EmailOnApproval;
            preferences.EmailOnEventUpdate = request.EmailOnEventUpdate;
            preferences.EmailOnEventReminder = request.EmailOnEventReminder;
            preferences.EmailOnNewComment = request.EmailOnNewComment;
            preferences.UpdatedAt = DateTime.UtcNow;
        }

        await _unitOfWork.SaveChangesAsync();
    }

    private async Task SendEmailNotificationIfEnabled(int userId, NotificationType type, string title, string message)
    {
        var preferences = await _unitOfWork.NotificationPreferences.Query()
            .FirstOrDefaultAsync(np => np.UserId == userId);

        var shouldSendEmail = preferences == null || type switch
        {
            NotificationType.ApplicationReceived => preferences.EmailOnApplication,
            NotificationType.ApplicationApproved => preferences.EmailOnApproval,
            NotificationType.ApplicationRejected => preferences.EmailOnApproval,
            NotificationType.EventUpdated => preferences.EmailOnEventUpdate,
            NotificationType.EventCancelled => preferences.EmailOnEventUpdate,
            NotificationType.EventReminder => preferences.EmailOnEventReminder,
            NotificationType.NewComment => preferences.EmailOnNewComment,
            _ => false
        };

        if (shouldSendEmail)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user != null)
            {
                try
                {
                    await _emailService.SendNotificationEmailAsync(user.Email, title, message);
                }
                catch
                {
                    // Don't fail the notification creation if email sending fails
                }
            }
        }
    }
}
