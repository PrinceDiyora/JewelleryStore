import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtDate, money, rateLabel } from '../lib/api';
import { StatusBadge } from '../pages/Orders';

const Stat = ({ label, value, tone = '' }) => (
  <div className="card p-5"><p className="text-sm text-ink/60">{label}</p><p className={`mt-1 font-display text-3xl ${tone}`}>{value}</p></div>
);

export default function Dashboard() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get('/admin/dashboard').then((r) => setD(r.data)); }, []);
  if (!d) return <p className="text-ink/60">Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl">Dashboard</h1>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total orders" value={d.totalOrders} />
        <Stat label="Revenue (excluding cancelled)" value={money(d.revenue)} tone="text-gold" />
        <Stat label="Customers" value={d.users} />
        <Stat label={`Low-stock products (${d.lowStockThreshold} or fewer)`} value={d.lowStock.length} tone={d.lowStock.length ? 'text-red-700' : ''} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center justify-between"><h2 className="text-lg">Today's metal rates</h2><Link to="/admin/rates" className="text-sm text-garnet hover:underline">Update rates</Link></div>
          <ul className="mt-3 divide-y divide-mist text-sm">
            {d.rates.map((r) => (
              <li key={r._id} className="flex justify-between py-2"><span>{rateLabel(r)}</span><span><b>{money(r.ratePerGram)}</b> per gram <span className="text-ink/50">(updated {fmtDate(r.updatedAt)})</span></span></li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between"><h2 className="text-lg">Low-stock products</h2><Link to="/admin/products" className="text-sm text-garnet hover:underline">Manage products</Link></div>
          {d.lowStock.length === 0 ? <p className="mt-3 text-sm text-ink/60">Every product has healthy stock.</p> : (
            <ul className="mt-3 divide-y divide-mist text-sm">
              {d.lowStock.map((p) => (
                <li key={p._id} className="flex justify-between py-2"><span>{p.name}</span><span className={p.stock === 0 ? 'font-semibold text-red-700' : 'text-amber-800'}>{p.stock === 0 ? 'Out of stock' : `${p.stock} left`}</span></li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card mt-6 p-5">
        <div className="flex items-center justify-between"><h2 className="text-lg">Recent orders</h2><Link to="/admin/orders" className="text-sm text-garnet hover:underline">All orders</Link></div>
        {d.recentOrders.length === 0 ? <p className="mt-3 text-sm text-ink/60">No orders yet.</p> : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px]"><tbody className="divide-y divide-mist">
              {d.recentOrders.map((o) => (
                <tr key={o._id}><td className="td font-medium">{o.orderNumber}</td><td className="td">{o.user?.name}</td><td className="td text-ink/60">{fmtDate(o.createdAt)}</td><td className="td"><StatusBadge status={o.status} /></td><td className="td text-right font-medium">{money(o.total)}</td></tr>
              ))}
            </tbody></table>
          </div>
        )}
      </section>
    </div>
  );
}
