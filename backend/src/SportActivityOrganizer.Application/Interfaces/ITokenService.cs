using SportActivityOrganizer.Domain.Entities;

namespace SportActivityOrganizer.Application.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    int? ValidateAccessToken(string token);
}
