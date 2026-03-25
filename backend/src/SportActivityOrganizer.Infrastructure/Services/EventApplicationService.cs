using Microsoft.EntityFrameworkCore;
using SportActivityOrganizer.Application.DTOs.Events;
using SportActivityOrganizer.Application.Interfaces;
using SportActivityOrganizer.Application.Interfaces.Persistence;
using SportActivityOrganizer.Domain.Entities;
using SportActivityOrganizer.Domain.Enums;

namespace SportActivityOrganizer.Infrastructure.Services;

public class EventApplicationService : IEventApplicationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;

    public EventApplicationService(IUnitOfWork unitOfWork, INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
    }

    public async Task<EventApplicationDto> ApplyAsync(int userId, int eventId)
    {
        var sportEvent = await _unitOfWork.SportEvents.Query()
            .Include(e => e.Applications)
            .FirstOrDefaultAsync(e => e.Id == eventId);

        if (sportEvent == null)
            throw new KeyNotFoundException("Event not found.");

        // Can't apply to own event
        if (sportEvent.OrganizerId == userId)
            throw new InvalidOperationException("You cannot apply to your own event.");

        // Check for existing application (any status)
        var existingApplication = await _unitOfWork.EventApplications.Query()
            .FirstOrDefaultAsync(ea =>
                ea.EventId == eventId &&
                ea.UserId == userId);

        if (existingApplication != null)
        {
            // Already has active application
            if (existingApplication.Status == ApplicationStatus.Pending || existingApplication.Status == ApplicationStatus.Approved)
                throw new InvalidOperationException("You already have an active application for this event.");

            // Reuse cancelled/rejected application — reset to Pending
            if (existingApplication.Status == ApplicationStatus.Cancelled || existingApplication.Status == ApplicationStatus.Rejected)
            {
                if (sportEvent.Status != EventStatus.Open)
                    throw new InvalidOperationException($"Cannot apply to an event with status '{sportEvent.Status}'.");

                existingApplication.Status = ApplicationStatus.Pending;
                existingApplication.AppliedAt = DateTime.UtcNow;
                existingApplication.ResolvedAt = null;
                existingApplication.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.SaveChangesAsync();

                await _notificationService.CreateNotificationAsync(
                    sportEvent.OrganizerId,
                    NotificationType.ApplicationReceived,
                    "Нова апликација",
                    $"Добивте нова апликација за настанот \"{sportEvent.Title}\".",
                    eventId);

                return await MapToDto(existingApplication);
            }
        }

        // Can't apply to Full/Completed/Cancelled events
        if (sportEvent.Status != EventStatus.Open)
            throw new InvalidOperationException($"Cannot apply to an event with status '{sportEvent.Status}'.");

        var application = new EventApplication
        {
            EventId = eventId,
            UserId = userId,
            Status = ApplicationStatus.Pending,
            AppliedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.EventApplications.AddAsync(application);
        await _unitOfWork.SaveChangesAsync();

        // Notify the organizer
        await _notificationService.CreateNotificationAsync(
            sportEvent.OrganizerId,
            NotificationType.ApplicationReceived,
            "Нова апликација",
            $"Добивте нова апликација за настанот \"{sportEvent.Title}\".",
            eventId);

        return await MapToDto(application);
    }

    public async Task<EventApplicationDto> ApproveAsync(int organizerId, int applicationId)
    {
        var application = await _unitOfWork.EventApplications.Query()
            .Include(ea => ea.Event)
                .ThenInclude(e => e.Applications)
            .Include(ea => ea.User)
            .FirstOrDefaultAsync(ea => ea.Id == applicationId);

        if (application == null)
            throw new KeyNotFoundException("Application not found.");

        if (application.Event.OrganizerId != organizerId)
            throw new UnauthorizedAccessException("Only the organizer can approve applications.");

        if (application.Status != ApplicationStatus.Pending)
            throw new InvalidOperationException("Only pending applications can be approved.");

        application.Status = ApplicationStatus.Approved;
        application.ResolvedAt = DateTime.UtcNow;
        application.UpdatedAt = DateTime.UtcNow;

        // Check if max participants reached
        var approvedCount = application.Event.Applications
            .Count(a => a.Status == ApplicationStatus.Approved);

        if (approvedCount >= application.Event.MaxParticipants)
        {
            application.Event.Status = EventStatus.Full;
            application.Event.UpdatedAt = DateTime.UtcNow;
        }

        await _unitOfWork.SaveChangesAsync();

        // Notify the applicant
        await _notificationService.CreateNotificationAsync(
            application.UserId,
            NotificationType.ApplicationApproved,
            "Апликација одобрена",
            $"Вашата апликација за \"{application.Event.Title}\" е одобрена!",
            application.EventId);

        return await MapToDto(application);
    }

    public async Task<EventApplicationDto> RejectAsync(int organizerId, int applicationId)
    {
        var application = await _unitOfWork.EventApplications.Query()
            .Include(ea => ea.Event)
            .Include(ea => ea.User)
            .FirstOrDefaultAsync(ea => ea.Id == applicationId);

        if (application == null)
            throw new KeyNotFoundException("Application not found.");

        if (application.Event.OrganizerId != organizerId)
            throw new UnauthorizedAccessException("Only the organizer can reject applications.");

        if (application.Status != ApplicationStatus.Pending)
            throw new InvalidOperationException("Only pending applications can be rejected.");

        application.Status = ApplicationStatus.Rejected;
        application.ResolvedAt = DateTime.UtcNow;
        application.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();

        // Notify the applicant
        await _notificationService.CreateNotificationAsync(
            application.UserId,
            NotificationType.ApplicationRejected,
            "Апликација одбиена",
            $"Вашата апликација за \"{application.Event.Title}\" е одбиена.",
            application.EventId);

        return await MapToDto(application);
    }

    public async Task CancelAsync(int userId, int applicationId)
    {
        var application = await _unitOfWork.EventApplications.Query()
            .Include(ea => ea.Event)
                .ThenInclude(e => e.Applications)
            .FirstOrDefaultAsync(ea => ea.Id == applicationId);

        if (application == null)
            throw new KeyNotFoundException("Application not found.");

        if (application.UserId != userId)
            throw new UnauthorizedAccessException("You can only cancel your own applications.");

        if (application.Status != ApplicationStatus.Pending && application.Status != ApplicationStatus.Approved)
            throw new InvalidOperationException("Only pending or approved applications can be cancelled.");

        // Check 2-hour cancellation window for approved applications
        if (application.Status == ApplicationStatus.Approved)
        {
            var hoursUntilEvent = (application.Event.EventDate - DateTime.UtcNow).TotalHours;
            if (hoursUntilEvent < 2)
                throw new InvalidOperationException("Cannot cancel less than 2 hours before the event starts.");
        }

        var wasApproved = application.Status == ApplicationStatus.Approved;
        var eventWasFull = application.Event.Status == EventStatus.Full;

        application.Status = ApplicationStatus.Cancelled;
        application.ResolvedAt = DateTime.UtcNow;
        application.UpdatedAt = DateTime.UtcNow;

        // If participant was approved and event was Full, change back to Open
        if (wasApproved && eventWasFull)
        {
            application.Event.Status = EventStatus.Open;
            application.Event.UpdatedAt = DateTime.UtcNow;
        }

        await _unitOfWork.SaveChangesAsync();

        // Notify the organizer that a participant cancelled
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        var userName = user != null ? $"{user.FirstName} {user.LastName}" : "Учесник";
        await _notificationService.CreateNotificationAsync(
            application.Event.OrganizerId,
            NotificationType.ApplicationReceived,
            "Откажана апликација",
            $"{userName} ја откажа апликацијата за настанот \"{application.Event.Title}\".",
            application.EventId);
    }

    public async Task<List<EventApplicationDto>> GetEventApplicationsAsync(int organizerId, int eventId)
    {
        var sportEvent = await _unitOfWork.SportEvents.Query()
            .FirstOrDefaultAsync(e => e.Id == eventId);

        if (sportEvent == null)
            throw new KeyNotFoundException("Event not found.");

        if (sportEvent.OrganizerId != organizerId)
            throw new UnauthorizedAccessException("Only the organizer can view event applications.");

        var applications = await _unitOfWork.EventApplications.Query()
            .Include(ea => ea.User)
                .ThenInclude(u => u.FavoriteSports)
                    .ThenInclude(fs => fs.Sport)
            .Where(ea => ea.EventId == eventId)
            .OrderByDescending(ea => ea.AppliedAt)
            .ToListAsync();

        var dtos = new List<EventApplicationDto>();
        foreach (var app in applications)
        {
            dtos.Add(await MapToDto(app));
        }
        return dtos;
    }

    public async Task<EventApplicationDto?> GetMyApplicationAsync(int userId, int eventId)
    {
        var application = await _unitOfWork.EventApplications.Query()
            .Include(ea => ea.User)
                .ThenInclude(u => u.FavoriteSports)
                    .ThenInclude(fs => fs.Sport)
            .Include(ea => ea.Event)
            .Where(ea => ea.EventId == eventId && ea.UserId == userId)
            .OrderByDescending(ea => ea.AppliedAt)
            .FirstOrDefaultAsync();

        return application == null ? null : await MapToDto(application);
    }

    public async Task RemoveParticipantAsync(int organizerId, int eventId, int userId, string? reason = null)
    {
        var sportEvent = await _unitOfWork.SportEvents.Query()
            .Include(e => e.Applications)
            .FirstOrDefaultAsync(e => e.Id == eventId);

        if (sportEvent == null)
            throw new KeyNotFoundException("Event not found.");

        if (sportEvent.OrganizerId != organizerId)
            throw new UnauthorizedAccessException("Only the organizer can remove participants.");

        var application = sportEvent.Applications
            .FirstOrDefault(a => a.UserId == userId && a.Status == ApplicationStatus.Approved);

        if (application == null)
            throw new KeyNotFoundException("Participant not found in this event.");

        application.Status = ApplicationStatus.Cancelled;
        application.ResolvedAt = DateTime.UtcNow;
        application.UpdatedAt = DateTime.UtcNow;

        // If event was Full, change back to Open
        if (sportEvent.Status == EventStatus.Full)
        {
            sportEvent.Status = EventStatus.Open;
            sportEvent.UpdatedAt = DateTime.UtcNow;
        }

        await _unitOfWork.SaveChangesAsync();

        // Notify the removed participant
        var reasonText = !string.IsNullOrEmpty(reason) ? $" Причина: {reason}" : "";
        await _notificationService.CreateNotificationAsync(
            userId,
            NotificationType.ApplicationRejected,
            "Отстранети сте од настан",
            $"Организаторот ве отстрани од настанот \"{sportEvent.Title}\".{reasonText}",
            eventId);
    }

    private async Task<EventApplicationDto> MapToDto(EventApplication application)
    {
        var user = application.User ?? await _unitOfWork.Users.Query()
            .Include(u => u.FavoriteSports)
                .ThenInclude(fs => fs.Sport)
            .FirstAsync(u => u.Id == application.UserId);

        // Get the user's skill level for the event's sport
        string? userSkillLevel = null;
        if (application.Event != null)
        {
            var favSport = user.FavoriteSports?
                .FirstOrDefault(fs => fs.SportId == application.Event.SportId);
            userSkillLevel = favSport?.SkillLevel.ToString();
        }

        return new EventApplicationDto(
            Id: application.Id,
            EventId: application.EventId,
            UserId: application.UserId,
            UserName: $"{user.FirstName} {user.LastName}",
            UserPhotoUrl: user.ProfilePhotoUrl,
            UserAvgRating: user.AvgRatingAsParticipant.HasValue ? (double)user.AvgRatingAsParticipant.Value : null,
            UserSkillLevel: userSkillLevel,
            Status: application.Status.ToString(),
            AppliedAt: application.AppliedAt,
            ResolvedAt: application.ResolvedAt);
    }
}
