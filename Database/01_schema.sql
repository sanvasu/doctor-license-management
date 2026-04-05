-- =============================================
-- Doctor License Management - Database Schema
-- =============================================

CREATE DATABASE DoctorLicenseDB;
GO

USE DoctorLicenseDB;
GO

CREATE TABLE Doctors (
    Id                UNIQUEIDENTIFIER   NOT NULL  DEFAULT NEWID(),
    FullName          NVARCHAR(200)      NOT NULL,
    Email             NVARCHAR(255)      NOT NULL,
    Specialization    NVARCHAR(150)      NOT NULL,
    LicenseNumber     NVARCHAR(100)      NOT NULL,
    LicenseExpiryDate DATE               NOT NULL,
    Status            NVARCHAR(20)       NOT NULL  DEFAULT 'Active',
    IsDeleted         BIT                NOT NULL  DEFAULT 0,
    CreatedDate       DATETIME2          NOT NULL  DEFAULT GETUTCDATE(),
    UpdatedDate       DATETIME2          NULL,

    CONSTRAINT PK_Doctors PRIMARY KEY (Id),
    CONSTRAINT CHK_Doctors_Status
        CHECK (Status IN ('Active', 'Expired', 'Suspended'))
);
GO

-- Unique index on LicenseNumber for non-deleted doctors only
CREATE UNIQUE INDEX UX_Doctors_LicenseNumber
    ON Doctors (LicenseNumber)
    WHERE IsDeleted = 0;
GO
