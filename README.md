# Doctor License Management System

A full-stack Medical SaaS module for managing doctor license lifecycles — built with .NET 10, Next.js(App Router), and SQL Server.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | .NET 10 Web API, Clean Architecture |
| ORM | Entity Framework Core + Dapper |
| Database | SQL Server |
| Validation | FluentValidation |
| API Docs | Swagger / OpenAPI |
| Frontend | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS |

---

## Project Structure

```
Doctor License Management/
├── DoctorLicense.API/           # Controllers, Middleware, Program.cs
├── DoctorLicense.Application/   # Business Logic, DTOs, Validators
├── DoctorLicense.Domain/        # Entities, Enums, Exceptions, Interfaces
├── DoctorLicense.Infrastructure/# EF Core, Dapper, Repositories
├── frontend/                    # Next.js App
└── database/                    # SQL Scripts
    ├── 01_schema.sql            # Table + Index
    └── 02_stored_procedures.sql # Stored Procedures
```

---

## Setup Instructions

### Prerequisites
- .NET 10 SDK
- SQL Server (LocalDB, Express, or full)
- Node.js 18+
- Visual Studio 2022+
- VS Code

---

### 1. Database Setup

Open **SSMS** and run the scripts in order:

```
1. database/01_schema.sql          → Creates DoctorLicenseDB database and Doctors table
2. database/02_stored_procedures.sql → Creates usp_GetDoctors and usp_GetExpiredDoctors
```

---

### 2. Backend Setup

Open `Doctor License Management.slnx` in Visual Studio.

Update the connection string in `DoctorLicense.API/appsettings.json`:

**Local SQL Server with SQL Auth:**
```json
"DefaultConnection": "Server=localhost;Database=DoctorLicenseDB;User Id=YOUR_USERNAME;Password=YOUR_PASSWORD;TrustServerCertificate=True;"
```

Run the API:
```bash
cd DoctorLicense.API
dotnet run
```

Swagger UI will be available at:
```
https://localhost:{port}/swagger
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local` file:
```
NEXT_PUBLIC_API_URL=https://localhost:{your-api-port}/api
```

Run the frontend:
```bash
npm run dev
```

Open browser at:
```
http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/doctors | Get all doctors (paginated, searchable, filterable) |
| GET | /api/doctors/{id} | Get doctor by ID |
| POST | /api/doctors | Create new doctor |
| PUT | /api/doctors/{id} | Update doctor details |
| PATCH | /api/doctors/{id}/status | Update status only |
| DELETE | /api/doctors/{id} | Soft delete doctor |

### Query Parameters for GET /api/doctors

| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search by name or license number |
| status | string | Filter by Active, Expired, Suspended |
| pageNumber | int | Page number (default: 1) |
| pageSize | int | Results per page (default: 10) |

---

## Key Architecture Decisions

### Clean Architecture
Four separate projects enforce strict dependency rules at the compiler level:
- **Domain** — zero external dependencies, pure business rules
- **Application** — orchestrates use cases, no DB or HTTP knowledge
- **Infrastructure** — EF Core + Dapper, SQL Server only here
- **API** — thin controllers, delegates everything to Application

### EF Core + Dapper (Hybrid)
- **EF Core** for writes and single-entity reads (change tracking, soft delete filter)
- **Dapper** for stored procedure calls (simpler mapping, better performance for complex queries)

### Stored Procedure Design
`usp_GetDoctors` handles everything in one DB round-trip:
- Auto-expires Active doctors whose license date has passed
- Applies expiry logic inline via CASE expression
- Supports search by name or license number
- Supports filter by status
- Paginates using OFFSET/FETCH
- Returns total count via COUNT(*) OVER() — no second query needed

### Soft Delete
Records are never physically deleted. `IsDeleted = 1` flag + EF Core global query filter
makes deleted records invisible to all queries automatically. The unique index on
LicenseNumber has `WHERE IsDeleted = 0` so license numbers can be reused after deletion.

### Validation — Two Layers
- **FluentValidation** on backend — security, cannot be bypassed
- **Client-side validation** on frontend — instant UX feedback

---

## Business Rules

| Rule | Where Enforced |
|------|----------------|
| Auto-expire on listing | usp_GetDoctors (SQL) |
| Auto-expire on GetById | Doctor.EnsureExpiryStatus() (C#) |
| Prevent duplicate license | LicenseNumberExistsAsync() + DB unique index |
| Required field validation | FluentValidation + frontend |
| Soft delete only | Doctor.SoftDelete() sets IsDeleted = true |
| Suspended not auto-expired | ComputeStatus() skips Suspended doctors |

---

## Features

### Backend
- Clean Architecture (4 layers)
- Global exception middleware
- Async throughout with CancellationToken
- FluentValidation
- Swagger documentation
- CORS configured

### Frontend
- Doctor table with search and filter
- Status badges (Active / Expired / Suspended)
- Add / Edit modal form
- Delete confirmation modal
- Skeleton loading states
- Empty states
- Toast notifications
- Pagination
- Expired row highlighting
- Expiring soon warning (within 30 days)
- Debounced search (400ms)

### Database
- Proper schema with constraints
- Filtered unique index on LicenseNumber
- usp_GetDoctors — main listing SP
- usp_GetExpiredDoctors — bonus SP with DaysExpired column
