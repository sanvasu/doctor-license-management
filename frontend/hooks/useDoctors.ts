'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, doctorApi } from '@/lib/api';
import type {
  CreateDoctorDto,
  Doctor,
  DoctorFilters,
  PagedResult,
  UpdateDoctorDto,
} from '@/types/doctor';

// ── Fetch hook ────────────────────────────────────────────────────────────────

export function useDoctors(filters: DoctorFilters) {
  const [data, setData]       = useState<PagedResult<Doctor> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const abortRef              = useRef<AbortController | null>(null);

  const fetchDoctors = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const result = await doctorApi.getAll(filters);
      setData(result);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError(err instanceof ApiError ? err.message : 'Failed to load doctors.');
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.status, filters.pageNumber, filters.pageSize]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return { data, loading, error, refresh: fetchDoctors };
}

// ── Mutation hook ─────────────────────────────────────────────────────────────

export function useDoctorMutations(onSuccess: () => void) {
  const [saving,    setSaving]   = useState(false);
  const [mutError,  setMutError] = useState<string | null>(null);

  const clearError = () => setMutError(null);

  const run = async (fn: () => Promise<unknown>): Promise<boolean> => {
    setSaving(true);
    setMutError(null);
    try {
      await fn();
      onSuccess();
      return true;
    } catch (err) {
      const msg = err instanceof ApiError
        ? err.message
        : 'An unexpected error occurred.';
      setMutError(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const create = (dto: CreateDoctorDto) =>
    run(() => doctorApi.create(dto));

  const update = (id: string, dto: UpdateDoctorDto) =>
    run(() => doctorApi.update(id, dto));

  const updateStatus = (id: string, status: string) =>
    run(() => doctorApi.updateStatus(id, status));

  const remove = (id: string) =>
    run(() => doctorApi.delete(id));

  return { saving, mutError, clearError, create, update, updateStatus, remove };
}