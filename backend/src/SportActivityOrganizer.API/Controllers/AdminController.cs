using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportActivityOrganizer.Application.DTOs.Admin;
using SportActivityOrganizer.Application.Interfaces;

namespace SportActivityOrganizer.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<AdminStatsDto>> GetStats()
    {
        var result = await _adminService.GetStatsAsync();
        return Ok(result);
    }

    [HttpGet("users")]
    public async Task<ActionResult<object>> GetUsers([FromQuery] string? search, [FromQuery] string? role, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var (items, totalCount) = await _adminService.GetUsersAsync(search, role, page, pageSize);
        return Ok(new { items, totalCount, page, pageSize });
    }

    [HttpPost("users/{id}/deactivate")]
    public async Task<IActionResult> DeactivateUser(int id)
    {
        await _adminService.DeactivateUserAsync(id);
        return Ok(new { message = "Корисникот е деактивиран." });
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        await _adminService.DeleteUserAsync(id);
        return Ok(new { message = "Корисникот е избришан." });
    }

    [HttpDelete("events/{id}")]
    public async Task<IActionResult> DeleteEvent(int id)
    {
        await _adminService.DeleteEventAsync(id);
        return Ok(new { message = "Настанот е избришан." });
    }

    [HttpDelete("comments/{id}")]
    public async Task<IActionResult> DeleteComment(int id)
    {
        await _adminService.DeleteCommentAsync(id);
        return Ok(new { message = "Коментарот е избришан." });
    }
}
