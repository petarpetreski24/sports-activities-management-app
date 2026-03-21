using AutoMapper;
using SportActivityOrganizer.Application.DTOs.Notifications;
using SportActivityOrganizer.Domain.Entities;

namespace SportActivityOrganizer.Application.Mapping;

public class NotificationMappingProfile : Profile
{
    public NotificationMappingProfile()
    {
        CreateMap<Notification, NotificationDto>()
            .ForCtorParam("Type",
                opt => opt.MapFrom(s => s.Type.ToString()));

        CreateMap<NotificationPreference, NotificationPreferenceDto>();
    }
}
