'use client';

import { useState } from 'react';
import { DoctorTable }              from '@/components/doctors/DoctorTable';
import { SearchFilter }             from '@/components/doctors/SearchFilter';
import { DoctorModal, DeleteModal } from '@/components/doctors/DoctorModal';
import { Pagination }               from '@/components/ui/Pagination';
import { Toaster, useToast }        from '@/components/ui/Toast';
import { useDoctors, useDoctorMutations } from '@/hooks/useDoctors';
import type { CreateDoctorDto, Doctor, DoctorFilters } from '@/types/doctor';

// ── Default filters ───────────────────────────────────────────────────────────

const DEFAULT_FILTERS: DoctorFilters = {
  search:     '',
  status:     '',
  pageNumber: 1,
  pageSize:   10,
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DoctorsPage() {

  // ── Filters state ───────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<DoctorFilters>(DEFAULT_FILTERS);

  const setFilter = <K extends keyof DoctorFilters>(
    key: K,
    value: DoctorFilters[K]
  ) => setFilters(f => ({
    ...f,
    [key]: value,
    // Reset to page 1 when search or status changes
    ...(key !== 'pageNumber' ? { pageNumber: 1 } : {}),
  }));

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data, loading, error, refresh } = useDoctors(filters);
  const toast = useToast();

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [formOpen,   setFormOpen]   = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected,   setSelected]   = useState<Doctor | undefined>();

  const openAdd    = () => { setSelected(undefined); setFormOpen(true);   };
  const openEdit   = (d: Doctor) => { setSelected(d); setFormOpen(true);  };
  const openDelete = (d: Doctor) => { setSelected(d); setDeleteOpen(true); };
  const closeForm  = () => { setFormOpen(false);   setSelected(undefined); };
  const closeDelete = () => { setDeleteOpen(false); setSelected(undefined); };

  // ── Mutations ───────────────────────────────────────────────────────────────
  const { saving, mutError, clearError, create, update, updateStatus, remove } =
    useDoctorMutations(refresh);

  const handleSubmit = async (dto: CreateDoctorDto): Promise<boolean> => {
    const ok = selected
      ? await update(selected.id, dto)
      : await create(dto);

    if (ok) {
      toast.success(selected
        ? 'Doctor updated successfully.'
        : 'Doctor registered successfully.');
      closeForm();
    }
    return ok;
  };

  const handleStatusChange = async (id: string, status: string) => {
    const ok = await updateStatus(id, status);
    if (ok) toast.success(`Doctor status updated to ${status}.`);
    else    toast.error('Failed to update status.');
  };

  const handleDelete = async (): Promise<boolean> => {
    if (!selected) return false;
    const ok = await remove(selected.id);
    if (ok) {
      toast.success('Doctor deleted successfully.');
      closeDelete();
    } else {
      toast.error('Failed to delete doctor.');
    }
    return ok;
  };

  const hasFilters = !!(filters.search || filters.status);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-4
                      sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Doctor Licenses
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage registrations, track expiry dates,
            and update license statuses.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl
                     bg-blue-600 px-5 py-2.5 text-sm font-semibold
                     text-white shadow-sm hover:bg-blue-700
                     transition-colors"
        >
          + Add Doctor
        </button>
      </div>

      {/* Fetch error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50
                        px-4 py-3 text-sm text-red-700">
          <strong>Error:</strong> {error}{' '}
          <button onClick={refresh} className="underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Search + filter */}
      <div className="mb-4">
        <SearchFilter
          search={filters.search}
          status={filters.status}
          totalCount={data?.totalCount ?? 0}
          onSearchChange={v => setFilter('search', v)}
          onStatusChange={v => setFilter('status', v)}
        />
      </div>

      {/* Table */}
      <DoctorTable
        doctors={data?.data ?? []}
        loading={loading}
        hasFilters={hasFilters}
        onEdit={openEdit}
        onStatusChange={handleStatusChange}
        onDelete={openDelete}
      />

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            pageNumber={data.pageNumber}
            totalPages={data.totalPages}
            totalCount={data.totalCount}
            pageSize={data.pageSize}
            onChange={p => setFilter('pageNumber', p)}
          />
        </div>
      )}

      {/* Add / Edit modal */}
      <DoctorModal
        open={formOpen}
        doctor={selected}
        onClose={() => { closeForm(); clearError(); }}
        onSubmit={handleSubmit}
        saving={saving}
        serverError={mutError}
      />

      {/* Delete modal */}
      <DeleteModal
        open={deleteOpen}
        doctor={selected}
        onClose={closeDelete}
        onConfirm={handleDelete}
        saving={saving}
      />

      {/* Toasts */}
      <Toaster toasts={toast.toasts} dismiss={toast.dismiss} />
    </>
  );
}