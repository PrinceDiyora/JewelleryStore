import { useEffect, useState } from 'react';
import { api, errMsg } from '../lib/api';
import ImageField from './ImageField';

// A config-driven list + add/edit form used for products, categories,
// collections, banners and coupons.
const idOf = (v) => (v && typeof v === 'object' ? v._id : v);

function toForm(row, fields, blank) {
  const f = { ...blank };
  fields.forEach((fd) => {
    let v = row ? row[fd.name] : undefined;
    if (fd.type === 'multiselect') v = (v || []).map(idOf);
    else if (fd.type === 'select') v = idOf(v);
    else if (fd.type === 'date') v = v ? String(v).slice(0, 10) : '';
    if (v !== undefined && v !== null) f[fd.name] = v;
  });
  return f;
}

function Field({ fd, value, onChange, opts }) {
  const id = `f-${fd.name}`;
  const options = fd.options || (opts[fd.from] || []).map((o) => ({ value: o._id, label: o.name }));
  switch (fd.type) {
    case 'textarea':
      return <textarea id={id} rows={3} className="input" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
    case 'number':
      return <input id={id} type="number" step={fd.step || 'any'} min={fd.min ?? 0} className="input" required={fd.required} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'date':
      return <input id={id} type="date" className="input" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
    case 'checkbox':
      return <label className="flex items-center gap-2 py-2 text-sm"><input id={id} type="checkbox" className="accent-garnet" checked={!!value} onChange={(e) => onChange(e.target.checked)} />{fd.hint || 'Yes'}</label>;
    case 'select':
      return (
        <select id={id} className="input" required={fd.required} value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    case 'multiselect':
      return (
        <div className="flex flex-wrap gap-x-4 gap-y-1 py-1">
          {options.map((o) => (
            <label key={o.value} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" className="accent-garnet" checked={(value || []).includes(o.value)} onChange={(e) => onChange(e.target.checked ? [...(value || []), o.value] : (value || []).filter((x) => x !== o.value))} />
              {o.label}
            </label>
          ))}
          {!options.length && <span className="text-sm text-ink/50">Nothing to choose yet.</span>}
        </div>
      );
    case 'image':
      return <ImageField value={value} onChange={onChange} />;
    case 'images':
      return <ImageField multiple value={value} onChange={onChange} />;
    default:
      return <input id={id} className="input" required={fd.required} value={value || ''} onChange={(e) => onChange(e.target.value)} />;
  }
}

export default function CrudPage({ title, noun, endpoint, columns, fields, blank, intro, searchable }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opts, setOpts] = useState({});
  const [form, setForm] = useState(null); // null = closed
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => api.get(`/admin/${endpoint}`).then((r) => setRows(r.data)).finally(() => setLoading(false));
  useEffect(() => {
    load();
    [...new Set(fields.filter((f) => f.from).map((f) => f.from))].forEach((from) =>
      api.get(`/admin/${from}`).then((r) => setOpts((o) => ({ ...o, [from]: r.data })))
    );
  }, [endpoint]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = (row) => { setEditId(row?._id || null); setForm(toForm(row, fields, blank)); setError(''); };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    const payload = { ...form };
    fields.forEach((fd) => {
      if (fd.type === 'number') payload[fd.name] = payload[fd.name] === '' ? 0 : Number(payload[fd.name]);
      if (fd.type === 'date' && !payload[fd.name]) payload[fd.name] = null;
      if (fd.type === 'select' && !payload[fd.name]) delete payload[fd.name];
    });
    try {
      editId ? await api.put(`/admin/${endpoint}/${editId}`, payload) : await api.post(`/admin/${endpoint}`, payload);
      setForm(null);
      setMsg(`${noun} ${editId ? 'updated' : 'added'}`);
      await load();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete this ${noun.toLowerCase()}? This cannot be undone.`)) return;
    try { await api.delete(`/admin/${endpoint}/${row._id}`); setMsg(`${noun} deleted`); await load(); } catch (err) { setMsg(errMsg(err)); }
  };

  const shown = q ? rows.filter((r) => JSON.stringify([r.name, r.title, r.code]).toLowerCase().includes(q.toLowerCase())) : rows;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl">{title}</h1>{intro && <p className="mt-1 max-w-2xl text-sm text-ink/60">{intro}</p>}</div>
        <div className="flex gap-2">
          {searchable && <input className="input !w-48" placeholder={`Search ${title.toLowerCase()}`} aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} />}
          <button className="btn-primary" onClick={() => open(null)}>Add {noun.toLowerCase()}</button>
        </div>
      </div>
      {msg && <p role="status" className="mt-4 rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</p>}

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-mist bg-pearl/60"><tr>{columns.map((c) => <th key={c.label} className="th">{c.label}</th>)}<th className="th text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-mist">
            {loading ? <tr><td className="td text-ink/60" colSpan={columns.length + 1}>Loading…</td></tr>
              : shown.length === 0 ? <tr><td className="td text-ink/60" colSpan={columns.length + 1}>Nothing here yet. Use “Add {noun.toLowerCase()}” to create the first one.</td></tr>
              : shown.map((row) => (
                <tr key={row._id}>
                  {columns.map((c) => <td key={c.label} className="td">{c.render ? c.render(row) : row[c.key]}</td>)}
                  <td className="td whitespace-nowrap text-right">
                    <button className="btn-outline btn-sm mr-2" onClick={() => open(row)}>Edit</button>
                    <button className="btn-danger btn-sm" onClick={() => remove(row)}>Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-night/60 p-4" role="dialog" aria-modal="true" aria-label={`${editId ? 'Edit' : 'Add'} ${noun}`}>
          <form onSubmit={save} className="my-6 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-xl">{editId ? 'Edit' : 'Add'} {noun.toLowerCase()}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {fields.map((fd) => (
                <div key={fd.name} className={fd.full || ['textarea', 'images', 'image', 'multiselect'].includes(fd.type) ? 'sm:col-span-2' : ''}>
                  {fd.type !== 'checkbox' && <label className="label" htmlFor={`f-${fd.name}`}>{fd.label}{fd.required && ' *'}</label>}
                  {fd.type === 'checkbox' && <span className="label">{fd.label}</span>}
                  <Field fd={fd} value={form[fd.name]} opts={opts} onChange={(v) => setForm({ ...form, [fd.name]: v })} />
                  {fd.help && <p className="mt-1 text-xs text-ink/50">{fd.help}</p>}
                </div>
              ))}
            </div>
            {error && <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="btn-outline" onClick={() => setForm(null)}>Cancel</button>
              <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
