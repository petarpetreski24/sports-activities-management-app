namespace SportActivityOrganizer.Application.DTOs.Reports;

public record CreateReportRequest(
    int? ReportedUserId,
    int? ReportedEventId,
    int? ReportedCommentId,
    string Reason,
    string? Description
);

public record ReportDto(
    int Id,
    int ReporterId,
    string ReporterName,
    int? ReportedUserId,
    string? ReportedUserName,
    int? ReportedEventId,
    string? ReportedEventTitle,
    int? ReportedCommentId,
    string Reason,
    string? Description,
    string Status,
    string? AdminNotes,
    DateTime CreatedAt,
    DateTime? ResolvedAt
);

public record ResolveReportRequest(
    string Status,
    string? AdminNotes
);
