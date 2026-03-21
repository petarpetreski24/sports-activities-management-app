using SportActivityOrganizer.Application.DTOs.Comments;

namespace SportActivityOrganizer.Application.Interfaces;

public interface ICommentService
{
    Task<List<EventCommentDto>> GetEventCommentsAsync(int userId, int eventId);
    Task<EventCommentDto> CreateAsync(int userId, int eventId, CreateCommentRequest request);
    Task DeleteAsync(int userId, int commentId, bool isAdmin);
}
