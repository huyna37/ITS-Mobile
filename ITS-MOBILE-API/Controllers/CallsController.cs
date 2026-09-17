using ITS_MOBILE_API.Models;
using ITS_MOBILE_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ITS_MOBILE_API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CallsController : ControllerBase
{
    private readonly CallHistoryService _callHistoryService;

    public CallsController(CallHistoryService callHistoryService)
    {
        _callHistoryService = callHistoryService;
    }

    [Authorize]
    [HttpGet("history")]
    public async Task<ActionResult<List<CallHistoryResponse>>> GetCallHistory()
    {
        try
        {
            var history = await _callHistoryService.GetHistory();
            return Ok(history);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("missed")]
    public async Task<ActionResult<List<CallHistoryResponse>>> GetMissedCalls()
    {
        try
        {
            var history = await _callHistoryService.GetMissedCalls();
            return Ok(history);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("stats")]
    public async Task<ActionResult<CallStatsResponse>> GetStats()
    {
        try
        {
            var stats = await _callHistoryService.GetStats();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("history")]
    public async Task<ActionResult<CallHistoryResponse>> RecordCall([FromBody] RecordCallReq? request)
    {
        try
        {
            var username = User.FindFirst("username")?.Value
                ?? User.FindFirst(ClaimTypes.Name)?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.Identity?.Name;

            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { error = "Unauthorized" });

            var ext = !string.IsNullOrEmpty(request?.Extension) ? request.Extension : "1001";
            var name = !string.IsNullOrEmpty(request?.Name) ? request.Name : "Không rõ";
            var result = await _callHistoryService.RecordCall(ext, name, request?.Duration ?? 0, request?.Status ?? 0, username);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("bypass-pbx")]
    public async Task<ActionResult<CallHistoryResponse>> BypassPbx([FromBody] RecordCallReq? request)
    {
        try
        {
            var username = User.FindFirst("username")?.Value
                ?? User.FindFirst(ClaimTypes.Name)?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.Identity?.Name;

            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { error = "Unauthorized" });

            var ext = !string.IsNullOrEmpty(request?.Extension) ? request.Extension : "1001";
            var name = !string.IsNullOrEmpty(request?.Name) ? request.Name : "Đồng nghiệp";
            var duration = (request?.Duration != null && request.Duration.Value > 0) ? request.Duration.Value : 45;

            var result = await _callHistoryService.BypassPbxCall(ext, name, duration, username);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối giả lập tổng đài", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("sos")]
    public async Task<ActionResult<CallHistoryResponse>> RecordSosCall([FromBody] RecordSosReq? request)
    {
        try
        {
            var username = User.FindFirst("username")?.Value
                ?? User.FindFirst(ClaimTypes.Name)?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.Identity?.Name;

            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { error = "Unauthorized" });

            var hotline = !string.IsNullOrEmpty(request?.Hotline) ? request.Hotline : "113";
            var result = await _callHistoryService.RecordSosCall(hotline, username, request?.Location);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi ghi nhận cuộc gọi SOS", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("{id}/end")]
    public async Task<ActionResult> EndCall(string id, [FromBody] EndCallReq request)
    {
        try
        {
            var success = await _callHistoryService.EndCall(id, request.Duration);
            if (!success)
                return NotFound(new { error = "Không tìm thấy cuộc gọi" });

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpDelete("history")]
    public async Task<ActionResult> ClearCallHistory()
    {
        try
        {
            await _callHistoryService.ClearHistory();
            return Ok(new { success = true, message = "Đã xóa toàn bộ lịch sử cuộc gọi" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpDelete("history/{id}")]
    public async Task<ActionResult> DeleteCallRecord(string id)
    {
        try
        {
            var success = await _callHistoryService.DeleteCallRecord(id);
            if (!success)
                return NotFound(new { error = "Không tìm thấy cuộc gọi" });

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    public class RecordCallReq
    {
        public string? Extension { get; set; }
        public string? Name { get; set; }
        public int? Duration { get; set; }
        public int? Status { get; set; }
    }

    public class EndCallReq
    {
        public int Duration { get; set; }
    }

    public class RecordSosReq
    {
        public string? Hotline { get; set; }
        public string? Location { get; set; }
    }
}
