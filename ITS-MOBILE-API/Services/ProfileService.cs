using ITS_MOBILE_API.Data;
using ITS_MOBILE_API.Models;
using Microsoft.EntityFrameworkCore;

namespace ITS_MOBILE_API.Services;

public class ProfileService
{
    private readonly ItsDbContext _db;

    public ProfileService(ItsDbContext db)
    {
        _db = db;
    }

    public async Task<ProfileResponse?> GetProfile(string username)
    {
        var user = await _db.AbpUsers
            .FirstOrDefaultAsync(u => u.UserName == username);

        if (user == null) return null;

        var workerInfo = await _db.WorkerInfos
            .FirstOrDefaultAsync(w => w.UserId == user.Id && !w.IsDeleted);

        return new ProfileResponse(
            TenNhanVien: $"{user.Name} {user.Surname}",
            ChucVu: "Nhân viên vận hành hiện trường",
            DonVi: workerInfo != null ? "Đội vận hành" : "Chưa phân công",
            Extension: user.SipNumber ?? "N/A",
            Username: user.UserName
        );
    }

    public async Task<bool> UpdateProfile(string username, string? name)
    {
        if (string.IsNullOrEmpty(name)) return false;

        var user = await _db.AbpUsers.FirstOrDefaultAsync(u => u.UserName == username);
        if (user == null) return false;

        // Parse name: "FirstName LastName"
        var parts = name.Split(new[] { ' ' }, 2);
        if (parts.Length >= 1) user.Name = parts[0];
        if (parts.Length >= 2) user.Surname = parts[1];

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<ProfileService.PreferencesResponse> GetPreferences(string username)
    {
        // Read from ExtensionDetails table
        var user = await _db.AbpUsers.FirstOrDefaultAsync(u => u.UserName == username);
        if (user == null)
            return new PreferencesResponse("vi", "system", "streets");

        var userGuid = new Guid(user.Id.ToString("D32"));
        var prefs = new Dictionary<string, string>();
        var extensions = await _db.ExtensionDetails
            .Where(e => e.GuiId == userGuid && e.Key.StartsWith("pref_"))
            .ToListAsync();

        foreach (var ext in extensions)
        {
            prefs[ext.Key.Replace("pref_", "", StringComparison.Ordinal)] = ext.Value ?? "";
        }

        return new ProfileService.PreferencesResponse(
            Language: prefs.GetValueOrDefault("language", "vi"),
            Theme: prefs.GetValueOrDefault("theme", "system"),
            MapStyle: prefs.GetValueOrDefault("map_style", "streets")
        );
    }

    public async Task<bool> UpdatePreferences(string username, string? language, string? theme)
    {
        var user = await _db.AbpUsers.FirstOrDefaultAsync(u => u.UserName == username);
        if (user == null) return false;

        var userGuid = new Guid(user.Id.ToString("D32"));

        // Store preferences as ExtensionDetails
        var existing = await _db.ExtensionDetails
            .Where(e => e.GuiId == userGuid && e.Key.StartsWith("pref_"))
            .ToListAsync();

        foreach (var ext in existing)
            _db.ExtensionDetails.Remove(ext);

        var prefs = new Dictionary<string, string>();
        if (language != null) prefs["pref_language"] = language;
        if (theme != null) prefs["pref_theme"] = theme;
        prefs["pref_map_style"] = "streets"; // Default

        foreach (var (key, value) in prefs)
        {
            _db.ExtensionDetails.Add(new ExtensionDetail
            {
                Key = key,
                Value = value,
                GuiId = userGuid,
                CreationTime = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
        return true;
    }

    public record PreferencesResponse(string Language, string Theme, string MapStyle);
}
