using Dapper;
using DoctorLicense.Domain.Entities;
using DoctorLicense.Domain.Interfaces;
using DoctorLicense.Infrastructure.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace DoctorLicense.Infrastructure.Repositories;

public class DoctorRepository : IDoctorRepository
{
    private readonly AppDbContext _context;
    private readonly string _connectionString;

    public DoctorRepository(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _connectionString = config.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Connection string 'DefaultConnection' is not configured.");
    }


    public async Task<(IEnumerable<Doctor> Items, int TotalCount)> GetAllAsync(
        string? search,
        string? status,
        int pageNumber,
        int pageSize,
        CancellationToken ct = default)
    {
        await using var connection = new SqlConnection(_connectionString);

        var results = await connection.QueryAsync<DoctorRow>(
            "usp_GetDoctors",
            new
            {
                Search = search,
                Status = status,
                PageNumber = pageNumber,
                PageSize = pageSize
            },
            commandType: System.Data.CommandType.StoredProcedure
        );

        var rows = results.ToList();
        var totalCount = rows.FirstOrDefault()?.TotalCount ?? 0;

    
        var doctors = rows.Select(r => MapToDomain(r));

        return (doctors, totalCount);
    }


    public async Task<Doctor?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Doctors
            .FirstOrDefaultAsync(d => d.Id == id, ct);

    public async Task<bool> LicenseNumberExistsAsync(
        string licenseNumber,
        Guid? excludeId = null,
        CancellationToken ct = default)
        => await _context.Doctors
            .AnyAsync(d =>
                d.LicenseNumber == licenseNumber.ToUpperInvariant() &&
                d.Id != excludeId,
                ct);

    public async Task AddAsync(Doctor doctor, CancellationToken ct = default)
        => await _context.Doctors.AddAsync(doctor, ct);

    public void Update(Doctor doctor)
        => _context.Doctors.Update(doctor);

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        => await _context.SaveChangesAsync(ct);


    private class DoctorRow
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Specialization { get; set; } = default!;
        public string LicenseNumber { get; set; } = default!;
        public DateTime LicenseExpiryDate { get; set; }
        public string Status { get; set; } = default!;
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public int TotalCount { get; set; }
    }

    private static Doctor MapToDomain(DoctorRow row)
    {
       
        var doctor = (Doctor)System.Runtime.CompilerServices
            .RuntimeHelpers.GetUninitializedObject(typeof(Doctor));

        typeof(Doctor).GetProperty(nameof(Doctor.Id))!
            .SetValue(doctor, row.Id);
        typeof(Doctor).GetProperty(nameof(Doctor.FullName))!
            .SetValue(doctor, row.FullName);
        typeof(Doctor).GetProperty(nameof(Doctor.Email))!
            .SetValue(doctor, row.Email);
        typeof(Doctor).GetProperty(nameof(Doctor.Specialization))!
            .SetValue(doctor, row.Specialization);
        typeof(Doctor).GetProperty(nameof(Doctor.LicenseNumber))!
            .SetValue(doctor, row.LicenseNumber);
        typeof(Doctor).GetProperty(nameof(Doctor.LicenseExpiryDate))!
            .SetValue(doctor, row.LicenseExpiryDate);
        typeof(Doctor).GetProperty(nameof(Doctor.Status))!
            .SetValue(doctor, Enum.Parse<Domain.Enums.DoctorStatus>(row.Status));
        typeof(Doctor).GetProperty(nameof(Doctor.IsDeleted))!
            .SetValue(doctor, row.IsDeleted);
        typeof(Doctor).GetProperty(nameof(Doctor.CreatedDate))!
            .SetValue(doctor, row.CreatedDate);
        typeof(Doctor).GetProperty(nameof(Doctor.UpdatedDate))!
            .SetValue(doctor, row.UpdatedDate);

        return doctor;
    }
}



