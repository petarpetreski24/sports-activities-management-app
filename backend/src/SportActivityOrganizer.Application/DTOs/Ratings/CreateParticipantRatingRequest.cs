namespace SportActivityOrganizer.Application.DTOs.Ratings;

public record CreateParticipantRatingRequest(
    int ParticipantId,
    int Rating,
    string? Comment);
