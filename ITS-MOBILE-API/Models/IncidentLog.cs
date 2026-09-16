using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITS_MOBILE_API.Models;

[Table("IncidentLogs")]
public class IncidentLog
{
    [Key] public long Id { get; set; }
    [Required] public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int ActionType { get; set; }
    public long IncidentProfileId { get; set; }
    public long? TaskId { get; set; }
    public int? TaskStatus { get; set; }
    public string? RefInfomation { get; set; }
    public DateTime CreationTime { get; set; }
}
