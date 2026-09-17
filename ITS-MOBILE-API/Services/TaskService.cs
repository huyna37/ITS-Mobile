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

    /// <summary>
    /// Lấy danh sách nhiệm vụ đang được giao (Status < 3: Chưa tiếp nhận hoặc Đang xử lý)
    /// Nguồn dữ liệu SQL Server:
    /// - Bảng chính: [dbo].[TaskOfIncidents] (Lưu nhiệm vụ: Id, Code, Name, Status, StartDate...)
    /// - Bảng liên kết: [dbo].[IncidentProfiles] qua khóa ngoại IncidentProfileId (Lưu hồ sơ sự cố: PositionKM, PositionM, Direction, Level, Description, Script...)
    /// </summary>
    public async Task<List<TaskResponse>> GetAssignedTasks()
    {
        // Lọc các nhiệm vụ chưa bị xóa (IsDeleted = false) và trạng thái chưa hoàn thành (Status < 3)
        var tasks = await _db.TaskOfIncidents
            .Where(t => !t.IsDeleted && t.Status < 3)
            .Include(t => t.IncidentProfile) // JOIN sang bảng [dbo].[IncidentProfiles]
            .OrderByDescending(t => t.CreationTime)
            .ToListAsync();

        return tasks.Select(t => new TaskResponse(
            Id: t.Id.ToString(),                                         // [dbo].[TaskOfIncidents].[Id] (Khóa chính Task)
            Code: t.Code ?? "N/A",                                      // [dbo].[TaskOfIncidents].[Code] (Mã nhiệm vụ, nếu NULL hiển thị N/A)
            Type: t.Name,                                               // [dbo].[TaskOfIncidents].[Name] (Tên nhiệm vụ / loại công việc)
            Level: GetLevel(t.IncidentProfile?.Level ?? 0),             // [dbo].[IncidentProfiles].[Level] (Cấp độ sự cố: 0=Thấp/Thông tin, 1=Nghiêm trọng, 2=Trung bình)
            Location: FormatLocation(t.IncidentProfile),                // [dbo].[IncidentProfiles].[PositionKM] + [PositionM] (Lý trình: Km xxx+xxx)
            Direction: GetDirectionText(t.IncidentProfile?.Direction ?? 0), // [dbo].[IncidentProfiles].[Direction] (Quy ước: 1=Hà Nội -> Lào Cai, 2=Lào Cai -> Hà Nội)
            Time: t.StartDate.ToString("dd/MM"),                        // [dbo].[TaskOfIncidents].[StartDate]
            Status: t.Status,                                           // [dbo].[TaskOfIncidents].[Status] (0: Đã giao, 1: Đã nhận, 2: Đang xử lý, 3: Hoàn thành)
            Description: t.IncidentProfile?.Description,                // [dbo].[IncidentProfiles].[Description] (Mô tả chi tiết sự cố)
            Script: t.IncidentProfile?.Script,                          // [dbo].[IncidentProfiles].[Script] / [ScriptId] (Kịch bản phương án xử lý)
            IncidentCode: t.IncidentProfile?.Code                       // [dbo].[IncidentProfiles].[Code] (Mã hồ sơ sự cố liên kết, ví dụ: MS.250826.HS23)
        )).ToList();
    }

    /// <summary>
    /// Lấy danh sách nhiệm vụ đã hoàn thành (Status = 3)
    /// Nguồn dữ liệu SQL Server: [dbo].[TaskOfIncidents] JOIN [dbo].[IncidentProfiles]
    /// </summary>
    public async Task<List<TaskResponse>> GetCompletedTasks(int? count = null)
    {
        var query = _db.TaskOfIncidents
            .Where(t => !t.IsDeleted && t.Status == 3)
            .Include(t => t.IncidentProfile)
            .OrderByDescending(t => t.EndDate);

        var tasks = count.HasValue
            ? await query.Take(count.Value).ToListAsync()
            : await query.ToListAsync();

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
            Script: t.IncidentProfile?.Script,
            IncidentCode: t.IncidentProfile?.Code
        )).ToList();
    }

    /// <summary>
    /// Lấy chi tiết nhiệm vụ và lịch sử sự cố
    /// Nguồn dữ liệu SQL Server:
    /// - [dbo].[TaskOfIncidents]: Chi tiết thông tin nhiệm vụ
    /// - [dbo].[IncidentProfiles]: Chi tiết vị trí lý trình, hướng tuyến, mô tả ban đầu
    /// - [dbo].[IncidentLogs]: Toàn bộ lịch sử các mốc thời gian cập nhật trạng thái sự cố
    /// - Lưu ý: Tệp đính kèm & hình ảnh hiện trường được lưu ở bảng riêng [dbo].[FilesOfIncidents] (theo IncidentProfileId hoặc TaskId)
    /// </summary>
    public async Task<TaskDetailResponse?> GetTaskDetail(string taskId)
    {
        if (!long.TryParse(taskId, out var id)) return null;

        var task = await _db.TaskOfIncidents
            .Include(t => t.IncidentProfile)
            .Include(t => t.IncidentProfile!.IncidentLogs) // JOIN sang [dbo].[IncidentLogs] lấy lịch sử cập nhật
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

        if (task == null) return null;

        // Lấy lịch sử biến động từ bảng [dbo].[IncidentLogs]
        var logs = (task.IncidentProfile?.IncidentLogs ?? new List<IncidentLog>())
            .OrderByDescending(l => l.CreationTime)
            .Select(l => new StatusLogEntry(
                Time: l.CreationTime.ToString("HH:mm dd/MM"), // [dbo].[IncidentLogs].[CreationTime]
                Text: l.Title,                               // [dbo].[IncidentLogs].[Title] (Tên hành động cập nhật)
                Actor: l.RefInfomation ?? "Hệ thống"        // [dbo].[IncidentLogs].[RefInfomation] hoặc CreatorUserId
            )).ToList();

        // Mốc khởi tạo ban đầu phân công từ hệ thống ITS/TMC
        logs.Insert(0, new StatusLogEntry(
            Time: task.StartDate.ToString("HH:mm dd/MM"),
            Text: "Phân công nhiệm vụ từ ITS/TMC",
            Actor: "Hệ thống"
        ));

        return new TaskDetailResponse(
            Id: task.Id.ToString(),
            Code: task.Code ?? "N/A",                                      // [dbo].[TaskOfIncidents].[Code]
            Type: task.Name,                                               // [dbo].[TaskOfIncidents].[Name]
            Level: GetLevel(task.IncidentProfile!.Level),                  // [dbo].[IncidentProfiles].[Level]
            Location: FormatLocation(task.IncidentProfile),                // [dbo].[IncidentProfiles].[PositionKM]+[PositionM]
            Direction: GetDirectionText(task.IncidentProfile.Direction),   // [dbo].[IncidentProfiles].[Direction]
            Time: task.StartDate.ToString("dd/MM"),
            Status: task.Status,
            Description: task.IncidentProfile.Description ?? "Chưa có mô tả",
            Script: task.IncidentProfile.Script ?? "Chưa có phương án",
            StatusLog: logs,
            IncidentCode: task.IncidentProfile.Code                        // [dbo].[IncidentProfiles].[Code] (Mã hồ sơ sự cố)
        );
    }

    /// <summary>
    /// Ghi nhận cập nhật trạng thái nhiệm vụ (chuyển bước 1 -> 2 -> 3)
    /// Ghi vào [dbo].[TaskOfIncidents].[Status] và thêm log vào [dbo].[IncidentLogs]
    /// </summary>
    public async Task<bool> UpdateStatus(string taskId, int newStatus, string? actor = null)
    {
        if (!long.TryParse(taskId, out var id)) return false;

        var task = await _db.TaskOfIncidents
            .Include(t => t.IncidentProfile)
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

        if (task == null) return false;

        if (newStatus == task.Status) return true;

        task.Status = newStatus;

        // Ghi nhật ký vào bảng [dbo].[IncidentLogs]
        var log = new IncidentLog
        {
            Title = GetStatusText(newStatus),
            Description = string.IsNullOrWhiteSpace(actor) ? "Cập nhật bởi: Hệ thống" : $"Cập nhật bởi: {actor}",
            ActionType = newStatus,
            IncidentProfileId = task.IncidentProfileId ?? 0,
            CreationTime = DateTime.UtcNow,
            TaskStatus = newStatus
        };

        _db.IncidentLogs.Add(log);
        await _db.SaveChangesAsync();

        return true;
    }

    /// <summary>
    /// Chuyển đổi mã mức độ nghiêm trọng [dbo].[IncidentProfiles].[Level] sang text hiển thị
    /// 1 hoặc null: Nghiêm trọng (P1), 2: Trung bình (P2), khác: Thấp / Thông tin (P3)
    /// </summary>
    private string GetLevel(int? level) => level switch
    {
        1 or null => "Nghiêm trọng",
        2 => "Trung bình",
        _ => "Thấp"
    };

    /// <summary>
    /// Định dạng vị trí lý trình từ [dbo].[IncidentProfiles]: PositionKM và PositionM thành dạng: Km xxx+xxx
    /// </summary>
    private string FormatLocation(IncidentProfile? profile) => profile != null
        ? $"Km {profile.PositionKM}+{profile.PositionM:000}"
        : "Chưa xác định";

    /// <summary>
    /// Quy ước Hướng tuyến cao tốc Nội Bài - Lào Cai:
    /// Nguồn quy ước: Enum Direction trong ITS.Core.Shared & bảng [dbo].[Routes] (Mã NBLC, Km0+800 -> Km244+155)
    /// - 1 = NoiBai_LaoCai: Hướng đi từ Hà Nội (Nội Bài) lên Lào Cai
    /// - 2 = LaoCai_NoiBai: Hướng về từ Lào Cai về Hà Nội (Nội Bài)
    /// Lưu trong CSDL tại cột [dbo].[IncidentProfiles].[Direction]
    /// </summary>
    private string GetDirectionText(int? direction) => direction switch
    {
        1 => "Hà Nội ➔ Lào Cai",
        2 => "Lào Cai ➔ Hà Nội",
        _ => "Không xác định"
    };

    /// <summary>
    /// Chuyển đổi mã trạng thái nhiệm vụ [dbo].[TaskOfIncidents].[Status] sang text
    /// </summary>
    private string GetStatusText(int status) => status switch
    {
        1 => "Đã tiếp nhận (1)",
        2 => "Đang xử lý (2)",
        3 => "Hoàn thành (3)",
        _ => $"Trạng thái {status}"
    };
}
