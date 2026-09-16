using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITS_MOBILE_API.Models;

[Table("IncidentProfiles")]
public class IncidentProfile
{
    [Key] public long Id { get; set; }
    [Required] public string Code { get; set; } = string.Empty;
    public DateTime TimeDetect { get; set; }
    public int Direction { get; set; }
    public int PositionKM { get; set; }
    public int PositionM { get; set; }
    public string? Description { get; set; }
    public int Status { get; set; }
    public long TimeStamp { get; set; }
    public int Level { get; set; }
    public string? Script { get; set; }
    public virtual List<IncidentLog>? IncidentLogs { get; set; }
    public string? Reason { get; set; }
    public string? Damage { get; set; }
    public DateTime? StartProcessTime { get; set; }
    public DateTime? EndProcessTime { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreationTime { get; set; }
    public long? ScriptId { get; set; }
    public string? BeginInfomation { get; set; }
    public string? ResultPolice { get; set; }
}
