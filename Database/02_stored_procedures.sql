-- =============================================
-- Doctor License Management - Stored Procedures
-- =============================================

USE DoctorLicenseDB;
GO

-- =============================================
-- SP: usp_GetDoctors
-- Returns paginated, searchable, filterable
-- doctor list with auto-expiry logic
-- =============================================
CREATE OR ALTER PROCEDURE usp_GetDoctors
    @Search     NVARCHAR(200) = NULL,
    @Status     NVARCHAR(20)  = NULL,
    @PageNumber INT           = 1,
    @PageSize   INT           = 10
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Today DATE = CAST(GETUTCDATE() AS DATE);

    -- Auto-expire doctors whose license has passed
    UPDATE Doctors
    SET    Status      = 'Expired',
           UpdatedDate = GETUTCDATE()
    WHERE  IsDeleted         = 0
      AND  Status            = 'Active'
      AND  LicenseExpiryDate < @Today;

    -- Return paginated result with total count
    SELECT
        Id,
        FullName,
        Email,
        Specialization,
        LicenseNumber,
        LicenseExpiryDate,
        CASE
            WHEN Status != 'Suspended' AND LicenseExpiryDate < @Today
            THEN 'Expired'
            ELSE Status
        END AS Status,
        CreatedDate,
        UpdatedDate,
        COUNT(*) OVER () AS TotalCount
    FROM  Doctors
    WHERE IsDeleted = 0
      AND (
            @Search IS NULL
            OR FullName      LIKE '%' + @Search + '%'
            OR LicenseNumber LIKE '%' + @Search + '%'
          )
      AND (@Status IS NULL OR Status = @Status)
    ORDER BY CreatedDate DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH  NEXT @PageSize ROWS ONLY;
END;
GO

-- =============================================
-- BONUS SP: usp_GetExpiredDoctors
-- Returns all expired doctors with days expired
-- =============================================
CREATE OR ALTER PROCEDURE usp_GetExpiredDoctors
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Today DATE = CAST(GETUTCDATE() AS DATE);

    SELECT
        Id,
        FullName,
        Email,
        Specialization,
        LicenseNumber,
        LicenseExpiryDate,
        'Expired'                                      AS Status,
        CreatedDate,
        DATEDIFF(DAY, LicenseExpiryDate, @Today)       AS DaysExpired
    FROM  Doctors
    WHERE IsDeleted = 0
      AND (Status = 'Expired' OR LicenseExpiryDate < @Today)
    ORDER BY LicenseExpiryDate ASC;
END;
GO
