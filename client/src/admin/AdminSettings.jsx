import { useEffect, useState } from 'react';
import { api, errMsg } from '../lib/api';
import { useShop } from '../context/ShopContext';

export default function AdminSettings() {
  const { notify } = useShop();
  const [s, setS] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => { api.get('/admin/settings').then((r) => setS(r.data)); }, []);
  if (!s) return <p className="text-ink/60">Loading…</p>;
  const bind = (k) => ({ value: s[k] ?? '', onChange: (e) => setS({ ...s, [k]: e.target.value }) });

  const save = async (e) => {
    e.preventDefault(); setErr('');
    try {
      await api.put('/admin/settings', { ...s, gstPercent: Number(s.gstPercent), lowStockThreshold: Number(s.lowStockThreshold) });
      notify('Settings saved. Reload the store to see the new name and contact details.');
    } catch (e2) { setErr(errMsg(e2)); }
  };

  return (
    <div>
      <h1 className="text-2xl">Settings</h1>
      <form onSubmit={save} className="card mt-5 grid max-w-2xl gap-4 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className="label" htmlFor="sn">Store name</label><input id="sn" className="input" required {...bind('storeName')} /></div>
        <div><label className="label" htmlFor="gst">GST (%)</label><input id="gst" type="number" min="0" max="100" step="0.01" required className="input" {...bind('gstPercent')} /><p className="mt-1 text-xs text-ink/50">Added to every product price.</p></div>
        <div><label className="label" htmlFor="ls">Low-stock alert at</label><input id="ls" type="number" min="0" step="1" className="input" {...bind('lowStockThreshold')} /><p className="mt-1 text-xs text-ink/50">Pieces or fewer shows on the dashboard.</p></div>
        <div><label className="label" htmlFor="se">Contact email</label><input id="se" type="email" className="input" {...bind('email')} /></div>
        <div><label className="label" htmlFor="sp">Contact phone</label><input id="sp" className="input" {...bind('phone')} /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="sa">Shop address</label><textarea id="sa" rows={2} className="input" {...bind('address')} /></div>
        {err && <p role="alert" className="sm:col-span-2 rounded bg-red-50 p-3 text-sm text-red-700">{err}</p>}
        <div className="sm:col-span-2"><button className="btn-primary">Save settings</button></div>
      </form>
    </div>
  );
}
