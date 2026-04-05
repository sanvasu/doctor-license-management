using DoctorLicense.Application.DTOs;

namespace DoctorLicense.Application.Interfaces;

public interface IDoctorService
{
    Task<PagedResult<DoctorDto>> GetAllAsync(
        string? search,
        string? status,
        int pageNumber,
        int pageSize,
        CancellationToken ct = default);

    Task<DoctorDto> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<DoctorDto> CreateAsync(CreateDoctorDto dto, CancellationToken ct = default);

    Task<DoctorDto> UpdateAsync(Guid id, UpdateDoctorDto dto, CancellationToken ct = default);

    Task UpdateStatusAsync(Guid id, UpdateStatusDto dto, CancellationToken ct = default);

    Task DeleteAsync(Guid id, CancellationToken ct = default);
}