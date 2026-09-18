using ITS_MOBILE_API.Models;
using ITS_MOBILE_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ITS_MOBILE_API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly FileService _fileService;

    public FilesController(FileService fileService)
    {
        _fileService = fileService;
    }

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<FileResponse>> UploadFile([FromForm] SingleFileUploadDto dto)
    {
        try
        {
            if (dto.File == null)
                return BadRequest(new { error = "Chưa chọn file tải lên" });
            var username = User.FindFirst("username")?.Value
                ?? User.FindFirst(ClaimTypes.Name)?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.Identity?.Name
                ?? "admin";

            var result = await _fileService.UploadFile(dto.File, username, dto.IncidentId, dto.TaskId);
            if (result == null)
                return BadRequest(new { error = "File không hợp lệ hoặc vượt quá kích thước" });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [HttpPost("upload-multiple")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<List<FileResponse>>> UploadMultiple([FromForm] MultipleFilesUploadDto dto)
    {
        try
        {
            var username = User.FindFirst("username")?.Value
                ?? User.FindFirst(ClaimTypes.Name)?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.Identity?.Name
                ?? "admin";

            if (dto.Files == null || !dto.Files.Any())
                return BadRequest(new { error = "Chưa có file nào được chọn" });

            var results = new List<FileResponse>();
            foreach (var file in dto.Files)
            {
                var result = await _fileService.UploadFile(file, username, dto.IncidentId, dto.TaskId);
                if (result != null)
                    results.Add(result);
            }

            if (!results.Any())
                return BadRequest(new { error = "Không có file hợp lệ" });

            return Ok(results);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadFile(string id, [FromQuery] bool download = false)
    {
        try
        {
            var username = User.FindFirst("username")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? "admin";

            var data = await _fileService.DownloadFile(id, username);
            if (data == null)
                return NotFound(new { error = "Không tìm thấy file" });

            var fileRecord = await _fileService.GetFileMetadata(id);
            if (fileRecord == null)
                return NotFound(new { error = "Không tìm thấy file" });

            var contentType = fileRecord.Type;
            if (string.IsNullOrWhiteSpace(contentType) || contentType == "application/octet-stream")
            {
                var ext = Path.GetExtension(fileRecord.Name)?.ToLowerInvariant();
                contentType = ext switch
                {
                    ".jfif" or ".jpg" or ".jpeg" => "image/jpeg",
                    ".png" => "image/png",
                    ".gif" => "image/gif",
                    ".webp" => "image/webp",
                    ".bmp" => "image/bmp",
                    ".svg" => "image/svg+xml",
                    ".mp4" => "video/mp4",
                    ".pdf" => "application/pdf",
                    _ => "application/octet-stream"
                };
            }

            if (download)
            {
                return File(data, contentType, fileRecord.Name);
            }

            // Inline display for images, videos, and previews
            Response.Headers.Append("Content-Disposition", $"inline; filename=\"{fileRecord.Name}\"");
            return File(data, contentType, enableRangeProcessing: true);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<FileMetadataResponse>> GetFileMetadata(string id)
    {
        try
        {
            var metadata = await _fileService.GetFileMetadata(id);
            if (metadata == null)
                return NotFound(new { error = "Không tìm thấy file" });

            return Ok(metadata);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteFile(string id)
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("username")?.Value;

            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { error = "Unauthorized" });

            var success = await _fileService.DeleteFile(id, username);
            if (!success)
                return NotFound(new { error = "Không tìm thấy file" });

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }
}

public class SingleFileUploadDto
{
    public IFormFile? File { get; set; }
    public string? IncidentId { get; set; }
    public string? TaskId { get; set; }
}

public class MultipleFilesUploadDto
{
    public IList<IFormFile>? Files { get; set; }
    public string? IncidentId { get; set; }
    public string? TaskId { get; set; }
}

