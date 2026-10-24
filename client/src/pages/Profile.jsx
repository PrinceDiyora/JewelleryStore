import { useState } from 'react';
import { api, errMsg } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { notify } = useShop();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', address: { line1: '', line2: '', city: '', state: '', pincode: '', ...user.address } });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });

  const saveProfile = async (e) => {
    e.preventDefault();
    try { setUser((await api.put('/auth/me', form)).data); notify('Profile saved'); } catch (err) { notify(errMsg(err)); }
  };
  const savePassword = async (e) => {
    e.preventDefault();
    try { await api.put('/auth/password', pw); setPw({ currentPassword: '', newPassword: '' }); notify('Password changed'); } catch (err) { notify(errMsg(err)); }
  };
  const addr = (k) => ({ value: form.address[k] || '', onChange: (e) => setForm({ ...form, address: { ...form.address, [k]: e.target.value } }) });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl">Your profile</h1>
      <form onSubmit={saveProfile} className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className="label" htmlFor="pn">Full name</label><input id="pn" className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="label">Email</label><input className="input bg-pearl" disabled value={user.email} /></div>
        <div><label className="label" htmlFor="pp">Phone</label><input id="pp" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <p className="sm:col-span-2 -mb-2 text-sm font-semibold">Default delivery address</p>
        <div className="sm:col-span-2"><input className="input" placeholder="Address line 1" aria-label="Address line 1" {...addr('line1')} /></div>
        <div className="sm:col-span-2"><input className="input" placeholder="Address line 2" aria-label="Address line 2" {...addr('line2')} /></div>
        <input className="input" placeholder="City" aria-label="City" {...addr('city')} />
        <input className="input" placeholder="State" aria-label="State" {...addr('state')} />
        <input className="input" placeholder="Pincode" aria-label="Pincode" {...addr('pincode')} />
        <div className="sm:col-span-2"><button className="btn-primary">Save profile</button></div>
      </form>

      <form onSubmit={savePassword} className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
        <p className="sm:col-span-2 text-lg font-display">Change password</p>
        <input type="password" className="input" placeholder="Current password" aria-label="Current password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
        <input type="password" minLength={6} className="input" placeholder="New password" aria-label="New password" required value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
        <div className="sm:col-span-2"><button className="btn-outline">Update password</button></div>
      </form>
    </div>
  );
}
