'use client';

import { useState } from 'react';
import type { CreateDoctorDto, Doctor } from '@/types/doctor';

type FormData = CreateDoctorDto;
type FormErrors = Partial<Record<keyof FormData, string>>;

const SPECIALIZATIONS = [
  'Cardiology', 'Dermatology', 'Emergency Medicine',
  'Endocrinology', 'Family Medicine', 'Gastroenterology',
  'General Surgery', 'Hematology', 'Internal Medicine',
  'Nephrology', 'Neurology', 'Obstetrics & Gynecology',
  'Oncology', 'Ophthalmology', 'Orthopedics',
  'Pediatrics', 'Psychiatry', 'Pulmonology',
  'Radiology', 'Urology', 'Other',
];

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.fullName.trim())
    errors.fullName = 'Full name is required.';

  if (!data.email.trim())
    errors.email = 'Email is required.';
  else if (!/\S+@\S+\.\S+/.test(data.email))
    errors.email = 'Enter a valid email address.';

  if (!data.specialization)
    errors.specialization = 'Specialization is required.';

  if (!data.licenseNumber.trim())
    errors.licenseNumber = 'License number is required.';
  else if (!/^[A-Za-z0-9-]+$/.test(data.licenseNumber))
    errors.licenseNumber = 'Only letters, numbers, and hyphens allowed.';

  if (!data.licenseExpiryDate)
    errors.licenseExpiryDate = 'Expiry date is required.';
  else if (new Date(data.licenseExpiryDate) <= new Date())
    errors.licenseExpiryDate = 'Expiry date must be a future date.';

  return errors;
}

function Field({
  label,
  error,
  required = false,
  children,
}: {
  label:     string;
  error?:    string;
  required?: boolean;
  children:  React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

const inputClass = (error?: string) =>
  `w-full rounded-lg border px-3 py-2 text-sm text-slate-700
   shadow-sm outline-none placeholder-slate-400 transition-colors
   focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
   ${error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`;

interface Props {
  initial?:    Doctor;
  onSubmit:    (data: FormData) => Promise<boolean>;
  onCancel:    () => void;
  saving:      boolean;
  serverError: string | null;
}

function toInputDate(iso?: string) {
  if (!iso) return '';
  return iso.split('T')[0];
}

export function DoctorForm({
  initial,
  onSubmit,
  onCancel,
  saving,
  serverError,
}: Props) {
  const [data, setData]     = useState<FormData>({
    fullName:          initial?.fullName          ?? '',
    email:             initial?.email             ?? '',
    specialization:    initial?.specialization    ?? '',
    licenseNumber:     initial?.licenseNumber     ?? '',
    licenseExpiryDate: toInputDate(initial?.licenseExpiryDate),
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const set = (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const updated = { ...data, [key]: e.target.value };
      setData(updated);
      if (errors[key]) {
        setErrors(prev => ({ ...prev, [key]: undefined }));
      }
    };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') e.preventDefault();
  };

  const handleButtonClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const errs = validate(data);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    await onSubmit(data);
  };

  return (
    <form
      onSubmit={e => e.preventDefault()}
      onKeyDown={handleKeyDown}
      noValidate
      className="flex flex-col gap-4"
    >
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50
                        px-3 py-2.5 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        <Field label="Full Name" error={errors.fullName} required>
          <input
            type="text"
            placeholder="Dr. Jane Smith"
            value={data.fullName}
            onChange={set('fullName')}
            className={inputClass(errors.fullName)}
          />
        </Field>

        <Field label="Email Address" error={errors.email} required>
          <input
            type="email"
            placeholder="jane@hospital.com"
            value={data.email}
            onChange={set('email')}
            className={inputClass(errors.email)}
          />
        </Field>

        <Field label="Specialization" error={errors.specialization} required>
          <select
            value={data.specialization}
            onChange={set('specialization')}
            className={inputClass(errors.specialization)}
          >
            <option value="">Select specialization...</option>
            {SPECIALIZATIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>

        <Field label="License Number" error={errors.licenseNumber} required>
          <input
            type="text"
            placeholder="DOC-2024-001"
            value={data.licenseNumber}
            onChange={set('licenseNumber')}
            className={inputClass(errors.licenseNumber)}
          />
        </Field>

        <Field label="License Expiry Date" error={errors.licenseExpiryDate} required>
          <input
            type="date"
            value={data.licenseExpiryDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={set('licenseExpiryDate')}
            className={inputClass(errors.licenseExpiryDate)}
          />
        </Field>

      </div>

      <div className="flex items-center justify-end gap-3
                      border-t border-slate-100 pt-4">
        <button
          type="button"
          tabIndex={-1}
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-slate-200 px-4 py-2
                     text-sm font-medium text-slate-700
                     hover:bg-slate-50 transition-colors
                     disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleButtonClick}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg
                     bg-blue-600 px-5 py-2 text-sm font-medium
                     text-white hover:bg-blue-700 transition-colors
                     disabled:opacity-60"
        >
          {saving ? 'Saving...' : initial ? 'Save Changes' : 'Add Doctor'}
        </button>
      </div>
    </form>
  );
}