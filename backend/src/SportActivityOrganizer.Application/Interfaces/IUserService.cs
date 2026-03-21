using SportActivityOrganizer.Application.DTOs.Users;

namespace SportActivityOrganizer.Application.Interfaces;

public interface IUserService
{
    Task<UserDto> GetProfileAsync(int userId);
    Task<UserPublicDto> GetPublicProfileAsync(int userId);
    Task<UserDto> UpdateProfileAsync(int userId, UpdateProfileRequest request);
    Task ChangePasswordAsync(int userId, ChangePasswordRequest request);
    Task<string> UploadProfilePhotoAsync(int userId, Stream fileStream, string fileName);
    Task<List<UserFavoriteSportDto>> GetFavoriteSportsAsync(int userId);
    Task UpdateFavoriteSportsAsync(int userId, UpdateFavoriteSportsRequest request);
    Task<UserFavoriteSportDto> AddFavoriteSportAsync(int userId, int sportId, string skillLevel);
    Task RemoveFavoriteSportAsync(int userId, int sportId);
}
