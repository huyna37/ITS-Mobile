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

    [Authorize]
    [HttpPost("upload")]
    public async Task<ActionResult<FileResponse>> UploadFile([FromForm] IFormFile file, [FromForm] string? incidentId)
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("username")?.Value;

            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { error = "Unauthorized" });

            var result = await _fileService.UploadFile(file, username, incidentId);
            if (result == null)
                return BadRequest(new { error = "File không hợp lệ hoặc vượt quá kích thước" });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("upload-multiple")]
    public async Task<ActionResult<List<FileResponse>>> UploadMultiple([FromForm] IList<IFormFile> files, [FromForm] string? incidentId)
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("username")?.Value;

            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { error = "Unauthorized" });

            if (files == null || !files.Any())
                return BadRequest(new { error = "Chưa có file nào được chọn" });

            var results = new List<FileResponse>();
            foreach (var file in files)
            {
                var result = await _fileService.UploadFile(file, username, incidentId);
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

    [Authorize]
    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadFile(string id)
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("username")?.Value;

            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { error = "Unauthorized" });

            var data = await _fileService.DownloadFile(id, username);
            if (data == null)
                return NotFound(new { error = "Không tìm thấy file" });

            var fileRecord = await _fileService.GetFileMetadata(id);
            if (fileRecord == null)
                return NotFound(new { error = "Không tìm thấy file" });

            return File(data, fileRecord.Type, fileRecord.Name);
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
