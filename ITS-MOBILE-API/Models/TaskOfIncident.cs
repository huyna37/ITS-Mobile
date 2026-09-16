using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITS_MOBILE_API.Models;

[Table("TaskOfIncidents")]
public class TaskOfIncident
{
    [Key] public long Id { get; set; }
    public string? Code { get; set; }
    [Required] public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int OrderNumber { get; set; }
    public int Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public long? IncidentProfileId { get; set; }
    public DateTime CreationTime { get; set; }
    public bool IsDeleted { get; set; }
    public virtual IncidentProfile? IncidentProfile { get; set; }
}
