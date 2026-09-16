using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITS_MOBILE_API.Models;

[Table("EventInfos")]
public class EventInfo
{
    [Key] public long Id { get; set; }
    [Required] public string Code { get; set; } = string.Empty;
    public DateTime TimeDetect { get; set; }
    public int Direction { get; set; }
    public int PositionKM { get; set; }
    public int PositionM { get; set; }
    public string? Description { get; set; }
    public string? AnnounverName { get; set; }
    public int Status { get; set; }
    public int DistanceEffected { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreationTime { get; set; }
}
