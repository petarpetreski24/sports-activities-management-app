using SportActivityOrganizer.Application.DTOs.Users;

namespace SportActivityOrganizer.Application.DTOs.Auth;

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    UserDto User);
