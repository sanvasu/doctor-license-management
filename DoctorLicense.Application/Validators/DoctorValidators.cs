using DoctorLicense.Application.DTOs;
using FluentValidation;

namespace DoctorLicense.Application.Validators;

public class CreateDoctorValidator : AbstractValidator<CreateDoctorDto>
{
    public CreateDoctorValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MaximumLength(200).WithMessage("Full name cannot exceed 200 characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.")
            .MaximumLength(255).WithMessage("Email cannot exceed 255 characters.");

        RuleFor(x => x.Specialization)
            .NotEmpty().WithMessage("Specialization is required.")
            .MaximumLength(150).WithMessage("Specialization cannot exceed 150 characters.");

        RuleFor(x => x.LicenseNumber)
            .NotEmpty().WithMessage("License number is required.")
            .MaximumLength(100).WithMessage("License number cannot exceed 100 characters.")
            .Matches(@"^[A-Za-z0-9\-]+$")
            .WithMessage("License number can only contain letters, numbers, and hyphens.");

        RuleFor(x => x.LicenseExpiryDate)
            .NotEmpty().WithMessage("License expiry date is required.");
    }
}

public class UpdateDoctorValidator : AbstractValidator<UpdateDoctorDto>
{
    public UpdateDoctorValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MaximumLength(200).WithMessage("Full name cannot exceed 200 characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.")
            .MaximumLength(255).WithMessage("Email cannot exceed 255 characters.");

        RuleFor(x => x.Specialization)
            .NotEmpty().WithMessage("Specialization is required.")
            .MaximumLength(150).WithMessage("Specialization cannot exceed 150 characters.");

        RuleFor(x => x.LicenseNumber)
            .NotEmpty().WithMessage("License number is required.")
            .MaximumLength(100).WithMessage("License number cannot exceed 100 characters.")
            .Matches(@"^[A-Za-z0-9\-]+$")
            .WithMessage("License number can only contain letters, numbers, and hyphens.");

        RuleFor(x => x.LicenseExpiryDate)
            .NotEmpty().WithMessage("License expiry date is required.");
    }
}

public class UpdateStatusValidator : AbstractValidator<UpdateStatusDto>
{
    private static readonly string[] ValidStatuses = ["Active", "Expired", "Suspended"];

    public UpdateStatusValidator()
    {
        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("Status is required.")
            .Must(s => ValidStatuses.Contains(s, StringComparer.OrdinalIgnoreCase))
            .WithMessage("Status must be one of: Active, Expired, Suspended.");
    }
}



