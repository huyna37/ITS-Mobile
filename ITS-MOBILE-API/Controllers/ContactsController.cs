using ITS_MOBILE_API.Models;
using ITS_MOBILE_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITS_MOBILE_API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactsController : ControllerBase
{
    private readonly ContactService _contactService;

    public ContactsController(ContactService contactService)
    {
        _contactService = contactService;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<ContactResponse>>> GetContacts()
    {
        try
        {
            var contacts = await _contactService.GetContacts();
            return Ok(contacts);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ContactResponse>> CreateContact([FromBody] CreateContactRequest request)
    {
        try
        {
            var contact = await _contactService.CreateContact(request);
            return CreatedAtAction(nameof(GetContacts), contact);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpPatch("{id}")]
    public async Task<ActionResult> UpdateContact(long id, [FromBody] UpdateContactRequest request)
    {
        try
        {
            var success = await _contactService.UpdateContact(id, request);
            if (!success)
                return NotFound(new { error = "Không tìm thấy liên hệ" });

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteContact(long id)
    {
        try
        {
            var success = await _contactService.DeleteContact(id);
            if (!success)
                return NotFound(new { error = "Không tìm thấy liên hệ" });

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi kết nối cơ sở dữ liệu", detail = ex.Message });
        }
    }
}
