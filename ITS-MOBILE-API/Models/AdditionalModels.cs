using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITS_MOBILE_API.Models;

[Table("AbpUserOrganizationUnits")]
public class AbpUserOrganizationUnit
{
    [Key] public Guid Id { get; set; }
    public long UserId { get; set; }
    public long OrganizationUnitId { get; set; }
    public int? TenantId { get; set; }
    public DateTime CreationTime { get; set; }
}

[Table("AbpOrganizationUnits")]
public class AbpOrganizationUnit
{
    [Key] public long Id { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public long? ParentId { get; set; }
    public int? TenantId { get; set; }
}

[Table("TaskOfScripts")]
public class TaskOfScript
{
    [Key] public long Id { get; set; }
    [Required] public string Code { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Description { get; set; }
    public int OrderNumber { get; set; }
    public long ScriptInfoId { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreationTime { get; set; }
}

[Table("ExtensionDetails")]
public class ExtensionDetail
{
    [Key] public long Id { get; set; }
    public string? Key { get; set; }
    public string? Value { get; set; }
    public Guid GuiId { get; set; }
    public long? ExtensionId { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreationTime { get; set; }
}

[Table("AsteriskCDR")]
public class AsteriskCDR
{
    [Key] public long Id { get; set; }
    public string? UniqueId { get; set; }
    public string? Src { get; set; }
    public string? Dst { get; set; }
    public string? Dcontext { get; set; }
    public int Duration { get; set; }
    public int BillSec { get; set; }
    public string? Disposition { get; set; }
    public DateTime StartTime { get; set; }
}

[Table("AbpUserNotifications")]
public class AbpUserNotification
{
    [Key] public Guid Id { get; set; }
    public Guid TenantNotificationId { get; set; }
    public long UserId { get; set; }
    public int State { get; set; }
    public DateTime CreationTime { get; set; }
}

[Table("AbpNotifications")]
public class AbpNotification
{
    [Key] public Guid Id { get; set; }
    [Required] public string NotificationName { get; set; } = string.Empty;
    public byte Severity { get; set; }
    public string? Data { get; set; }
    public DateTime CreationTime { get; set; }
}
