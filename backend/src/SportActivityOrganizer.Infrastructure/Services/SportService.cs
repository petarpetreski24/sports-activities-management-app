using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SportActivityOrganizer.Application.DTOs.Sports;
using SportActivityOrganizer.Application.Interfaces;
using SportActivityOrganizer.Application.Interfaces.Persistence;
using SportActivityOrganizer.Domain.Entities;

namespace SportActivityOrganizer.Infrastructure.Services;

public class SportService : ISportService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public SportService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<SportDto>> GetAllAsync(bool includeInactive = false)
    {
        var query = _unitOfWork.Sports.Query();

        if (!includeInactive)
            query = query.Where(s => s.IsActive);

        var sports = await query
            .OrderBy(s => s.Name)
            .ToListAsync();

        return _mapper.Map<List<SportDto>>(sports);
    }

    public async Task<SportDto> GetByIdAsync(int id)
    {
        var sport = await _unitOfWork.Sports.GetByIdAsync(id);

        if (sport == null)
            throw new KeyNotFoundException("Sport not found.");

        return _mapper.Map<SportDto>(sport);
    }

    public async Task<SportDto> CreateAsync(CreateSportRequest request)
    {
        var exists = await _unitOfWork.Sports
            .AnyAsync(s => s.Name.ToLower() == request.Name.ToLower());

        if (exists)
            throw new InvalidOperationException("A sport with this name already exists.");

        var sport = new Sport
        {
            Name = request.Name,
            Icon = request.Icon,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Sports.AddAsync(sport);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<SportDto>(sport);
    }

    public async Task<SportDto> UpdateAsync(int id, UpdateSportRequest request)
    {
        var sport = await _unitOfWork.Sports.GetByIdAsync(id);

        if (sport == null)
            throw new KeyNotFoundException("Sport not found.");

        // Check for duplicate name (excluding current sport)
        var duplicate = await _unitOfWork.Sports
            .AnyAsync(s => s.Name.ToLower() == request.Name.ToLower() && s.Id != id);

        if (duplicate)
            throw new InvalidOperationException("A sport with this name already exists.");

        sport.Name = request.Name;
        sport.Icon = request.Icon;
        sport.IsActive = request.IsActive;

        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<SportDto>(sport);
    }
}
