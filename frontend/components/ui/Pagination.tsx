'use client';

interface Props {
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  pageSize:   number;
  onChange:   (page: number) => void;
}

export function Pagination({
  pageNumber,
  totalPages,
  totalCount,
  pageSize,
  onChange,
}: Props) {
  if (totalPages <= 1) return null;

  const start = (pageNumber - 1) * pageSize + 1;
  const end   = Math.min(pageNumber * pageSize, totalCount);

  // Build page numbers with ellipsis
  const pages: (number | '...')[] = [];
  const delta = 2;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= pageNumber - delta && i <= pageNumber + delta)
    ) {
      pages.push(i);
    } else if (
      i === pageNumber - delta - 1 ||
      i === pageNumber + delta + 1
    ) {
      pages.push('...');
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      {/* Result count */}
      <p className="text-sm text-slate-500">
        Showing{' '}
        <span className="font-medium text-slate-700">{start}–{end}</span>
        {' '}of{' '}
        <span className="font-medium text-slate-700">{totalCount}</span>
        {' '}doctors
      </p>

      {/* Page buttons */}
      <nav className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onChange(pageNumber - 1)}
          disabled={pageNumber === 1}
          className="rounded-lg border border-slate-200 p-2 text-slate-500
                     hover:bg-slate-50 disabled:opacity-40
                     disabled:cursor-not-allowed transition-colors"
        >
          ←
        </button>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`min-w-[36px] rounded-lg border px-3 py-1.5 text-sm
                          font-medium transition-colors
                          ${p === pageNumber
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onChange(pageNumber + 1)}
          disabled={pageNumber === totalPages}
          className="rounded-lg border border-slate-200 p-2 text-slate-500
                     hover:bg-slate-50 disabled:opacity-40
                     disabled:cursor-not-allowed transition-colors"
        >
          →
        </button>
      </nav>
    </div>
  );
}