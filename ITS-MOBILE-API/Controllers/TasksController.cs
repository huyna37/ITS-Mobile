using ITS_MOBILE_API.Models;
using ITS_MOBILE_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITS_MOBILE_API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly TaskService _taskService;

    public TasksController(TaskService taskService)
    {
        _taskService = taskService;
    }

    [Authorize]
    [HttpGet("assigned")]
    public async Task<ActionResult<List<TaskResponse>>> GetAssignedTasks()
    {
        try
        {
            var tasks = await _taskService.GetAssignedTasks();
            return Ok(tasks);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("completed-recent")]
    public async Task<ActionResult<List<TaskResponse>>> GetCompletedTasks()
    {
        try
        {
            var tasks = await _taskService.GetCompletedTasks();
            return Ok(tasks);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<TaskDetailResponse>> GetTaskDetail(string id)
    {
        try
        {
            var task = await _taskService.GetTaskDetail(id);
            if (task == null)
                return NotFound(new { error = "Không tìm thấy nhiệm vụ" });

            return Ok(task);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpPatch("{id}")]
    public async Task<ActionResult> UpdateTaskStatus(string id, [FromBody] StatusUpdateRequest request)
    {
        try
        {
            var success = await _taskService.UpdateStatus(id, request.Status, request.Actor);
            if (!success)
                return BadRequest(new { error = "Không thể cập nhật trạng thái" });

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }
}
