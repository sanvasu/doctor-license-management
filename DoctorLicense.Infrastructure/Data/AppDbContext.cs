using DoctorLicense.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DoctorLicense.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Doctor> Doctors => Set<Doctor>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Doctor>(e =>
        {
            e.HasKey(d => d.Id);

            e.Property(d => d.FullName)
             .IsRequired()
             .HasMaxLength(200);

            e.Property(d => d.Email)
             .IsRequired()
             .HasMaxLength(255);

            e.Property(d => d.Specialization)
             .IsRequired()
             .HasMaxLength(150);

            e.Property(d => d.LicenseNumber)
             .IsRequired()
             .HasMaxLength(100);

            e.Property(d => d.LicenseExpiryDate)
             .HasColumnType("date");

            e.Property(d => d.Status)
             .HasConversion<string>()
             .HasMaxLength(20);

            e.Property(d => d.CreatedDate)
             .HasDefaultValueSql("GETUTCDATE()");

            e.HasIndex(d => d.LicenseNumber)
             .IsUnique()
             .HasFilter("[IsDeleted] = 0")
             .HasDatabaseName("UX_Doctors_LicenseNumber");

            e.HasQueryFilter(d => !d.IsDeleted);
        });
    }
}