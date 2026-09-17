using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITS_MOBILE_API.Models;

[Table("CallHistories")]
public class CallHistory
{
    [Key] public long Id { get; set; }
    public int TypeId { get; set; }
    public int Status { get; set; }
    public long AsteriskId { get; set; }
    public string? PhoneNumber { get; set; }
    public int Duration { get; set; }
    public DateTime CallDate { get; set; }
    public string? Supporter { get; set; }
    public string? RecordFile { get; set; }
    public string? PrivateIdentity { get; set; }
    public string? UniqueIdCall { get; set; }
    public int? BillSec { get; set; }
    public bool? IsSOS { get; set; }
    public long Timestamp { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreationTime { get; set; }
}
