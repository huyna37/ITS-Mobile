using ITS_MOBILE_API.Data;
using ITS_MOBILE_API.Models;
using Microsoft.EntityFrameworkCore;

namespace ITS_MOBILE_API.Services;

public class TaskService
{
    private readonly ItsDbContext _db;

    public TaskService(ItsDbContext db)
    {
        _db = db;
    }

    public async Task<List<TaskResponse>> GetAssignedTasks()
    {
        // Get active tasks (not deleted, status 0-2)
        var tasks = await _db.TaskOfIncidents
            .Where(t => !t.IsDeleted && t.Status < 3)
            .Include(t => t.IncidentProfile)
            .OrderByDescending(t => t.CreationTime)
            .ToListAsync();

        return tasks.Select(t => new TaskResponse(
            Id: t.Id.ToString(),
            Code: t.Code ?? "N/A",
            Type: t.Name,
            Level: GetLevel(t.IncidentProfile?.Level ?? 0),
            Location: FormatLocation(t.IncidentProfile),
            Direction: GetDirectionText(t.IncidentProfile?.Direction ?? 0),
            Time: t.StartDate.ToString("dd/MM"),
            Status: t.Status,
            Description: t.IncidentProfile?.Description,
            Script: t.IncidentProfile?.Script
        )).ToList();
    }

    public async Task<List<TaskResponse>> GetCompletedTasks(int count = 5)
    {
        var tasks = await _db.TaskOfIncidents
            .Where(t => !t.IsDeleted && t.Status == 3)
            .Include(t => t.IncidentProfile)
            .OrderByDescending(t => t.EndDate)
            .Take(count)
            .ToListAsync();

        return tasks.Select(t => new TaskResponse(
            Id: t.Id.ToString(),
            Code: t.Code ?? "N/A",
            Type: t.Name,
            Level: GetLevel(t.IncidentProfile?.Level ?? 0),
            Location: FormatLocation(t.IncidentProfile),
            Direction: GetDirectionText(t.IncidentProfile?.Direction ?? 0),
            Time: t.EndDate.ToString("dd/MM"),
            Status: 3,
            Description: t.IncidentProfile?.Description,
            Script: t.IncidentProfile?.Script
        )).ToList();
    }

    public async Task<TaskDetailResponse?> GetTaskDetail(string taskId)
    {
        if (!long.TryParse(taskId, out var id)) return null;

        var task = await _db.TaskOfIncidents
            .Include(t => t.IncidentProfile)
            .Include(t => t.IncidentProfile!.IncidentLogs)
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

        if (task == null) return null;

        var logs = (task.IncidentProfile?.IncidentLogs ?? new List<IncidentLog>())
            .OrderByDescending(l => l.CreationTime)
            .Select(l => new StatusLogEntry(
                Time: l.CreationTime.ToString("HH:mm dd/MM"),
                Text: l.Title,
                Actor: l.RefInfomation ?? "Hệ thống"
            )).ToList();

        // Add initial system entry
        logs.Insert(0, new StatusLogEntry(
            Time: task.StartDate.ToString("HH:mm dd/MM"),
            Text: "Phân công nhiệm vụ từ ITS/TMC",
            Actor: "Hệ thống"
        ));

        return new TaskDetailResponse(
            Id: task.Id.ToString(),
            Code: task.Code ?? "N/A",
            Type: task.Name,
            Level: GetLevel(task.IncidentProfile!.Level),
            Location: FormatLocation(task.IncidentProfile),
            Direction: GetDirectionText(task.IncidentProfile.Direction),
            Time: task.StartDate.ToString("dd/MM"),
            Status: task.Status,
            Description: task.IncidentProfile.Description ?? "Chưa có mô tả",
            Script: task.IncidentProfile.Script ?? "Chưa có phương án",
            StatusLog: logs
        );
    }

    public async Task<bool> UpdateStatus(string taskId, int newStatus, string actor)
    {
        if (!long.TryParse(taskId, out var id)) return false;

        var task = await _db.TaskOfIncidents
            .Include(t => t.IncidentProfile)
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

        if (task == null) return false;

        // Sequential state machine: 0 -> 1 -> 2 -> 3
        if (newStatus <= task.Status) return false;

        task.Status = newStatus;

        // Add log entry
        var log = new IncidentLog
        {
            Title = GetStatusText(newStatus),
            Description = $"Cập nhật bởi: {actor}",
            ActionType = newStatus,
            IncidentProfileId = task.IncidentProfileId ?? 0,
            CreationTime = DateTime.UtcNow,
            TaskStatus = newStatus
        };

        _db.IncidentLogs.Add(log);
        await _db.SaveChangesAsync();

        return true;
    }

    private string GetLevel(int? level) => level switch
    {
        1 or null => "Nghiêm trọng",
        2 => "Trung bình",
        _ => "Thấp"
    };

    private string FormatLocation(IncidentProfile? profile) => profile != null
        ? $"Km {profile.PositionKM}+{profile.PositionM:000}"
        : "Chưa xác định";

    private string GetDirectionText(int? direction) => direction switch
    {
        0 => "Hướng Hà Nội",
        1 => "Hướng Lào Cai",
        _ => "Không xác định"
    };

    private string GetStatusText(int status) => status switch
    {
        1 => "Đã tiếp nhận (1)",
        2 => "Đang xử lý (2)",
        3 => "Hoàn thành (3)",
        _ => $"Trạng thái {status}"
    };
}
