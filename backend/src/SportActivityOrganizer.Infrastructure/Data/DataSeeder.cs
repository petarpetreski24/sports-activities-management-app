using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using SportActivityOrganizer.Domain.Entities;
using SportActivityOrganizer.Domain.Enums;

namespace SportActivityOrganizer.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Only seed if no events exist yet (avoid re-seeding)
        var eventCount = await context.SportEvents.CountAsync();
        if (eventCount > 0)
            return;

        var random = new Random(42); // Fixed seed for reproducible data
        var now = DateTime.UtcNow;

        // Compute BCrypt hash once — all seed users share this password
        var defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");

        // ========================= USERS =========================
        var users = CreateUsers(now, defaultPasswordHash);
        context.Users.AddRange(users);
        await context.SaveChangesAsync();

        // ========================= NOTIFICATION PREFERENCES =========================
        var notifPrefs = users.Select(u => new NotificationPreference
        {
            UserId = u.Id,
            CreatedAt = now,
            UpdatedAt = now
        }).ToList();
        context.NotificationPreferences.AddRange(notifPrefs);
        await context.SaveChangesAsync();

        // ========================= FAVORITE SPORTS =========================
        var favoriteSports = CreateFavoriteSports(users, random, now);
        context.Set<UserFavoriteSport>().AddRange(favoriteSports);
        await context.SaveChangesAsync();

        // ========================= EVENTS =========================
        var events = CreateEvents(users, random, now);
        context.SportEvents.AddRange(events);
        await context.SaveChangesAsync();

        // ========================= APPLICATIONS =========================
        var applications = CreateApplications(events, users, random, now);
        context.EventApplications.AddRange(applications);
        await context.SaveChangesAsync();

        // Update event statuses based on applications
        UpdateEventStatuses(events, applications, now);
        await context.SaveChangesAsync();

        // ========================= COMMENTS =========================
        var comments = CreateComments(events, users, random, now);
        context.EventComments.AddRange(comments);
        await context.SaveChangesAsync();

        // ========================= RATINGS =========================
        var ratings = CreateRatings(events, applications, random, now);
        context.EventRatings.AddRange(ratings);
        await context.SaveChangesAsync();

        // Update average ratings on events
        UpdateEventAvgRatings(events, ratings);
        await context.SaveChangesAsync();

        // ========================= NOTIFICATIONS =========================
        var notifications = CreateNotifications(events, applications, users, random, now);
        context.Notifications.AddRange(notifications);
        await context.SaveChangesAsync();
    }

    private static List<User> CreateUsers(DateTime now, string defaultPasswordHash)
    {
        var cities = new[]
        {
            ("Скопје", 41.9981m, 21.4254m),
            ("Битола", 41.0297m, 21.3292m),
            ("Охрид", 41.1231m, 20.8016m),
            ("Прилеп", 41.3449m, 21.5528m),
            ("Тетово", 41.7856m, 20.9715m),
            ("Куманово", 42.1322m, 21.7144m),
            ("Штип", 41.7358m, 22.1914m),
            ("Велес", 41.7153m, 21.7753m),
            ("Струмица", 41.4378m, 22.6427m),
            ("Гевгелија", 41.1408m, 22.5008m)
        };

        var firstNames = new[] { "Марко", "Стефан", "Никола", "Александар", "Давид", "Филип", "Андреј", "Дарко", "Иван", "Петар",
                                  "Ана", "Марија", "Елена", "Сара", "Јована", "Ива", "Мила", "Теа", "Лена", "Нина",
                                  "Горан", "Бојан", "Дејан", "Зоран", "Тони", "Кристијан", "Матеј", "Лука", "Борис", "Виктор" };
        var lastNames = new[] { "Петровски", "Стојановски", "Николовски", "Ивановски", "Димитровски",
                                 "Трајковски", "Ангеловски", "Јосифовски", "Георгиевски", "Миленковски",
                                 "Коцевска", "Наумовска", "Стефановска", "Павловска", "Велковска",
                                 "Тодоровска", "Мицковски", "Ристовски", "Попоски", "Крстевски",
                                 "Богдановски", "Спасовски", "Андоновски", "Атанасовски", "Василевски",
                                 "Симоновски", "Ѓорѓиевски", "Мановски", "Цветковски", "Илиевски" };

        var users = new List<User>();
        for (int i = 0; i < 30; i++)
        {
            var city = cities[i % cities.Length];
            var latOffset = (i * 0.005m) - 0.05m;
            var lngOffset = (i * 0.003m) - 0.04m;

            users.Add(new User
            {
                FirstName = firstNames[i],
                LastName = lastNames[i],
                Email = $"user{i + 1}@sportactivityorganizer.com",
                PasswordHash = defaultPasswordHash,
                Phone = $"+389 7{(i % 9) + 1} {100 + i * 3:000} {200 + i * 7:000}",
                Bio = $"Здраво! Јас сум {firstNames[i]} од {city.Item1}. Сакам спорт и активен живот.",
                LocationCity = city.Item1,
                LocationLat = city.Item2 + latOffset,
                LocationLng = city.Item3 + lngOffset,
                Role = UserRole.User,
                IsActive = true,
                EmailConfirmed = true,
                CreatedAt = now.AddDays(-random_days(i)),
                UpdatedAt = now
            });
        }

        return users;
    }

    private static int random_days(int i) => 30 + (i * 7) % 180;

    private static List<UserFavoriteSport> CreateFavoriteSports(List<User> users, Random random, DateTime now)
    {
        var favSports = new List<UserFavoriteSport>();
        var skillLevels = Enum.GetValues<SkillLevel>();

        foreach (var user in users)
        {
            // Each user gets 2-4 favorite sports
            var sportCount = random.Next(2, 5);
            var chosenSports = Enumerable.Range(1, 10).OrderBy(_ => random.Next()).Take(sportCount).ToList();

            foreach (var sportId in chosenSports)
            {
                favSports.Add(new UserFavoriteSport
                {
                    UserId = user.Id,
                    SportId = sportId,
                    SkillLevel = skillLevels[random.Next(skillLevels.Length)],
                    CreatedAt = now.AddDays(-random.Next(1, 60))
                });
            }
        }

        return favSports;
    }

    private static List<SportEvent> CreateEvents(List<User> users, Random random, DateTime now)
    {
        var events = new List<SportEvent>();
        var skillLevels = Enum.GetValues<SkillLevel>();

        // Location data for events across Macedonia
        var locations = new[]
        {
            ("Градски стадион Скопје", 42.0037m, 21.4092m),
            ("Спортска сала Јане Сандански, Скопје", 41.9920m, 21.4310m),
            ("Градски парк Скопје", 41.9947m, 21.4354m),
            ("Фудбалски терен Аеродром, Скопје", 41.9771m, 21.4534m),
            ("СРЦ Кале, Скопје", 42.0000m, 21.4300m),
            ("Тениски клуб Скопје", 41.9890m, 21.4500m),
            ("Базен Скопје, Скопје", 41.9950m, 21.4200m),
            ("Градски парк Битола", 41.0310m, 21.3350m),
            ("Спортска сала Битола", 41.0280m, 21.3400m),
            ("Охридско езеро плажа", 41.1150m, 20.7980m),
            ("Спортски центар Охрид", 41.1200m, 20.8100m),
            ("Градски стадион Прилеп", 41.3500m, 21.5500m),
            ("Спортска сала Тетово", 41.7900m, 20.9700m),
            ("Градски стадион Куманово", 42.1350m, 21.7100m),
            ("Спортски центар Штип", 41.7400m, 22.1950m),
            ("Градски парк Велес", 41.7200m, 21.7800m),
            ("Спортска сала Струмица", 41.4400m, 22.6400m),
            ("Спортски терен Гевгелија", 41.1420m, 22.5050m),
            ("Парк Жена борец, Скопје", 42.0020m, 21.4210m),
            ("Маратонска патека Водно, Скопје", 41.9700m, 21.3900m)
        };

        var eventTitles = new Dictionary<int, string[]>
        {
            { 1, new[] { "Фудбал на мали голови", "Пријателски фудбалски меч", "Ноќен фудбал", "Фудбал 5 на 5", "Недела фудбал" } },
            { 2, new[] { "Кошарка 3 на 3", "Кошаркарски турнир", "Кошарка за аматери", "Утро кошарка", "Streetball натпревар" } },
            { 3, new[] { "Одбојка на песок", "Одбојка во сала", "Мешан одбојкарски меч", "Одбојка за почетници", "Одбојкарски турнир" } },
            { 4, new[] { "Тениски дуел", "Тенис за почетници", "Тениски турнир", "Двојки тенис", "Вечерен тенис" } },
            { 5, new[] { "Пинг-понг натпревар", "Пинг-понг лига", "Пинг-понг за забава", "Пинг-понг турнир", "Пинг-понг дуел" } },
            { 6, new[] { "Ракометен меч", "Ракомет на плажа", "Ракомет за аматери", "Ракометен турнир", "Пријателски ракомет" } },
            { 7, new[] { "Пливање во базен", "Отворено пливање", "Пливачки тренинг", "Пливање за почетници", "Аква фитнес" } },
            { 8, new[] { "Утринско трчање", "Трчање во парк", "5К трка", "Трчање по Водно", "Вечерно трчање" } },
            { 9, new[] { "Велосипедска тура", "Планински велосипедизам", "Велосипедска авантура", "Градски велосипедизам", "Утринско возење" } },
            { 10, new[] { "Бадминтон дуел", "Бадминтон за почетници", "Бадминтон турнир", "Двојки бадминтон", "Бадминтон тренинг" } }
        };

        // Create 85 events
        for (int i = 0; i < 85; i++)
        {
            var organizer = users[random.Next(users.Count)];
            var sportId = (i % 10) + 1;
            var location = locations[i % locations.Length];
            var titles = eventTitles[sportId];
            var title = titles[i % titles.Length];

            // Mix of past (completed) and future events
            DateTime eventDate;
            EventStatus status;

            if (i < 35)
            {
                // Past completed events
                eventDate = now.AddDays(-random.Next(1, 90)).AddHours(random.Next(8, 20));
                status = EventStatus.Completed;
            }
            else if (i < 45)
            {
                // Past cancelled events
                eventDate = now.AddDays(-random.Next(1, 60)).AddHours(random.Next(8, 20));
                status = EventStatus.Cancelled;
            }
            else
            {
                // Future open events
                eventDate = now.AddDays(random.Next(1, 45)).AddHours(random.Next(8, 20));
                status = EventStatus.Open;
            }

            var latOffset = (decimal)(random.NextDouble() * 0.01 - 0.005);
            var lngOffset = (decimal)(random.NextDouble() * 0.01 - 0.005);

            events.Add(new SportEvent
            {
                OrganizerId = organizer.Id,
                SportId = sportId,
                Title = $"{title} #{i + 1}",
                Description = $"Придружете ни се на {title.ToLower()}! Ве очекуваме на {location.Item1}. Донесете спортска опрема и добро расположение!",
                EventDate = eventDate,
                DurationMinutes = new[] { 60, 90, 120, 150 }[random.Next(4)],
                LocationAddress = location.Item1,
                LocationLat = location.Item2 + latOffset,
                LocationLng = location.Item3 + lngOffset,
                MaxParticipants = new[] { 6, 8, 10, 12, 16, 20 }[random.Next(6)],
                MinSkillLevel = random.Next(3) == 0 ? skillLevels[random.Next(skillLevels.Length)] : null,
                Status = status,
                CreatedAt = eventDate.AddDays(-random.Next(3, 14)),
                UpdatedAt = now
            });
        }

        return events;
    }

    private static List<EventApplication> CreateApplications(List<SportEvent> events, List<User> users, Random random, DateTime now)
    {
        var applications = new List<EventApplication>();

        foreach (var evt in events)
        {
            if (evt.Status == EventStatus.Cancelled && random.Next(3) > 0)
                continue;

            // Each event gets 2-8 applications
            var applicantCount = random.Next(2, Math.Min(9, evt.MaxParticipants + 2));
            var possibleApplicants = users.Where(u => u.Id != evt.OrganizerId).OrderBy(_ => random.Next()).Take(applicantCount).ToList();

            foreach (var applicant in possibleApplicants)
            {
                ApplicationStatus appStatus;
                DateTime? resolvedAt = null;

                if (evt.Status == EventStatus.Completed)
                {
                    // Most are approved for completed events
                    appStatus = random.Next(5) == 0 ? ApplicationStatus.Rejected : ApplicationStatus.Approved;
                    resolvedAt = evt.CreatedAt.AddDays(1);
                }
                else if (evt.Status == EventStatus.Cancelled)
                {
                    appStatus = ApplicationStatus.Cancelled;
                    resolvedAt = evt.UpdatedAt;
                }
                else
                {
                    // Future events: mix of pending and approved
                    appStatus = random.Next(3) == 0 ? ApplicationStatus.Pending : ApplicationStatus.Approved;
                    if (appStatus == ApplicationStatus.Approved)
                        resolvedAt = evt.CreatedAt.AddHours(random.Next(2, 48));
                }

                applications.Add(new EventApplication
                {
                    EventId = evt.Id,
                    UserId = applicant.Id,
                    Status = appStatus,
                    AppliedAt = evt.CreatedAt.AddHours(random.Next(1, 72)),
                    ResolvedAt = resolvedAt,
                    CreatedAt = evt.CreatedAt.AddHours(random.Next(1, 72)),
                    UpdatedAt = now
                });
            }
        }

        return applications;
    }

    private static void UpdateEventStatuses(List<SportEvent> events, List<EventApplication> applications, DateTime now)
    {
        foreach (var evt in events.Where(e => e.Status == EventStatus.Open))
        {
            var approvedCount = applications.Count(a => a.EventId == evt.Id && a.Status == ApplicationStatus.Approved);
            if (approvedCount >= evt.MaxParticipants)
            {
                evt.Status = EventStatus.Full;
                evt.UpdatedAt = now;
            }
        }
    }

    private static List<EventComment> CreateComments(List<SportEvent> events, List<User> users, Random random, DateTime now)
    {
        var comments = new List<EventComment>();
        var commentTexts = new[]
        {
            "Одличен настан, се гледаме!",
            "Дали има место за уште еден?",
            "Ќе дојдам со пријател, може ли?",
            "Супер организација, браво!",
            "Кое ниво е потребно?",
            "Дали има паркинг во близина?",
            "Се надевам дека ќе биде сончево!",
            "Ве молам споделете ја точната локација",
            "Одлично беше! Се гледаме следниот пат!",
            "Многу добро ја поминавме!",
            "Кога ќе биде следниот настан?",
            "Може ли да се пријавам?",
            "Ги носам своите ракети",
            "Топката ја носам јас",
            "Има ли соблекувална на теренот?",
            "Колку струја ќе биде?",
            "Совршено беше, фала!",
            "Организирај повторно, ве молам!",
            "Дали може да дојдам малку подоцна?",
            "Ќе донесам вода за сите"
        };

        foreach (var evt in events)
        {
            var commentCount = random.Next(0, 5);
            var commenters = users.OrderBy(_ => random.Next()).Take(commentCount).ToList();

            foreach (var commenter in commenters)
            {
                comments.Add(new EventComment
                {
                    EventId = evt.Id,
                    UserId = commenter.Id,
                    Content = commentTexts[random.Next(commentTexts.Length)],
                    IsDeleted = false,
                    CreatedAt = evt.CreatedAt.AddHours(random.Next(1, 168))
                });
            }
        }

        return comments;
    }

    private static List<EventRating> CreateRatings(List<SportEvent> events, List<EventApplication> applications, Random random, DateTime now)
    {
        var ratings = new List<EventRating>();
        var ratingComments = new[]
        {
            "Одличен настан!", "Многу добра организација!", "Беше забавно!",
            "Солидно, но може подобро", "Супер атмосфера!", "Ќе дојдам повторно!",
            "Добро организирано", "Можеше подобро", "Топ!", "Фантастично искуство!"
        };

        var completedEvents = events.Where(e => e.Status == EventStatus.Completed).ToList();

        foreach (var evt in completedEvents)
        {
            var eventApps = applications
                .Where(a => a.EventId == evt.Id && a.Status == ApplicationStatus.Approved)
                .ToList();

            // Some approved participants rate the event
            foreach (var app in eventApps)
            {
                if (random.Next(2) == 0) // 50% chance of rating
                {
                    ratings.Add(new EventRating
                    {
                        EventId = evt.Id,
                        ReviewerId = app.UserId,
                        Rating = random.Next(3, 6), // 3-5 rating
                        Comment = random.Next(3) == 0 ? ratingComments[random.Next(ratingComments.Length)] : null,
                        CreatedAt = evt.EventDate.AddHours(random.Next(2, 72))
                    });
                }
            }
        }

        return ratings;
    }

    private static void UpdateEventAvgRatings(List<SportEvent> events, List<EventRating> ratings)
    {
        foreach (var evt in events)
        {
            var eventRatings = ratings.Where(r => r.EventId == evt.Id).ToList();
            if (eventRatings.Count > 0)
            {
                evt.AvgRating = (decimal)eventRatings.Average(r => r.Rating);
            }
        }
    }

    private static List<Notification> CreateNotifications(List<SportEvent> events, List<EventApplication> applications, List<User> users, Random random, DateTime now)
    {
        var notifications = new List<Notification>();

        // Create some recent notifications for various users
        var recentEvents = events.OrderByDescending(e => e.CreatedAt).Take(20).ToList();

        foreach (var evt in recentEvents)
        {
            var eventApps = applications.Where(a => a.EventId == evt.Id).Take(3).ToList();

            foreach (var app in eventApps)
            {
                if (app.Status == ApplicationStatus.Approved)
                {
                    notifications.Add(new Notification
                    {
                        UserId = app.UserId,
                        Type = NotificationType.ApplicationApproved,
                        Title = "Апликација одобрена",
                        Message = $"Вашата апликација за \"{evt.Title}\" е одобрена!",
                        ReferenceEventId = evt.Id,
                        IsRead = random.Next(2) == 0,
                        CreatedAt = app.ResolvedAt ?? now.AddDays(-random.Next(1, 7))
                    });
                }

                // Notify organizer about application
                notifications.Add(new Notification
                {
                    UserId = evt.OrganizerId,
                    Type = NotificationType.ApplicationReceived,
                    Title = "Нова апликација",
                    Message = $"Нова апликација за настанот \"{evt.Title}\".",
                    ReferenceEventId = evt.Id,
                    IsRead = random.Next(2) == 0,
                    CreatedAt = app.AppliedAt
                });
            }
        }

        return notifications;
    }
}
