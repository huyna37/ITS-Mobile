using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITS_MOBILE_API.Models;

[Table("WorkerInfos")]
public class WorkerInfo
{
    [Key] public long Id { get; set; }
    public long UserId { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreationTime { get; set; }
}
