namespace SportActivityOrganizer.Application.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string htmlBody);
    Task SendEmailConfirmationAsync(string to, string token);
    Task SendPasswordResetAsync(string to, string token);
    Task SendNotificationEmailAsync(string to, string subject, string message);
}
