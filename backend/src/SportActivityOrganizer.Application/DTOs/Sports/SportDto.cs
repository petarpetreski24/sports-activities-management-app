namespace SportActivityOrganizer.Application.DTOs.Sports;

public record SportDto(
    int Id,
    string Name,
    string? Icon,
    bool IsActive);
