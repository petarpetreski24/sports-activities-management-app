using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportActivityOrganizer.Application.DTOs.Users;
using SportActivityOrganizer.Application.Interfaces;

namespace SportActivityOrganizer.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetProfile()
    {
        var result = await _userService.GetProfileAsync(GetUserId());
        return Ok(result);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<UserPublicDto>> GetPublicProfile(int id)
    {
        var result = await _userService.GetPublicProfileAsync(id);
        return Ok(result);
    }

    [HttpPut("me")]
    public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var result = await _userService.UpdateProfileAsync(GetUserId(), request);
        return Ok(result);
    }

    [HttpPut("me/password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        await _userService.ChangePasswordAsync(GetUserId(), request);
        return Ok(new { message = "Лозинката е успешно променета." });
    }

    [HttpPost("me/photo")]
    public async Task<ActionResult<object>> UploadPhoto(IFormFile file)
    {
        if (file.Length == 0) return BadRequest(new { error = "Нема прикачена датотека." });
        if (file.Length > 5 * 1024 * 1024) return BadRequest(new { error = "Максималната големина е 5MB." });

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/jpg" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(new { error = "Дозволени формати: JPG, PNG." });

        using var stream = file.OpenReadStream();
        var url = await _userService.UploadProfilePhotoAsync(GetUserId(), stream, file.FileName);
        return Ok(new { profilePhotoUrl = url });
    }

    [HttpGet("me/favorite-sports")]
    public async Task<ActionResult<List<UserFavoriteSportDto>>> GetFavoriteSports()
    {
        var result = await _userService.GetFavoriteSportsAsync(GetUserId());
        return Ok(result);
    }

    [HttpPut("me/favorite-sports")]
    public async Task<IActionResult> UpdateFavoriteSports([FromBody] UpdateFavoriteSportsRequest request)
    {
        await _userService.UpdateFavoriteSportsAsync(GetUserId(), request);
        return Ok(new { message = "Омилените спортови се ажурирани." });
    }

    [HttpPost("me/favorite-sports")]
    public async Task<ActionResult<UserFavoriteSportDto>> AddFavoriteSport([FromBody] AddFavoriteSportRequest request)
    {
        var result = await _userService.AddFavoriteSportAsync(GetUserId(), request.SportId, request.SkillLevel);
        return Ok(result);
    }

    [HttpDelete("me/favorite-sports/{sportId}")]
    public async Task<IActionResult> RemoveFavoriteSport(int sportId)
    {
        await _userService.RemoveFavoriteSportAsync(GetUserId(), sportId);
        return Ok(new { message = "Спортот е отстранет од омилени." });
    }
}
