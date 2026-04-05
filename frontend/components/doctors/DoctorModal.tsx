'use client';

import { useEffect } from 'react';
import { DoctorForm } from './DoctorForm';
import type { CreateDoctorDto, Doctor } from '@/types/doctor';

// ── Base modal shell ──────────────────────────────────────────────────────────

interface ModalProps {
  open:      boolean;
  onClose:   () => void;
  title:     string;
  children:  React.ReactNode;
  maxWidth?: string;
}

function Modal({ open, onClose, title, children, maxWidth = 'max-w-xl' }: ModalProps) {

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`relative w-full ${maxWidth} rounded-2xl bg-white
                       shadow-2xl flex flex-col max-h-[90vh]`}>

        {/* Header */}
        <div className="flex items-center justify-between
                        border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">
            {title}
          </h2>
        <button
            type="button"
            tabIndex={-1}
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400
                      hover:bg-slate-100 hover:text-slate-700
                      transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Doctor form modal ─────────────────────────────────────────────────────────

interface DoctorModalProps {
  open:        boolean;
  doctor?:     Doctor;
  onClose:     () => void;
  onSubmit:    (data: CreateDoctorDto) => Promise<boolean>;
  saving:      boolean;
  serverError: string | null;
}

export function DoctorModal({
  open,
  doctor,
  onClose,
  onSubmit,
  saving,
  serverError,
}: DoctorModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={doctor ? 'Edit Doctor Details' : 'Register New Doctor'}
    >
      <DoctorForm
        initial={doctor}
        onSubmit={onSubmit}
        onCancel={onClose}
        saving={saving}
        serverError={serverError}
      />
    </Modal>
  );
}

// ── Delete confirmation modal ─────────────────────────────────────────────────

interface DeleteModalProps {
  open:      boolean;
  doctor?:   Doctor;
  onClose:   () => void;
  onConfirm: () => Promise<boolean>;
  saving:    boolean;
}

export function DeleteModal({
  open,
  doctor,
  onClose,
  onConfirm,
  saving,
}: DeleteModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Doctor"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col gap-5">

        {/* Warning */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center
                          justify-center rounded-full bg-red-100">
            <span className="text-red-600 text-lg">⚠</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">
              Are you sure you want to delete{' '}
              <strong>{doctor?.fullName}</strong>?
            </p>
            <p className="mt-1 text-sm text-slate-500">
              This action cannot be undone. The doctor record
              will be permanently removed from all listings.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-slate-200 px-4 py-2
                       text-sm font-medium text-slate-700
                       hover:bg-slate-50 transition-colors
                       disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg
                       bg-red-600 px-4 py-2 text-sm font-medium
                       text-white hover:bg-red-700 transition-colors
                       disabled:opacity-60"
          >
            {saving ? 'Deleting...' : 'Delete Doctor'}
          </button>
        </div>
      </div>
    </Modal>
  );
}