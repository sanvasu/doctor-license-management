import type {
  CreateDoctorDto,
  Doctor,
  DoctorFilters,
  PagedResult,
  UpdateDoctorDto,
} from '@/types/doctor';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://localhost:65053/api';

// ── Error class ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Generic fetch wrapper ─────────────────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    let body: { message?: string; errors?: Record<string, string[]> } = {};
    try { body = await res.json(); } catch { }

    throw new ApiError(
      body.message ?? `Request failed (${res.status})`,
      res.status,
      body.errors
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Doctor API calls ──────────────────────────────────────────────────────────

export const doctorApi = {
  getAll(filters: Partial<DoctorFilters> = {}): Promise<PagedResult<Doctor>> {
    const params = new URLSearchParams();
    if (filters.search)                      params.set('search',     filters.search);
    if (filters.status)                      params.set('status',     filters.status);
    if (filters.pageNumber)                  params.set('pageNumber', String(filters.pageNumber));
    if (filters.pageSize)                    params.set('pageSize',   String(filters.pageSize));
    const qs = params.toString();
    return request<PagedResult<Doctor>>(`/doctors${qs ? `?${qs}` : ''}`);
  },

  getById(id: string): Promise<Doctor> {
    return request<Doctor>(`/doctors/${id}`);
  },

  create(dto: CreateDoctorDto): Promise<Doctor> {
    return request<Doctor>('/doctors', {
      method: 'POST',
      body:   JSON.stringify(dto),
    });
  },

  update(id: string, dto: UpdateDoctorDto): Promise<Doctor> {
    return request<Doctor>(`/doctors/${id}`, {
      method: 'PUT',
      body:   JSON.stringify(dto),
    });
  },

  updateStatus(id: string, status: string): Promise<void> {
    return request<void>(`/doctors/${id}/status`, {
      method: 'PATCH',
      body:   JSON.stringify({ status }),
    });
  },

  delete(id: string): Promise<void> {
    return request<void>(`/doctors/${id}`, {
      method: 'DELETE',
    });
  },
};