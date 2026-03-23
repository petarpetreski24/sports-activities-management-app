using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using SportActivityOrganizer.Application.Interfaces;

namespace SportActivityOrganizer.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.sendgrid.net";
        var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
        var fromEmail = _configuration["Email:FromEmail"] ?? "noreply@sportactivityorganizer.com";
        var fromName = _configuration["Email:FromName"] ?? "EkipAY";
        var smtpUsername = _configuration["Email:SmtpUsername"];
        var smtpPassword = _configuration["Email:SmtpPassword"];

        using var client = new SmtpClient(smtpHost, smtpPort);

        if (!string.IsNullOrEmpty(smtpUsername) && !string.IsNullOrEmpty(smtpPassword))
        {
            client.Credentials = new NetworkCredential(smtpUsername, smtpPassword);
        }

        var enableSsl = bool.Parse(_configuration["Email:EnableSsl"] ?? "true");
        client.EnableSsl = enableSsl;

        var mailMessage = new MailMessage
        {
            From = new MailAddress(fromEmail, fromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };

        mailMessage.To.Add(to);

        await client.SendMailAsync(mailMessage);
    }

    public async Task SendEmailConfirmationAsync(string to, string token)
    {
        var baseUrl = _configuration["App:BaseUrl"] ?? "http://localhost:5000";
        var confirmationLink = $"{baseUrl}/api/auth/confirm-email?token={token}";

        var subject = "Потврдете ја вашата е-пошта - EkipAY";
        var htmlBody = BuildEmailTemplate(
            "Добредојдовте на EkipAY! 🏆",
            $@"
                <p style='color: #475569; font-size: 16px; line-height: 1.7;'>
                    Ви благодариме што се регистриравте! Потврдете ја вашата е-пошта со кликнување на копчето подолу:
                </p>
                <div style='text-align: center; margin: 32px 0;'>
                    <a href='{confirmationLink}'
                       style='display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #1a56db, #059669);
                              color: white; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px;
                              box-shadow: 0 4px 15px rgba(26,86,219,0.3);'>
                        Потврди е-пошта
                    </a>
                </div>
                <p style='color: #94a3b8; font-size: 13px;'>
                    Доколку не сте го креирале овој профил, слободно игнорирајте ја оваа порака.
                </p>
                <p style='color: #94a3b8; font-size: 12px;'>Линкот истекува за 24 часа.</p>"
        );

        await SendEmailAsync(to, subject, htmlBody);
    }

    public async Task SendPasswordResetAsync(string to, string token)
    {
        var baseUrl = _configuration["App:FrontendUrl"] ?? _configuration["App:BaseUrl"] ?? "http://localhost:5173";
        var resetLink = $"{baseUrl}/reset-password?token={token}";

        var subject = "Ресетирање на лозинка - EkipAY";
        var htmlBody = BuildEmailTemplate(
            "Ресетирање на лозинка 🔑",
            $@"
                <p style='color: #475569; font-size: 16px; line-height: 1.7;'>
                    Побаравте ресетирање на вашата лозинка. Кликнете на копчето подолу за да поставите нова лозинка:
                </p>
                <div style='text-align: center; margin: 32px 0;'>
                    <a href='{resetLink}'
                       style='display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #1a56db, #059669);
                              color: white; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px;
                              box-shadow: 0 4px 15px rgba(26,86,219,0.3);'>
                        Ресетирај лозинка
                    </a>
                </div>
                <p style='color: #94a3b8; font-size: 13px;'>
                    Доколку не сте го побарале ова, слободно игнорирајте ја оваа порака. Вашата лозинка нема да се промени.
                </p>
                <p style='color: #94a3b8; font-size: 12px;'>Линкот истекува за 1 час.</p>"
        );

        await SendEmailAsync(to, subject, htmlBody);
    }

    public async Task SendNotificationEmailAsync(string to, string subject, string message)
    {
        var htmlBody = BuildEmailTemplate(
            subject,
            $@"
                <p style='color: #475569; font-size: 16px; line-height: 1.7;'>{message}</p>
                <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;' />
                <p style='color: #94a3b8; font-size: 12px;'>
                    Ја добивте оваа порака поради вашите поставки за известувања.
                    Можете да ги промените поставките во апликацијата.
                </p>"
        );

        await SendEmailAsync(to, $"{subject} - EkipAY", htmlBody);
    }

    private static string BuildEmailTemplate(string heading, string bodyContent)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8' />
    <meta name='viewport' content='width=device-width, initial-scale=1.0' />
</head>
<body style='margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, ""Helvetica Neue"", Arial, sans-serif;'>
    <table role='presentation' cellpadding='0' cellspacing='0' width='100%' style='background-color: #f1f5f9;'>
        <tr>
            <td align='center' style='padding: 40px 20px;'>
                <table role='presentation' cellpadding='0' cellspacing='0' width='600' style='max-width: 600px; width: 100%;'>
                    <!-- Header -->
                    <tr>
                        <td align='center' style='padding: 0 0 32px 0;'>
                            <div style='display: inline-flex; align-items: center; gap: 12px;'>
                                <div style='width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #1a56db, #059669);
                                            display: inline-block; text-align: center; line-height: 44px; font-size: 20px; color: white;'>
                                    &#9917;
                                </div>
                                <span style='font-size: 28px; font-weight: 800; color: #1e293b; letter-spacing: -0.02em;'>EkipAY</span>
                            </div>
                        </td>
                    </tr>
                    <!-- Body Card -->
                    <tr>
                        <td>
                            <div style='background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.06);
                                        border: 1px solid #e2e8f0;'>
                                <h1 style='margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1e293b;'>{heading}</h1>
                                {bodyContent}
                            </div>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td align='center' style='padding: 32px 0 0 0;'>
                            <p style='color: #94a3b8; font-size: 12px; margin: 0;'>
                                &copy; 2026 EkipAY. Сите права се задржани.
                            </p>
                            <p style='color: #cbd5e1; font-size: 11px; margin: 8px 0 0 0;'>
                                Најди тим. Играј. Победи.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }
}
