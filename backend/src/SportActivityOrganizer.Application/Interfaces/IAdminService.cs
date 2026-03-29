using SportActivityOrganizer.Application.DTOs.Admin;
using SportActivityOrganizer.Application.DTOs.Events;

namespace SportActivityOrganizer.Application.Interfaces;

public interface IAdminService
{
    Task<AdminStatsDto> GetStatsAsync();
    Task<(List<AdminUserDto> Items, int TotalCount)> GetUsersAsync(string? search, string? role, int page, int pageSize);
    Task DeactivateUserAsync(int userId);
    Task DeleteUserAsync(int userId);
    Task DeleteEventAsync(int eventId);
    Task DeleteCommentAsync(int commentId);
    Task<SportEventDto> AdminCreateEventAsync(AdminCreateEventRequest request);
}
