using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITS_MOBILE_API.Models;

[Table("FilesOfIncidents")]
public class FilesOfIncident
{
    [Key] public long Id { get; set; }
    [Required] public string FileName { get; set; } = string.Empty;
    public int Size { get; set; }
    public int TypeFile { get; set; }
    public string? PathFile { get; set; }
    public string? Extension { get; set; }
    public long IncidentProfileId { get; set; }
    public long TaskId { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreationTime { get; set; }
    public long? CreatorUserId { get; set; }
}
