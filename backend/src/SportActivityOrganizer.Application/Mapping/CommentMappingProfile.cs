using AutoMapper;
using SportActivityOrganizer.Application.DTOs.Comments;
using SportActivityOrganizer.Domain.Entities;

namespace SportActivityOrganizer.Application.Mapping;

public class CommentMappingProfile : Profile
{
    public CommentMappingProfile()
    {
        CreateMap<EventComment, EventCommentDto>()
            .ForCtorParam("UserName",
                opt => opt.MapFrom(s => s.User != null ? $"{s.User.FirstName} {s.User.LastName}" : ""))
            .ForCtorParam("UserPhotoUrl",
                opt => opt.MapFrom(s => s.User != null ? s.User.ProfilePhotoUrl : null));
    }
}
