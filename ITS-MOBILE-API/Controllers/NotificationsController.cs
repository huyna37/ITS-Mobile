using ITS_MOBILE_API.Models;
using ITS_MOBILE_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ITS_MOBILE_API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly NotificationService _notificationService;

    public NotificationsController(NotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<NotificationResponse>>> GetNotifications()
    {
        try
        {
            var notifications = await _notificationService.GetNotifications();
            return Ok(notifications);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("unread-count")]
    public async Task<ActionResult<UnreadCountResponse>> GetUnreadCount()
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("username")?.Value;

            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { error = "Unauthorized" });

            var count = await _notificationService.GetUnreadCount(username);
            return Ok(new UnreadCountResponse(count));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpPatch("{id}/read")]
    public async Task<ActionResult> MarkRead(string id)
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("username")?.Value;

            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { error = "Unauthorized" });

            var success = await _notificationService.MarkRead(id, username);
            if (!success)
                return NotFound(new { error = "Không tìm thấy thông báo" });

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpPatch("{id}/unread")]
    public async Task<ActionResult> MarkUnread(string id)
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("username")?.Value;

            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { error = "Unauthorized" });

            var success = await _notificationService.MarkUnread(id, username);
            if (!success)
                return NotFound(new { error = "Không tìm thấy thông báo" });

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpPatch("read-all")]
    public async Task<ActionResult> MarkAllRead()
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("username")?.Value;

            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { error = "Unauthorized" });

            var success = await _notificationService.MarkAllRead(username);
            return Ok(new { success = success });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteNotification(string id)
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("username")?.Value;

            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { error = "Unauthorized" });

            var success = await _notificationService.DeleteNotification(id, username);
            if (!success)
                return NotFound(new { error = "Không tìm thấy thông báo" });

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("push/register")]
    public async Task<ActionResult> RegisterPushToken([FromBody] PushTokenRequest request)
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("username")?.Value;

            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { error = "Unauthorized" });

            if (string.IsNullOrEmpty(request.Token))
                return BadRequest(new { error = "Token không được để trống" });

            var success = await _notificationService.RegisterPushToken(username, request.Token, request.Platform ?? "web");
            return Ok(new { success = success });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("push/unregister")]
    public async Task<ActionResult> UnregisterPushToken([FromBody] PushTokenRequest request)
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("username")?.Value;

            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { error = "Unauthorized" });

            if (string.IsNullOrEmpty(request.Token))
                return BadRequest(new { error = "Token không được để trống" });

            var success = await _notificationService.UnregisterPushToken(username, request.Token);
            return Ok(new { success = success });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    public record PushTokenRequest(string Token, string? Platform);
}
