using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITS_MOBILE_API.Models;

[Table("AbpUserRoles")]
public class AbpUserRole
{
    [Key] public long Id { get; set; }
    public long UserId { get; set; }
    public int RoleId { get; set; }
    public int? TenantId { get; set; }
    public DateTime CreationTime { get; set; }

    [ForeignKey("RoleId")]
    public virtual AbpRole? Role { get; set; }
}

[Table("AbpRoles")]
public class AbpRole
{
    [Key] public int Id { get; set; }
    [Required] public string NormalizedName { get; set; } = string.Empty;
    [Required] public string Name { get; set; } = string.Empty;
    public int? TenantId { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreationTime { get; set; }
}
