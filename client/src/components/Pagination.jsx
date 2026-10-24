export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1
  );
  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
      <button className="btn-outline btn-sm" disabled={page === 1} onClick={() => onChange(page - 1)}>Previous</button>
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && n - nums[i - 1] > 1 && <span className="text-ink/40">…</span>}
          <button
            onClick={() => onChange(n)}
            aria-current={n === page ? 'page' : undefined}
            className={`btn btn-sm ${n === page ? 'bg-garnet text-white' : 'border border-mist bg-white hover:border-garnet'}`}
          >
            {n}
          </button>
        </span>
      ))}
      <button className="btn-outline btn-sm" disabled={page === pages} onClick={() => onChange(page + 1)}>Next</button>
    </nav>
  );
}
