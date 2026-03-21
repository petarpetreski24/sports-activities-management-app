using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SportActivityOrganizer.Application.DTOs.Users;
using SportActivityOrganizer.Application.Interfaces;
using SportActivityOrganizer.Application.Interfaces.Persistence;
using SportActivityOrganizer.Domain.Entities;
using SportActivityOrganizer.Domain.Enums;

namespace SportActivityOrganizer.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UserService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<UserDto> GetProfileAsync(int userId)
    {
        var user = await _unitOfWork.Users.Query()
            .Include(u => u.FavoriteSports)
                .ThenInclude(fs => fs.Sport)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            throw new KeyNotFoundException("User not found.");

        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserPublicDto> GetPublicProfileAsync(int userId)
    {
        var user = await _unitOfWork.Users.Query()
            .Include(u => u.FavoriteSports)
                .ThenInclude(fs => fs.Sport)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            throw new KeyNotFoundException("User not found.");

        var totalParticipated = await _unitOfWork.EventApplications
            .CountAsync(ea => ea.UserId == userId && ea.Status == ApplicationStatus.Approved);

        var totalOrganized = await _unitOfWork.SportEvents
            .CountAsync(se => se.OrganizerId == userId);

        // Compute per-sport average participant ratings
        var ratingsWithSport = await _unitOfWork.ParticipantRatings.Query()
            .Where(pr => pr.ParticipantId == userId)
            .Select(pr => new { pr.Rating, pr.Event.SportId })
            .ToListAsync();

        var sportRatingDict = ratingsWithSport
            .GroupBy(r => r.SportId)
            .ToDictionary(g => g.Key, g => g.Average(r => r.Rating));

        // Compute overall avg participant rating as average across all ratings received
        double? allParticipantRatings = ratingsWithSport.Count > 0
            ? ratingsWithSport.Average(r => r.Rating)
            : null;

        return new UserPublicDto(
            Id: user.Id,
            FirstName: user.FirstName,
            LastName: user.LastName,
            Bio: user.Bio,
            ProfilePhotoUrl: user.ProfilePhotoUrl,
            LocationCity: user.LocationCity,
            AvgRatingAsOrganizer: user.AvgRatingAsOrganizer.HasValue ? (double)user.AvgRatingAsOrganizer.Value : null,
            AvgRatingAsParticipant: allParticipantRatings,
            FavoriteSports: user.FavoriteSports.Select(fs => new UserFavoriteSportDto(
                Id: fs.Id,
                SportId: fs.SportId,
                SportName: fs.Sport?.Name ?? string.Empty,
                SportIcon: fs.Sport?.Icon,
                SkillLevel: fs.SkillLevel.ToString(),
                AvgRating: sportRatingDict.TryGetValue(fs.SportId, out var avg) ? avg : null
            )).ToList(),
            TotalEventsParticipated: totalParticipated,
            TotalEventsOrganized: totalOrganized);
    }

    public async Task<UserDto> UpdateProfileAsync(int userId, UpdateProfileRequest request)
    {
        var user = await _unitOfWork.Users.Query()
            .Include(u => u.FavoriteSports)
                .ThenInclude(fs => fs.Sport)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            throw new KeyNotFoundException("User not found.");

        if (request.FirstName != null) user.FirstName = request.FirstName;
        if (request.LastName != null) user.LastName = request.LastName;
        if (request.Phone != null) user.Phone = request.Phone;
        if (request.Bio != null) user.Bio = request.Bio;
        if (request.LocationCity != null) user.LocationCity = request.LocationCity;
        if (request.LocationLat.HasValue) user.LocationLat = (decimal)request.LocationLat.Value;
        if (request.LocationLng.HasValue) user.LocationLng = (decimal)request.LocationLng.Value;

        user.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<UserDto>(user);
    }

    public async Task ChangePasswordAsync(int userId, ChangePasswordRequest request)
    {
        var user = await _unitOfWork.Users.Query()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            throw new KeyNotFoundException("User not found.");

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            throw new InvalidOperationException("Current password is incorrect.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<string> UploadProfilePhotoAsync(int userId, Stream fileStream, string fileName)
    {
        var user = await _unitOfWork.Users.Query()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            throw new KeyNotFoundException("User not found.");

        // Create uploads directory if it doesn't exist
        var uploadsDir = Path.Combine("wwwroot", "uploads", "profiles");
        Directory.CreateDirectory(uploadsDir);

        // Generate unique file name
        var extension = Path.GetExtension(fileName);
        var uniqueFileName = $"{userId}_{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsDir, uniqueFileName);

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(stream);
        }

        var photoUrl = $"/uploads/profiles/{uniqueFileName}";
        user.ProfilePhotoUrl = photoUrl;
        user.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();

        return photoUrl;
    }

    public async Task<List<UserFavoriteSportDto>> GetFavoriteSportsAsync(int userId)
    {
        var userExists = await _unitOfWork.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            throw new KeyNotFoundException("User not found.");

        var favorites = await _unitOfWork.UserFavoriteSports.Query()
            .Include(fs => fs.Sport)
            .Where(fs => fs.UserId == userId)
            .ToListAsync();

        return _mapper.Map<List<UserFavoriteSportDto>>(favorites);
    }

    public async Task UpdateFavoriteSportsAsync(int userId, UpdateFavoriteSportsRequest request)
    {
        var userExists = await _unitOfWork.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            throw new KeyNotFoundException("User not found.");

        // Remove existing favorites
        var existingFavorites = await _unitOfWork.UserFavoriteSports.Query()
            .Where(fs => fs.UserId == userId)
            .ToListAsync();

        _unitOfWork.UserFavoriteSports.RemoveRange(existingFavorites);

        // Add new favorites
        foreach (var item in request.FavoriteSports)
        {
            var sport = await _unitOfWork.Sports.GetByIdAsync(item.SportId);
            if (sport == null)
                throw new KeyNotFoundException($"Sport with ID {item.SportId} not found.");

            if (!Enum.TryParse<SkillLevel>(item.SkillLevel, true, out var skillLevel))
                throw new InvalidOperationException($"Invalid skill level: {item.SkillLevel}");

            await _unitOfWork.UserFavoriteSports.AddAsync(new UserFavoriteSport
            {
                UserId = userId,
                SportId = item.SportId,
                SkillLevel = skillLevel,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<UserFavoriteSportDto> AddFavoriteSportAsync(int userId, int sportId, string skillLevel)
    {
        var userExists = await _unitOfWork.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            throw new KeyNotFoundException("User not found.");

        var sport = await _unitOfWork.Sports.GetByIdAsync(sportId);
        if (sport == null)
            throw new KeyNotFoundException($"Sport with ID {sportId} not found.");

        if (!Enum.TryParse<SkillLevel>(skillLevel, true, out var level))
            throw new InvalidOperationException($"Invalid skill level: {skillLevel}");

        // Check if already exists
        var existing = await _unitOfWork.UserFavoriteSports.Query()
            .FirstOrDefaultAsync(fs => fs.UserId == userId && fs.SportId == sportId);

        if (existing != null)
            throw new InvalidOperationException("This sport is already in your favorites.");

        var favSport = new UserFavoriteSport
        {
            UserId = userId,
            SportId = sportId,
            SkillLevel = level,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.UserFavoriteSports.AddAsync(favSport);
        await _unitOfWork.SaveChangesAsync();

        return new UserFavoriteSportDto(
            Id: favSport.Id,
            SportId: sport.Id,
            SportName: sport.Name,
            SportIcon: sport.Icon,
            SkillLevel: favSport.SkillLevel.ToString()
        );
    }

    public async Task RemoveFavoriteSportAsync(int userId, int sportId)
    {
        var favSport = await _unitOfWork.UserFavoriteSports.Query()
            .FirstOrDefaultAsync(fs => fs.UserId == userId && fs.SportId == sportId);

        if (favSport == null)
            throw new KeyNotFoundException("Favorite sport not found.");

        _unitOfWork.UserFavoriteSports.Remove(favSport);
        await _unitOfWork.SaveChangesAsync();
    }
}
