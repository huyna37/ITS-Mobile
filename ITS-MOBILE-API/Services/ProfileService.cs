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

    public async Task<ProfileResponse?> GetProfile(string identifier, string? extensionClaim = null)
    {
        long.TryParse(identifier, out var userId);

        var user = await _db.AbpUsers
            .FirstOrDefaultAsync(u => (userId > 0 && u.Id == userId) || u.UserName == identifier || u.EmailAddress == identifier);

        if (user == null) return null;

        var userRole = await _db.AbpUserRoles
            .Include(ur => ur.Role)
            .FirstOrDefaultAsync(ur => ur.UserId == user.Id);
        var role = userRole?.Role?.NormalizedName ?? "USER";

        var workerInfo = await _db.WorkerInfos
            .FirstOrDefaultAsync(w => w.UserId == user.Id && !w.IsDeleted);

        var chucVu = role switch
        {
            "ADMIN" => "Quản trị viên",
            "SUPERADMIN" => "Quản trị hệ thống",
            _ => "Nhân viên vận hành hiện trường"
        };

        var donVi = workerInfo != null 
            ? "Đội vận hành" 
            : (role.Contains("ADMIN") ? "Quản trị hệ thống" : "Đội vận hành");

        var extension = !string.IsNullOrEmpty(user.SipNumber)
            ? user.SipNumber
            : (!string.IsNullOrEmpty(extensionClaim) ? extensionClaim : "1001");

        return new ProfileResponse(
            TenNhanVien: $"{user.Name} {user.Surname}".Trim(),
            ChucVu: chucVu,
            DonVi: donVi,
            Extension: extension,
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
            .Where(e => e.GuiId == userGuid && e.Key != null && e.Key.StartsWith("pref_"))
            .ToListAsync();

        foreach (var ext in extensions)
        {
            if (ext.Key != null)
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
            .Where(e => e.GuiId == userGuid && e.Key != null && e.Key.StartsWith("pref_"))
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
