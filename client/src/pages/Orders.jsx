import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api, errMsg, fmtDate, metalLabel, money } from '../lib/api';
import { useShop } from '../context/ShopContext';
import ProductImage from '../components/ProductImage';

export const STATUS_STYLE = {
  Placed: 'bg-blue-50 text-blue-800',
  Packed: 'bg-amber-50 text-amber-800',
  Shipped: 'bg-violet-50 text-violet-800',
  Delivered: 'bg-emerald-50 text-emerald-800',
  Cancelled: 'bg-red-50 text-red-700',
};
export const StatusBadge = ({ status }) => <span className={`badge ${STATUS_STYLE[status]}`}>{status}</span>;

export function OrdersList() {
  const [orders, setOrders] = useState(null);
  useEffect(() => { api.get('/orders').then((r) => setOrders(r.data)); }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl">My orders</h1>
      {orders === null ? <p className="mt-6 text-ink/60">Loading…</p> : orders.length === 0 ? (
        <div className="mt-8 text-center"><p className="text-ink/60">You have not placed any orders yet.</p><Link to="/products" className="btn-primary mt-4">Browse jewellery</Link></div>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((o) => (
            <li key={o._id}>
              <Link to={`/orders/${o._id}`} className="card flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:border-garnet">
                <div>
                  <p className="font-medium">Order {o.orderNumber}</p>
                  <p className="text-sm text-ink/60">{fmtDate(o.createdAt)} &middot; {o.items.reduce((s, i) => s + i.qty, 0)} item(s)</p>
                </div>
                <div className="flex items-center gap-4"><StatusBadge status={o.status} /><span className="font-semibold">{money(o.total)}</span></div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const STEPS = ['Placed', 'Packed', 'Shipped', 'Delivered'];

export function OrderDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const { notify } = useShop();
  const [o, setO] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { api.get(`/orders/${id}`).then((r) => setO(r.data)).catch((e) => setError(errMsg(e))); }, [id]);

  const cancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    try { setO((await api.put(`/orders/${id}/cancel`)).data); notify('Order cancelled'); } catch (e) { notify(errMsg(e)); }
  };

  if (error) return <p className="p-10 text-center text-red-700">{error}</p>;
  if (!o) return <p className="p-10 text-center text-ink/60">Loading…</p>;
  const step = STEPS.indexOf(o.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {state?.placed && (
        <div role="status" className="mb-6 rounded bg-emerald-50 p-4 text-emerald-800">
          <p className="font-semibold">Thank you, your order is placed.</p>
          <p className="text-sm">We will confirm it shortly. You can follow its status on this page.</p>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl">Order {o.orderNumber}</h1><p className="text-sm text-ink/60">Placed on {fmtDate(o.createdAt)}</p></div>
        <StatusBadge status={o.status} />
      </div>

      {o.status !== 'Cancelled' && (
        <ol className="mt-6 grid grid-cols-4 gap-2" aria-label="Order progress">
          {STEPS.map((s, i) => (
            <li key={s} className="text-center text-sm">
              <div className={`mb-2 h-1.5 rounded-full ${i <= step ? 'bg-garnet' : 'bg-mist'}`} />
              <span className={i <= step ? 'font-medium' : 'text-ink/50'}>{s}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="card mt-6 divide-y divide-mist">
        {o.items.map((i, n) => (
          <div key={n} className="flex gap-4 p-4">
            <ProductImage src={i.image} alt={i.name} className="h-16 w-16 rounded" />
            <div className="flex-1 text-sm">
              <p className="font-medium">{i.name}</p>
              <p className="text-ink/60">{metalLabel(i)} &middot; {i.weight} g &middot; Qty {i.qty}</p>
              {i.breakup && <p className="text-xs text-ink/50">Rate {money(i.breakup.rate)}/g, making {money(i.breakup.making)}, GST {money(i.breakup.gst)} per piece</p>}
            </div>
            <p className="font-medium">{money(i.unitPrice * i.qty, 2)}</p>
          </div>
        ))}
        <div className="space-y-1 p-4 text-sm">
          <div className="flex justify-between"><span>Items total</span><span>{money(o.itemsTotal, 2)}</span></div>
          {o.discount > 0 && <div className="flex justify-between text-emerald-700"><span>Coupon {o.couponCode}</span><span>− {money(o.discount, 2)}</span></div>}
          <div className="flex justify-between text-base font-semibold"><span>Total</span><span className="text-gold">{money(o.total, 2)}</span></div>
          <p className="text-ink/60">Payment: {o.paymentMethod === 'COD' ? 'Cash on Delivery' : o.paymentMethod} ({o.paymentStatus})</p>
        </div>
      </div>

      <div className="card mt-6 p-4 text-sm">
        <p className="mb-1 font-semibold">Delivering to</p>
        <p>{o.address.name}, {o.address.phone}</p>
        <p>{[o.address.line1, o.address.line2, o.address.city, o.address.state, o.address.pincode].filter(Boolean).join(', ')}</p>
      </div>

      {o.status === 'Placed' && <button className="btn-danger mt-6" onClick={cancel}>Cancel order</button>}
    </div>
  );
}
