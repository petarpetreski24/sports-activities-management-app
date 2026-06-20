using FluentAssertions;
using SportActivityOrganizer.Application.DTOs.Comments;
using SportActivityOrganizer.Application.Services;
using SportActivityOrganizer.Domain.Enums;

namespace SportActivityOrganizer.Tests;

public class CommentServiceTests
{
    private static CommentService CreateSut(TestHarness h) =>
        new(h.Uow, h.Mapper, h.Notifications.Object);

    [Fact]
    public async Task GetComments_AsPendingApplicant_Throws()
    {
        using var h = new TestHarness();
        var org = h.AddUser(email: "org@test.com");
        var pending = h.AddUser(email: "pending@test.com");
        var sport = h.AddSport();
        var evt = h.AddEvent(org.Id, sport.Id);
        h.AddApplication(evt.Id, pending.Id, ApplicationStatus.Pending);
        var sut = CreateSut(h);

        var act = () => sut.GetEventCommentsAsync(pending.Id, evt.Id, isAdmin: false);

        await act.Should().ThrowAsync<UnauthorizedAccessException>(); // FR-6.5
    }

    [Fact]
    public async Task GetComments_AsApprovedParticipant_Succeeds()
    {
        using var h = new TestHarness();
        var org = h.AddUser(email: "org@test.com");
        var member = h.AddUser(email: "member@test.com");
        var sport = h.AddSport();
        var evt = h.AddEvent(org.Id, sport.Id);
        h.AddApplication(evt.Id, member.Id, ApplicationStatus.Approved);
        var sut = CreateSut(h);

        var comments = await sut.GetEventCommentsAsync(member.Id, evt.Id, isAdmin: false);

        comments.Should().NotBeNull();
    }

    [Fact]
    public async Task GetComments_AsAdmin_Succeeds()
    {
        using var h = new TestHarness();
        var org = h.AddUser(email: "org@test.com");
        var admin = h.AddUser(email: "admin@test.com", role: UserRole.Admin);
        var sport = h.AddSport();
        var evt = h.AddEvent(org.Id, sport.Id);
        var sut = CreateSut(h);

        var comments = await sut.GetEventCommentsAsync(admin.Id, evt.Id, isAdmin: true);

        comments.Should().NotBeNull(); // admins moderate
    }

    [Fact]
    public async Task Create_AsNonParticipant_Throws()
    {
        using var h = new TestHarness();
        var org = h.AddUser(email: "org@test.com");
        var outsider = h.AddUser(email: "outsider@test.com");
        var sport = h.AddSport();
        var evt = h.AddEvent(org.Id, sport.Id);
        var sut = CreateSut(h);

        var act = () => sut.CreateAsync(outsider.Id, evt.Id, new CreateCommentRequest("hi"));

        await act.Should().ThrowAsync<UnauthorizedAccessException>(); // FR-6.2
    }
}
