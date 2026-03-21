using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SportActivityOrganizer.Application.DTOs.Dashboard;
using SportActivityOrganizer.Application.DTOs.Events;
using SportActivityOrganizer.Application.DTOs.Notifications;
using SportActivityOrganizer.Application.Interfaces;
using SportActivityOrganizer.Application.Interfaces.Persistence;
using SportActivityOrganizer.Domain.Enums;

namespace SportActivityOrganizer.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DashboardService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<DashboardDto> GetDashboardAsync(int userId)
    {
        var user = await _unitOfWork.Users.Query()
            .Include(u => u.FavoriteSports)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            throw new KeyNotFoundException("User not found.");

        var upcomingEvents = await GetUpcomingEventsAsync(userId);
        var suggestedEvents = await GetSuggestedEventsAsync(userId, user);
        var pendingApplications = await GetPendingApplicationsAsync(userId);
        var stats = await GetStatsAsync(userId, user);
        var recentNotifications = await GetRecentNotificationsAsync(userId);

        return new DashboardDto(
            UpcomingEvents: upcomingEvents,
            SuggestedEvents: suggestedEvents,
            PendingApplications: pendingApplications,
            Stats: stats,
            RecentNotifications: recentNotifications);
    }

    private async Task<List<SportEventDto>> GetUpcomingEventsAsync(int userId)
    {
        // Events where user has an approved application or is the organizer, future date
        var events = await _unitOfWork.SportEvents.Query()
            .Include(e => e.Organizer)
            .Include(e => e.Sport)
            .Include(e => e.Applications)
            .Where(e => e.EventDate > DateTime.UtcNow &&
                        e.Status != EventStatus.Cancelled &&
                        (e.OrganizerId == userId ||
                         e.Applications.Any(a => a.UserId == userId && a.Status == ApplicationStatus.Approved)))
            .OrderBy(e => e.EventDate)
            .Take(10)
            .ToListAsync();

        return _mapper.Map<List<SportEventDto>>(events);
    }

    private async Task<List<SportEventDto>> GetSuggestedEventsAsync(int userId, Domain.Entities.User user)
    {
        var favoriteSportIds = user.FavoriteSports.Select(fs => fs.SportId).ToList();

        var query = _unitOfWork.SportEvents.Query()
            .Include(e => e.Organizer)
            .Include(e => e.Sport)
            .Include(e => e.Applications)
            .Where(e =>
                e.Status == EventStatus.Open &&
                e.EventDate > DateTime.UtcNow &&
                e.OrganizerId != userId &&
                !e.Applications.Any(a => a.UserId == userId &&
                    (a.Status == ApplicationStatus.Pending || a.Status == ApplicationStatus.Approved)));

        // Filter by favorite sports if user has any
        if (favoriteSportIds.Count > 0)
        {
            query = query.Where(e => favoriteSportIds.Contains(e.SportId));
        }

        // If user has location, sort by proximity using bounding box
        if (user.LocationLat.HasValue && user.LocationLng.HasValue)
        {
            var userLat = user.LocationLat.Value;
            var userLng = user.LocationLng.Value;
            var radiusKm = 50m;
            var latDelta = radiusKm / 111m;
            var lngDelta = radiusKm / (111m * (decimal)Math.Cos((double)userLat * Math.PI / 180.0));

            query = query.Where(e =>
                e.LocationLat >= userLat - latDelta && e.LocationLat <= userLat + latDelta &&
                e.LocationLng >= userLng - lngDelta && e.LocationLng <= userLng + lngDelta);
        }

        var events = await query
            .OrderBy(e => e.EventDate)
            .Take(10)
            .ToListAsync();

        return _mapper.Map<List<SportEventDto>>(events);
    }

    private async Task<List<PendingApplicationDto>> GetPendingApplicationsAsync(int userId)
    {
        var applications = await _unitOfWork.EventApplications.Query()
            .Include(ea => ea.Event)
            .Include(ea => ea.User)
            .Where(ea =>
                ea.Event.OrganizerId == userId &&
                ea.Status == ApplicationStatus.Pending)
            .OrderByDescending(ea => ea.AppliedAt)
            .Take(20)
            .ToListAsync();

        return applications.Select(a => new PendingApplicationDto(
            ApplicationId: a.Id,
            EventId: a.EventId,
            EventTitle: a.Event.Title,
            UserId: a.UserId,
            UserName: $"{a.User.FirstName} {a.User.LastName}",
            UserPhotoUrl: a.User.ProfilePhotoUrl,
            UserAvgRating: a.User.AvgRatingAsParticipant.HasValue ? (double)a.User.AvgRatingAsParticipant.Value : null,
            AppliedAt: a.AppliedAt
        )).ToList();
    }

    private async Task<DashboardStatsDto> GetStatsAsync(int userId, Domain.Entities.User user)
    {
        var totalParticipated = await _unitOfWork.EventApplications.CountAsync(ea =>
                ea.UserId == userId &&
                ea.Status == ApplicationStatus.Approved &&
                ea.Event.Status == EventStatus.Completed);

        var totalOrganized = await _unitOfWork.SportEvents.CountAsync(e => e.OrganizerId == userId);

        // Use participant rating if available, otherwise organizer rating
        double? avgRating = user.AvgRatingAsParticipant.HasValue
            ? (double)user.AvgRatingAsParticipant.Value
            : user.AvgRatingAsOrganizer.HasValue
                ? (double)user.AvgRatingAsOrganizer.Value
                : null;

        return new DashboardStatsDto(
            TotalEventsParticipated: totalParticipated,
            TotalEventsOrganized: totalOrganized,
            AvgRating: avgRating);
    }

    private async Task<List<NotificationDto>> GetRecentNotificationsAsync(int userId)
    {
        var notifications = await _unitOfWork.Notifications.Query()
            .Where(n => n.UserId == userId && !n.IsRead)
            .OrderByDescending(n => n.CreatedAt)
            .Take(5)
            .ToListAsync();

        return _mapper.Map<List<NotificationDto>>(notifications);
    }
}
