namespace SportActivityOrganizer.Application.DTOs.Admin;

public record AdminStatsDto(
    int TotalUsers,
    int TotalEvents,
    int ActiveEvents,
    int TotalSports,
    int TotalComments,
    int TotalRatings,
    int NewUsersThisMonth,
    int NewEventsThisMonth,
    List<TopSportDto> TopSports);

public record TopSportDto(
    string SportName,
    int Count);
