using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportActivityOrganizer.Application.DTOs.Reports;
using SportActivityOrganizer.Domain.Entities;
using SportActivityOrganizer.Domain.Enums;
using SportActivityOrganizer.Infrastructure.Data;

namespace SportActivityOrganizer.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReportsController(AppDbContext db)
    {
        _db = db;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<ActionResult<ReportDto>> CreateReport([FromBody] CreateReportRequest request)
    {
        var userId = GetUserId();

        if (request.ReportedUserId == null && request.ReportedEventId == null && request.ReportedCommentId == null)
            return BadRequest(new { error = "Мора да изберете корисник, настан или коментар за пријавување." });

        if (!Enum.TryParse<ReportReason>(request.Reason, out var reason))
            return BadRequest(new { error = "Невалидна причина." });

        // Can't report yourself
        if (request.ReportedUserId == userId)
            return BadRequest(new { error = "Не можете да се пријавите себеси." });

        var report = new Report
        {
            ReporterId = userId,
            ReportedUserId = request.ReportedUserId,
            ReportedEventId = request.ReportedEventId,
            ReportedCommentId = request.ReportedCommentId,
            Reason = reason,
            Description = request.Description,
            Status = ReportStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _db.Reports.Add(report);
        await _db.SaveChangesAsync();

        return Ok(await MapToDto(report));
    }

    [HttpGet("my")]
    public async Task<ActionResult<List<ReportDto>>> GetMyReports()
    {
        var userId = GetUserId();
        var reports = await _db.Reports
            .Include(r => r.Reporter)
            .Include(r => r.ReportedUser)
            .Include(r => r.ReportedEvent)
            .Include(r => r.ReportedComment)
            .Where(r => r.ReporterId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var dtos = new List<ReportDto>();
        foreach (var r in reports) dtos.Add(await MapToDto(r));
        return Ok(dtos);
    }

    // Admin endpoints
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<object>> GetAllReports([FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = _db.Reports
            .Include(r => r.Reporter)
            .Include(r => r.ReportedUser)
            .Include(r => r.ReportedEvent)
            .Include(r => r.ReportedComment)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<ReportStatus>(status, out var statusFilter))
            query = query.Where(r => r.Status == statusFilter);

        var totalCount = await query.CountAsync();
        var reports = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = new List<ReportDto>();
        foreach (var r in reports) dtos.Add(await MapToDto(r));

        return Ok(new { items = dtos, totalCount, page, pageSize });
    }

    [HttpPut("{id}/resolve")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ReportDto>> ResolveReport(int id, [FromBody] ResolveReportRequest request)
    {
        var report = await _db.Reports
            .Include(r => r.Reporter)
            .Include(r => r.ReportedUser)
            .Include(r => r.ReportedEvent)
            .Include(r => r.ReportedComment)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (report == null)
            return NotFound(new { error = "Пријавата не е пронајдена." });

        if (!Enum.TryParse<ReportStatus>(request.Status, out var newStatus))
            return BadRequest(new { error = "Невалиден статус." });

        report.Status = newStatus;
        report.AdminNotes = request.AdminNotes;
        report.ResolvedByUserId = GetUserId();
        report.ResolvedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(await MapToDto(report));
    }

    private async Task<ReportDto> MapToDto(Report r)
    {
        var reporter = r.Reporter ?? await _db.Users.FindAsync(r.ReporterId);
        var reportedUser = r.ReportedUserId.HasValue ? (r.ReportedUser ?? await _db.Users.FindAsync(r.ReportedUserId)) : null;
        var reportedEvent = r.ReportedEventId.HasValue ? (r.ReportedEvent ?? await _db.SportEvents.FindAsync(r.ReportedEventId)) : null;

        return new ReportDto(
            Id: r.Id,
            ReporterId: r.ReporterId,
            ReporterName: reporter != null ? $"{reporter.FirstName} {reporter.LastName}" : "Непознат",
            ReportedUserId: r.ReportedUserId,
            ReportedUserName: reportedUser != null ? $"{reportedUser.FirstName} {reportedUser.LastName}" : null,
            ReportedEventId: r.ReportedEventId,
            ReportedEventTitle: reportedEvent?.Title,
            ReportedCommentId: r.ReportedCommentId,
            Reason: r.Reason.ToString(),
            Description: r.Description,
            Status: r.Status.ToString(),
            AdminNotes: r.AdminNotes,
            CreatedAt: r.CreatedAt,
            ResolvedAt: r.ResolvedAt
        );
    }
}
