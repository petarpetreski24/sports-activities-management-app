namespace SportActivityOrganizer.Application.DTOs.Sports;

public record UpdateSportRequest(
    string Name,
    string? Icon,
    bool IsActive);
