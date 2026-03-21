using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportActivityOrganizer.Application.DTOs.Sports;
using SportActivityOrganizer.Application.Interfaces;

namespace SportActivityOrganizer.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SportsController : ControllerBase
{
    private readonly ISportService _sportService;

    public SportsController(ISportService sportService)
    {
        _sportService = sportService;
    }

    [HttpGet]
    public async Task<ActionResult<List<SportDto>>> GetAll([FromQuery] bool includeInactive = false)
    {
        var result = await _sportService.GetAllAsync(includeInactive);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SportDto>> GetById(int id)
    {
        var result = await _sportService.GetByIdAsync(id);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SportDto>> Create([FromBody] CreateSportRequest request)
    {
        var result = await _sportService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SportDto>> Update(int id, [FromBody] UpdateSportRequest request)
    {
        var result = await _sportService.UpdateAsync(id, request);
        return Ok(result);
    }
}
