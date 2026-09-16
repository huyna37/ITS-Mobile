using ITS_MOBILE_API.Data;
using ITS_MOBILE_API.Models;
using Microsoft.EntityFrameworkCore;

namespace ITS_MOBILE_API.Services;

public class IncidentService
{
    private readonly ItsDbContext _db;

    public IncidentService(ItsDbContext db)
    {
        _db = db;
    }

    public async Task<List<IncidentResponse>> GetEvents()
    {
        var events = await _db.EventInfos
            .Where(e => !e.IsDeleted)
            .OrderByDescending(e => e.CreationTime)
            .Take(10)
            .ToListAsync();

        return events.Select(e => new IncidentResponse(
            Id: e.Id.ToString(),
            Kind: GetIncidentKind(e.Description),
            Title: e.Description ?? e.Code,
            Location: $"Km {e.PositionKM}+{e.PositionM:000}",
            Time: e.TimeDetect.ToString("HH:mm dd/MM"),
            Tag: GetTagText(e)
        )).ToList();
    }

    public async Task<IncidentDetailResponse?> GetIncidentDetail(long incidentId)
    {
        var task = await _db.TaskOfIncidents
            .Include(t => t.IncidentProfile)
            .Include(t => t.IncidentProfile!.IncidentLogs)
            .FirstOrDefaultAsync(t => t.Id == incidentId && !t.IsDeleted);

        if (task == null) return null;

        var profile = task.IncidentProfile!;
        var logs = profile.IncidentLogs
            ?.OrderByDescending(l => l.CreationTime)
            .Select(l => new StatusLogEntry(
                Time: l.CreationTime.ToString("HH:mm dd/MM"),
                Text: l.Title,
                Actor: l.RefInfomation ?? "Hệ thống"
            )).ToList() ?? new List<StatusLogEntry>();

        if (logs.Count == 0)
        {
            logs.Add(new StatusLogEntry(
                Time: task.StartDate.ToString("HH:mm dd/MM"),
                Text: "Phân công nhiệm vụ từ ITS/TMC",
                Actor: "Hệ thống"
            ));
        }
        else
        {
            logs.Insert(0, new StatusLogEntry(
                Time: task.StartDate.ToString("HH:mm dd/MM"),
                Text: "Phân công nhiệm vụ từ ITS/TMC",
                Actor: "Hệ thống"
            ));
        }

        return new IncidentDetailResponse(
            Id: task.Id.ToString(),
            Kind: "incident",
            Title: task.Name,
            Location: FormatLocation(profile),
            Time: task.StartDate.ToString("dd/MM"),
            Tag: GetTagText(profile.Status),
            Description: profile.Description ?? "Chưa có mô tả",
            Script: profile.Script ?? "Chưa có phương án",
            Level: GetLevel(profile.Level),
            Direction: GetDirectionText(profile.Direction),
            StatusLog: logs
        );
    }

    public async Task<List<StatusLogEntry>> GetIncidentTimeline(long incidentId)
    {
        var task = await _db.TaskOfIncidents
            .Include(t => t.IncidentProfile)
            .Include(t => t.IncidentProfile!.IncidentLogs)
            .FirstOrDefaultAsync(t => t.Id == incidentId && !t.IsDeleted);

        if (task == null) return new List<StatusLogEntry>();

        var profile = task.IncidentProfile!;
        var logs = profile.IncidentLogs
            ?.OrderByDescending(l => l.CreationTime)
            .Select(l => new StatusLogEntry(
                Time: l.CreationTime.ToString("HH:mm dd/MM"),
                Text: l.Title,
                Actor: l.RefInfomation ?? "Hệ thống"
            )).ToList() ?? new List<StatusLogEntry>();

        if (logs.Count == 0)
        {
            logs.Add(new StatusLogEntry(
                Time: task.StartDate.ToString("HH:mm dd/MM"),
                Text: "Phân công nhiệm vụ từ ITS/TMC",
                Actor: "Hệ thống"
            ));
        }
        else
        {
            logs.Insert(0, new StatusLogEntry(
                Time: task.StartDate.ToString("HH:mm dd/MM"),
                Text: "Phân công nhiệm vụ từ ITS/TMC",
                Actor: "Hệ thống"
            ));
        }

        return logs;
    }

    public async Task<bool> UpdateIncident(long incidentId, int? newStatus, string? notes, string? actor)
    {
        var task = await _db.TaskOfIncidents
            .Include(t => t.IncidentProfile)
            .FirstOrDefaultAsync(t => t.Id == incidentId && !t.IsDeleted);

        if (task == null) return false;

        if (newStatus.HasValue)
        {
            if (newStatus.Value <= task.Status) return false;
            task.Status = newStatus.Value;
        }

        // Add log entry for status change or notes
        var log = new IncidentLog
        {
            Title = newStatus.HasValue ? GetStatusText(newStatus.Value) : (notes ?? ""),
            Description = notes ?? $"Cập nhật bởi: {actor ?? "Người vận hành"}",
            ActionType = newStatus ?? 0,
            IncidentProfileId = task.IncidentProfileId ?? 0,
            CreationTime = DateTime.UtcNow,
            TaskStatus = newStatus
        };

        _db.IncidentLogs.Add(log);
        await _db.SaveChangesAsync();

        return true;
    }

    private string GetIncidentKind(string? description)
    {
        if (description == null) return "maintenance";
        var d = description.ToLower();
        if (d.Contains("mưa") || d.Contains("nắng") || d.Contains("thời tiết")) return "weather";
        if (d.Contains("tai nạn") || d.Contains("va chạm") || d.Contains("tai nạn")) return "accident";
        return "maintenance";
    }

    private string GetTagText(int status) => status switch
    {
        0 => "Đang diễn ra",
        1 => "Đã kết thúc",
        _ => "Theo dõi"
    };

    private string GetTagText(string? status) => status ?? "Theo dõi";

    private string GetTagText(EventInfo e) => e.Status switch
    {
        0 => "Đang diễn ra",
        1 => "Đã kết thúc",
        _ => "Theo dõi"
    };

    private string GetLevel(int? level) => level switch
    {
        1 or null => "Nghiêm trọng",
        2 => "Trung bình",
        _ => "Thấp"
    };

    private string FormatLocation(IncidentProfile profile) => $"Km {profile.PositionKM}+{profile.PositionM:000}";

    private string GetDirectionText(int direction) => direction switch
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
