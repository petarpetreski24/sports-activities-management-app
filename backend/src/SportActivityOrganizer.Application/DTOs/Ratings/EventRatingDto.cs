namespace SportActivityOrganizer.Application.DTOs.Ratings;

public record EventRatingDto(
    int Id,
    int EventId,
    int ReviewerId,
    string ReviewerName,
    string? ReviewerPhotoUrl,
    int Rating,
    string? Comment,
    DateTime CreatedAt);
