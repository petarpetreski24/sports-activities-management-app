namespace SportActivityOrganizer.Application.DTOs.Ratings;

public record ParticipantRatingDto(
    int Id,
    int EventId,
    int RaterId,
    string RaterName,
    int ParticipantId,
    string ParticipantName,
    int Rating,
    string? Comment,
    DateTime CreatedAt);
