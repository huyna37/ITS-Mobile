using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITS_MOBILE_API.Models;

[Table("AppVersions", Schema = "dbo")]
public class AppVersion
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Version { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Platform { get; set; } = "all"; // "all", "android", "ios"

    [MaxLength(500)]
    public string BundleUrl { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string ChangeLog { get; set; } = string.Empty;

    public bool Mandatory { get; set; } = false;

    [MaxLength(50)]
    public string ReleaseDate { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
