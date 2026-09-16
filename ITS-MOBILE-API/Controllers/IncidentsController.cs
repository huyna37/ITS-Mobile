using ITS_MOBILE_API.Models;
using ITS_MOBILE_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITS_MOBILE_API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IncidentsController : ControllerBase
{
    private readonly IncidentService _incidentService;

    public IncidentsController(IncidentService incidentService)
    {
        _incidentService = incidentService;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<IncidentResponse>>> GetIncidents()
    {
        try
        {
            var incidents = await _incidentService.GetEvents();
            return Ok(incidents);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<IncidentDetailResponse>> GetIncidentDetail(string id)
    {
        try
        {
            if (!long.TryParse(id, out var incidentId))
                return NotFound(new { error = "ID sự cố không hợp lệ" });

            var detail = await _incidentService.GetIncidentDetail(incidentId);
            if (detail == null)
                return NotFound(new { error = "Không tìm thấy sự cố" });

            return Ok(detail);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("{id}/timeline")]
    public async Task<ActionResult<List<StatusLogEntry>>> GetIncidentTimeline(string id)
    {
        try
        {
            if (!long.TryParse(id, out var incidentId))
                return NotFound(new { error = "ID sự cố không hợp lệ" });

            var timeline = await _incidentService.GetIncidentTimeline(incidentId);
            return Ok(timeline);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpPatch("{id}")]
    public async Task<ActionResult> UpdateIncident(string id, [FromBody] UpdateIncidentRequest request)
    {
        try
        {
            if (!long.TryParse(id, out var incidentId))
                return BadRequest(new { error = "ID sự cố không hợp lệ" });

            var success = await _incidentService.UpdateIncident(incidentId, request.Status, request.Notes, request.Actor);
            if (!success)
                return BadRequest(new { error = "Không thể cập nhật sự cố" });

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    public record UpdateIncidentRequest(int? Status, string? Notes, string? Actor);
}
