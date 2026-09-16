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
            .OrderByDescending(c => c.CreationTime)
            .Take(50)
            .ToListAsync();

        return calls.Select(c => new CallHistoryResponse(
            Id: c.Id.ToString(),
            Extension: c.PhoneNumber ?? c.PrivateIdentity ?? "N/A",
            Name: c.Supporter ?? "Không rõ",
            Time: c.CallDate.ToString("dd/MM HH:mm"),
            Duration: c.Duration > 0 ? FormatDuration(c.Duration) : null,
            Status: GetStatusText(c.Status)
        )).ToList();
    }

    public async Task<CallHistoryResponse?> RecordCall(string extension, string name, int duration, int status, string username)
    {
        var user = await _db.AbpUsers.FirstOrDefaultAsync(u => u.UserName == username);
        if (user == null) return null;

        var call = new CallHistory
        {
            PhoneNumber = user.SipNumber ?? extension,
            PrivateIdentity = user.SipNumber ?? extension,
            Supporter = name,
            CallDate = DateTime.UtcNow,
            Duration = duration,
            Status = status,
            CreationTime = DateTime.UtcNow
        };

        _db.CallHistories.Add(call);
        await _db.SaveChangesAsync();

        return new CallHistoryResponse(
            Id: call.Id.ToString(),
            Extension: call.PhoneNumber ?? "N/A",
            Name: call.Supporter ?? "Không rõ",
            Time: call.CallDate.ToString("dd/MM HH:mm"),
            Duration: call.Duration > 0 ? FormatDuration(call.Duration) : null,
            Status: GetStatusText(call.Status)
        );
    }

    public async Task<bool> EndCall(string callId, int duration)
    {
        if (!long.TryParse(callId, out var id)) return false;

        var call = await _db.CallHistories.FirstOrDefaultAsync(c => c.Id == id);
        if (call == null) return false;

        call.Duration = duration;
        call.Status = 2;
        call.CallDate = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteCallRecord(string callId)
    {
        if (!long.TryParse(callId, out var id)) return false;

        var call = await _db.CallHistories.FirstOrDefaultAsync(c => c.Id == id);
        if (call == null) return false;

        _db.CallHistories.Remove(call);
        await _db.SaveChangesAsync();

        return true;
    }

    private string FormatDuration(int seconds)
    {
        var m = seconds / 60;
        var s = seconds % 60;
        return $"{m}:{s:D2}";
    }

    private string GetStatusText(int status) => status switch
    {
        0 => "Đang quay số",
        1 => "Đang kết nối",
        2 => "Đã ngắt",
        3 => "Nhỡ cuộc",
        _ => "Không rõ"
    };
}
