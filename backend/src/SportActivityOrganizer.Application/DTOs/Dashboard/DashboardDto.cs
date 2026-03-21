using SportActivityOrganizer.Application.DTOs.Events;
using SportActivityOrganizer.Application.DTOs.Notifications;

namespace SportActivityOrganizer.Application.DTOs.Dashboard;

public record DashboardDto(
    List<SportEventDto> UpcomingEvents,
    List<SportEventDto> SuggestedEvents,
    List<PendingApplicationDto> PendingApplications,
    DashboardStatsDto Stats,
    List<NotificationDto> RecentNotifications);
