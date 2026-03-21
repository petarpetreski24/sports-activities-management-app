using SportActivityOrganizer.Application.DTOs.Dashboard;

namespace SportActivityOrganizer.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardAsync(int userId);
}
