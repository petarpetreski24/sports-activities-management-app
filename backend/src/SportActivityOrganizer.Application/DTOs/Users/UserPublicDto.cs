namespace SportActivityOrganizer.Application.DTOs.Users;

public record UserPublicDto(
    int Id,
    string FirstName,
    string LastName,
    string? Bio,
    string? ProfilePhotoUrl,
    string? LocationCity,
    double? AvgRatingAsOrganizer,
    double? AvgRatingAsParticipant,
    List<UserFavoriteSportDto> FavoriteSports,
    int TotalEventsParticipated,
    int TotalEventsOrganized);
