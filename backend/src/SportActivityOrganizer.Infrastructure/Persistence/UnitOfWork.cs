using SportActivityOrganizer.Application.Interfaces.Persistence;
using SportActivityOrganizer.Domain.Entities;
using SportActivityOrganizer.Infrastructure.Data;

namespace SportActivityOrganizer.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    private IRepository<User>? _users;
    private IRepository<Sport>? _sports;
    private IRepository<SportEvent>? _sportEvents;
    private IRepository<EventApplication>? _eventApplications;
    private IRepository<EventComment>? _eventComments;
    private IRepository<EventRating>? _eventRatings;
    private IRepository<ParticipantRating>? _participantRatings;
    private IRepository<Notification>? _notifications;
    private IRepository<NotificationPreference>? _notificationPreferences;
    private IRepository<UserFavoriteSport>? _userFavoriteSports;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    public IRepository<User> Users => _users ??= new GenericRepository<User>(_context);
    public IRepository<Sport> Sports => _sports ??= new GenericRepository<Sport>(_context);
    public IRepository<SportEvent> SportEvents => _sportEvents ??= new GenericRepository<SportEvent>(_context);
    public IRepository<EventApplication> EventApplications => _eventApplications ??= new GenericRepository<EventApplication>(_context);
    public IRepository<EventComment> EventComments => _eventComments ??= new GenericRepository<EventComment>(_context);
    public IRepository<EventRating> EventRatings => _eventRatings ??= new GenericRepository<EventRating>(_context);
    public IRepository<ParticipantRating> ParticipantRatings => _participantRatings ??= new GenericRepository<ParticipantRating>(_context);
    public IRepository<Notification> Notifications => _notifications ??= new GenericRepository<Notification>(_context);
    public IRepository<NotificationPreference> NotificationPreferences => _notificationPreferences ??= new GenericRepository<NotificationPreference>(_context);
    public IRepository<UserFavoriteSport> UserFavoriteSports => _userFavoriteSports ??= new GenericRepository<UserFavoriteSport>(_context);

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        => await _context.SaveChangesAsync(ct);

    public void Dispose() => _context.Dispose();
}
