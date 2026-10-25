import { useRef, useState } from 'react';
import { api, errMsg, imgUrl } from '../lib/api';

// Uploads to POST /api/admin/upload and stores the returned URL(s)
export default function ImageField({ value, onChange, multiple = false }) {
  const input = useRef();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const list = multiple ? value || [] : value ? [value] : [];

  const MAX_MB = 15;
  const upload = async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    const tooBig = files.filter((f) => f.size > MAX_MB * 1024 * 1024);
    if (tooBig.length) {
      setError(`File too large: ${tooBig.map((f) => f.name).join(', ')} — max ${MAX_MB} MB each`);
      input.current.value = '';
      return;
    }
    setBusy(true); setError('');
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('images', f));
      const { data } = await api.post('/admin/upload', fd);
      onChange(multiple ? [...list, ...data.urls] : data.urls[0]);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
      input.current.value = '';
    }
  };
  const remove = (url) => onChange(multiple ? list.filter((u) => u !== url) : '');

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {list.map((u) => (
          <div key={u} className="relative h-20 w-20 overflow-hidden rounded border border-mist">
            <img src={imgUrl(u)} alt="" className="h-full w-full object-cover" />
            <button type="button" onClick={() => remove(u)} aria-label="Remove image" className="absolute right-0.5 top-0.5 rounded-full bg-ink/80 px-1.5 text-xs text-white">×</button>
          </div>
        ))}
        {(multiple || !list.length) && (
          <button type="button" onClick={() => input.current.click()} disabled={busy} className="flex h-20 w-20 items-center justify-center rounded border border-dashed border-ink/30 text-xs text-ink/60 hover:border-garnet hover:text-garnet">
            {busy ? 'Uploading…' : '+ Add image'}
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple={multiple} onChange={upload} className="hidden" />
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
