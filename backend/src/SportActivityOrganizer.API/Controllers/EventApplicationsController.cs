using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportActivityOrganizer.Application.DTOs.Events;
using SportActivityOrganizer.Application.Interfaces;

namespace SportActivityOrganizer.API.Controllers;

[ApiController]
[Route("api/events/{eventId}/applications")]
[Authorize]
public class EventApplicationsController : ControllerBase
{
    private readonly IEventApplicationService _applicationService;

    public EventApplicationsController(IEventApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<ActionResult<EventApplicationDto>> Apply(int eventId)
    {
        var result = await _applicationService.ApplyAsync(GetUserId(), eventId);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<List<EventApplicationDto>>> GetApplications(int eventId)
    {
        var result = await _applicationService.GetEventApplicationsAsync(GetUserId(), eventId);
        return Ok(result);
    }

    [HttpGet("my")]
    public async Task<ActionResult<EventApplicationDto?>> GetMyApplication(int eventId)
    {
        var result = await _applicationService.GetMyApplicationAsync(GetUserId(), eventId);
        return Ok(result);
    }

    [HttpPost("{applicationId}/approve")]
    public async Task<ActionResult<EventApplicationDto>> Approve(int eventId, int applicationId)
    {
        var result = await _applicationService.ApproveAsync(GetUserId(), applicationId);
        return Ok(result);
    }

    [HttpPost("{applicationId}/reject")]
    public async Task<ActionResult<EventApplicationDto>> Reject(int eventId, int applicationId)
    {
        var result = await _applicationService.RejectAsync(GetUserId(), applicationId);
        return Ok(result);
    }

    [HttpPost("{applicationId}/cancel")]
    public async Task<IActionResult> Cancel(int eventId, int applicationId)
    {
        await _applicationService.CancelAsync(GetUserId(), applicationId);
        return Ok(new { message = "Пријавата е откажана." });
    }

    [HttpDelete("participants/{userId}")]
    public async Task<IActionResult> RemoveParticipant(int eventId, int userId, [FromQuery] string? reason = null)
    {
        await _applicationService.RemoveParticipantAsync(GetUserId(), eventId, userId, reason);
        return Ok(new { message = "Учесникот е отстранет." });
    }
}
