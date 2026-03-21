namespace SportActivityOrganizer.Application.DTOs.Comments;

public record EventCommentDto(
    int Id,
    int EventId,
    int UserId,
    string UserName,
    string? UserPhotoUrl,
    string Content,
    DateTime CreatedAt);
