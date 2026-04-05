namespace DoctorLicense.Application.DTOs;

public record CreateDoctorDto(
    string FullName,
    string Email,
    string Specialization,
    string LicenseNumber,
    DateTime LicenseExpiryDate
);

public record UpdateDoctorDto(
    string FullName,
    string Email,
    string Specialization,
    string LicenseNumber,
    DateTime LicenseExpiryDate
);

public record UpdateStatusDto(string Status);

public record DoctorDto(
    Guid Id,
    string FullName,
    string Email,
    string Specialization,
    string LicenseNumber,
    DateTime LicenseExpiryDate,
    string Status,
    DateTime CreatedDate,
    DateTime? UpdatedDate
);

public record PagedResult<T>(
    IEnumerable<T> Data,
    int TotalCount,
    int PageNumber,
    int PageSize,
    int TotalPages
)
{
    public static PagedResult<T> Create(
        IEnumerable<T> data,
        int totalCount,
        int pageNumber,
        int pageSize)
    {
        return new PagedResult<T>(
            data,
            totalCount,
            pageNumber,
            pageSize,
            (int)Math.Ceiling((double)totalCount / pageSize)
        );
    }
}
