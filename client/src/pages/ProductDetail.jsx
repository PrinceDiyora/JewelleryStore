import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, errMsg, imgUrl, metalLabel, money } from '../lib/api';
import { useShop } from '../context/ShopContext';
import { HeartIcon } from '../components/Icons';
import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart, wishIds, toggleWishlist } = useShop();
  const [p, setP] = useState(null);
  const [error, setError] = useState('');
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setP(null); setError(''); setActive(0); setQty(1);
    api.get(`/products/${id}`).then((r) => setP(r.data)).catch((e) => setError(errMsg(e)));
  }, [id]);

  if (error) return <div className="p-10 text-center"><p className="text-red-700">{error}</p><Link to="/products" className="btn-primary mt-4">Back to jewellery</Link></div>;
  if (!p) return <p className="p-10 text-center text-ink/60">Loading…</p>;

  const b = p.price;
  const out = p.stock < 1;
  const liked = wishIds.includes(String(p._id));
  const stockText = out ? 'Out of stock' : p.stock <= 5 ? `Only ${p.stock} left` : 'In stock';
  const Row = ({ label, value, strong }) => (
    <div className={`flex justify-between gap-4 py-2 ${strong ? 'border-t border-ink/30 text-lg font-semibold' : 'border-t border-mist text-sm'}`}>
      <span className={strong ? '' : 'text-ink/70'}>{label}</span><span className={strong ? 'text-gold' : ''}>{value}</span>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-sm text-ink/60">
        <Link to="/products" className="hover:text-garnet">All jewellery</Link> / <Link to={`/products?category=${p.category?._id}`} className="hover:text-garnet">{p.category?.name}</Link>
      </p>

      <div className="mt-5 grid gap-10 md:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-lg border border-mist bg-white">
            <ProductImage src={p.images?.[active]} alt={p.name} className="aspect-square w-full" />
          </div>
          {p.images?.length > 1 && (
            <div className="mt-3 flex gap-2">
              {p.images.map((img, i) => (
                <button key={img} onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`} className={`h-16 w-16 overflow-hidden rounded border-2 ${i === active ? 'border-garnet' : 'border-transparent'}`}>
                  <img src={imgUrl(img)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl">{p.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="badge bg-gold-soft text-gold">{metalLabel(p)}</span>
            <span className="badge bg-white text-ink/70 ring-1 ring-mist">{p.weight} g</span>
            <span className={`badge ${out ? 'bg-red-50 text-red-700' : p.stock <= 5 ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>{stockText}</span>
          </div>

          <div className="card mt-6 p-5">
            <h2 className="mb-1 text-lg">Price breakup</h2>
            {b.available ? (
              <>
                <Row label={`${p.metal === 'silver' ? 'Silver' : 'Gold'} rate ${p.purity}: ${money(b.rate)}/g × ${b.weight} g`} value={money(b.metalValue, 2)} />
                <Row label={`Making charges${p.makingType === 'percent' ? ` (${p.makingCharges}%)` : ''}`} value={money(b.making, 2)} />
                {b.stone > 0 && <Row label="Stone charges" value={money(b.stone, 2)} />}
                <Row label={`GST (${b.gstPercent}%)`} value={money(b.gst, 2)} />
                <Row label="Final price" value={money(b.total, 2)} strong />
                <p className="mt-2 text-xs text-ink/50">Calculated from today's metal rate. The price can change when the rate changes.</p>
              </>
            ) : (
              <p className="text-sm text-ink/70">Today's rate for this metal has not been set yet. Please check back soon.</p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded border border-mist bg-white">
              <button className="px-3 py-2" aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span className="w-8 text-center text-sm" aria-live="polite">{qty}</span>
              <button className="px-3 py-2" aria-label="Increase quantity" onClick={() => setQty(Math.min(Math.min(p.stock, 10), qty + 1))}>+</button>
            </div>
            <button className="btn-primary flex-1 py-3" disabled={out || !b.available} onClick={() => addToCart(p._id, qty)}>
              {out ? 'Out of stock' : 'Add to cart'}
            </button>
            <button className={`btn-outline py-3 ${liked ? 'text-garnet' : ''}`} aria-pressed={liked} onClick={() => toggleWishlist(String(p._id))}>
              <HeartIcon filled={liked} width={18} height={18} /> {liked ? 'Saved' : 'Wishlist'}
            </button>
          </div>

          {p.description && <p className="mt-8 max-w-prose leading-relaxed text-ink/80">{p.description}</p>}
          {p.collections?.length > 0 && (
            <p className="mt-4 text-sm text-ink/60">
              Part of: {p.collections.map((c, i) => (<span key={c._id}>{i > 0 && ', '}<Link className="text-garnet hover:underline" to={`/products?collection=${c._id}`}>{c.name}</Link></span>))}
            </p>
          )}
        </div>
      </div>

      {p.related?.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl">More from {p.category?.name}</h2>
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {p.related.map((r) => <ProductCard key={r._id} product={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
