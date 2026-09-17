using ITS_MOBILE_API.Data;
using ITS_MOBILE_API.Models;
using Microsoft.EntityFrameworkCore;

namespace ITS_MOBILE_API.Services;

public class FileService
{
    private readonly ItsDbContext _db;
    private readonly string _uploadPath;
    private readonly string _baseUrl;

    public FileService(ItsDbContext db, IConfiguration config)
    {
        _db = db;
        _uploadPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "uploads");
        _baseUrl = config["ApiBaseUrl"] ?? "http://localhost:5000";

        if (!Directory.Exists(_uploadPath))
            Directory.CreateDirectory(_uploadPath);
    }

    public async Task<FileResponse?> UploadFile(IFormFile file, string username, string? incidentId)
    {
        if (file == null || file.Length == 0)
            return null;

        long.TryParse(username, out var uid);
        var user = await _db.AbpUsers.FirstOrDefaultAsync(u => u.UserName == username || (uid > 0 && u.Id == uid))
            ?? await _db.AbpUsers.FirstOrDefaultAsync(u => u.IsActive);

        var userFolder = user?.UserName ?? "uploads";

        // Validate file type & extension
        var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".mov", ".avi", ".pdf", ".doc", ".docx", ".xls", ".xlsx" };
        var allowedTypes = new[] { 
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg", "image/pjpeg", 
            "video/mp4", "video/quicktime", "video/x-msvideo", 
            "application/pdf", "application/octet-stream" 
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
        if (extension is ".jpg" or ".jpeg" or ".png" or ".gif" or ".webp") typeFile = 1;
        else if (extension is ".mp4" or ".mov" or ".avi") typeFile = 2;

        // Save metadata to database
        var fileRecord = new FilesOfIncident
        {
            FileName = file.FileName,
            Size = (int)file.Length,
            TypeFile = typeFile,
            PathFile = filePath,
            Extension = extension,
            IncidentProfileId = long.TryParse(incidentId, out var incId) ? incId : 0,
            TaskId = 0,
            IsDeleted = false,
            CreationTime = DateTime.UtcNow
        };

        _db.FilesOfIncidents.Add(fileRecord);
        await _db.SaveChangesAsync();

        var fileUrl = $"{_baseUrl}/api/files/{fileRecord.Id}/download";

        return new FileResponse(
            Id: fileRecord.Id.ToString(),
            Url: fileUrl,
            Name: file.FileName,
            Size: file.Length,
            Type: file.ContentType ?? GetContentType(extension)
        );
    }

    public async Task<FileResponse?> UploadMultiple(IList<IFormFile> files, string username, string? incidentId)
    {
        var results = new List<FileResponse>();

        foreach (var file in files)
        {
            var result = await UploadFile(file, username, incidentId);
            if (result != null)
                results.Add(result);
        }

        return results.Count > 0 ? results[0] : null;
    }

    public async Task<byte[]?> DownloadFile(string fileId, string username)
    {
        if (!long.TryParse(fileId, out var id)) return null;

        var fileRecord = await _db.FilesOfIncidents
            .FirstOrDefaultAsync(f => f.Id == id && !f.IsDeleted);

        if (fileRecord == null) return null;

        if (File.Exists(fileRecord.PathFile))
            return await File.ReadAllBytesAsync(fileRecord.PathFile);

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
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            ".mp4" => "video/mp4",
            ".mov" => "video/quicktime",
            ".pdf" => "application/pdf",
            _ => "application/octet-stream"
        };
    }
}
