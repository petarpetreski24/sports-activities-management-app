using AutoMapper;
using SportActivityOrganizer.Application.DTOs.Ratings;
using SportActivityOrganizer.Domain.Entities;

namespace SportActivityOrganizer.Application.Mapping;

public class RatingMappingProfile : Profile
{
    public RatingMappingProfile()
    {
        CreateMap<EventRating, EventRatingDto>()
            .ForCtorParam("ReviewerName",
                opt => opt.MapFrom(s => s.Reviewer != null ? $"{s.Reviewer.FirstName} {s.Reviewer.LastName}" : ""))
            .ForCtorParam("ReviewerPhotoUrl",
                opt => opt.MapFrom(s => s.Reviewer != null ? s.Reviewer.ProfilePhotoUrl : null));

        CreateMap<ParticipantRating, ParticipantRatingDto>()
            .ForCtorParam("RaterName",
                opt => opt.MapFrom(s => s.Rater != null ? $"{s.Rater.FirstName} {s.Rater.LastName}" : ""))
            .ForCtorParam("ParticipantName",
                opt => opt.MapFrom(s => s.Participant != null ? $"{s.Participant.FirstName} {s.Participant.LastName}" : ""));
    }
}
