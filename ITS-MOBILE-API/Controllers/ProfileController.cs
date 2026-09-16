using ITS_MOBILE_API.Models;
using ITS_MOBILE_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ITS_MOBILE_API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly ProfileService _profileService;

    public ProfileController(ProfileService profileService)
    {
        _profileService = profileService;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<ProfileResponse>> GetProfile()
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("username")?.Value;

            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { error = "Unauthorized" });

            var profile = await _profileService.GetProfile(username);
            if (profile == null)
                return NotFound(new { error = "Không tìm thấy người dùng" });

            return Ok(new
            {
                profile.TenNhanVien,
                profile.ChucVu,
                profile.DonVi,
                profile.Extension,
                profile.Username
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpPatch]
    public async Task<ActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("username")?.Value;

            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { error = "Unauthorized" });

            var success = await _profileService.UpdateProfile(username, request.Name);
            return Ok(new { success = success });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("preferences")]
    public async Task<ActionResult<PreferencesResponse>> GetPreferences()
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("username")?.Value;

            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { error = "Unauthorized" });

            var prefs = await _profileService.GetPreferences(username);
            return Ok(prefs);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpPatch("preferences")]
    public async Task<ActionResult> UpdatePreferences([FromBody] UpdatePreferencesRequest request)
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("username")?.Value;

            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { error = "Unauthorized" });

            var success = await _profileService.UpdatePreferences(username, request.Language, request.Theme);
            return Ok(new { success = success });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    public record UpdateProfileRequest(string? Name, string? ChucVu, string? DonVi);
    public record PreferencesResponse(string Language, string Theme, string MapStyle);
    public record UpdatePreferencesRequest(string? Language, string? Theme, string? MapStyle);
}
