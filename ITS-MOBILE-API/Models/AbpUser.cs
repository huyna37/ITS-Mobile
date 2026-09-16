using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITS_MOBILE_API.Models;

[Table("AbpUsers")]
public class AbpUser
{
    [Key] public long Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string EmailAddress { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; }
    public bool IsEmailConfirmed { get; set; }
    public string? SipNumber { get; set; }
    public string? SipNumberSOS { get; set; }
    public string? Password { get; set; }
    public int? TenantId { get; set; }
    public DateTime CreationTime { get; set; }
}
