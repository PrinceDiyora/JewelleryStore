import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api, fmtDate, money, rateLabel } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { BagIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from './Icons';

export default function Layout() {
  const { settings, rates, cart, wishIds, toast } = useShop();
  const { user, logout } = useAuth();
  const [cats, setCats] = useState([]);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    api.get('/categories').then((r) => setCats(r.data));
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
    setOpen(false);
  }, [pathname]);

  const search = (e) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(q.trim())}`);
  };
  const lastUpdate = rates.length ? new Date(Math.max(...rates.map((r) => new Date(r.updatedAt)))) : null;
  const navCls = ({ isActive }) => `py-1 text-sm hover:text-garnet ${isActive ? 'font-semibold text-garnet' : ''}`;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Today's rates: the jeweller's board, driven by the admin panel */}
      <div className="bg-night text-sm text-white/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2">
          <span className="text-white/60">
            Today's rate{lastUpdate ? ` (updated ${fmtDate(lastUpdate)})` : ''}
          </span>
          {rates.map((r) => (
            <span key={r._id}>
              {rateLabel(r)} <b className="font-semibold text-[#E3C27A]">{money(r.ratePerGram)}</b> per gram
            </span>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-mist bg-pearl/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <button className="md:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            <MenuIcon />
          </button>
          <Link to="/" className="font-display text-2xl font-medium text-garnet">{settings.storeName}</Link>

          <nav className="ml-6 hidden items-center gap-5 md:flex" aria-label="Main">
            <NavLink to="/products" end className={navCls}>All jewellery</NavLink>
            {cats.map((c) => (
              <Link key={c._id} to={`/products?category=${c._id}`} className="py-1 text-sm hover:text-garnet">{c.name}</Link>
            ))}
          </nav>

          <form onSubmit={search} className="ml-auto hidden max-w-xs flex-1 items-center rounded border border-mist bg-white px-2 lg:flex">
            <SearchIcon width={18} height={18} className="text-ink/50" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jewellery" aria-label="Search jewellery" className="w-full bg-transparent px-2 py-2 text-sm outline-none" />
          </form>

          <div className="ml-auto flex items-center gap-4 lg:ml-0">
            <Link to="/wishlist" aria-label="Wishlist" className="relative hover:text-garnet">
              <HeartIcon />
              {wishIds.length > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-garnet px-1.5 text-[10px] text-white">{wishIds.length}</span>}
            </Link>
            <Link to="/cart" aria-label="Cart" className="relative hover:text-garnet">
              <BagIcon />
              {cart.count > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-garnet px-1.5 text-[10px] text-white">{cart.count}</span>}
            </Link>
            {user ? (
              <div className="group relative">
                <Link to="/profile" aria-label="Account" className="hover:text-garnet"><UserIcon /></Link>
                <div className="invisible absolute right-0 top-full w-44 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <div className="card p-2 text-sm shadow-lg">
                    <p className="px-2 py-1 text-ink/60">Hi, {user.name.split(' ')[0]}</p>
                    <Link className="block rounded px-2 py-1.5 hover:bg-garnet-soft" to="/orders">My orders</Link>
                    <Link className="block rounded px-2 py-1.5 hover:bg-garnet-soft" to="/profile">Profile</Link>
                    {user.role === 'admin' && <Link className="block rounded px-2 py-1.5 hover:bg-garnet-soft" to="/admin">Admin panel</Link>}
                    <button className="block w-full rounded px-2 py-1.5 text-left hover:bg-garnet-soft" onClick={() => { logout(); navigate('/'); }}>Log out</button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn-outline btn-sm">Log in</Link>
            )}
          </div>
        </div>

        {open && (
          <div className="border-t border-mist px-4 py-3 md:hidden">
            <form onSubmit={search} className="mb-3 flex items-center rounded border border-mist bg-white px-2">
              <SearchIcon width={18} height={18} className="text-ink/50" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jewellery" aria-label="Search jewellery" className="w-full bg-transparent px-2 py-2 text-sm outline-none" />
            </form>
            <div className="flex flex-col">
              <Link className="py-2" to="/products">All jewellery</Link>
              {cats.map((c) => <Link key={c._id} className="py-2" to={`/products?category=${c._id}`}>{c.name}</Link>)}
              {user && <Link className="py-2" to="/orders">My orders</Link>}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="mt-16 bg-night text-white/80">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3">
          <div>
            <p className="font-display text-xl text-white">{settings.storeName}</p>
            <p className="mt-2 max-w-xs text-sm text-white/60">Every price is worked out from the day's metal rate, the piece's weight and its making charges.</p>
          </div>
          <div className="text-sm">
            <p className="mb-2 font-semibold text-white">Shop</p>
            {cats.map((c) => <Link key={c._id} to={`/products?category=${c._id}`} className="block py-0.5 hover:text-white">{c.name}</Link>)}
          </div>
          <div className="text-sm">
            <p className="mb-2 font-semibold text-white">Contact</p>
            {settings.address && <p className="py-0.5">{settings.address}</p>}
            {settings.phone && <p className="py-0.5">{settings.phone}</p>}
            {settings.email && <p className="py-0.5">{settings.email}</p>}
          </div>
        </div>
      </footer>

      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded bg-ink px-4 py-2.5 text-sm text-white shadow-lg">{toast}</div>
      )}
    </div>
  );
}
