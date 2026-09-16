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
    [HttpPost("history")]
    public async Task<ActionResult<CallHistoryResponse>> RecordCall([FromBody] RecordCallReq request)
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("username")?.Value;

            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { error = "Unauthorized" });

            var result = await _callHistoryService.RecordCall(request.Extension, request.Name, request.Duration ?? 0, request.Status, username);
            return CreatedAtAction(nameof(GetCallHistory), result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
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

    public record RecordCallReq(string Extension, string Name, int? Duration, int Status);
    public record EndCallReq(int Duration);
}
