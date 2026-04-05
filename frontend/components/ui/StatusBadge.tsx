import type { DoctorStatus } from '@/types/doctor';

const CONFIG: Record<DoctorStatus, { label: string; classes: string; dot: string }> = {
  Active: {
    label:   'Active',
    classes: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    dot:     'bg-emerald-500',
  },
  Expired: {
    label:   'Expired',
    classes: 'bg-red-50 text-red-700 ring-red-600/20',
    dot:     'bg-red-500',
  },
  Suspended: {
    label:   'Suspended',
    classes: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    dot:     'bg-amber-500',
  },
};

interface Props {
  status: DoctorStatus;
}

export function StatusBadge({ status }: Props) {
  const cfg = CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 
                  text-xs font-medium ring-1 ring-inset ${cfg.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}