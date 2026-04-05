using DoctorLicense.Application.DTOs;
using DoctorLicense.Application.Interfaces;
using DoctorLicense.Domain.Entities;
using DoctorLicense.Domain.Enums;
using DoctorLicense.Domain.Exceptions;
using DoctorLicense.Domain.Interfaces;

namespace DoctorLicense.Application.Services;

public class DoctorService : IDoctorService
{
    private readonly IDoctorRepository _repo;

    public DoctorService(IDoctorRepository repo)
    {
        _repo = repo;
    }

    public async Task<PagedResult<DoctorDto>> GetAllAsync(
        string? search,
        string? status,
        int pageNumber,
        int pageSize,
        CancellationToken ct = default)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var (items, totalCount) = await _repo.GetAllAsync(
            search, status, pageNumber, pageSize, ct);

        var dtos = items.Select(d => ToDto(d));

        return PagedResult<DoctorDto>.Create(dtos, totalCount, pageNumber, pageSize);
    }

    public async Task<DoctorDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var doctor = await GetOrThrowAsync(id, ct);
        doctor.EnsureExpiryStatus();
        return ToDto(doctor);
    }

    public async Task<DoctorDto> CreateAsync(CreateDoctorDto dto, CancellationToken ct = default)
    {
        await EnsureUniqueLicenseAsync(dto.LicenseNumber, excludeId: null, ct);
        await EnsureUniqueEmailAsync(dto.Email, excludeId: null, ct);

        var doctor = Doctor.Create(
            dto.FullName,
            dto.Email,
            dto.Specialization,
            dto.LicenseNumber,
            dto.LicenseExpiryDate);

        await _repo.AddAsync(doctor, ct);
        await _repo.SaveChangesAsync(ct);

        return ToDto(doctor);
    }

    public async Task<DoctorDto> UpdateAsync(
        Guid id, UpdateDoctorDto dto, CancellationToken ct = default)
    {
        var doctor = await GetOrThrowAsync(id, ct);

        await EnsureUniqueLicenseAsync(dto.LicenseNumber, excludeId: id, ct);
        await EnsureUniqueEmailAsync(dto.Email, excludeId: id, ct);

        doctor.Update(
            dto.FullName,
            dto.Email,
            dto.Specialization,
            dto.LicenseNumber,
            dto.LicenseExpiryDate);

        _repo.Update(doctor);
        await _repo.SaveChangesAsync(ct);

        return ToDto(doctor);
    }

    public async Task UpdateStatusAsync(
        Guid id, UpdateStatusDto dto, CancellationToken ct = default)
    {
        var doctor = await GetOrThrowAsync(id, ct);

        if (!Enum.TryParse<DoctorStatus>(dto.Status, ignoreCase: true, out var parsedStatus))
            throw new DomainValidationException(
                $"'{dto.Status}' is not a valid status. Valid values: Active, Expired, Suspended.");

        doctor.UpdateStatus(parsedStatus);

        _repo.Update(doctor);
        await _repo.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var doctor = await GetOrThrowAsync(id, ct);
        doctor.SoftDelete();
        _repo.Update(doctor);
        await _repo.SaveChangesAsync(ct);
    }

    private async Task<Doctor> GetOrThrowAsync(Guid id, CancellationToken ct)
    {
        var doctor = await _repo.GetByIdAsync(id, ct);
        if (doctor is null)
            throw new NotFoundException(nameof(Doctor), id);
        return doctor;
    }

    private async Task EnsureUniqueLicenseAsync(
        string licenseNumber, Guid? excludeId, CancellationToken ct)
    {
        var exists = await _repo.LicenseNumberExistsAsync(licenseNumber, excludeId, ct);
        if (exists)
            throw new ConflictException(
                $"License number '{licenseNumber.ToUpperInvariant()}' is already in use.");
    }

    private async Task EnsureUniqueEmailAsync(
    string email, Guid? excludeId, CancellationToken ct)
    {
        var exists = await _repo.EmailExistsAsync(email, excludeId, ct);
        if (exists)
            throw new ConflictException(
                $"Email '{email.ToLowerInvariant()}' is already in use.");
    }
    private static DoctorDto ToDto(Doctor d) => new(
        d.Id,
        d.FullName,
        d.Email,
        d.Specialization,
        d.LicenseNumber,
        d.LicenseExpiryDate,
        d.Status.ToString(),
        d.CreatedDate,
        d.UpdatedDate);
}