using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITS_MOBILE_API.Models;

[Table("IpPhones")]
public class IpPhone
{
    [Key] public long Id { get; set; }
    public string? Name { get; set; }
    public string? Code { get; set; }
    public string? PhoneNumber { get; set; }
    public string? IPAddress { get; set; }
    public int Status { get; set; }
    public int Direction { get; set; }
    public int AddressKM { get; set; }
    public int AddressM { get; set; }
    public string? Department { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public bool IsOnRoad { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? SetupDate { get; set; }
    public DateTime CreationTime { get; set; }
}
