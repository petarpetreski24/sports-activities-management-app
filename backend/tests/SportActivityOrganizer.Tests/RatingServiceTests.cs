using FluentAssertions;
using SportActivityOrganizer.Application.DTOs.Ratings;
using SportActivityOrganizer.Application.Services;
using SportActivityOrganizer.Domain.Entities;
using SportActivityOrganizer.Domain.Enums;

namespace SportActivityOrganizer.Tests;

public class RatingServiceTests
{
    private static RatingService CreateSut(TestHarness h) => new(h.Uow, h.Mapper);

    [Fact]
    public async Task RateEvent_WhenEventNotCompleted_Throws()
    {
        using var h = new TestHarness();
        var org = h.AddUser(email: "org@test.com");
        var member = h.AddUser(email: "member@test.com");
        var sport = h.AddSport();
        var evt = h.AddEvent(org.Id, sport.Id, status: EventStatus.Open);
        h.AddApplication(evt.Id, member.Id, ApplicationStatus.Approved);
        var sut = CreateSut(h);

        var act = () => sut.RateEventAsync(member.Id, evt.Id, new CreateEventRatingRequest(5, "great"));

        await act.Should().ThrowAsync<InvalidOperationException>(); // FR-8.1 (completed only)
    }

    [Fact]
    public async Task RateEvent_Twice_Throws()
    {
        using var h = new TestHarness();
        var org = h.AddUser(email: "org@test.com");
        var member = h.AddUser(email: "member@test.com");
        var sport = h.AddSport();
        var evt = h.AddEvent(org.Id, sport.Id, status: EventStatus.Completed,
            eventDate: DateTime.UtcNow.AddDays(-1));
        h.AddApplication(evt.Id, member.Id, ApplicationStatus.Approved);
        h.Db.Set<EventRating>().Add(new EventRating
        {
            EventId = evt.Id,
            ReviewerId = member.Id,
            Rating = 4,
            CreatedAt = DateTime.UtcNow
        });
        h.Db.SaveChanges();
        var sut = CreateSut(h);

        var act = () => sut.RateEventAsync(member.Id, evt.Id, new CreateEventRatingRequest(5, "again"));

        await act.Should().ThrowAsync<InvalidOperationException>(); // FR-8.4 (one rating per event)
    }
}
