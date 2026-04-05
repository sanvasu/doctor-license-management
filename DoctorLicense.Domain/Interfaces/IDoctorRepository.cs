using DoctorLicense.Domain.Entities;

namespace DoctorLicense.Domain.Interfaces;

public interface IDoctorRepository
{
    Task<(IEnumerable<Doctor> Items, int TotalCount)> GetAllAsync(
        string? search,
        string? status,
        int pageNumber,
        int pageSize,
        CancellationToken ct = default);

    Task<Doctor?> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<bool> LicenseNumberExistsAsync(
        string licenseNumber,
        Guid? excludeId = null,
        CancellationToken ct = default);

    Task AddAsync(Doctor doctor, CancellationToken ct = default);

    void Update(Doctor doctor);

    Task<int> SaveChangesAsync(CancellationToken ct = default);

    Task<bool> EmailExistsAsync(
    string email,
    Guid? excludeId = null,
    CancellationToken ct = default);
}