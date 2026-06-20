using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using SportActivityOrganizer.Application.DTOs.Auth;
using SportActivityOrganizer.Application.Services;
using SportActivityOrganizer.Domain.Entities;

namespace SportActivityOrganizer.Tests;

public class AuthServiceTests
{
    private static AuthService CreateSut(TestHarness h) =>
        new(h.Uow, h.Tokens.Object, h.Email.Object, h.Mapper);

    [Theory]
    [InlineData("short1A")]      // < 8 chars
    [InlineData("alllowercase1")] // no uppercase
    [InlineData("NoDigitsHere")]  // no digit
    public async Task Register_WithWeakPassword_Throws(string password)
    {
        using var h = new TestHarness();
        var sut = CreateSut(h);

        var act = () => sut.RegisterAsync(new RegisterRequest("A", "B", "new@test.com", password));

        await act.Should().ThrowAsync<ArgumentException>(); // FR-1.5
    }

    [Fact]
    public async Task Register_Valid_CreatesUnconfirmedUser_AndSendsConfirmationEmail()
    {
        using var h = new TestHarness();
        var sut = CreateSut(h);

        var result = await sut.RegisterAsync(new RegisterRequest("A", "B", "New@Test.com", "Password123"));

        result.Email.Should().Be("new@test.com"); // stored lowercased
        var user = await h.Db.Set<User>().SingleAsync(u => u.Email == "new@test.com");
        user.EmailConfirmed.Should().BeFalse();           // FR-1.6 — must confirm before login
        user.RefreshToken.Should().BeNull();              // FR-1.6 — no session issued at registration
        h.Email.Verify(e => e.SendEmailConfirmationAsync("new@test.com", It.IsAny<string>()), Times.Once);
    }

    [Fact]
    public async Task Register_DuplicateEmail_Throws()
    {
        using var h = new TestHarness();
        h.AddUser(email: "dupe@test.com");
        var sut = CreateSut(h);

        var act = () => sut.RegisterAsync(new RegisterRequest("A", "B", "dupe@test.com", "Password123"));

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task Login_WithUnconfirmedEmail_Throws()
    {
        using var h = new TestHarness();
        h.AddUser(email: "pending@test.com", emailConfirmed: false, password: "Password123");
        var sut = CreateSut(h);

        var act = () => sut.LoginAsync(new LoginRequest("pending@test.com", "Password123"));

        await act.Should().ThrowAsync<InvalidOperationException>(); // FR-1.6
    }

    [Fact]
    public async Task Login_WithValidConfirmedUser_ReturnsTokens()
    {
        using var h = new TestHarness();
        h.AddUser(email: "ok@test.com", emailConfirmed: true, password: "Password123");
        var sut = CreateSut(h);

        var result = await sut.LoginAsync(new LoginRequest("ok@test.com", "Password123"));

        result.AccessToken.Should().Be("access-token");
        result.RefreshToken.Should().Be("refresh-token");
    }

    [Fact]
    public async Task Login_WithWrongPassword_Throws()
    {
        using var h = new TestHarness();
        h.AddUser(email: "ok@test.com", password: "Password123");
        var sut = CreateSut(h);

        var act = () => sut.LoginAsync(new LoginRequest("ok@test.com", "WrongPass123"));

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }
}
