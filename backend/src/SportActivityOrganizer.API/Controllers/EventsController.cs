using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportActivityOrganizer.Application.DTOs.Events;
using SportActivityOrganizer.Application.Interfaces;

namespace SportActivityOrganizer.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EventsController : ControllerBase
{
    private readonly IEventService _eventService;

    public EventsController(IEventService eventService)
    {
        _eventService = eventService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<ActionResult<SportEventDto>> Create([FromBody] CreateEventRequest request)
    {
        var result = await _eventService.CreateAsync(GetUserId(), request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<SportEventDto>> GetById(int id)
    {
        var result = await _eventService.GetByIdAsync(id);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SportEventDto>> Update(int id, [FromBody] UpdateEventRequest request)
    {
        var result = await _eventService.UpdateAsync(GetUserId(), id, request);
        return Ok(result);
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        await _eventService.CancelAsync(GetUserId(), id);
        return Ok(new { message = "Настанот е откажан." });
    }

    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<ActionResult<EventSearchResponse>> Search([FromQuery] EventSearchRequest request)
    {
        var result = await _eventService.SearchAsync(request);
        return Ok(result);
    }

    [HttpGet("my")]
    public async Task<ActionResult<List<SportEventDto>>> GetMyEvents([FromQuery] string? status, [FromQuery] string? type)
    {
        var result = await _eventService.GetMyEventsAsync(GetUserId(), status, type);
        return Ok(result);
    }
}
