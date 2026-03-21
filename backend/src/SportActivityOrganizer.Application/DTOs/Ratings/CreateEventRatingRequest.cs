namespace SportActivityOrganizer.Application.DTOs.Ratings;

public record CreateEventRatingRequest(
    int Rating,
    string? Comment);
