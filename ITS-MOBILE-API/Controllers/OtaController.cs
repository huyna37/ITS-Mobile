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

[ApiController]
[Route("api/[controller]")]
public class OtaController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _config;

    public OtaController(IWebHostEnvironment env, IConfiguration config)
    {
        _env = env;
        _config = config;
    }

    [HttpGet("check")]
    public ActionResult<OtaCheckResponse> CheckUpdate(
        [FromQuery] string currentVersion = "1.0.0-base",
        [FromQuery] string platform = "android")
    {
        var otaFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "ota");
        bool isIos = string.Equals(platform, "ios", StringComparison.OrdinalIgnoreCase);

        var manifestPath = Path.Combine(otaFolder, isIos ? "manifest-ios.json" : "manifest.json");
        if (isIos && !System.IO.File.Exists(manifestPath))
        {
            // Tuyệt đối không fallback sang manifest.json của Android khi thiết bị là iOS
            return Ok(new OtaCheckResponse
            {
                HasUpdate = false,
                LatestVersion = currentVersion ?? "1.0.0-base",
                BundleUrl = "",
                ChangeLog = "Chưa có bản cập nhật OTA riêng cho iOS.",
                Mandatory = false,
                ReleaseDate = DateTime.UtcNow.ToString("yyyy-MM-dd")
            });
        }

        string latestVersion = "1.0.1";
        string changeLog = "Cập nhật tối ưu giao diện ca trực, sửa lỗi hiển thị màu và cải thiện tốc độ xử lý sự cố.";
        bool mandatory = false;
        string releaseDate = DateTime.UtcNow.ToString("yyyy-MM-dd");

        if (System.IO.File.Exists(manifestPath))
        {
            try
            {
                var json = System.IO.File.ReadAllText(manifestPath);
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

        bool hasUpdate = !string.Equals(currentVersion?.Trim(), latestVersion?.Trim(), StringComparison.OrdinalIgnoreCase);

        var request = HttpContext.Request;
        var baseUrl = $"{request.Scheme}://{request.Host}";
        var bundleUrl = isIos
            ? $"{baseUrl}/api/ota/bundle/latest?platform=ios"
            : $"{baseUrl}/api/ota/bundle/latest?platform=android";

        return Ok(new OtaCheckResponse
        {
            HasUpdate = hasUpdate,
            LatestVersion = latestVersion ?? "1.0.1",
            BundleUrl = bundleUrl,
            ChangeLog = changeLog ?? "",
            Mandatory = mandatory,
            ReleaseDate = releaseDate
        });
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
