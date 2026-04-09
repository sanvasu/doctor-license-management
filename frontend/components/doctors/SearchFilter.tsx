'use client';

import { useEffect, useRef, useState } from 'react';

const STATUSES = [
  { value: '',          label: 'All Statuses' },
  { value: 'Active',    label: 'Active'       },
  { value: 'Expired',   label: 'Expired'      },
  { value: 'Suspended', label: 'Suspended'    },
];

interface Props {
  search:         string;
  status:         string;
  totalCount:     number;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
}

export function SearchFilter({
  search,
  status,
  totalCount,
  onSearchChange,
  onStatusChange,
}: Props) {
  const [localSearch, setLocalSearch] = useState(search);
const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Sync if parent resets search
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const handleSearch = (value: string) => {
    setLocalSearch(value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSearchChange(value), 400);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left side — inputs */}
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:max-w-xl">

        {/* Search input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center
                           text-slate-400 pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by name or license number..."
            value={localSearch}
            onChange={e => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white
                       py-2 pl-9 pr-4 text-sm text-slate-700
                       placeholder-slate-400 shadow-sm outline-none
                       focus:border-blue-500 focus:ring-2
                       focus:ring-blue-500/20 transition-colors"
          />
          {localSearch && (
            <button
              onClick={() => handleSearch('')}
              className="absolute inset-y-0 right-3 flex items-center
                         text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status filter */}
        <select
          value={status}
          onChange={e => onStatusChange(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white
                     py-2 pl-3 pr-8 text-sm text-slate-700
                     shadow-sm outline-none cursor-pointer
                     focus:border-blue-500 focus:ring-2
                     focus:ring-blue-500/20 transition-colors"
        >
          {STATUSES.map(s => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        
      </div>

      {/* Right side — result count */}
      <p className="text-sm text-slate-500 shrink-0">
        {totalCount === 0
          ? 'No doctors found'
          : `${totalCount} doctor${totalCount !== 1 ? 's' : ''} found`}
      </p>
    </div>
  );
}