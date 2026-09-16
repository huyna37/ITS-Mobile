using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITS_MOBILE_API.Models;

[Table("AbpUserLogins")]
public class AbpUserLogin
{
    [Key] public long Id { get; set; }
    public string LoginProvider { get; set; } = string.Empty;
    public string ProviderKey { get; set; } = string.Empty;
    public long UserId { get; set; }
    public int? TenantId { get; set; }
}
