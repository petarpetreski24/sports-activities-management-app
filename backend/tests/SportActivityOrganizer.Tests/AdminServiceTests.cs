using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using SportActivityOrganizer.Application.Services;
using SportActivityOrganizer.Domain.Entities;
using SportActivityOrganizer.Domain.Enums;

namespace SportActivityOrganizer.Tests;

public class AdminServiceTests
{
    private static AdminService CreateSut(TestHarness h) => new(h.Uow, h.Mapper);

    [Fact]
    public async Task DeleteUser_SoftDeletes_PreservingTheRow()
    {
        using var h = new TestHarness();
        var user = h.AddUser(email: "victim@test.com");
        var sut = CreateSut(h);

        await sut.DeleteUserAsync(user.Id);

        // DBR-1.3: row must still exist, anonymized and deactivated (not removed)
        var reloaded = await h.Db.Set<User>().SingleAsync(u => u.Id == user.Id);
        reloaded.IsActive.Should().BeFalse();
        reloaded.Email.Should().NotBe("victim@test.com");
        reloaded.PasswordHash.Should().BeEmpty();
    }

    [Fact]
    public async Task DeleteUser_WhenTargetIsAdmin_Throws()
    {
        using var h = new TestHarness();
        var admin = h.AddUser(email: "admin@test.com", role: UserRole.Admin);
        var sut = CreateSut(h);

        var act = () => sut.DeleteUserAsync(admin.Id);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task DeactivateUser_SetsInactive()
    {
        using var h = new TestHarness();
        var user = h.AddUser(email: "user@test.com");
        var sut = CreateSut(h);

        await sut.DeactivateUserAsync(user.Id);

        var reloaded = await h.Db.Set<User>().SingleAsync(u => u.Id == user.Id);
        reloaded.IsActive.Should().BeFalse(); // FR-10.2
    }
}
