namespace SportActivityOrganizer.Application.DTOs.Ratings;

public record RatableParticipantDto(
    int UserId,
    string UserName,
    string? UserPhotoUrl,
    double? AvgRating);
