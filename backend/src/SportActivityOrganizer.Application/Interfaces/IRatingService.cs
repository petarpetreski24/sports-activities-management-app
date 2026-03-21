using SportActivityOrganizer.Application.DTOs.Ratings;

namespace SportActivityOrganizer.Application.Interfaces;

public interface IRatingService
{
    Task<EventRatingDto> RateEventAsync(int reviewerId, int eventId, CreateEventRatingRequest request);
    Task<List<EventRatingDto>> GetEventRatingsAsync(int eventId);
    Task<ParticipantRatingDto> RateParticipantAsync(int raterId, int eventId, CreateParticipantRatingRequest request);
    Task<List<ParticipantRatingDto>> GetParticipantRatingsAsync(int eventId);
    Task<List<RatableParticipantDto>> GetRatableParticipantsAsync(int userId, int eventId);
}
