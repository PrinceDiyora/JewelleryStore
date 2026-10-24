import { useEffect, useState } from 'react';
import { api, errMsg, fmtDate, money, rateLabel } from '../lib/api';

export default function Rates() {
  const [rates, setRates] = useState([]);
  const [edit, setEdit] = useState({});
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [add, setAdd] = useState({ metal: 'gold', purity: '22K', ratePerGram: '' });

  const load = () => api.get('/admin/rates').then((r) => { setRates(r.data); setEdit(Object.fromEntries(r.data.map((x) => [x._id, x.ratePerGram]))); });
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(''); setMsg('');
    try {
      await api.put('/admin/rates', { rates: rates.map((r) => ({ _id: r._id, ratePerGram: edit[r._id] })) });
      await load();
      setMsg("Rates saved. Every product price in the store now follows today's rates.");
    } catch (e2) { setErr(errMsg(e2)); } finally { setBusy(false); }
  };

  const addRate = async (e) => {
    e.preventDefault();
    try { await api.post('/admin/rates', { ...add, purity: add.metal === 'silver' ? '925' : add.purity }); setAdd({ ...add, ratePerGram: '' }); await load(); setMsg('Rate added'); } catch (e2) { setErr(errMsg(e2)); }
  };

  return (
    <div>
      <h1 className="text-2xl">Daily metal rates</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink/60">Enter today's rate per gram and save once. Product prices, carts and the rate board on the store update straight away. Diamond jewellery uses the gold rate for its purity.</p>

      <form onSubmit={save} className="card mt-5 p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          {rates.map((r) => (
            <div key={r._id} className="rounded border border-mist p-4">
              <label className="label" htmlFor={`r-${r._id}`}>{rateLabel(r)} (₹ per gram)</label>
              <input id={`r-${r._id}`} type="number" min="0" step="0.01" required className="input text-lg" value={edit[r._id] ?? ''} onChange={(e) => setEdit({ ...edit, [r._id]: e.target.value })} />
              <p className="mt-2 text-xs text-ink/50">Now {money(r.ratePerGram)}. Last updated {fmtDate(r.updatedAt)}.</p>
              {r.history?.length > 1 && <p className="mt-1 text-xs text-ink/40">Recent: {r.history.slice(-4).map((h) => money(h.rate)).join(', ')}</p>}
            </div>
          ))}
        </div>
        {msg && <p role="status" className="mt-4 rounded bg-emerald-50 p-3 text-sm text-emerald-800">{msg}</p>}
        {err && <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{err}</p>}
        <button className="btn-primary mt-5" disabled={busy || !rates.length}>{busy ? 'Saving…' : 'Save rates'}</button>
      </form>

      <form onSubmit={addRate} className="card mt-6 flex flex-wrap items-end gap-3 p-5">
        <div><label className="label" htmlFor="am">Add a missing rate</label>
          <select id="am" className="input" value={add.metal} onChange={(e) => setAdd({ ...add, metal: e.target.value })}><option value="gold">Gold</option><option value="silver">Silver</option></select></div>
        {add.metal === 'gold' && (<div><label className="label" htmlFor="ap2">Purity</label><select id="ap2" className="input" value={add.purity} onChange={(e) => setAdd({ ...add, purity: e.target.value })}><option>22K</option><option>18K</option></select></div>)}
        <div><label className="label" htmlFor="ar">Rate per gram</label><input id="ar" type="number" min="0" step="0.01" required className="input" value={add.ratePerGram} onChange={(e) => setAdd({ ...add, ratePerGram: e.target.value })} /></div>
        <button className="btn-outline">Add rate</button>
      </form>
    </div>
  );
}
