namespace SportActivityOrganizer.Application.DTOs.Sports;

public record CreateSportRequest(
    string Name,
    string? Icon);
