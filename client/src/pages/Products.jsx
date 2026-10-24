import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

const METALS = [{ v: 'gold', l: 'Gold' }, { v: 'silver', l: 'Silver' }, { v: 'diamond', l: 'Diamond' }];
const PURITIES = [{ v: '18K', l: '18K' }, { v: '22K', l: '22K' }, { v: '925', l: '925 Silver' }];

export default function Products() {
  const [sp, setSp] = useSearchParams();
  const [cats, setCats] = useState([]);
  const [cols, setCols] = useState([]);
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [price, setPrice] = useState({ min: sp.get('minPrice') || '', max: sp.get('maxPrice') || '' });

  const get = (k) => sp.get(k) || '';
  const set = (patch) => {
    const n = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)));
    if (!('page' in patch)) n.delete('page');
    setSp(n);
  };
  const toggle = (k, v) => {
    const cur = get(k).split(',').filter(Boolean);
    set({ [k]: (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]).join(',') });
  };

  useEffect(() => {
    api.get('/categories').then((r) => setCats(r.data));
    api.get('/collections').then((r) => setCols(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get('/products', { params: Object.fromEntries(sp) }).then((r) => setData(r.data)).finally(() => setLoading(false));
    setPrice({ min: sp.get('minPrice') || '', max: sp.get('maxPrice') || '' });
  }, [sp.toString()]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeCount = ['category', 'collection', 'metal', 'purity', 'minPrice', 'maxPrice', 'search'].filter(get).length;

  const filters = (
    <div className="space-y-6 text-sm">
      <div>
        <p className="mb-2 font-semibold">Category</p>
        {[{ _id: '', name: 'All' }, ...cats].map((c) => (
          <label key={c._id} className="flex cursor-pointer items-center gap-2 py-1">
            <input type="radio" name="category" checked={get('category') === c._id} onChange={() => set({ category: c._id })} className="accent-garnet" />
            {c.name}
          </label>
        ))}
      </div>
      {cols.length > 0 && (
        <div>
          <p className="mb-2 font-semibold">Collection</p>
          <select className="input" value={get('collection')} onChange={(e) => set({ collection: e.target.value })} aria-label="Collection">
            <option value="">All collections</option>
            {cols.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
      )}
      <div>
        <p className="mb-2 font-semibold">Metal</p>
        {METALS.map((m) => (
          <label key={m.v} className="flex cursor-pointer items-center gap-2 py-1">
            <input type="checkbox" checked={get('metal').split(',').includes(m.v)} onChange={() => toggle('metal', m.v)} className="accent-garnet" />
            {m.l}
          </label>
        ))}
      </div>
      <div>
        <p className="mb-2 font-semibold">Purity</p>
        {PURITIES.map((m) => (
          <label key={m.v} className="flex cursor-pointer items-center gap-2 py-1">
            <input type="checkbox" checked={get('purity').split(',').includes(m.v)} onChange={() => toggle('purity', m.v)} className="accent-garnet" />
            {m.l}
          </label>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); set({ minPrice: price.min, maxPrice: price.max }); }}>
        <p className="mb-2 font-semibold">Price (₹)</p>
        <div className="flex gap-2">
          <input className="input" type="number" min="0" placeholder="Min" aria-label="Minimum price" value={price.min} onChange={(e) => setPrice({ ...price, min: e.target.value })} />
          <input className="input" type="number" min="0" placeholder="Max" aria-label="Maximum price" value={price.max} onChange={(e) => setPrice({ ...price, max: e.target.value })} />
        </div>
        <button className="btn-outline btn-sm mt-2 w-full">Apply price</button>
      </form>
      {activeCount > 0 && <button className="text-garnet underline" onClick={() => setSp({})}>Clear all filters</button>}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl">{get('search') ? `Results for "${get('search')}"` : 'All jewellery'}</h1>
          <p className="mt-1 text-sm text-ink/60">{loading ? 'Loading…' : `${data.total} piece${data.total === 1 ? '' : 's'}`}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline btn-sm lg:hidden" onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters}>
            Filters{activeCount ? ` (${activeCount})` : ''}
          </button>
          <label className="sr-only" htmlFor="sort">Sort by</label>
          <select id="sort" className="input !w-auto" value={get('sort') || 'newest'} onChange={(e) => set({ sort: e.target.value })}>
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="weight_asc">Weight: light to heavy</option>
            <option value="weight_desc">Weight: heavy to light</option>
            <option value="name">Name A to Z</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className={`${showFilters ? 'block' : 'hidden'} card p-4 lg:block lg:self-start`}>{filters}</aside>
        <div>
          {!loading && data.items.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="font-display text-xl">No jewellery matches these filters</p>
              <p className="mt-1 text-sm text-ink/60">Try removing a filter or widening the price range.</p>
              <button className="btn-primary mt-4" onClick={() => setSp({})}>Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
              {data.items.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
          <Pagination page={data.page} pages={data.pages} onChange={(n) => { set({ page: String(n) }); window.scrollTo(0, 0); }} />
        </div>
      </div>
    </div>
  );
}
