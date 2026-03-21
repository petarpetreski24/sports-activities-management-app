namespace SportActivityOrganizer.Application.DTOs.Events;

public record EventSearchResponse(
    List<SportEventDto> Items,
    int TotalCount,
    int Page,
    int PageSize);
