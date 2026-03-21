using SportActivityOrganizer.Application.DTOs.Events;

namespace SportActivityOrganizer.Application.Interfaces;

public interface IEventApplicationService
{
    Task<EventApplicationDto> ApplyAsync(int userId, int eventId);
    Task<EventApplicationDto> ApproveAsync(int organizerId, int applicationId);
    Task<EventApplicationDto> RejectAsync(int organizerId, int applicationId);
    Task CancelAsync(int userId, int applicationId);
    Task<List<EventApplicationDto>> GetEventApplicationsAsync(int organizerId, int eventId);
    Task<EventApplicationDto?> GetMyApplicationAsync(int userId, int eventId);
    Task RemoveParticipantAsync(int organizerId, int eventId, int userId, string? reason = null);
}
