import { useEffect, useState } from 'react';
import { api, errMsg, fmtDate, metalLabel, money } from '../lib/api';
import { StatusBadge } from '../pages/Orders';
import ProductImage from '../components/ProductImage';

const STATUSES = ['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState('');
  const [sel, setSel] = useState(null);
  const [status, setStatus] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => api.get('/admin/orders', { params: filter ? { status: filter } : {} }).then((r) => setOrders(r.data));
  useEffect(() => { load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = (o) => { setSel(o); setStatus(o.status); setMsg(''); };
  const update = async () => {
    try {
      const { data } = await api.put(`/admin/orders/${sel._id}/status`, { status });
      setSel(data); setMsg(`Order marked as ${data.status}`); load();
    } catch (e) { setMsg(errMsg(e)); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl">Orders</h1>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {['', ...STATUSES].map((s) => (
            <button key={s} onClick={() => setFilter(s)} aria-pressed={filter === s} className={`btn btn-sm ${filter === s ? 'bg-garnet text-white' : 'border border-mist bg-white'}`}>{s || 'All'}</button>
          ))}
        </div>
      </div>

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-mist bg-pearl/60"><tr><th className="th">Order</th><th className="th">Customer</th><th className="th">Date</th><th className="th">Total</th><th className="th">Status</th><th className="th" /></tr></thead>
          <tbody className="divide-y divide-mist">
            {orders === null ? <tr><td className="td text-ink/60" colSpan={6}>Loading…</td></tr> : orders.length === 0 ? <tr><td className="td text-ink/60" colSpan={6}>No orders {filter ? `with status “${filter}”` : 'yet'}.</td></tr> : orders.map((o) => (
              <tr key={o._id}>
                <td className="td font-medium">{o.orderNumber}</td>
                <td className="td">{o.user?.name}<br /><span className="text-xs text-ink/50">{o.user?.email}</span></td>
                <td className="td text-ink/60">{fmtDate(o.createdAt)}</td>
                <td className="td">{money(o.total)}</td>
                <td className="td"><StatusBadge status={o.status} /></td>
                <td className="td text-right"><button className="btn-outline btn-sm" onClick={() => open(o)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sel && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-night/60 p-4" role="dialog" aria-modal="true" aria-label={`Order ${sel.orderNumber}`}>
          <div className="my-6 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="text-xl">Order {sel.orderNumber}</h2><p className="text-sm text-ink/60">{fmtDate(sel.createdAt)}</p></div>
              <button className="btn-outline btn-sm" onClick={() => setSel(null)}>Close</button>
            </div>

            <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div><p className="font-semibold">Customer</p><p>{sel.user?.name}</p><p>{sel.user?.email}</p><p>{sel.address.phone}</p></div>
              <div><p className="font-semibold">Deliver to</p><p>{sel.address.name}</p><p>{[sel.address.line1, sel.address.line2, sel.address.city, sel.address.state, sel.address.pincode].filter(Boolean).join(', ')}</p></div>
            </div>

            <div className="mt-4 divide-y divide-mist rounded border border-mist">
              {sel.items.map((i, n) => (
                <div key={n} className="flex items-center gap-3 p-3 text-sm">
                  <ProductImage src={i.image} alt="" className="h-12 w-12 rounded" />
                  <div className="flex-1"><p className="font-medium">{i.name}</p><p className="text-xs text-ink/60">{metalLabel(i)}, {i.weight} g, qty {i.qty}</p>
                    {i.breakup && <p className="text-xs text-ink/50">Rate {money(i.breakup.rate)}/g, metal {money(i.breakup.metalValue)}, making {money(i.breakup.making)}{i.breakup.stone ? `, stone ${money(i.breakup.stone)}` : ''}, GST {money(i.breakup.gst)}</p>}</div>
                  <span>{money(i.unitPrice * i.qty, 2)}</span>
                </div>
              ))}
              <div className="space-y-1 p-3 text-sm">
                <div className="flex justify-between"><span>Items total</span><span>{money(sel.itemsTotal, 2)}</span></div>
                {sel.discount > 0 && <div className="flex justify-between text-emerald-700"><span>Coupon {sel.couponCode}</span><span>− {money(sel.discount, 2)}</span></div>}
                <div className="flex justify-between font-semibold"><span>Total</span><span>{money(sel.total, 2)}</span></div>
                <p className="text-ink/60">Payment: {sel.paymentMethod} ({sel.paymentStatus})</p>
              </div>
            </div>
            {sel.note && <p className="mt-3 rounded bg-gold-soft p-3 text-sm">Customer note: {sel.note}</p>}

            <div className="mt-5 flex flex-wrap items-end gap-3">
              <div><label className="label" htmlFor="st">Order status</label>
                <select id="st" className="input" value={status} onChange={(e) => setStatus(e.target.value)} disabled={sel.status === 'Cancelled'}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
              <button className="btn-primary" onClick={update} disabled={status === sel.status}>Update status</button>
            </div>
            {msg && <p role="status" className="mt-3 text-sm text-ink/70">{msg}</p>}
            {sel.status === 'Cancelled' && <p className="mt-2 text-xs text-ink/50">Cancelled orders cannot be reopened. Stock was returned.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
