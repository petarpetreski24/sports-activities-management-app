using FluentAssertions;
using SportActivityOrganizer.Application.DTOs.Events;
using SportActivityOrganizer.Application.Services;
using SportActivityOrganizer.Domain.Enums;

namespace SportActivityOrganizer.Tests;

public class EventServiceTests
{
    private static EventService CreateSut(TestHarness h) =>
        new(h.Uow, h.Mapper, h.Notifications.Object);

    private static CreateEventRequest NewEvent(int sportId, DateTime date) =>
        new(sportId, "Match", "desc", date, 90, "Court", 41.99, 21.42, 10, null);

    [Fact]
    public async Task Create_WithPastDate_Throws()
    {
        using var h = new TestHarness();
        var org = h.AddUser();
        var sport = h.AddSport();
        var sut = CreateSut(h);

        var act = () => sut.CreateAsync(org.Id, NewEvent(sport.Id, DateTime.UtcNow.AddDays(-1)));

        await act.Should().ThrowAsync<ArgumentException>(); // FR-3.8
    }

    [Fact]
    public async Task Create_Valid_PersistsEventWithOpenStatus()
    {
        using var h = new TestHarness();
        var org = h.AddUser();
        var sport = h.AddSport();
        var sut = CreateSut(h);

        var result = await sut.CreateAsync(org.Id, NewEvent(sport.Id, DateTime.UtcNow.AddDays(5)));

        result.Status.Should().Be(EventStatus.Open.ToString()); // FR-3.5 default
        result.OrganizerId.Should().Be(org.Id);
    }

    [Fact]
    public async Task Update_ByNonOrganizer_Throws()
    {
        using var h = new TestHarness();
        var org = h.AddUser(email: "org@test.com");
        var stranger = h.AddUser(email: "stranger@test.com");
        var sport = h.AddSport();
        var evt = h.AddEvent(org.Id, sport.Id);
        var sut = CreateSut(h);

        var act = () => sut.UpdateAsync(stranger.Id, evt.Id,
            new UpdateEventRequest(sport.Id, "X", "d", DateTime.UtcNow.AddDays(4), 60, "addr", 41.9, 21.4, 8, null));

        await act.Should().ThrowAsync<UnauthorizedAccessException>(); // NFR-1.4 ownership
    }
}
