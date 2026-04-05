using DoctorLicense.Application.DTOs;
using DoctorLicense.Application.Interfaces;
using DoctorLicense.Application.Validators;
using Microsoft.AspNetCore.Mvc;

namespace DoctorLicense.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly IDoctorService _service;

    public DoctorsController(IDoctorService service)
    {
        _service = service;
    }

    // GET api/doctors?search=john&status=Active&pageNumber=1&pageSize=10
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await _service.GetAllAsync(search, status, pageNumber, pageSize, ct);
        return Ok(result);
    }

    // GET api/doctors/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var doctor = await _service.GetByIdAsync(id, ct);
        return Ok(doctor);
    }

    // POST api/doctors
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateDoctorDto dto,
        CancellationToken ct = default)
    {
        // Validate first
        var validator = new CreateDoctorValidator();
        var validation = await validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return BadRequest(new
            {
                message = "Validation failed.",
                errors = validation.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.ErrorMessage).ToArray())
            });

        var doctor = await _service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = doctor.Id }, doctor);
    }

    // PUT api/doctors/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateDoctorDto dto,
        CancellationToken ct = default)
    {
        var validator = new UpdateDoctorValidator();
        var validation = await validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return BadRequest(new
            {
                message = "Validation failed.",
                errors = validation.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.ErrorMessage).ToArray())
            });

        var doctor = await _service.UpdateAsync(id, dto, ct);
        return Ok(doctor);
    }

    // PATCH api/doctors/{id}/status
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        [FromBody] UpdateStatusDto dto,
        CancellationToken ct = default)
    {
        var validator = new UpdateStatusValidator();
        var validation = await validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return BadRequest(new
            {
                message = "Validation failed.",
                errors = validation.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.ErrorMessage).ToArray())
            });

        await _service.UpdateStatusAsync(id, dto, ct);
        return NoContent();
    }

    // DELETE api/doctors/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct = default)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}