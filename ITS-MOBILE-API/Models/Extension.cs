using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITS_MOBILE_API.Models;

[Table("Extensions")]
public class Extension
{
    [Key] public long Id { get; set; }
    public string? ExtensionNumber { get; set; }
    public string? ExtensionName { get; set; }
    public string? ExtensionUnsignedName { get; set; }
    public string? ContactList { get; set; }
    public int Type { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletionTime { get; set; }
    public DateTime CreationTime { get; set; }
}
