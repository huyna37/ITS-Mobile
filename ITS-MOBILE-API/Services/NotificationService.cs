using ITS_MOBILE_API.Data;
using ITS_MOBILE_API.Models;
using Microsoft.EntityFrameworkCore;

namespace ITS_MOBILE_API.Services;

public class NotificationService
{
    private readonly ItsDbContext _db;

    public NotificationService(ItsDbContext db)
    {
        _db = db;
    }

    public async Task<List<NotificationResponse>> GetNotifications()
    {
        var notifications = await _db.AbpNotifications
            .OrderByDescending(n => n.CreationTime)
            .Take(20)
            .ToListAsync();

        return notifications.Select(n => new NotificationResponse(
            Id: n.Id.ToString(),
            Title: n.NotificationName,
            Desc: ParseData(n.Data),
            Time: n.CreationTime.ToString("HH:mm"),
            Unread: false
        )).ToList();
    }

    public async Task<int> GetUnreadCount(string username)
    {
        var user = await _db.AbpUsers.FirstOrDefaultAsync(u => u.UserName == username);
        if (user == null) return 0;

        var count = await _db.AbpUserNotifications
            .CountAsync(n => n.UserId == user.Id && n.State == 0);

        return count;
    }

    public async Task<bool> MarkRead(string notificationId, string username)
    {
        var user = await _db.AbpUsers.FirstOrDefaultAsync(u => u.UserName == username);
        if (user == null) return false;

        if (!Guid.TryParse(notificationId, out var notifGuid)) return false;

        var notification = await _db.AbpUserNotifications
            .FirstOrDefaultAsync(n => n.UserId == user.Id && n.Id == notifGuid);

        if (notification == null) return false;

        notification.State = 1; // Read
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkUnread(string notificationId, string username)
    {
        var user = await _db.AbpUsers.FirstOrDefaultAsync(u => u.UserName == username);
        if (user == null) return false;

        if (!Guid.TryParse(notificationId, out var notifGuid)) return false;

        var notification = await _db.AbpUserNotifications
            .FirstOrDefaultAsync(n => n.UserId == user.Id && n.Id == notifGuid);

        if (notification == null) return false;

        notification.State = 0; // Unread
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkAllRead(string username)
    {
        var user = await _db.AbpUsers.FirstOrDefaultAsync(u => u.UserName == username);
        if (user == null) return false;

        var notifications = await _db.AbpUserNotifications
            .Where(n => n.UserId == user.Id && n.State == 0)
            .ToListAsync();

        foreach (var notification in notifications)
        {
            notification.State = 1; // Read
        }

        await _db.SaveChangesAsync();
        return notifications.Count > 0;
    }

    public async Task<bool> DeleteNotification(string notificationId, string username)
    {
        var user = await _db.AbpUsers.FirstOrDefaultAsync(u => u.UserName == username);
        if (user == null) return false;

        if (!Guid.TryParse(notificationId, out var notifGuid)) return false;

        var notification = await _db.AbpUserNotifications
            .FirstOrDefaultAsync(n => n.UserId == user.Id && n.Id == notifGuid);

        if (notification == null) return false;

        _db.AbpUserNotifications.Remove(notification);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RegisterPushToken(string username, string token, string platform)
    {
        var user = await _db.AbpUsers.FirstOrDefaultAsync(u => u.UserName == username);
        if (user == null) return false;

        // Use ExtensionDetails table to store push tokens per user
        var existing = await _db.ExtensionDetails
            .FirstOrDefaultAsync(e => 
                e.Key == "_push_token" && 
                e.GuiId == new Guid(user.Id.ToString("D32")));

        if (existing != null)
        {
            existing.Value = token;
        }
        else
        {
            _db.ExtensionDetails.Add(new ExtensionDetail
            {
                Key = "_push_token",
                Value = token,
                GuiId = new Guid(user.Id.ToString("D32")),
                CreationTime = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UnregisterPushToken(string username, string token)
    {
        var user = await _db.AbpUsers.FirstOrDefaultAsync(u => u.UserName == username);
        if (user == null) return false;

        var extension = await _db.ExtensionDetails
            .FirstOrDefaultAsync(e => 
                e.Key == "_push_token" && 
                e.GuiId == new Guid(user.Id.ToString("D32")));

        if (extension != null)
        {
            _db.ExtensionDetails.Remove(extension);
            await _db.SaveChangesAsync();
            return true;
        }

        return false;
    }

    private string ParseData(string? data)
    {
        if (string.IsNullOrEmpty(data)) return "Thông báo hệ thống";
        try
        {
            var json = System.Text.Json.JsonDocument.Parse(data);
            return json.RootElement.TryGetProperty("en", out var en) ? en.GetString() ?? data : data;
        }
        catch
        {
            return data;
        }
    }
}
