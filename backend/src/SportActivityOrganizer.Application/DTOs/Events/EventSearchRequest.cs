namespace SportActivityOrganizer.Application.DTOs.Events;

public record EventSearchRequest(
    string? Keyword,
    List<int>? SportIds,
    DateTime? DateFrom,
    DateTime? DateTo,
    double? Lat,
    double? Lng,
    double? RadiusKm,
    bool? AvailableOnly,
    string? MinSkillLevel,
    List<string>? Statuses,
    string? SortBy,
    int Page = 1,
    int PageSize = 20);
