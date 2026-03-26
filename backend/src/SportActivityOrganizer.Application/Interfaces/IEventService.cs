using SportActivityOrganizer.Application.DTOs.Events;

namespace SportActivityOrganizer.Application.Interfaces;

public interface IEventService
{
    Task<SportEventDto> CreateAsync(int organizerId, CreateEventRequest request);
    Task<SportEventDto> GetByIdAsync(int eventId);
    Task<SportEventDto> UpdateAsync(int organizerId, int eventId, UpdateEventRequest request);
    Task CancelAsync(int organizerId, int eventId);
    Task<EventSearchResponse> SearchAsync(EventSearchRequest request);
    Task<List<SportEventDto>> GetMyEventsAsync(int userId, string? statusFilter, string? type);
    Task<SportEventDto> ToggleLastMinuteAsync(int organizerId, int eventId);
    Task<List<SportEventDto>> GetLastMinuteEventsAsync();
}
