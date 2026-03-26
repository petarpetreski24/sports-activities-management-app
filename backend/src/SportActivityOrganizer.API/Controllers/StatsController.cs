using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportActivityOrganizer.Domain.Enums;
using SportActivityOrganizer.Infrastructure.Data;

namespace SportActivityOrganizer.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly AppDbContext _db;

    public StatsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("leaderboard")]
    public async Task<IActionResult> GetLeaderboard([FromQuery] string period = "weekly")
    {
        var now = DateTime.UtcNow;
        var startDate = period switch
        {
            "monthly" => now.AddDays(-30),
            "alltime" => DateTime.MinValue,
            _ => now.AddDays(-7) // weekly
        };
        var startDateUtc = DateTime.SpecifyKind(startDate, DateTimeKind.Utc);

        // Most active players (by events participated in period)
        var mostActive = await _db.EventApplications
            .Where(a => a.Status == ApplicationStatus.Approved && a.AppliedAt >= startDateUtc)
            .GroupBy(a => a.UserId)
            .Select(g => new
            {
                UserId = g.Key,
                EventCount = g.Count()
            })
            .OrderByDescending(x => x.EventCount)
            .Take(10)
            .ToListAsync();

        var mostActiveUserIds = mostActive.Select(x => x.UserId).ToList();
        var mostActiveUsers = await _db.Users
            .Where(u => mostActiveUserIds.Contains(u.Id))
            .Select(u => new { u.Id, u.FirstName, u.LastName, u.ProfilePhotoUrl, u.AvgRatingAsParticipant })
            .ToListAsync();

        var mostActivePlayers = mostActive.Select(a =>
        {
            var user = mostActiveUsers.FirstOrDefault(u => u.Id == a.UserId);
            return new
            {
                UserId = a.UserId,
                Name = user != null ? $"{user.FirstName} {user.LastName}" : "",
                PhotoUrl = user?.ProfilePhotoUrl,
                Rating = user?.AvgRatingAsParticipant != null ? (double)user.AvgRatingAsParticipant : (double?)null,
                EventCount = a.EventCount
            };
        }).ToList();

        // Top rated organizers
        var topOrganizers = await _db.Users
            .Where(u => u.AvgRatingAsOrganizer != null && u.AvgRatingAsOrganizer > 0 && u.IsActive)
            .OrderByDescending(u => u.AvgRatingAsOrganizer)
            .Take(10)
            .Select(u => new
            {
                UserId = u.Id,
                Name = u.FirstName + " " + u.LastName,
                PhotoUrl = u.ProfilePhotoUrl,
                Rating = u.AvgRatingAsOrganizer != null ? (double)u.AvgRatingAsOrganizer : (double?)null,
                EventCount = u.OrganizedEvents.Count
            })
            .ToListAsync();

        // Top rated participants
        var topParticipants = await _db.Users
            .Where(u => u.AvgRatingAsParticipant != null && u.AvgRatingAsParticipant > 0 && u.IsActive)
            .OrderByDescending(u => u.AvgRatingAsParticipant)
            .Take(10)
            .Select(u => new
            {
                UserId = u.Id,
                Name = u.FirstName + " " + u.LastName,
                PhotoUrl = u.ProfilePhotoUrl,
                Rating = u.AvgRatingAsParticipant != null ? (double)u.AvgRatingAsParticipant : (double?)null,
                EventCount = u.Applications.Count(a => a.Status == ApplicationStatus.Approved)
            })
            .ToListAsync();

        // Weekly insights
        var weekStart = DateTime.SpecifyKind(now.AddDays(-7), DateTimeKind.Utc);
        var prevWeekStart = DateTime.SpecifyKind(now.AddDays(-14), DateTimeKind.Utc);

        var thisWeekEvents = await _db.SportEvents.CountAsync(e => e.CreatedAt >= weekStart);
        var prevWeekEvents = await _db.SportEvents.CountAsync(e => e.CreatedAt >= prevWeekStart && e.CreatedAt < weekStart);
        var thisWeekUsers = await _db.Users.CountAsync(u => u.CreatedAt >= weekStart);
        var thisWeekApplications = await _db.EventApplications.CountAsync(a => a.AppliedAt >= weekStart);

        // Trending sports (most events created this week)
        var trendingSports = await _db.SportEvents
            .Where(e => e.CreatedAt >= weekStart)
            .GroupBy(e => new { e.SportId, e.Sport.Name, e.Sport.Icon })
            .Select(g => new
            {
                SportName = g.Key.Name,
                SportIcon = g.Key.Icon,
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .Take(5)
            .ToListAsync();

        return Ok(new
        {
            MostActivePlayers = mostActivePlayers,
            TopOrganizers = topOrganizers,
            TopParticipants = topParticipants,
            WeeklyInsights = new
            {
                NewEvents = thisWeekEvents,
                PrevWeekEvents = prevWeekEvents,
                EventsTrend = prevWeekEvents > 0 ? Math.Round(((double)thisWeekEvents - prevWeekEvents) / prevWeekEvents * 100, 1) : 0,
                NewUsers = thisWeekUsers,
                TotalApplications = thisWeekApplications,
            },
            TrendingSports = trendingSports
        });
    }

    [HttpGet("heatmap")]
    public async Task<IActionResult> GetHeatmap()
    {
        // Return events with locations for heatmap display
        var events = await _db.SportEvents
            .Include(e => e.Sport)
            .Where(e => e.Status != EventStatus.Cancelled)
            .Select(e => new
            {
                e.Id,
                e.Title,
                e.SportId,
                SportName = e.Sport.Name,
                SportIcon = e.Sport.Icon,
                Lat = (double)e.LocationLat,
                Lng = (double)e.LocationLng,
                e.LocationAddress,
                e.EventDate,
                Status = e.Status.ToString(),
                e.MaxParticipants,
                CurrentParticipants = e.Applications.Count(a => a.Status == ApplicationStatus.Approved),
                e.IsLastMinute
            })
            .ToListAsync();

        // City-level aggregation
        var cityStats = events
            .GroupBy(e =>
            {
                // Round to ~1km grid for clustering
                var latRounded = Math.Round(e.Lat, 2);
                var lngRounded = Math.Round(e.Lng, 2);
                return $"{latRounded},{lngRounded}";
            })
            .Select(g =>
            {
                var first = g.First();
                return new
                {
                    Lat = Math.Round(first.Lat, 2),
                    Lng = Math.Round(first.Lng, 2),
                    Count = g.Count(),
                    ActiveCount = g.Count(e => e.Status == "Open" || e.Status == "Full"),
                    TopSport = g.GroupBy(e => e.SportName).OrderByDescending(sg => sg.Count()).First().Key
                };
            })
            .OrderByDescending(x => x.Count)
            .ToList();

        // Sport distribution for map
        var sportDistribution = events
            .GroupBy(e => new { e.SportName, e.SportIcon })
            .Select(g => new
            {
                g.Key.SportName,
                g.Key.SportIcon,
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .ToList();

        return Ok(new
        {
            Events = events,
            CityStats = cityStats,
            SportDistribution = sportDistribution,
            TotalEvents = events.Count,
            ActiveEvents = events.Count(e => e.Status == "Open" || e.Status == "Full")
        });
    }

    [HttpGet("badges/{userId}")]
    public async Task<IActionResult> GetUserBadges(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        var eventsParticipated = await _db.EventApplications
            .CountAsync(a => a.UserId == userId && a.Status == ApplicationStatus.Approved);

        var eventsOrganized = await _db.SportEvents
            .CountAsync(e => e.OrganizerId == userId && e.Status != EventStatus.Cancelled);

        var ratingsGiven = await _db.EventRatings.CountAsync(r => r.ReviewerId == userId) +
                          await _db.ParticipantRatings.CountAsync(r => r.RaterId == userId);

        var commentsWritten = await _db.EventComments.CountAsync(c => c.UserId == userId && !c.IsDeleted);

        var distinctSports = await _db.EventApplications
            .Where(a => a.UserId == userId && a.Status == ApplicationStatus.Approved)
            .Select(a => a.Event.SportId)
            .Distinct()
            .CountAsync();

        var distinctCities = await _db.EventApplications
            .Where(a => a.UserId == userId && a.Status == ApplicationStatus.Approved)
            .Select(a => a.Event.LocationAddress)
            .Distinct()
            .CountAsync();

        // Night events (after 20:00 UTC)
        var nightEvents = await _db.EventApplications
            .Where(a => a.UserId == userId && a.Status == ApplicationStatus.Approved)
            .Select(a => a.Event.EventDate)
            .Where(d => d.Hour >= 20)
            .CountAsync();

        // Events organized that got high ratings
        var highRatedEvents = await _db.SportEvents
            .Where(e => e.OrganizerId == userId && e.AvgRating >= 4.5m)
            .CountAsync();

        var badges = new List<object>();

        // Participation badges
        if (eventsParticipated >= 1) badges.Add(new { Id = "first_event", Name = "Прв настан", Description = "Учествуваше на прв настан", Icon = "emoji_events", Level = "bronze" });
        if (eventsParticipated >= 10) badges.Add(new { Id = "regular_10", Name = "Редовен играч", Description = "10 настани", Icon = "sports", Level = "silver" });
        if (eventsParticipated >= 25) badges.Add(new { Id = "veteran_25", Name = "Ветеран", Description = "25 настани", Icon = "military_tech", Level = "gold" });
        if (eventsParticipated >= 50) badges.Add(new { Id = "legend_50", Name = "Легенда", Description = "50 настани", Icon = "star", Level = "platinum" });
        if (eventsParticipated >= 100) badges.Add(new { Id = "goat_100", Name = "GOAT", Description = "100 настани", Icon = "workspace_premium", Level = "diamond" });

        // Organizer badges
        if (eventsOrganized >= 1) badges.Add(new { Id = "first_org", Name = "Прв организатор", Description = "Организираше прв настан", Icon = "event", Level = "bronze" });
        if (eventsOrganized >= 5) badges.Add(new { Id = "active_org_5", Name = "Активен организатор", Description = "5 организирани настани", Icon = "event_available", Level = "silver" });
        if (eventsOrganized >= 20) badges.Add(new { Id = "master_org_20", Name = "Мастер организатор", Description = "20 организирани настани", Icon = "celebration", Level = "gold" });

        // Rating badges
        if (user.AvgRatingAsParticipant >= 4.5m) badges.Add(new { Id = "top_rated", Name = "Топ рејтинг", Description = "Просечна оцена 4.5+", Icon = "thumb_up", Level = "gold" });
        if (highRatedEvents >= 3) badges.Add(new { Id = "quality_org", Name = "Квалитетен организатор", Description = "3+ настани со оцена 4.5+", Icon = "verified", Level = "gold" });

        // Social badges
        if (ratingsGiven >= 10) badges.Add(new { Id = "reviewer", Name = "Рецензент", Description = "10+ оцени", Icon = "rate_review", Level = "bronze" });
        if (commentsWritten >= 20) badges.Add(new { Id = "commentator", Name = "Коментатор", Description = "20+ коментари", Icon = "chat", Level = "silver" });

        // Explorer badges
        if (distinctSports >= 3) badges.Add(new { Id = "multi_sport", Name = "Мулти-спортист", Description = "3+ различни спортови", Icon = "sports_score", Level = "silver" });
        if (distinctSports >= 5) badges.Add(new { Id = "all_rounder", Name = "Универзалец", Description = "5+ различни спортови", Icon = "auto_awesome", Level = "gold" });
        if (distinctCities >= 5) badges.Add(new { Id = "explorer", Name = "Истражувач", Description = "5+ различни локации", Icon = "explore", Level = "silver" });

        // Special badges
        if (nightEvents >= 5) badges.Add(new { Id = "night_owl", Name = "Ноќна птица", Description = "5+ настани после 20:00", Icon = "nightlight", Level = "bronze" });

        return Ok(new
        {
            UserId = userId,
            TotalBadges = badges.Count,
            Badges = badges,
            Stats = new
            {
                EventsParticipated = eventsParticipated,
                EventsOrganized = eventsOrganized,
                RatingsGiven = ratingsGiven,
                CommentsWritten = commentsWritten,
                DistinctSports = distinctSports,
                DistinctCities = distinctCities
            }
        });
    }
}
