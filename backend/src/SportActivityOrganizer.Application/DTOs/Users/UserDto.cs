namespace SportActivityOrganizer.Application.DTOs.Users;

public record UserDto(
    int Id,
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string? Bio,
    string? ProfilePhotoUrl,
    string? LocationCity,
    double? LocationLat,
    double? LocationLng,
    string Role,
    bool IsActive,
    bool EmailConfirmed,
    double? AvgRatingAsOrganizer,
    double? AvgRatingAsParticipant,
    List<UserFavoriteSportDto> FavoriteSports,
    DateTime CreatedAt);
