using ITS_MOBILE_API.Models;
using ITS_MOBILE_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace ITS_MOBILE_API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly IConfiguration _config;

    public AuthController(AuthService authService, IConfiguration config)
    {
        _authService = authService;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _authService.Login(request.Username, request.Password, request.Extension);
            if (result == null)
                return Unauthorized(new { error = "Sai tài khoản hoặc mật khẩu" });

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<ActionResult<ProfileResponse>> GetProfile()
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("username")?.Value
                ?? User.Identity?.Name;

            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { error = "Unauthorized" });

            var profile = await _authService.GetProfile(username);
            if (profile == null)
                return NotFound(new { error = "Không tìm thấy người dùng" });

            return Ok(profile);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ProfileResponse>> GetMe()
    {
        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("username")?.Value
            ?? User.Identity?.Name;

        if (string.IsNullOrEmpty(username))
            return Unauthorized(new { error = "Unauthorized" });

        var profile = await _authService.GetProfile(username);
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

    [Authorize]
    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("username")?.Value
            ?? User.Identity?.Name;

        if (string.IsNullOrEmpty(username))
            return Unauthorized(new { error = "Unauthorized" });

        var user = await _authService.GetUserByUserName(username);
        if (user == null || !user.IsActive)
            return Unauthorized(new { error = "Người dùng không tồn tại hoặc đã bị vô hiệu hóa" });

        return Ok(new { success = true, message = "Đăng xuất thành công" });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (string.IsNullOrEmpty(request.CurrentPassword) || string.IsNullOrEmpty(request.NewPassword))
            return BadRequest(new { error = "Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới" });

        if (request.NewPassword.Length < 6)
            return BadRequest(new { error = "Mật khẩu mới phải có ít nhất 6 ký tự" });

        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("username")?.Value
            ?? User.Identity?.Name;

        if (string.IsNullOrEmpty(username))
            return Unauthorized(new { error = "Unauthorized" });

        var isValid = await _authService.ValidateCurrentPassword(username, request.CurrentPassword);
        if (!isValid)
            return BadRequest(new { error = "Mật khẩu hiện tại không đúng" });

        var updateResult = await _authService.UpdatePassword(username, request.NewPassword);
        if (!updateResult)
            return StatusCode(500, new { error = "Lỗi khi cập nhật mật khẩu" });

        return Ok(new { success = true, message = "Mật khẩu đã được thay đổi" });
    }

    [HttpPost("refresh")]
    public async Task<ActionResult> Refresh([FromBody] RefreshRequest request)
    {
        if (string.IsNullOrEmpty(request.RefreshToken))
            return BadRequest(new { error = "Refresh token là bắt buộc" });

        try
        {
            var (token, newRefreshToken) = await _authService.RefreshToken(request.RefreshToken);
            return Ok(new { token, refreshToken = newRefreshToken, expiresIn = 43200 });
        }
        catch (InvalidOperationException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }

    public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
    public record RefreshRequest(string RefreshToken);
}
