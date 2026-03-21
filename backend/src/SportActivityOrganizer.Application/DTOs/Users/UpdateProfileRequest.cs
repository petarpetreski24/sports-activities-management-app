namespace SportActivityOrganizer.Application.DTOs.Users;

public record UpdateProfileRequest(
    string? FirstName,
    string? LastName,
    string? Phone,
    string? Bio,
    string? LocationCity,
    double? LocationLat,
    double? LocationLng);
