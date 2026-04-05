namespace DoctorLicense.Domain.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(string entityName, object key)
        : base($"{entityName} with id '{key}' was not found.") { }
}

public class ConflictException : Exception
{
    public ConflictException(string message) : base(message) { }
}

public class DomainValidationException : Exception
{
    public DomainValidationException(string message) : base(message) { }
}