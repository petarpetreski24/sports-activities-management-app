using AutoMapper;
using SportActivityOrganizer.Application.DTOs.Users;
using SportActivityOrganizer.Domain.Entities;

namespace SportActivityOrganizer.Application.Mapping;

public class UserMappingProfile : Profile
{
    public UserMappingProfile()
    {
        CreateMap<User, UserDto>()
            .ForCtorParam("LocationLat",
                opt => opt.MapFrom(s => s.LocationLat.HasValue ? (double)s.LocationLat.Value : (double?)null))
            .ForCtorParam("LocationLng",
                opt => opt.MapFrom(s => s.LocationLng.HasValue ? (double)s.LocationLng.Value : (double?)null))
            .ForCtorParam("Role",
                opt => opt.MapFrom(s => s.Role.ToString()))
            .ForCtorParam("AvgRatingAsOrganizer",
                opt => opt.MapFrom(s => s.AvgRatingAsOrganizer.HasValue ? (double)s.AvgRatingAsOrganizer.Value : (double?)null))
            .ForCtorParam("AvgRatingAsParticipant",
                opt => opt.MapFrom(s => s.AvgRatingAsParticipant.HasValue ? (double)s.AvgRatingAsParticipant.Value : (double?)null))
            .ForCtorParam("FavoriteSports",
                opt => opt.MapFrom(s => s.FavoriteSports ?? new List<UserFavoriteSport>()))
            .ForCtorParam("CreatedAt",
                opt => opt.MapFrom(s => s.CreatedAt));

        CreateMap<UserFavoriteSport, UserFavoriteSportDto>()
            .ForCtorParam("SportName",
                opt => opt.MapFrom(s => s.Sport != null ? s.Sport.Name : ""))
            .ForCtorParam("SportIcon",
                opt => opt.MapFrom(s => s.Sport != null ? s.Sport.Icon : null))
            .ForCtorParam("SkillLevel",
                opt => opt.MapFrom(s => s.SkillLevel.ToString()))
            .ForCtorParam("AvgRating",
                opt => opt.MapFrom(s => (double?)null));
    }
}
