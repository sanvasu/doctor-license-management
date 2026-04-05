'use client';

import { useState } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Doctor, DoctorStatus } from '@/types/doctor';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  });
}

function isExpiringSoon(iso: string) {
  const days = (new Date(iso).getTime() - Date.now()) / 86_400_000;
  return days > 0 && days <= 30;
}

// ── Skeleton loading row ──────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-slate-100"
               style={{ width: `${60 + (i * 7) % 35}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <tr>
      <td colSpan={7} className="px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <span className="text-5xl">🩺</span>
          <p className="text-base font-medium text-slate-600">
            {hasFilters
              ? 'No doctors match your filters'
              : 'No doctors registered yet'}
          </p>
          <p className="text-sm">
            {hasFilters
              ? 'Try adjusting your search or filter.'
              : 'Add your first doctor to get started.'}
          </p>
        </div>
      </td>
    </tr>
  );
}

// ── Action menu ───────────────────────────────────────────────────────────────

const STATUS_TRANSITIONS: Record<DoctorStatus, DoctorStatus[]> = {
  Active:    ['Suspended'],
  Expired:   ['Suspended'],
  Suspended: ['Active'],
};

interface ActionMenuProps {
  doctor:         Doctor;
  onEdit:         (d: Doctor) => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete:       (d: Doctor) => void;
}

function ActionMenu({ doctor, onEdit, onStatusChange, onDelete }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const transitions     = STATUS_TRANSITIONS[doctor.status] ?? [];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(o => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100
                   hover:text-slate-700 transition-colors"
      >
        ⋯
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border
                        border-slate-200 bg-white shadow-lg py-1">

          {/* Edit */}
       <button
  type="button"
  onMouseDown={() => { onEdit(doctor); setOpen(false); }}
  className="flex w-full items-center gap-2 px-3 py-2 text-sm
             text-slate-700 hover:bg-slate-50 transition-colors"
>
  ✏️ Edit Details
</button>

{transitions.map(s => (
  <button
    key={s}
    type="button"
    onMouseDown={() => { onStatusChange(doctor.id, s); setOpen(false); }}
    className="flex w-full items-center gap-2 px-3 py-2 text-sm
               text-slate-700 hover:bg-slate-50 transition-colors"
  >
    🔄 Mark as {s}
  </button>
))}

<div className="my-1 border-t border-slate-100" />

<button
  type="button"
  onMouseDown={() => { onDelete(doctor); setOpen(false); }}
  className="flex w-full items-center gap-2 px-3 py-2 text-sm
             text-red-600 hover:bg-red-50 transition-colors"
>
  🗑️ Delete
</button>
        </div>
      )}
    </div>
  );
}

// ── Main table ────────────────────────────────────────────────────────────────

const COLUMNS = [
  'Doctor', 'Specialization', 'License No.',
  'Expiry Date', 'Status', 'Added', ''
];

interface Props {
  doctors:        Doctor[];
  loading:        boolean;
  hasFilters:     boolean;
  onEdit:         (d: Doctor) => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete:       (d: Doctor) => void;
}

export function DoctorTable({
  doctors,
  loading,
  hasFilters,
  onEdit,
  onStatusChange,
  onDelete,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200
                    bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">

          {/* Header */}
          <thead className="bg-slate-50">
            <tr>
              {COLUMNS.map(col => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold
                             uppercase tracking-wide text-slate-500"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))
              : doctors.length === 0
              ? <EmptyState hasFilters={hasFilters} />
              : doctors.map(doctor => {
                  const expiringSoon = isExpiringSoon(doctor.licenseExpiryDate);
                  const isExpired    = doctor.status === 'Expired';

                  return (
                    <tr
                      key={doctor.id}
                      className={`transition-colors hover:bg-slate-50
                                  ${isExpired ? 'bg-red-50/40' : ''}`}
                    >
                      {/* Doctor name + email */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-800">
                            {doctor.fullName}
                          </span>
                          <span className="text-xs text-slate-400">
                            {doctor.email}
                          </span>
                        </div>
                      </td>

                      {/* Specialization */}
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {doctor.specialization}
                      </td>

                      {/* License number */}
                      <td className="px-4 py-3">
                        <code className="rounded bg-slate-100 px-1.5 py-0.5
                                         text-xs font-mono text-slate-700">
                          {doctor.licenseNumber}
                        </code>
                      </td>

                      {/* Expiry date */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-sm
                            ${isExpired
                              ? 'text-red-600 font-medium'
                              : 'text-slate-600'}`}>
                            {formatDate(doctor.licenseExpiryDate)}
                          </span>
                          {expiringSoon && (
                            <span className="text-xs font-medium text-amber-600">
                              ⚠ Expires soon
                            </span>
                          )}
                          {isExpired && (
                            <span className="text-xs font-medium text-red-500">
                              Expired
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3">
                        <StatusBadge status={doctor.status} />
                      </td>

                      {/* Created date */}
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {formatDate(doctor.createdDate)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <ActionMenu
                          doctor={doctor}
                          onEdit={onEdit}
                          onStatusChange={onStatusChange}
                          onDelete={onDelete}
                        />
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
}