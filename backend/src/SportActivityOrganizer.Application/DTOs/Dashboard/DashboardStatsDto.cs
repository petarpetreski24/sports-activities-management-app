namespace SportActivityOrganizer.Application.DTOs.Dashboard;

public record DashboardStatsDto(
    int TotalEventsParticipated,
    int TotalEventsOrganized,
    double? AvgRating);
