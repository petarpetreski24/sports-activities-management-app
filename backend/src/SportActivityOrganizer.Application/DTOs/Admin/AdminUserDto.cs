using SportActivityOrganizer.Application.DTOs.Users;

namespace SportActivityOrganizer.Application.DTOs.Admin;

public record AdminUserDto(
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
    DateTime CreatedAt,
    int TotalEventsParticipated,
    int TotalEventsOrganized);
