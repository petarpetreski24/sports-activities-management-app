using SportActivityOrganizer.Domain.Entities;

namespace SportActivityOrganizer.Application.Interfaces.Persistence;

public interface IUnitOfWork : IDisposable
{
    IRepository<User> Users { get; }
    IRepository<Sport> Sports { get; }
    IRepository<SportEvent> SportEvents { get; }
    IRepository<EventApplication> EventApplications { get; }
    IRepository<EventComment> EventComments { get; }
    IRepository<EventRating> EventRatings { get; }
    IRepository<ParticipantRating> ParticipantRatings { get; }
    IRepository<Notification> Notifications { get; }
    IRepository<NotificationPreference> NotificationPreferences { get; }
    IRepository<UserFavoriteSport> UserFavoriteSports { get; }
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
