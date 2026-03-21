using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportActivityOrganizer.Application.DTOs.Ratings;
using SportActivityOrganizer.Application.Interfaces;

namespace SportActivityOrganizer.API.Controllers;

[ApiController]
[Route("api/events/{eventId}/ratings")]
[Authorize]
public class EventRatingsController : ControllerBase
{
    private readonly IRatingService _ratingService;

    public EventRatingsController(IRatingService ratingService)
    {
        _ratingService = ratingService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<ActionResult<EventRatingDto>> RateEvent(int eventId, [FromBody] CreateEventRatingRequest request)
    {
        var result = await _ratingService.RateEventAsync(GetUserId(), eventId, request);
        return Ok(result);
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<EventRatingDto>>> GetRatings(int eventId)
    {
        var result = await _ratingService.GetEventRatingsAsync(eventId);
        return Ok(result);
    }

    [HttpPost("participants")]
    public async Task<ActionResult<ParticipantRatingDto>> RateParticipant(int eventId, [FromBody] CreateParticipantRatingRequest request)
    {
        var result = await _ratingService.RateParticipantAsync(GetUserId(), eventId, request);
        return Ok(result);
    }

    [HttpGet("participants")]
    public async Task<ActionResult<List<ParticipantRatingDto>>> GetParticipantRatings(int eventId)
    {
        var result = await _ratingService.GetParticipantRatingsAsync(eventId);
        return Ok(result);
    }

    [HttpGet("ratable-participants")]
    public async Task<ActionResult<List<RatableParticipantDto>>> GetRatableParticipants(int eventId)
    {
        var result = await _ratingService.GetRatableParticipantsAsync(GetUserId(), eventId);
        return Ok(result);
    }
}
