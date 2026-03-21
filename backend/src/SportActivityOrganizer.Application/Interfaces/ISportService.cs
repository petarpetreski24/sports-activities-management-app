using SportActivityOrganizer.Application.DTOs.Sports;

namespace SportActivityOrganizer.Application.Interfaces;

public interface ISportService
{
    Task<List<SportDto>> GetAllAsync(bool includeInactive = false);
    Task<SportDto> GetByIdAsync(int id);
    Task<SportDto> CreateAsync(CreateSportRequest request);
    Task<SportDto> UpdateAsync(int id, UpdateSportRequest request);
}
