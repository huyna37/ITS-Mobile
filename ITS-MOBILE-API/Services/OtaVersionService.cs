using ITS_MOBILE_API.Data;
using ITS_MOBILE_API.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ITS_MOBILE_API.Services;

public class OtaVersionService
{
    private readonly ItsDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<OtaVersionService> _logger;

    public OtaVersionService(ItsDbContext db, IWebHostEnvironment env, ILogger<OtaVersionService> logger)
    {
        _db = db;
        _env = env;
        _logger = logger;
    }

    /// <summary>
    /// Đảm bảo bảng dbo.AppVersions tồn tại trong Database và tự động nạp phiên bản ban đầu nếu trống
    /// </summary>
    public async Task EnsureTableAndSyncAsync()
    {
        try
        {
            // 1. Tự động tạo bảng dbo.AppVersions nếu chưa tồn tại
            const string createTableSql = @"
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AppVersions' AND schema_id = SCHEMA_ID('dbo'))
                BEGIN
                    CREATE TABLE [dbo].[AppVersions] (
                        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                        [Version] NVARCHAR(50) NOT NULL,
                        [Platform] NVARCHAR(20) NOT NULL,
                        [BundleUrl] NVARCHAR(500) NULL,
                        [ChangeLog] NVARCHAR(2000) NULL,
                        [Mandatory] BIT NOT NULL DEFAULT 0,
                        [ReleaseDate] NVARCHAR(50) NULL,
                        [IsActive] BIT NOT NULL DEFAULT 1,
                        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
                    );
                    CREATE INDEX [IX_AppVersions_Platform_IsActive] ON [dbo].[AppVersions]([Platform], [IsActive]);
                END";

            await _db.Database.ExecuteSqlRawAsync(createTableSql);

            // 2. Nếu bảng chưa có dữ liệu, đọc seed từ manifest.json và manifest-ios.json
            var hasAny = await _db.AppVersions.AnyAsync();
            if (!hasAny)
            {
                var otaFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "ota");
                await TrySeedManifestAsync(Path.Combine(otaFolder, "manifest.json"), "android");
                await TrySeedManifestAsync(Path.Combine(otaFolder, "manifest-ios.json"), "ios");
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[OTA] Không thể khởi tạo hoặc đồng bộ bảng AppVersions trong Database.");
        }
    }

    private async Task TrySeedManifestAsync(string manifestPath, string platform)
    {
        if (!File.Exists(manifestPath)) return;

        try
        {
            var raw = await File.ReadAllTextAsync(manifestPath);
            raw = raw.TrimStart('\uFEFF').Trim();
            var doc = JsonDocument.Parse(raw);
            var root = doc.RootElement;

            string version = root.TryGetProperty("latestVersion", out var v) ? v.GetString() ?? "" : "";
            string changeLog = root.TryGetProperty("changeLog", out var c) ? c.GetString() ?? "" : "";
            string bundleUrl = root.TryGetProperty("bundleUrl", out var b) ? b.GetString() ?? "" : "";
            string releaseDate = root.TryGetProperty("releaseDate", out var r) ? r.GetString() ?? "" : "";
            bool mandatory = root.TryGetProperty("mandatory", out var m) && m.GetBoolean();

            if (!string.IsNullOrWhiteSpace(version))
            {
                _db.AppVersions.Add(new AppVersion
                {
                    Version = version,
                    Platform = platform,
                    BundleUrl = bundleUrl,
                    ChangeLog = changeLog,
                    ReleaseDate = releaseDate,
                    Mandatory = mandatory,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
                await _db.SaveChangesAsync();
                _logger.LogInformation("[OTA] Đã seed phiên bản v{Version} ({Platform}) vào Database.", version, platform);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[OTA] Không thể seed file manifest {Path}", manifestPath);
        }
    }

    /// <summary>
    /// Lấy phiên bản OTA mới nhất đang kích hoạt theo nền tảng (android / ios)
    /// </summary>
    public async Task<AppVersion?> GetLatestActiveVersionAsync(string platform)
    {
        string normPlatform = platform.Trim().ToLowerInvariant();
        return await _db.AppVersions
            .Where(v => v.IsActive && (v.Platform == normPlatform || v.Platform == "all"))
            .OrderByDescending(v => v.Id)
            .FirstOrDefaultAsync();
    }

    /// <summary>
    /// Lưu phiên bản mới vào Database
    /// </summary>
    public async Task<AppVersion> PublishVersionAsync(string version, string platform, string changeLog, bool mandatory, string? releaseDate = null)
    {
        string normPlatform = platform.Trim().ToLowerInvariant();
        string dateStr = releaseDate ?? DateTime.UtcNow.AddHours(7).ToString("yyyy-MM-dd HH:mm");

        var appVersion = new AppVersion
        {
            Version = version.Trim(),
            Platform = normPlatform,
            BundleUrl = $"/api/ota/bundle/latest?platform={normPlatform}",
            ChangeLog = changeLog.Trim(),
            Mandatory = mandatory,
            ReleaseDate = dateStr,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.AppVersions.Add(appVersion);
        await _db.SaveChangesAsync();

        return appVersion;
    }
}
