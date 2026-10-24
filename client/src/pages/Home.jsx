import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, imgUrl } from '../lib/api';
import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';

function Hero({ banners }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % banners.length), 6000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) return null;
  const b = banners[i % banners.length];
  return (
    <section aria-label="Featured offers" className="relative overflow-hidden bg-gradient-to-br from-garnet-dark via-garnet to-night text-white">
      {b.image && <img src={imgUrl(b.image)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />}
      {b.image && <div className="absolute inset-0 bg-gradient-to-r from-night/80 to-transparent" />}
      <div className="relative mx-auto flex min-h-[340px] max-w-7xl flex-col justify-center px-4 py-14 md:min-h-[420px]">
        <h1 className="max-w-2xl text-4xl font-medium leading-tight md:text-6xl">{b.title}</h1>
        {b.subtitle && <p className="mt-4 max-w-xl text-lg text-white/80">{b.subtitle}</p>}
        <div className="mt-8 flex items-center gap-6">
          <Link to={b.link || '/products'} className="btn bg-[#E3C27A] px-6 py-3 text-night hover:bg-white">{b.ctaText || 'Shop now'}</Link>
          {banners.length > 1 && (
            <div className="flex gap-2" role="tablist" aria-label="Choose banner">
              {banners.map((x, n) => (
                <button key={x._id} role="tab" aria-selected={n === i % banners.length} aria-label={`Banner ${n + 1}`} onClick={() => setI(n)}
                  className={`h-2 rounded-full transition-all ${n === i % banners.length ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/home').then((r) => setData(r.data)).catch(() => setError('Could not load the store. Please check the server is running.'));
  }, []);

  if (error) return <p className="p-10 text-center text-red-700">{error}</p>;
  if (!data) return <p className="p-10 text-center text-ink/60">Loading…</p>;

  return (
    <>
      <Hero banners={data.banners} />

      <section className="mx-auto max-w-7xl px-4 pt-14">
        <h2 className="text-3xl">Shop by category</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {data.categories.map((c) => (
            <Link key={c._id} to={`/products?category=${c._id}`} className="group relative block overflow-hidden rounded-lg border border-mist bg-white">
              <ProductImage src={c.image} alt="" className="aspect-[4/5] w-full transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/85 to-transparent p-4 pt-12 text-white">
                <p className="font-display text-xl">{c.name}</p>
                {c.description && <p className="text-xs text-white/75">{c.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {data.featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-14">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl">Featured jewellery</h2>
            <Link to="/products" className="text-sm font-medium text-garnet hover:underline">View all</Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {data.featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {data.collections.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-14">
          <h2 className="text-3xl">Collections</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {data.collections.map((c) => (
              <Link key={c._id} to={`/products?collection=${c._id}`} className="card group flex overflow-hidden transition-colors hover:border-garnet">
                <ProductImage src={c.image} alt="" className="h-full min-h-[120px] w-28 shrink-0" />
                <div className="p-4">
                  <p className="font-display text-xl group-hover:text-garnet">{c.name}</p>
                  <p className="mt-1 text-sm text-ink/60">{c.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
