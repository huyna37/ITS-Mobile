using ITS_MOBILE_API.Data;
using ITS_MOBILE_API.Models;
using Microsoft.EntityFrameworkCore;

namespace ITS_MOBILE_API.Services;

public class TaskService
{
    private readonly ItsDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TaskService(ItsDbContext db, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
    }

    private string GetBaseUrl()
    {
        var request = _httpContextAccessor.HttpContext?.Request;
        return request != null ? $"{request.Scheme}://{request.Host}" : "";
    }

    private async Task<(Dictionary<long, List<TaskAttachmentDto>> attachments, Dictionary<long, List<TaskNoteDto>> notes)> GetAttachmentsAndNotesForTasks(List<TaskOfIncident> tasks)
    {
        var taskIds = tasks.Select(t => t.Id).ToList();
        var incProfileIds = tasks.Where(t => t.IncidentProfileId > 0).Select(t => t.IncidentProfileId!.Value).Distinct().ToList();

        // 1. FilesOfIncidents
        var files = await _db.FilesOfIncidents
            .Where(f => !f.IsDeleted && (taskIds.Contains(f.TaskId) || (f.IncidentProfileId > 0 && incProfileIds.Contains(f.IncidentProfileId))))
            .OrderByDescending(f => f.CreationTime)
            .ToListAsync();

        var baseUrl = GetBaseUrl();
        var attachmentsByTaskId = new Dictionary<long, List<TaskAttachmentDto>>();
        foreach (var task in tasks)
        {
            var taskFiles = files.Where(f => f.TaskId == task.Id || (task.IncidentProfileId > 0 && f.IncidentProfileId == task.IncidentProfileId && f.TaskId == 0)).ToList();
            attachmentsByTaskId[task.Id] = taskFiles.Select(f =>
            {
                var ext = Path.GetExtension(f.FileName ?? f.PathFile ?? "").ToLowerInvariant();
                var isImg = f.TypeFile == 1 || ext is ".jpg" or ".jpeg" or ".png" or ".gif" or ".webp" or ".jfif" or ".bmp" or ".svg" or ".heic" or ".heif" or ".ico";
                var isVid = f.TypeFile == 2 || ext is ".mp4" or ".mov" or ".avi" or ".mkv" or ".3gp" or ".webm";
                var type = isImg ? "image" : isVid ? "video" : "document";
                var downloadUri = string.IsNullOrEmpty(baseUrl) ? $"/api/files/{f.Id}/download" : $"{baseUrl}/api/files/{f.Id}/download";
                return new TaskAttachmentDto(
                    Id: f.Id.ToString(),
                    Name: f.FileName ?? Path.GetFileName(f.PathFile ?? "") ?? "file",
                    Uri: downloadUri,
                    Type: type,
                    SizeBytes: f.Size,
                    UploadedAt: f.CreationTime.ToString("yyyy-MM-ddTHH:mm:ssZ")
                );
            }).ToList();
        }

        // 2. IncidentLogs
        var logs = await _db.IncidentLogs
            .Where(l => (l.TaskId.HasValue && taskIds.Contains(l.TaskId.Value)) || (l.IncidentProfileId > 0 && incProfileIds.Contains(l.IncidentProfileId)))
            .OrderByDescending(l => l.CreationTime)
            .ToListAsync();

        var notesByTaskId = new Dictionary<long, List<TaskNoteDto>>();
        foreach (var task in tasks)
        {
            var taskLogs = logs.Where(l => (l.TaskId.HasValue && l.TaskId.Value == task.Id) || (task.IncidentProfileId > 0 && l.IncidentProfileId == task.IncidentProfileId && (!l.TaskId.HasValue || l.TaskId.Value == 0))).ToList();
            notesByTaskId[task.Id] = taskLogs.Select(l =>
            {
                var parsed = ParseIncidentLog(l);
                return new TaskNoteDto(
                    Id: l.Id.ToString(),
                    Author: parsed.Author,
                    Content: parsed.Content,
                    CreatedAt: l.CreationTime.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    OldStatus: parsed.OldStatus,
                    NewStatus: parsed.NewStatus,
                    LogType: parsed.LogType
                );
            }).ToList();
        }

        return (attachmentsByTaskId, notesByTaskId);
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

        var (attachments, notes) = await GetAttachmentsAndNotesForTasks(tasks);

        return tasks.Select(t => new TaskResponse(
            Id: t.Id.ToString(),                                         // [dbo].[TaskOfIncidents].[Id] (Khóa chính Task)
            Code: t.Code ?? "N/A",                                      // [dbo].[TaskOfIncidents].[Code] (Mã nhiệm vụ, nếu NULL hiển thị N/A)
            Type: t.Name,                                               // [dbo].[TaskOfIncidents].[Name] (Tên nhiệm vụ / loại công việc)
            Level: GetLevel(t.IncidentProfile?.Level ?? 0),             // [dbo].[IncidentProfiles].[Level] (Cấp độ sự cố: 0=Thấp/Thông tin, 1=Nghiêm trọng, 2=Trung bình)
            Location: FormatLocation(t.IncidentProfile),                // [dbo].[IncidentProfiles].[PositionKM] + [PositionM] (Lý trình: Km xxx+xxx)
            Direction: GetDirectionText(t.IncidentProfile?.Direction ?? 0), // [dbo].[IncidentProfiles].[Direction] (Quy ước: 1=Hà Nội -> Lào Cai, 2=Lào Cai -> Hà Nội)
            Time: t.StartDate.ToString("yyyy-MM-ddTHH:mm:ssZ"),        // [dbo].[TaskOfIncidents].[StartDate]
            Status: t.Status,                                           // [dbo].[TaskOfIncidents].[Status] (0: Đã giao, 1: Đã nhận, 2: Đang xử lý, 3: Hoàn thành)
            Description: t.IncidentProfile?.Description,                // [dbo].[IncidentProfiles].[Description] (Mô tả chi tiết sự cố)
            Script: t.IncidentProfile?.Script,                          // [dbo].[IncidentProfiles].[Script] / [ScriptId] (Kịch bản phương án xử lý)
            IncidentCode: t.IncidentProfile?.Code,                      // [dbo].[IncidentProfiles].[Code] (Mã hồ sơ sự cố liên kết)
            Attachments: attachments.GetValueOrDefault(t.Id, new()),
            Notes: notes.GetValueOrDefault(t.Id, new())
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
            .OrderByDescending(t => t.EndDate)
            .ThenByDescending(t => t.CreationTime);

        var tasks = count.HasValue
            ? await query.Take(count.Value).ToListAsync()
            : await query.ToListAsync();

        var (attachments, notes) = await GetAttachmentsAndNotesForTasks(tasks);

        return tasks.Select(t => new TaskResponse(
            Id: t.Id.ToString(),
            Code: t.Code ?? "N/A",
            Type: t.Name,
            Level: GetLevel(t.IncidentProfile?.Level ?? 0),
            Location: FormatLocation(t.IncidentProfile),
            Direction: GetDirectionText(t.IncidentProfile?.Direction ?? 0),
            Time: t.EndDate.ToString("yyyy-MM-ddTHH:mm:ssZ"),
            Status: 3,
            Description: t.IncidentProfile?.Description,
            Script: t.IncidentProfile?.Script,
            IncidentCode: t.IncidentProfile?.Code,
            Attachments: attachments.GetValueOrDefault(t.Id, new()),
            Notes: notes.GetValueOrDefault(t.Id, new())
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
            .Select(l =>
            {
                var parsed = ParseIncidentLog(l);
                return new StatusLogEntry(
                    Time: l.CreationTime.ToString("HH:mm dd/MM/yyyy"),
                    Text: parsed.Content,
                    Actor: parsed.Author,
                    OldStatus: parsed.OldStatus,
                    NewStatus: parsed.NewStatus
                );
            }).ToList();

        logs.Add(new StatusLogEntry(
            Time: task.StartDate.ToString("HH:mm dd/MM/yyyy"),
            Text: "Phân công nhiệm vụ từ ITS/TMC",
            Actor: "Hệ thống",
            OldStatus: "Khởi tạo",
            NewStatus: "Đã phân công"
        ));

        var (attachments, notes) = await GetAttachmentsAndNotesForTasks(new List<TaskOfIncident> { task });

        return new TaskDetailResponse(
            Id: task.Id.ToString(),
            Code: task.Code ?? "N/A",                                      // [dbo].[TaskOfIncidents].[Code]
            Type: task.Name,                                               // [dbo].[TaskOfIncidents].[Name]
            Level: GetLevel(task.IncidentProfile!.Level),                  // [dbo].[IncidentProfiles].[Level]
            Location: FormatLocation(task.IncidentProfile),                // [dbo].[IncidentProfiles].[PositionKM]+[PositionM]
            Direction: GetDirectionText(task.IncidentProfile.Direction),   // [dbo].[IncidentProfiles].[Direction]
            Time: task.StartDate.ToString("dd/MM/yyyy"),
            Status: task.Status,
            Description: task.IncidentProfile.Description ?? "Chưa có mô tả",
            Script: task.IncidentProfile.Script ?? "Chưa có phương án",
            StatusLog: logs,
            IncidentCode: task.IncidentProfile.Code,                       // [dbo].[IncidentProfiles].[Code] (Mã hồ sơ sự cố)
            Attachments: attachments.GetValueOrDefault(task.Id, new()),
            Notes: notes.GetValueOrDefault(task.Id, new())
        );
    }

    /// <summary>
    /// Gửi báo cáo hiện trường (ghi chú + liên kết tệp đính kèm)
    /// </summary>
    public async Task<bool> SubmitReport(string taskId, SubmitReportRequest request, string username)
    {
        if (!long.TryParse(taskId, out var id)) return false;

        var task = await _db.TaskOfIncidents
            .Include(t => t.IncidentProfile)
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

        if (task == null) return false;

        if (!string.IsNullOrWhiteSpace(request.Note))
        {
            var log = new IncidentLog
            {
                Title = "Ghi nhận hiện trường",
                Description = request.Note.Trim(),
                ActionType = 4,
                IncidentProfileId = task.IncidentProfileId ?? 0,
                TaskId = task.Id,
                TaskStatus = task.Status,
                RefInfomation = string.IsNullOrWhiteSpace(request.Actor) ? username : request.Actor,
                CreationTime = DateTime.UtcNow
            };
            _db.IncidentLogs.Add(log);
        }

        if (request.FileIds != null && request.FileIds.Any())
        {
            foreach (var fileIdStr in request.FileIds)
            {
                if (long.TryParse(fileIdStr, out var fileId))
                {
                    var file = await _db.FilesOfIncidents.FirstOrDefaultAsync(f => f.Id == fileId);
                    if (file != null)
                    {
                        file.TaskId = task.Id;
                        if (task.IncidentProfileId.HasValue && task.IncidentProfileId.Value > 0)
                        {
                            file.IncidentProfileId = task.IncidentProfileId.Value;
                        }
                    }
                }
            }
        }

        await _db.SaveChangesAsync();
        return true;
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
        1 => "Đã tiếp nhận",
        2 => "Đang xử lý",
        3 => "Hoàn thành",
        _ => $"Trạng thái {status}"
    };

    private static string CleanHtmlAndJson(string? input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;
        var stripped = System.Text.RegularExpressions.Regex.Replace(input, "<.*?>", string.Empty);
        return stripped.Trim();
    }

    private static (string Content, string Author, string? OldStatus, string? NewStatus, string LogType) ParseIncidentLog(IncidentLog log)
    {
        var author = "Hệ thống";
        if (!string.IsNullOrWhiteSpace(log.RefInfomation))
        {
            if (log.RefInfomation.TrimStart().StartsWith("{"))
            {
                author = "Điều hành TMC";
            }
            else
            {
                author = log.RefInfomation.Trim();
            }
        }

        // 1. Ghi nhận hiện trường gửi từ mobile (ActionType = 4 hoặc Title = "Ghi nhận hiện trường")
        if (log.ActionType == 4 || log.Title == "Ghi nhận hiện trường")
        {
            return (
                Content: !string.IsNullOrWhiteSpace(log.Description) ? log.Description.Trim() : log.Title,
                Author: author,
                OldStatus: null,
                NewStatus: null,
                LogType: "FIELD_NOTE"
            );
        }

        // 2. Chuyển trạng thái nhiệm vụ
        if (log.ActionType == 1 || log.ActionType == 2 || log.ActionType == 3)
        {
            string oldSt = log.ActionType switch
            {
                1 => "Chờ tiếp nhận",
                2 => "Đã tiếp nhận",
                3 => "Đang xử lý",
                _ => "Khởi tạo"
            };
            string newSt = log.ActionType switch
            {
                1 => "Đã tiếp nhận",
                2 => "Đang xử lý",
                3 => "Hoàn thành",
                _ => $"Bước {log.ActionType}"
            };

            return (
                Content: $"{oldSt} ➔ {newSt}",
                Author: author,
                OldStatus: oldSt,
                NewStatus: newSt,
                LogType: "STATUS_CHANGE"
            );
        }

        // 3. Phân tích nội dung JSON từ TMC (Description_ChangeStatusProfile)
        var rawDesc = log.Description ?? string.Empty;
        var rawTitle = log.Title ?? string.Empty;
        var combined = rawDesc + " " + rawTitle;

        if (combined.Contains("Description_ChangeStatusProfile"))
        {
            try
            {
                var jsonStr = rawDesc.TrimStart().StartsWith("{") ? rawDesc : rawTitle;
                using var doc = System.Text.Json.JsonDocument.Parse(jsonStr);
                if (doc.RootElement.TryGetProperty("Param", out var paramEl) && paramEl.ValueKind == System.Text.Json.JsonValueKind.Array)
                {
                    var pList = paramEl.EnumerateArray().ToList();
                    var oldVal = pList.Count > 0 ? CleanHtmlAndJson(pList[0].GetString()) : "Chờ xử lý";
                    var newVal = pList.Count > 1 ? CleanHtmlAndJson(pList[1].GetString()) : "Đang xử lý";

                    if (string.IsNullOrWhiteSpace(oldVal)) oldVal = "Chờ xử lý";
                    if (string.IsNullOrWhiteSpace(newVal)) newVal = "Đang xử lý";

                    return (
                        Content: $"{oldVal} ➔ {newVal}",
                        Author: author,
                        OldStatus: oldVal,
                        NewStatus: newVal,
                        LogType: "STATUS_CHANGE"
                    );
                }
            }
            catch
            {
                return (
                    Content: "Chờ xử lý ➔ Đang xử lý",
                    Author: author,
                    OldStatus: "Chờ xử lý",
                    NewStatus: "Đang xử lý",
                    LogType: "STATUS_CHANGE"
                );
            }
        }

        if (combined.Contains("Description_AddTasks"))
        {
            try
            {
                var jsonStr = rawDesc.TrimStart().StartsWith("{") ? rawDesc : rawTitle;
                using var doc = System.Text.Json.JsonDocument.Parse(jsonStr);
                if (doc.RootElement.TryGetProperty("Param", out var paramEl) && paramEl.ValueKind == System.Text.Json.JsonValueKind.Array)
                {
                    var taskName = paramEl.EnumerateArray().FirstOrDefault().GetString();
                    return (
                        Content: $"Giao nhiệm vụ: {taskName}",
                        Author: author,
                        OldStatus: null,
                        NewStatus: null,
                        LogType: "FIELD_NOTE"
                    );
                }
            }
            catch {}
            return ("Giao nhiệm vụ hiện trường", author, null, null, "FIELD_NOTE");
        }

        if (combined.Contains("Description_SetUpProcessingScripts"))
        {
            return ("Thiết lập phương án xử lý sự cố", author, null, null, "FIELD_NOTE");
        }

        if (combined.Contains("Description_UpdateMissionInformation"))
        {
            return ("Cập nhật thông tin nhiệm vụ", author, null, null, "FIELD_NOTE");
        }

        if (combined.Contains("Description_AddEventInProfile"))
        {
            return ("Ghi nhận sự cố vào hồ sơ", author, null, null, "FIELD_NOTE");
        }

        // Mặc định làm sạch chuỗi
        var cleanContent = CleanHtmlAndJson(string.IsNullOrWhiteSpace(log.Description) ? log.Title : log.Description);
        if (cleanContent.StartsWith("{"))
        {
            cleanContent = "Cập nhật thông tin sự cố";
        }

        return (
            Content: cleanContent,
            Author: author,
            OldStatus: null,
            NewStatus: null,
            LogType: "FIELD_NOTE"
        );
    }
}
