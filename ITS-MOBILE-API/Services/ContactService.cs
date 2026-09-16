using ITS_MOBILE_API.Data;
using ITS_MOBILE_API.Models;
using Microsoft.EntityFrameworkCore;

namespace ITS_MOBILE_API.Services;

public class ContactService
{
    private readonly ItsDbContext _db;

    public ContactService(ItsDbContext db)
    {
        _db = db;
    }

    public async Task<List<ContactResponse>> GetContacts()
    {
        var extensions = await _db.Extensions
            .Where(e => !e.IsDeleted && !string.IsNullOrEmpty(e.ExtensionNumber))
            .OrderBy(e => e.ExtensionNumber)
            .ToListAsync();

        // Check online status from IpPhones
        var ipPhones = await _db.IpPhones
            .Where(p => !p.IsDeleted && p.Status == 1)
            .ToDictionaryAsync(p => p.PhoneNumber ?? p.Code ?? string.Empty);

        return extensions.Select(e => new ContactResponse(
            Id: e.Id.ToString(),
            Name: e.ExtensionName ?? e.ExtensionUnsignedName ?? e.ExtensionNumber ?? "Unknown",
            Ext: e.ExtensionNumber ?? "N/A",
            Online: ipPhones.ContainsKey(e.ExtensionNumber ?? "")
        )).ToList();
    }

    public async Task<ContactResponse> CreateContact(CreateContactRequest req)
    {
        var ext = new Extension
        {
            ExtensionNumber = req.Ext,
            ExtensionName = req.Name,
            Type = 0,
            IsDeleted = false,
            CreationTime = DateTime.UtcNow
        };

        _db.Extensions.Add(ext);
        await _db.SaveChangesAsync();

        return new ContactResponse(ext.Id.ToString(), req.Name, req.Ext, false);
    }

    public async Task<bool> UpdateContact(long id, UpdateContactRequest req)
    {
        var ext = await _db.Extensions.FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);
        if (ext == null) return false;

        ext.ExtensionName = req.Name;
        ext.ExtensionNumber = req.Ext;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteContact(long id)
    {
        var ext = await _db.Extensions.FirstOrDefaultAsync(e => e.Id == id);
        if (ext == null) return false;

        ext.IsDeleted = true;
        ext.DeletionTime = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }
}
