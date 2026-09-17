namespace ITS_MOBILE_API.Models;

public record LoginRequest(string Username, string Password, string Extension);
public record LoginResponse(string Token, string RefreshToken, string TenNhanVien, string ChucVu, string DonVi, string Extension, string Username, long ExpiresIn);
public record ProfileResponse(string TenNhanVien, string ChucVu, string DonVi, string Extension, string Username);
public record TaskResponse(string Id, string Code, string Type, string Level, string Location, string Direction, string Time, int Status, string? Description, string? Script, string? IncidentCode = null);
public record TaskDetailResponse(string Id, string Code, string Type, string Level, string Location, string Direction, string Time, int Status, string Description, string Script, List<StatusLogEntry> StatusLog, string? IncidentCode = null);
public record StatusLogEntry(string Time, string Text, string Actor);
public class StatusUpdateRequest
{
    public int Status { get; set; }
    public string? Actor { get; set; }
}
public record ContactResponse(string Id, string Name, string Ext, bool Online);
public record CreateContactRequest(string Name, string Ext);
public record UpdateContactRequest(string Name, string Ext);
public record CallHistoryResponse(string Id, string Extension, string Name, string Time, string? Duration, string Status);
public record NotificationResponse(string Id, string Title, string Desc, string Time, bool Unread);
public record IncidentResponse(string Id, string Kind, string Title, string Location, string Time, string Tag);
public record IncidentDetailResponse(string Id, string Kind, string Title, string Location, string Time, string Tag, string Description, string Script, string Level, string Direction, List<StatusLogEntry> StatusLog);
public record UnreadCountResponse(int Count);
public record RecordCallRequest(string Extension, string Name, int? Duration, int Status);
public record FileResponse(string Id, string Url, string Name, long Size, string Type);
public record FileMetadataResponse(string Id, string Name, long Size, string Type, string UploadedAt);
public record CallStatsResponse(int TotalCalls, int MissedCalls, int SosCalls, int TotalDurationSeconds, string FormattedTotalDuration);
public class SosCallRequest
{
    public string? Hotline { get; set; }
    public string? Location { get; set; }
}
