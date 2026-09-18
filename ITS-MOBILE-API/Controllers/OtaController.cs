using ITS_MOBILE_API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ITS_MOBILE_API.Controllers;

public class OtaCheckResponse
{
    public bool HasUpdate { get; set; }
    public string LatestVersion { get; set; } = string.Empty;
    public string BundleUrl { get; set; } = string.Empty;
    public string ChangeLog { get; set; } = string.Empty;
    public bool Mandatory { get; set; }
    public string ReleaseDate { get; set; } = string.Empty;
}

public class PublishVersionDto
{
    public string Version { get; set; } = string.Empty;
    public string Platform { get; set; } = "all"; // all, android, ios
    public string ChangeLog { get; set; } = string.Empty;
    public bool Mandatory { get; set; } = false;
    public string? ReleaseDate { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class OtaController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _config;
    private readonly OtaVersionService _otaVersionService;

    public OtaController(IWebHostEnvironment env, IConfiguration config, OtaVersionService otaVersionService)
    {
        _env = env;
        _config = config;
        _otaVersionService = otaVersionService;
    }

    [HttpGet("check")]
    public async Task<ActionResult<OtaCheckResponse>> CheckUpdate(
        [FromQuery] string currentVersion = "1.0.0-base",
        [FromQuery] string platform = "android")
    {
        bool isIos = string.Equals(platform, "ios", StringComparison.OrdinalIgnoreCase);
        string normPlatform = isIos ? "ios" : "android";

        string latestVersion = "";
        string changeLog = "";
        bool mandatory = false;
        string releaseDate = "";

        // 1. Ưu tiên tra cứu từ bảng AppVersions trong Database
        var dbVersion = await _otaVersionService.GetLatestActiveVersionAsync(normPlatform);
        if (dbVersion != null)
        {
            latestVersion = dbVersion.Version;
            changeLog = dbVersion.ChangeLog;
            mandatory = dbVersion.Mandatory;
            releaseDate = dbVersion.ReleaseDate;
        }
        else
        {
            // 2. Fallback sang file manifest tĩnh nếu Database chưa có
            var otaFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "ota");
            var manifestPath = Path.Combine(otaFolder, isIos ? "manifest-ios.json" : "manifest.json");

            if (isIos && !System.IO.File.Exists(manifestPath))
            {
                return Ok(new OtaCheckResponse
                {
                    HasUpdate = false,
                    LatestVersion = currentVersion ?? "1.0.0-base",
                    BundleUrl = "",
                    ChangeLog = "Chưa có bản cập nhật OTA riêng cho iOS.",
                    Mandatory = false,
                    ReleaseDate = DateTime.UtcNow.AddHours(7).ToString("yyyy-MM-dd HH:mm")
                });
            }

            if (System.IO.File.Exists(manifestPath))
            {
                try
                {
                    var json = System.IO.File.ReadAllText(manifestPath).TrimStart('\uFEFF').Trim();
                    var parsed = System.Text.Json.JsonSerializer.Deserialize<OtaCheckResponse>(json, new System.Text.Json.JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                    if (parsed != null)
                    {
                        latestVersion = parsed.LatestVersion;
                        changeLog = parsed.ChangeLog;
                        mandatory = parsed.Mandatory;
                        releaseDate = parsed.ReleaseDate;
                    }
                }
                catch
                {
                    // Fallback to default
                }
            }
        }

        if (string.IsNullOrWhiteSpace(latestVersion))
        {
            latestVersion = "1.0.0-base";
        }
        if (string.IsNullOrWhiteSpace(releaseDate))
        {
            releaseDate = DateTime.UtcNow.AddHours(7).ToString("yyyy-MM-dd HH:mm");
        }

        bool hasUpdate = !string.Equals(currentVersion?.Trim(), latestVersion.Trim(), StringComparison.OrdinalIgnoreCase);

        var request = HttpContext.Request;
        var baseUrl = $"{request.Scheme}://{request.Host}";
        var bundleUrl = isIos
            ? $"{baseUrl}/api/ota/bundle/latest?platform=ios"
            : $"{baseUrl}/api/ota/bundle/latest?platform=android";

        return Ok(new OtaCheckResponse
        {
            HasUpdate = hasUpdate,
            LatestVersion = latestVersion,
            BundleUrl = bundleUrl,
            ChangeLog = changeLog,
            Mandatory = mandatory,
            ReleaseDate = releaseDate
        });
    }

    [HttpPost("publish")]
    public async Task<IActionResult> PublishVersion([FromBody] PublishVersionDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Version))
        {
            return BadRequest(new { error = "Version không được để trống" });
        }

        var record = await _otaVersionService.PublishVersionAsync(
            dto.Version,
            dto.Platform,
            dto.ChangeLog,
            dto.Mandatory,
            dto.ReleaseDate
        );

        return Ok(new { success = true, version = record });
    }

    [HttpGet("bundle/latest")]
    public IActionResult DownloadLatestBundle([FromQuery] string platform = "android")
    {
        var otaFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "ota");
        bool isIos = string.Equals(platform, "ios", StringComparison.OrdinalIgnoreCase);

        if (isIos)
        {
            var iosZip = Path.Combine(otaFolder, "bundle-ios.zip");
            var iosBundle = Path.Combine(otaFolder, "main.jsbundle");
            if (System.IO.File.Exists(iosZip))
            {
                return PhysicalFile(iosZip, "application/zip", "bundle-ios.zip");
            }
            if (System.IO.File.Exists(iosBundle))
            {
                return PhysicalFile(iosBundle, "application/octet-stream", "main.jsbundle");
            }
            return NotFound(new { error = "Chưa có file bundle OTA dành riêng cho iOS trên máy chủ." });
        }

        // Android
        var zipFile = Path.Combine(otaFolder, "bundle-android.zip");
        if (!System.IO.File.Exists(zipFile))
        {
            zipFile = Path.Combine(otaFolder, "bundle.zip");
        }
        var bundleFile = Path.Combine(otaFolder, "index.android.bundle");

        if (System.IO.File.Exists(zipFile))
        {
            return PhysicalFile(zipFile, "application/zip", "bundle.zip");
        }

        if (System.IO.File.Exists(bundleFile))
        {
            return PhysicalFile(bundleFile, "application/octet-stream", "index.android.bundle");
        }

        return NotFound(new { error = "Chưa có file bundle OTA dành cho Android trên máy chủ." });
    }
}
