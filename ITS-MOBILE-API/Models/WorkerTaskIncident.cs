using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITS_MOBILE_API.Models;

[Table("WorkerTaskIncidents")]
public class WorkerTaskIncident
{
    [Key] public long Id { get; set; }
    public bool IsActive { get; set; }
    public long? OrganizationUnitId { get; set; }
    public long? UserId { get; set; }
    public long? TaskOfIncidentId { get; set; }
}
