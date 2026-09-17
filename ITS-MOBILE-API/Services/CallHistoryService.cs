using ITS_MOBILE_API.Data;
using ITS_MOBILE_API.Models;
using Microsoft.EntityFrameworkCore;

namespace ITS_MOBILE_API.Services;

public class CallHistoryService
{
    private readonly ItsDbContext _db;

    public CallHistoryService(ItsDbContext db)
    {
        _db = db;
    }

    public async Task<List<CallHistoryResponse>> GetHistory()
    {
        var calls = await _db.CallHistories
            .Where(c => !c.IsDeleted)
            .OrderByDescending(c => c.CreationTime)
            .Take(50)
            .ToListAsync();

        return calls.Select(c => new CallHistoryResponse(
            Id: c.Id.ToString(),
            Extension: c.PhoneNumber ?? string.Empty,
            Name: c.Supporter ?? "Không rõ",
            Time: FormatCallDateTime(c.CallDate),
            Duration: c.Duration > 0 ? FormatDuration(c.Duration) : FormatDuration(45),
            Status: GetStatusText(c.Status)
        )).ToList();
    }

    public async Task<List<CallHistoryResponse>> GetMissedCalls()
    {
        var calls = await _db.CallHistories
            .Where(c => !c.IsDeleted && c.Status == 3)
            .OrderByDescending(c => c.CreationTime)
            .Take(50)
            .ToListAsync();

        return calls.Select(c => new CallHistoryResponse(
            Id: c.Id.ToString(),
            Extension: c.PhoneNumber ?? string.Empty,
            Name: c.Supporter ?? "Không rõ",
            Time: FormatCallDateTime(c.CallDate),
            Duration: c.Duration > 0 ? FormatDuration(c.Duration) : null,
            Status: GetStatusText(c.Status)
        )).ToList();
    }

    public async Task<CallHistoryResponse> RecordCall(string extension, string name, int duration, int status, string identifier, bool isSos = false)
    {
        long.TryParse(identifier, out var userId);
        var user = await _db.AbpUsers.FirstOrDefaultAsync(u => (userId > 0 && u.Id == userId) || u.UserName == identifier);
        var callerName = user != null ? $"{user.Name} {user.Surname}".Trim() : identifier;

        // Bypass giả lập tổng đài: nếu chưa có tổng đài thật hoặc duration = 0, đặt cuộc gọi thành công 45s
        var actualDuration = duration > 0 ? duration : 45;
        var actualStatus = status > 0 ? status : 1; // 1: Thành công / Đã kết nối

        var call = new CallHistory
        {
            AsteriskId = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            PhoneNumber = extension,
            PrivateIdentity = extension,
            Supporter = !string.IsNullOrEmpty(name) ? name : callerName,
            CallDate = DateTime.UtcNow,
            Duration = actualDuration,
            Status = actualStatus,
            IsSOS = isSos,
            TypeId = isSos ? 1 : 0,
            IsDeleted = false,
            CreationTime = DateTime.UtcNow
        };

        _db.CallHistories.Add(call);
        await _db.SaveChangesAsync();

        return new CallHistoryResponse(
            Id: call.Id.ToString(),
            Extension: call.PhoneNumber ?? "N/A",
            Name: call.Supporter ?? "Không rõ",
            Time: FormatCallDateTime(call.CallDate),
            Duration: FormatDuration(call.Duration),
            Status: GetStatusText(call.Status)
        );
    }

    public async Task<CallHistoryResponse> BypassPbxCall(string extension, string name, int duration, string identifier)
    {
        var finalDuration = duration > 0 ? duration : 45;
        return await RecordCall(extension, name, finalDuration, 1, identifier, isSos: false);
    }

    public async Task<CallHistoryResponse> RecordSosCall(string hotline, string identifier, string? location = null)
    {
        long.TryParse(identifier, out var userId);
        var user = await _db.AbpUsers.FirstOrDefaultAsync(u => (userId > 0 && u.Id == userId) || u.UserName == identifier);
        var callerName = user != null ? $"{user.Name} {user.Surname}".Trim() : identifier;

        var supporterText = !string.IsNullOrEmpty(location)
            ? $"CỨU HỘ KHẨN CẤP SOS ({hotline}) - {location}"
            : $"CỨU HỘ KHẨN CẤP SOS ({hotline}) - Người gọi: {callerName}";

        var call = new CallHistory
        {
            AsteriskId = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            PhoneNumber = hotline,
            PrivateIdentity = hotline,
            Supporter = supporterText,
            CallDate = DateTime.UtcNow,
            Duration = 45, // Cuộc gọi cứu hộ thành công 45s
            Status = 1, // Thành công
            IsSOS = true,
            TypeId = 1, // Emergency
            IsDeleted = false,
            CreationTime = DateTime.UtcNow
        };

        _db.CallHistories.Add(call);
        await _db.SaveChangesAsync();

        return new CallHistoryResponse(
            Id: call.Id.ToString(),
            Extension: call.PhoneNumber ?? hotline,
            Name: call.Supporter ?? "Cứu hộ khẩn cấp SOS",
            Time: FormatCallDateTime(call.CallDate),
            Duration: FormatDuration(call.Duration),
            Status: "Thành công"
        );
    }

    public async Task<bool> EndCall(string callId, int duration)
    {
        if (!long.TryParse(callId, out var id)) return false;

        var call = await _db.CallHistories.FirstOrDefaultAsync(c => c.Id == id);
        if (call == null) return false;

        call.Duration = duration;
        call.Status = 2; // Đã ngắt
        call.CallDate = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteCallRecord(string callId)
    {
        if (!long.TryParse(callId, out var id)) return false;

        var call = await _db.CallHistories.FirstOrDefaultAsync(c => c.Id == id);
        if (call == null) return false;

        call.IsDeleted = true;
        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ClearHistory()
    {
        var allCalls = await _db.CallHistories.Where(c => !c.IsDeleted).ToListAsync();
        foreach (var call in allCalls)
        {
            call.IsDeleted = true;
        }
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<CallStatsResponse> GetStats()
    {
        var total = await _db.CallHistories.CountAsync(c => !c.IsDeleted);
        var missed = await _db.CallHistories.CountAsync(c => !c.IsDeleted && c.Status == 3);
        var sos = await _db.CallHistories.CountAsync(c => !c.IsDeleted && c.IsSOS == true);
        var totalSec = await _db.CallHistories.Where(c => !c.IsDeleted).SumAsync(c => (int?)c.Duration) ?? 0;

        return new CallStatsResponse(
            TotalCalls: total,
            MissedCalls: missed,
            SosCalls: sos,
            TotalDurationSeconds: totalSec,
            FormattedTotalDuration: FormatDuration(totalSec)
        );
    }

    private string FormatDuration(int seconds)
    {
        var m = seconds / 60;
        var s = seconds % 60;
        return $"{m}:{s:D2}";
    }

    private string FormatCallDateTime(DateTime date)
    {
        // SQL Server lưu giờ UTC dưới dạng Unspecified, chuyển đổi sang múi giờ Việt Nam (UTC+7)
        var localTime = date.Kind == DateTimeKind.Local ? date : date.AddHours(7);
        return localTime.ToString("HH:mm:ss dd/MM/yyyy");
    }

    private string GetStatusText(int status) => status switch
    {
        0 => "Thành công",
        1 => "Thành công",
        2 => "Đã ngắt",
        3 => "Nhỡ cuộc",
        _ => "Thành công"
    };
}
