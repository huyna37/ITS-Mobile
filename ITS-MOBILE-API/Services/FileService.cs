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

        var user = await _db.AbpUsers.FirstOrDefaultAsync(u => u.UserName == username);
        if (user == null) return null;

        // Validate file type
        var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime", "application/pdf" };
        if (!allowedTypes.Contains(file.ContentType))
            return null;

        // Validate file size (max 10MB)
        const long maxFileSize = 10 * 1024 * 1024;
        if (file.Length > maxFileSize)
            return null;

        // Generate unique filename
        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{extension}";
        var dateFolder = DateTime.UtcNow.ToString("yyyyMMdd");
        var userFolder = Path.Combine(_uploadPath, user.UserName);
        var datePath = Path.Combine(userFolder, dateFolder);

        Directory.CreateDirectory(datePath);

        var filePath = Path.Combine(datePath, fileName);
        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        // Save metadata to database
        var fileRecord = new FilesOfIncident
        {
            FileName = file.FileName,
            Size = (int)file.Length,
            TypeFile = 1, // 1 = image, 2 = video, 3 = document
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
            Type: file.ContentType
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
