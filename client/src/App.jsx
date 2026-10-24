import { Link, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import { OrderDetail, OrdersList } from './pages/Orders';
import { Login, Register } from './pages/Auth';
import Profile from './pages/Profile';
import AdminApp from './admin/AdminApp';
import AdminLogin from './admin/AdminLogin';

const NotFound = () => (
  <div className="p-20 text-center">
    <h1 className="text-3xl">Page not found</h1>
    <Link to="/" className="btn-primary mt-5">Back to home</Link>
  </div>
);

const guard = (el) => <RequireAuth>{el}</RequireAuth>;

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/*" element={<AdminApp />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={guard(<Cart />)} />
        <Route path="/wishlist" element={guard(<Wishlist />)} />
        <Route path="/checkout" element={guard(<Checkout />)} />
        <Route path="/orders" element={guard(<OrdersList />)} />
        <Route path="/orders/:id" element={guard(<OrderDetail />)} />
        <Route path="/profile" element={guard(<Profile />)} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
