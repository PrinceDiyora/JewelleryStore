import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import Dashboard from './Dashboard';
import Rates from './Rates';
import AdminOrders from './AdminOrders';
import AdminSettings from './AdminSettings';
import { BannersPage, CategoriesPage, CollectionsPage, CouponsPage, ProductsPage } from './ManagePages';

const NAV = [
  ['/admin', 'Dashboard', true],
  ['/admin/orders', 'Orders'],
  ['/admin/products', 'Products'],
  ['/admin/rates', 'Daily metal rates'],
  ['/admin/categories', 'Categories'],
  ['/admin/collections', 'Collections'],
  ['/admin/banners', 'Banners'],
  ['/admin/coupons', 'Coupons'],
  ['/admin/settings', 'Settings'],
];

export default function AdminApp() {
  const { user, loading, logout } = useAuth();
  const { settings } = useShop();
  const navigate = useNavigate();

  if (loading) return <p className="p-10 text-center text-ink/60">Loading…</p>;
  // Normal users and visitors never see admin pages (the API also enforces this)
  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" replace />;

  const link = ({ isActive }) => `block rounded px-3 py-2 text-sm ${isActive ? 'bg-white/15 font-semibold text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`;

  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-night p-4 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:overflow-y-auto">
        <p className="px-3 pb-1 font-display text-xl text-white">{settings.storeName}</p>
        <p className="px-3 pb-4 text-xs text-white/50">Admin panel</p>
        <nav aria-label="Admin" className="flex flex-wrap gap-1 md:block md:space-y-1">
          {NAV.map(([to, label, end]) => <NavLink key={to} to={to} end={end} className={link}>{label}</NavLink>)}
        </nav>
        <div className="mt-4 border-t border-white/10 pt-4 md:mt-8">
          <Link to="/" className="block px-3 py-2 text-sm text-white/70 hover:text-white">View store</Link>
          <button onClick={() => { logout(); navigate('/admin/login'); }} className="block w-full px-3 py-2 text-left text-sm text-white/70 hover:text-white">Log out</button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-5 md:p-8">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="rates" element={<Rates />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="banners" element={<BannersPage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}
