using AutoMapper;
using SportActivityOrganizer.Application.DTOs.Events;
using SportActivityOrganizer.Domain.Entities;
using SportActivityOrganizer.Domain.Enums;

namespace SportActivityOrganizer.Application.Mapping;

public class EventMappingProfile : Profile
{
    public EventMappingProfile()
    {
        CreateMap<SportEvent, SportEventDto>()
            .ForCtorParam("OrganizerName",
                opt => opt.MapFrom(s => s.Organizer != null ? $"{s.Organizer.FirstName} {s.Organizer.LastName}" : ""))
            .ForCtorParam("OrganizerPhotoUrl",
                opt => opt.MapFrom(s => s.Organizer != null ? s.Organizer.ProfilePhotoUrl : null))
            .ForCtorParam("OrganizerRating",
                opt => opt.MapFrom(s => s.Organizer != null && s.Organizer.AvgRatingAsOrganizer.HasValue
                    ? (double)s.Organizer.AvgRatingAsOrganizer.Value
                    : (double?)null))
            .ForCtorParam("SportName",
                opt => opt.MapFrom(s => s.Sport != null ? s.Sport.Name : ""))
            .ForCtorParam("SportIcon",
                opt => opt.MapFrom(s => s.Sport != null ? s.Sport.Icon : null))
            .ForCtorParam("LocationLat",
                opt => opt.MapFrom(s => (double)s.LocationLat))
            .ForCtorParam("LocationLng",
                opt => opt.MapFrom(s => (double)s.LocationLng))
            .ForCtorParam("CurrentParticipants",
                opt => opt.MapFrom(s => s.Applications != null
                    ? s.Applications.Count(a => a.Status == ApplicationStatus.Approved)
                    : 0))
            .ForCtorParam("MinSkillLevel",
                opt => opt.MapFrom(s => s.MinSkillLevel.HasValue ? s.MinSkillLevel.Value.ToString() : null))
            .ForCtorParam("Status",
                opt => opt.MapFrom(s => s.Status.ToString()))
            .ForCtorParam("AvgRating",
                opt => opt.MapFrom(s => s.AvgRating.HasValue ? (double)s.AvgRating.Value : (double?)null))
            .ForCtorParam("CreatedAt",
                opt => opt.MapFrom(s => s.CreatedAt));

        CreateMap<EventApplication, EventApplicationDto>()
            .ForCtorParam("UserName",
                opt => opt.MapFrom(s => s.User != null ? $"{s.User.FirstName} {s.User.LastName}" : ""))
            .ForCtorParam("UserPhotoUrl",
                opt => opt.MapFrom(s => s.User != null ? s.User.ProfilePhotoUrl : null))
            .ForCtorParam("UserAvgRating",
                opt => opt.MapFrom(s => s.User != null && s.User.AvgRatingAsParticipant.HasValue
                    ? (double)s.User.AvgRatingAsParticipant.Value
                    : (double?)null))
            .ForCtorParam("UserSkillLevel",
                opt => opt.MapFrom(s => (string?)null))
            .ForCtorParam("Status",
                opt => opt.MapFrom(s => s.Status.ToString()));
    }
}
