using AutoMapper;
using SportActivityOrganizer.Application.DTOs.Sports;
using SportActivityOrganizer.Domain.Entities;

namespace SportActivityOrganizer.Application.Mapping;

public class SportMappingProfile : Profile
{
    public SportMappingProfile()
    {
        CreateMap<Sport, SportDto>();
    }
}
