using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SportActivityOrganizer.Application.DTOs.Ratings;
using SportActivityOrganizer.Application.Interfaces;
using SportActivityOrganizer.Application.Interfaces.Persistence;
using SportActivityOrganizer.Domain.Entities;
using SportActivityOrganizer.Domain.Enums;

namespace SportActivityOrganizer.Infrastructure.Services;

public class RatingService : IRatingService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public RatingService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<EventRatingDto> RateEventAsync(int reviewerId, int eventId, CreateEventRatingRequest request)
    {
        var sportEvent = await _unitOfWork.SportEvents.Query()
            .Include(e => e.Applications)
            .Include(e => e.Ratings)
            .FirstOrDefaultAsync(e => e.Id == eventId);

        if (sportEvent == null)
            throw new KeyNotFoundException("Event not found.");

        if (sportEvent.Status != EventStatus.Completed)
            throw new InvalidOperationException("Can only rate completed events.");

        var isParticipant = sportEvent.Applications
            .Any(a => a.UserId == reviewerId && a.Status == ApplicationStatus.Approved);

        if (!isParticipant)
            throw new UnauthorizedAccessException("Only approved participants can rate events.");

        var daysSinceUpdate = (DateTime.UtcNow - sportEvent.UpdatedAt).TotalDays;
        if (daysSinceUpdate > 7)
            throw new InvalidOperationException("Rating window has expired. Events can only be rated within 7 days of completion.");

        var existingRating = await _unitOfWork.EventRatings
            .AnyAsync(er => er.EventId == eventId && er.ReviewerId == reviewerId);

        if (existingRating)
            throw new InvalidOperationException("You have already rated this event.");

        if (request.Rating < 1 || request.Rating > 5)
            throw new InvalidOperationException("Rating must be between 1 and 5.");

        var reviewer = await _unitOfWork.Users.GetByIdAsync(reviewerId);
        if (reviewer == null)
            throw new KeyNotFoundException("User not found.");

        var rating = new EventRating
        {
            EventId = eventId,
            ReviewerId = reviewerId,
            Rating = request.Rating,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.EventRatings.AddAsync(rating);
        await _unitOfWork.SaveChangesAsync();

        var avgRating = await _unitOfWork.EventRatings.Query()
            .Where(er => er.EventId == eventId)
            .AverageAsync(er => (decimal)er.Rating);

        sportEvent.AvgRating = Math.Round(avgRating, 2);
        sportEvent.UpdatedAt = DateTime.UtcNow;

        var organizer = await _unitOfWork.Users.GetByIdAsync(sportEvent.OrganizerId);
        if (organizer != null)
        {
            var organizerAvg = await _unitOfWork.EventRatings.Query()
                .Where(er => er.Event.OrganizerId == sportEvent.OrganizerId)
                .AverageAsync(er => (decimal?)er.Rating);

            if (organizerAvg.HasValue)
            {
                organizer.AvgRatingAsOrganizer = Math.Round(organizerAvg.Value, 2);
                organizer.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _unitOfWork.SaveChangesAsync();

        return new EventRatingDto(
            Id: rating.Id,
            EventId: rating.EventId,
            ReviewerId: rating.ReviewerId,
            ReviewerName: $"{reviewer.FirstName} {reviewer.LastName}",
            ReviewerPhotoUrl: reviewer.ProfilePhotoUrl,
            Rating: rating.Rating,
            Comment: rating.Comment,
            CreatedAt: rating.CreatedAt);
    }

    public async Task<List<EventRatingDto>> GetEventRatingsAsync(int eventId)
    {
        var eventExists = await _unitOfWork.SportEvents.AnyAsync(e => e.Id == eventId);
        if (!eventExists)
            throw new KeyNotFoundException("Event not found.");

        var ratings = await _unitOfWork.EventRatings.Query()
            .Include(er => er.Reviewer)
            .Where(er => er.EventId == eventId)
            .OrderByDescending(er => er.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<EventRatingDto>>(ratings);
    }

    public async Task<ParticipantRatingDto> RateParticipantAsync(int raterId, int eventId, CreateParticipantRatingRequest request)
    {
        var sportEvent = await _unitOfWork.SportEvents.Query()
            .Include(e => e.Applications)
            .FirstOrDefaultAsync(e => e.Id == eventId);

        if (sportEvent == null)
            throw new KeyNotFoundException("Event not found.");

        if (sportEvent.Status != EventStatus.Completed)
            throw new InvalidOperationException("Can only rate participants of completed events.");

        var daysSinceUpdate = (DateTime.UtcNow - sportEvent.UpdatedAt).TotalDays;
        if (daysSinceUpdate > 7)
            throw new InvalidOperationException("Rating window has expired.");

        // Rater must be organizer OR approved participant
        var isRaterOrganizer = sportEvent.OrganizerId == raterId;
        var isRaterParticipant = sportEvent.Applications
            .Any(a => a.UserId == raterId && a.Status == ApplicationStatus.Approved);

        if (!isRaterOrganizer && !isRaterParticipant)
            throw new UnauthorizedAccessException("Only the organizer or approved participants can rate others.");

        // Target must be organizer OR approved participant
        var isTargetOrganizer = sportEvent.OrganizerId == request.ParticipantId;
        var isTargetParticipant = sportEvent.Applications
            .Any(a => a.UserId == request.ParticipantId && a.Status == ApplicationStatus.Approved);

        if (!isTargetOrganizer && !isTargetParticipant)
            throw new InvalidOperationException("The user is not a participant or organizer of this event.");

        if (raterId == request.ParticipantId)
            throw new InvalidOperationException("You cannot rate yourself.");

        var existingRating = await _unitOfWork.ParticipantRatings
            .AnyAsync(pr => pr.EventId == eventId && pr.RaterId == raterId && pr.ParticipantId == request.ParticipantId);

        if (existingRating)
            throw new InvalidOperationException("You have already rated this participant for this event.");

        if (request.Rating < 1 || request.Rating > 5)
            throw new InvalidOperationException("Rating must be between 1 and 5.");

        var participant = await _unitOfWork.Users.GetByIdAsync(request.ParticipantId);
        if (participant == null)
            throw new KeyNotFoundException("Participant not found.");

        var rater = await _unitOfWork.Users.GetByIdAsync(raterId);
        if (rater == null)
            throw new KeyNotFoundException("User not found.");

        var rating = new ParticipantRating
        {
            EventId = eventId,
            RaterId = raterId,
            ParticipantId = request.ParticipantId,
            Rating = request.Rating,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.ParticipantRatings.AddAsync(rating);
        await _unitOfWork.SaveChangesAsync();

        // Update participant's average rating
        var avgRating = await _unitOfWork.ParticipantRatings.Query()
            .Where(pr => pr.ParticipantId == request.ParticipantId)
            .AverageAsync(pr => (decimal?)pr.Rating);

        if (avgRating.HasValue)
        {
            participant.AvgRatingAsParticipant = Math.Round(avgRating.Value, 2);
            participant.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.SaveChangesAsync();
        }

        return new ParticipantRatingDto(
            Id: rating.Id,
            EventId: rating.EventId,
            RaterId: rating.RaterId,
            RaterName: $"{rater.FirstName} {rater.LastName}",
            ParticipantId: rating.ParticipantId,
            ParticipantName: $"{participant.FirstName} {participant.LastName}",
            Rating: rating.Rating,
            Comment: rating.Comment,
            CreatedAt: rating.CreatedAt);
    }

    public async Task<List<ParticipantRatingDto>> GetParticipantRatingsAsync(int eventId)
    {
        var eventExists = await _unitOfWork.SportEvents.AnyAsync(e => e.Id == eventId);
        if (!eventExists)
            throw new KeyNotFoundException("Event not found.");

        var ratings = await _unitOfWork.ParticipantRatings.Query()
            .Include(pr => pr.Rater)
            .Include(pr => pr.Participant)
            .Where(pr => pr.EventId == eventId)
            .OrderByDescending(pr => pr.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<ParticipantRatingDto>>(ratings);
    }

    public async Task<List<RatableParticipantDto>> GetRatableParticipantsAsync(int userId, int eventId)
    {
        var sportEvent = await _unitOfWork.SportEvents.Query()
            .Include(e => e.Applications)
            .Include(e => e.Organizer)
            .FirstOrDefaultAsync(e => e.Id == eventId);

        if (sportEvent == null)
            throw new KeyNotFoundException("Event not found.");

        if (sportEvent.Status != EventStatus.Completed)
            return new List<RatableParticipantDto>();

        var daysSinceUpdate = (DateTime.UtcNow - sportEvent.UpdatedAt).TotalDays;
        if (daysSinceUpdate > 7)
            return new List<RatableParticipantDto>();

        var isOrganizer = sportEvent.OrganizerId == userId;
        var isParticipant = sportEvent.Applications
            .Any(a => a.UserId == userId && a.Status == ApplicationStatus.Approved);

        if (!isOrganizer && !isParticipant)
            return new List<RatableParticipantDto>();

        // All people: organizer + approved participants except self
        var allPeopleIds = sportEvent.Applications
            .Where(a => a.Status == ApplicationStatus.Approved)
            .Select(a => a.UserId)
            .ToList();

        if (!allPeopleIds.Contains(sportEvent.OrganizerId))
            allPeopleIds.Add(sportEvent.OrganizerId);

        allPeopleIds.Remove(userId);

        // Already rated
        var alreadyRatedIds = await _unitOfWork.ParticipantRatings.Query()
            .Where(pr => pr.EventId == eventId && pr.RaterId == userId)
            .Select(pr => pr.ParticipantId)
            .ToListAsync();

        var ratableIds = allPeopleIds.Except(alreadyRatedIds).ToList();

        var users = await _unitOfWork.Users.Query()
            .Where(u => ratableIds.Contains(u.Id))
            .ToListAsync();

        return users.Select(u => new RatableParticipantDto(
            UserId: u.Id,
            UserName: $"{u.FirstName} {u.LastName}",
            UserPhotoUrl: u.ProfilePhotoUrl,
            AvgRating: u.AvgRatingAsParticipant.HasValue ? (double)u.AvgRatingAsParticipant.Value : null
        )).ToList();
    }
}
