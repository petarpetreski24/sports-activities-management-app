using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using SportActivityOrganizer.Application.Services;
using SportActivityOrganizer.Domain.Enums;

namespace SportActivityOrganizer.Tests;

public class EventApplicationServiceTests
{
    private static EventApplicationService CreateSut(TestHarness h) =>
        new(h.Uow, h.Notifications.Object);

    [Fact]
    public async Task Apply_ToOwnEvent_Throws()
    {
        using var h = new TestHarness();
        var org = h.AddUser();
        var sport = h.AddSport();
        var evt = h.AddEvent(org.Id, sport.Id);
        var sut = CreateSut(h);

        var act = () => sut.ApplyAsync(org.Id, evt.Id);

        await act.Should().ThrowAsync<InvalidOperationException>(); // FR-5.7
    }

    [Fact]
    public async Task Apply_WhenActiveApplicationExists_Throws()
    {
        using var h = new TestHarness();
        var org = h.AddUser(email: "org@test.com");
        var applicant = h.AddUser(email: "applicant@test.com");
        var sport = h.AddSport();
        var evt = h.AddEvent(org.Id, sport.Id);
        h.AddApplication(evt.Id, applicant.Id, ApplicationStatus.Pending);
        var sut = CreateSut(h);

        var act = () => sut.ApplyAsync(applicant.Id, evt.Id);

        await act.Should().ThrowAsync<InvalidOperationException>(); // FR-5.8
    }

    [Fact]
    public async Task Approve_WhenMaxReached_SetsEventFull()
    {
        using var h = new TestHarness();
        var org = h.AddUser(email: "org@test.com");
        var u1 = h.AddUser(email: "u1@test.com");
        var sport = h.AddSport();
        var evt = h.AddEvent(org.Id, sport.Id, maxParticipants: 1); // single slot
        var app = h.AddApplication(evt.Id, u1.Id, ApplicationStatus.Pending);
        var sut = CreateSut(h);

        await sut.ApproveAsync(org.Id, app.Id);

        var reloaded = await h.Db.Set<Domain.Entities.SportEvent>().SingleAsync(e => e.Id == evt.Id);
        reloaded.Status.Should().Be(EventStatus.Full); // FR-3.6
    }

    [Fact]
    public async Task Cancel_ApprovedParticipant_OnFullEvent_RevertsToOpen()
    {
        using var h = new TestHarness();
        var org = h.AddUser(email: "org@test.com");
        var u1 = h.AddUser(email: "u1@test.com");
        var sport = h.AddSport();
        // event comfortably in the future (cancellation allowed up to 2h before)
        var evt = h.AddEvent(org.Id, sport.Id, status: EventStatus.Full, maxParticipants: 1,
            eventDate: DateTime.UtcNow.AddDays(2));
        var app = h.AddApplication(evt.Id, u1.Id, ApplicationStatus.Approved);
        var sut = CreateSut(h);

        await sut.CancelAsync(u1.Id, app.Id);

        var reloaded = await h.Db.Set<Domain.Entities.SportEvent>().SingleAsync(e => e.Id == evt.Id);
        reloaded.Status.Should().Be(EventStatus.Open); // FR-3.7
    }

    [Fact]
    public async Task Cancel_ApprovedParticipant_LessThan2HoursBefore_Throws()
    {
        using var h = new TestHarness();
        var org = h.AddUser(email: "org@test.com");
        var u1 = h.AddUser(email: "u1@test.com");
        var sport = h.AddSport();
        var evt = h.AddEvent(org.Id, sport.Id, status: EventStatus.Full, maxParticipants: 1,
            eventDate: DateTime.UtcNow.AddHours(1)); // starts in 1h
        var app = h.AddApplication(evt.Id, u1.Id, ApplicationStatus.Approved);
        var sut = CreateSut(h);

        var act = () => sut.CancelAsync(u1.Id, app.Id);

        await act.Should().ThrowAsync<InvalidOperationException>(); // FR-5.5
    }
}
