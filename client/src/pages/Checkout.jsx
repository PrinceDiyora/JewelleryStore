import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errMsg, metalLabel, money } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { Totals } from './Cart';

const FIELDS = [
  ['name', 'Full name', 'sm:col-span-2'],
  ['phone', 'Phone number', ''],
  ['pincode', 'Pincode', ''],
  ['line1', 'Address line 1', 'sm:col-span-2'],
  ['line2', 'Address line 2 (optional)', 'sm:col-span-2'],
  ['city', 'City', ''],
  ['state', 'State', ''],
];

export default function Checkout() {
  const { user } = useAuth();
  const { cart, coupon, refreshCart } = useShop();
  const navigate = useNavigate();
  const [methods, setMethods] = useState([]);
  const [method, setMethod] = useState('COD');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [addr, setAddr] = useState({
    name: user.name, phone: user.phone || '', line1: '', line2: '', city: '', state: '', pincode: '', ...user.address,
  });

  useEffect(() => {
    api.get('/payment-methods').then((r) => { setMethods(r.data); if (r.data[0]) setMethod(r.data[0].key); });
  }, []);

  if (!cart.items.length)
    return <div className="p-16 text-center"><p>Your cart is empty.</p><Link to="/products" className="btn-primary mt-4">Browse jewellery</Link></div>;

  const place = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const { data } = await api.post('/orders', { address: addr, couponCode: coupon?.code, paymentMethod: method, note });
      await refreshCart();
      navigate(`/orders/${data._id}`, { state: { placed: true } });
    } catch (err) {
      setError(errMsg(err));
      refreshCart();
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={place} className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl">Checkout</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-4 text-xl">Delivery address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {FIELDS.map(([key, label, span]) => (
                <div key={key} className={span}>
                  <label className="label" htmlFor={key}>{label}</label>
                  <input id={key} className="input" required={key !== 'line2'} value={addr[key] || ''} onChange={(e) => setAddr({ ...addr, [key]: e.target.value })} />
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="mb-4 text-xl">Payment</h2>
            {methods.map((m) => (
              <label key={m.key} className="flex cursor-pointer items-start gap-3 rounded border border-mist p-3 has-[:checked]:border-garnet has-[:checked]:bg-garnet-soft">
                <input type="radio" name="pay" className="mt-1 accent-garnet" checked={method === m.key} onChange={() => setMethod(m.key)} />
                <span><span className="font-medium">{m.label}</span><br /><span className="text-sm text-ink/60">{m.description}</span></span>
              </label>
            ))}
            <label className="label mt-4" htmlFor="note">Note for the shop (optional)</label>
            <textarea id="note" rows={2} className="input" value={note} onChange={(e) => setNote(e.target.value)} />
          </section>
        </div>

        <aside className="card h-fit p-5">
          <h2 className="mb-4 text-xl">Your order</h2>
          <ul className="mb-4 space-y-2 text-sm">
            {cart.items.map(({ product: p, qty, lineTotal }) => (
              <li key={p._id} className="flex justify-between gap-3">
                <span>{p.name} <span className="text-ink/50">× {qty}</span><br /><span className="text-xs text-ink/50">{metalLabel(p)}, {p.weight} g</span></span>
                <span>{money(lineTotal)}</span>
              </li>
            ))}
          </ul>
          <Totals cart={cart} coupon={coupon} />
          {error && <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button className="btn-primary mt-5 w-full py-3" disabled={busy}>{busy ? 'Placing order…' : 'Place order'}</button>
          <p className="mt-2 text-center text-xs text-ink/50">Final prices are confirmed at today's metal rate when you place the order.</p>
        </aside>
      </div>
    </form>
  );
}
