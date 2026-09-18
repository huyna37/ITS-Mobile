using ITS_MOBILE_API.Data;
using ITS_MOBILE_API.Models;
using Microsoft.EntityFrameworkCore;

namespace ITS_MOBILE_API.Services;

public class FileService
{
    private readonly ItsDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly string _uploadPath;

    public FileService(ItsDbContext db, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
        _uploadPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "uploads");

        if (!Directory.Exists(_uploadPath))
            Directory.CreateDirectory(_uploadPath);
    }

    private string GetBaseUrl()
    {
        var request = _httpContextAccessor.HttpContext?.Request;
        return request != null ? $"{request.Scheme}://{request.Host}" : "";
    }

    public async Task<FileResponse?> UploadFile(IFormFile file, string username, string? incidentId, string? taskId = null)
    {
        if (file == null || file.Length == 0)
            return null;

        long.TryParse(username, out var uid);
        var user = await _db.AbpUsers.FirstOrDefaultAsync(u => u.UserName == username || (uid > 0 && u.Id == uid))
            ?? await _db.AbpUsers.FirstOrDefaultAsync(u => u.IsActive);

        var userFolder = user?.UserName ?? "uploads";

        // Validate file type & extension
        var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();
        var allowedExtensions = new[] { 
            ".jpg", ".jpeg", ".png", ".gif", ".webp", ".jfif", ".bmp", ".svg", ".heic", ".heif", ".ico",
            ".mp4", ".mov", ".avi", ".mkv", ".3gp", ".webm",
            ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".txt", ".zip", ".rar" 
        };
        var allowedTypes = new[] { 
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg", "image/pjpeg", "image/jfif", "image/bmp", "image/svg+xml",
            "video/mp4", "video/quicktime", "video/x-msvideo", 
            "application/pdf", "application/octet-stream", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        };

        bool isTypeAllowed = allowedTypes.Contains(file.ContentType?.ToLowerInvariant()) || 
                             (extension != null && allowedExtensions.Contains(extension));

        if (!isTypeAllowed)
            return null;

        // Validate file size (max 50MB)
        const long maxFileSize = 50 * 1024 * 1024;
        if (file.Length > maxFileSize)
            return null;

        // Generate unique filename
        var fileName = $"{Guid.NewGuid()}{extension}";
        var dateFolder = DateTime.UtcNow.ToString("yyyyMMdd");
        var userPath = Path.Combine(_uploadPath, userFolder);
        var datePath = Path.Combine(userPath, dateFolder);

        Directory.CreateDirectory(datePath);

        var filePath = Path.Combine(datePath, fileName);
        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        // Determine TypeFile (1 = image, 2 = video, 3 = document)
        int typeFile = 3;
        if (extension is ".jpg" or ".jpeg" or ".png" or ".gif" or ".webp" or ".jfif" or ".bmp" or ".svg" or ".heic" or ".heif" or ".ico") typeFile = 1;
        else if (extension is ".mp4" or ".mov" or ".avi" or ".mkv" or ".3gp" or ".webm") typeFile = 2;

        // Resolve valid IncidentProfileId and TaskId to satisfy FK_FilesOfIncidents_IncidentProfiles_IncidentProfileId
        long resolvedTaskId = 0;
        long resolvedIncidentProfileId = 0;

        // 1. Kiểm tra tham số taskId nếu được truyền
        if (!string.IsNullOrWhiteSpace(taskId) && long.TryParse(taskId, out var parsedTaskId) && parsedTaskId > 0)
        {
            var taskRecord = await _db.TaskOfIncidents.FirstOrDefaultAsync(t => t.Id == parsedTaskId);
            if (taskRecord != null)
            {
                resolvedTaskId = taskRecord.Id;
                if (taskRecord.IncidentProfileId.HasValue && taskRecord.IncidentProfileId.Value > 0)
                {
                    var inc = await _db.IncidentProfiles.FirstOrDefaultAsync(ip => ip.Id == taskRecord.IncidentProfileId.Value);
                    if (inc != null) resolvedIncidentProfileId = inc.Id;
                }
            }
        }

        // 2. Kiểm tra tham số incidentId
        if (resolvedIncidentProfileId == 0 && !string.IsNullOrWhiteSpace(incidentId))
        {
            if (long.TryParse(incidentId, out var parsedIncId) && parsedIncId > 0)
            {
                // Kiểm tra xem có phải trực tiếp là IncidentProfiles.Id không
                var inc = await _db.IncidentProfiles.FirstOrDefaultAsync(ip => ip.Id == parsedIncId);
                if (inc != null)
                {
                    resolvedIncidentProfileId = inc.Id;
                }
                else
                {
                    // Hoặc là TaskOfIncidents.Id
                    var taskRecord = await _db.TaskOfIncidents.FirstOrDefaultAsync(t => t.Id == parsedIncId);
                    if (taskRecord != null)
                    {
                        if (resolvedTaskId == 0) resolvedTaskId = taskRecord.Id;
                        if (taskRecord.IncidentProfileId.HasValue && taskRecord.IncidentProfileId.Value > 0)
                        {
                            var incFromTask = await _db.IncidentProfiles.FirstOrDefaultAsync(ip => ip.Id == taskRecord.IncidentProfileId.Value);
                            if (incFromTask != null) resolvedIncidentProfileId = incFromTask.Id;
                        }
                    }
                }
            }
            else
            {
                // Tìm theo Code (Mã sự cố hoặc mã nhiệm vụ)
                var incByCode = await _db.IncidentProfiles.FirstOrDefaultAsync(ip => ip.Code == incidentId);
                if (incByCode != null)
                {
                    resolvedIncidentProfileId = incByCode.Id;
                }
                else
                {
                    var taskByCode = await _db.TaskOfIncidents.FirstOrDefaultAsync(t => t.Code == incidentId);
                    if (taskByCode != null)
                    {
                        if (resolvedTaskId == 0) resolvedTaskId = taskByCode.Id;
                        if (taskByCode.IncidentProfileId.HasValue && taskByCode.IncidentProfileId.Value > 0)
                        {
                            var incFromTask = await _db.IncidentProfiles.FirstOrDefaultAsync(ip => ip.Id == taskByCode.IncidentProfileId.Value);
                            if (incFromTask != null) resolvedIncidentProfileId = incFromTask.Id;
                        }
                    }
                }
            }
        }

        // 3. Fallback: Nếu không tìm thấy hồ sơ chỉ định, lấy hồ sơ sự cố mới nhất trong DB
        // Điều này đảm bảo ràng buộc khóa ngoại FK_FilesOfIncidents_IncidentProfiles_IncidentProfileId không bao giờ bị lỗi
        if (resolvedIncidentProfileId == 0)
        {
            resolvedIncidentProfileId = await _db.IncidentProfiles
                .OrderByDescending(ip => ip.Id)
                .Select(ip => ip.Id)
                .FirstOrDefaultAsync();
        }

        // Lưu đường dẫn tương đối để không bị phụ thuộc vào thư mục cài đặt máy chủ
        var relativePath = $"uploads/{userFolder}/{dateFolder}/{fileName}";

        // Save metadata to database
        var fileRecord = new FilesOfIncident
        {
            FileName = file.FileName,
            Size = (int)file.Length,
            TypeFile = typeFile,
            PathFile = relativePath,
            Extension = extension,
            IncidentProfileId = resolvedIncidentProfileId,
            TaskId = resolvedTaskId,
            CreatorUserId = user?.Id,
            IsDeleted = false,
            CreationTime = DateTime.UtcNow
        };

        _db.FilesOfIncidents.Add(fileRecord);
        await _db.SaveChangesAsync();

        var baseUrl = GetBaseUrl();
        var fileUrl = string.IsNullOrEmpty(baseUrl)
            ? $"/api/files/{fileRecord.Id}/download"
            : $"{baseUrl}/api/files/{fileRecord.Id}/download";

        return new FileResponse(
            Id: fileRecord.Id.ToString(),
            Url: fileUrl,
            Name: file.FileName,
            Size: file.Length,
            Type: file.ContentType ?? GetContentType(extension)
        );
    }

    public async Task<List<FileResponse>> UploadMultipleFiles(List<IFormFile> files, string username, string? incidentId, string? taskId = null)
    {
        var results = new List<FileResponse>();
        foreach (var file in files)
        {
            var result = await UploadFile(file, username, incidentId, taskId);
            if (result != null)
                results.Add(result);
        }

        return results;
    }

    public async Task<FileResponse?> UploadSingleFile(IFormFile file, string username, string? incidentId, string? taskId = null)
    {
        var results = new List<FileResponse>();
        var result = await UploadFile(file, username, incidentId, taskId);
        if (result != null)
            results.Add(result);

        return results.Count > 0 ? results[0] : null;
    }

    public async Task<byte[]?> DownloadFile(string fileId, string username)
    {
        if (!long.TryParse(fileId, out var id)) return null;

        var fileRecord = await _db.FilesOfIncidents
            .FirstOrDefaultAsync(f => f.Id == id && !f.IsDeleted);

        if (fileRecord == null || string.IsNullOrWhiteSpace(fileRecord.PathFile)) return null;

        // 1. Kiểm tra trực tiếp đường dẫn
        if (File.Exists(fileRecord.PathFile))
            return await File.ReadAllBytesAsync(fileRecord.PathFile);

        // 2. Relative path từ AppDomain.CurrentDomain.BaseDirectory
        var altPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, fileRecord.PathFile);
        if (File.Exists(altPath))
            return await File.ReadAllBytesAsync(altPath);

        // 3. Relative path từ CurrentDirectory
        var altPath2 = Path.Combine(Directory.GetCurrentDirectory(), fileRecord.PathFile);
        if (File.Exists(altPath2))
            return await File.ReadAllBytesAsync(altPath2);

        // 4. Relative path từ _uploadPath
        var altPath3 = Path.Combine(_uploadPath, fileRecord.PathFile);
        if (File.Exists(altPath3))
            return await File.ReadAllBytesAsync(altPath3);

        return null;
    }

    public async Task<FileMetadataResponse?> GetFileMetadata(string fileId)
    {
        if (!long.TryParse(fileId, out var id)) return null;

        var fileRecord = await _db.FilesOfIncidents
            .FirstOrDefaultAsync(f => f.Id == id && !f.IsDeleted);

        if (fileRecord == null) return null;

        return new FileMetadataResponse(
            Id: fileRecord.Id.ToString(),
            Name: fileRecord.FileName,
            Size: fileRecord.Size,
            Type: GetContentType(fileRecord.Extension),
            UploadedAt: fileRecord.CreationTime.ToString("dd/MM/yyyy HH:mm")
        );
    }

    public async Task<bool> DeleteFile(string fileId, string username)
    {
        if (!long.TryParse(fileId, out var id)) return false;

        var fileRecord = await _db.FilesOfIncidents
            .FirstOrDefaultAsync(f => f.Id == id && !f.IsDeleted);

        if (fileRecord == null) return false;

        // Delete physical file
        if (!string.IsNullOrEmpty(fileRecord.PathFile) && File.Exists(fileRecord.PathFile))
            File.Delete(fileRecord.PathFile);

        // Soft delete
        fileRecord.IsDeleted = true;
        await _db.SaveChangesAsync();

        return true;
    }

    private string GetContentType(string? extension)
    {
        return extension?.ToLower() switch
        {
            ".jpg" or ".jpeg" or ".jfif" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            ".bmp" => "image/bmp",
            ".svg" => "image/svg+xml",
            ".heic" or ".heif" => "image/heic",
            ".ico" => "image/x-icon",
            ".mp4" => "video/mp4",
            ".mov" => "video/quicktime",
            ".pdf" => "application/pdf",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".xls" => "application/vnd.ms-excel",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".doc" => "application/msword",
            _ => "application/octet-stream"
        };
    }
}
