using DoctorLicense.Domain.Enums;

namespace DoctorLicense.Domain.Entities;

public class Doctor
{
    public Guid Id { get; private set; }
    public string FullName { get; private set; } = default!;
    public string Email { get; private set; } = default!;
    public string Specialization { get; private set; } = default!;
    public string LicenseNumber { get; private set; } = default!;
    public DateTime LicenseExpiryDate { get; private set; }
    public DoctorStatus Status { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTime CreatedDate { get; private set; }
    public DateTime? UpdatedDate { get; private set; }

    private Doctor() { }

    public static Doctor Create(
        string fullName,
        string email,
        string specialization,
        string licenseNumber,
        DateTime licenseExpiryDate)
    {
        return new Doctor
        {
            Id = Guid.NewGuid(),
            FullName = fullName.Trim(),
            Email = email.Trim().ToLowerInvariant(),
            Specialization = specialization.Trim(),
            LicenseNumber = licenseNumber.Trim().ToUpperInvariant(),
            LicenseExpiryDate = licenseExpiryDate.Date,
            Status = ComputeStatus(licenseExpiryDate),
            IsDeleted = false,
            CreatedDate = DateTime.UtcNow
        };
    }

    public void Update(
        string fullName,
        string email,
        string specialization,
        string licenseNumber,
        DateTime licenseExpiryDate)
    {
        FullName = fullName.Trim();
        Email = email.Trim().ToLowerInvariant();
        Specialization = specialization.Trim();
        LicenseNumber = licenseNumber.Trim().ToUpperInvariant();
        LicenseExpiryDate = licenseExpiryDate.Date;
        Status = Status == DoctorStatus.Suspended
                                ? DoctorStatus.Suspended
                                : ComputeStatus(licenseExpiryDate);
        UpdatedDate = DateTime.UtcNow;
    }

    public void UpdateStatus(DoctorStatus newStatus)
    {
        if (newStatus == DoctorStatus.Active && IsLicenseExpired())
            throw new InvalidOperationException(
                "Cannot set status to Active because the license has already expired.");

        Status = newStatus;
        UpdatedDate = DateTime.UtcNow;
    }

    public void SoftDelete()
    {
        IsDeleted = true;
        UpdatedDate = DateTime.UtcNow;
    }

    public void EnsureExpiryStatus()
    {
        if (Status != DoctorStatus.Suspended && IsLicenseExpired())
        {
            Status = DoctorStatus.Expired;
            UpdatedDate = DateTime.UtcNow;
        }
    }

    private bool IsLicenseExpired()
        => LicenseExpiryDate.Date < DateTime.UtcNow.Date;

    private static DoctorStatus ComputeStatus(DateTime expiryDate)
        => expiryDate.Date < DateTime.UtcNow.Date
            ? DoctorStatus.Expired
            : DoctorStatus.Active;
}