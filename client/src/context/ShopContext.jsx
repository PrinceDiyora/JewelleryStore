import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, errMsg } from '../lib/api';
import { useAuth } from './AuthContext';

const ShopContext = createContext(null);
const EMPTY_CART = { items: [], subtotal: 0, count: 0 };

export function ShopProvider({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [settings, setSettings] = useState({ storeName: 'Jewellery Store' });
  const [rates, setRates] = useState([]);
  const [cart, setCart] = useState(EMPTY_CART);
  const [wishIds, setWishIds] = useState([]);
  const [coupon, setCoupon] = useState(null); // { code, discount }
  const [toast, setToast] = useState('');
  const timer = useRef();

  const notify = useCallback((msg) => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 2600);
  }, []);

  useEffect(() => {
    api.get('/settings').then((r) => {
      setSettings(r.data);
      document.title = r.data.storeName;
    });
    api.get('/rates').then((r) => setRates(r.data));
  }, []);

  useEffect(() => {
    if (user) {
      api.get('/cart').then((r) => setCart(r.data)).catch(() => {});
      api.get('/wishlist').then((r) => setWishIds(r.data.ids)).catch(() => {});
    } else {
      setCart(EMPTY_CART);
      setWishIds([]);
      setCoupon(null);
    }
  }, [user?._id]);

  // Keep an applied coupon in step with the cart total
  useEffect(() => {
    if (!coupon) return;
    if (!cart.items.length) return setCoupon(null);
    api
      .post('/cart/coupon', { code: coupon.code })
      .then((r) => setCoupon(r.data))
      .catch(() => setCoupon(null));
  }, [cart.subtotal]); // eslint-disable-line react-hooks/exhaustive-deps

  const needLogin = () => {
    if (user) return false;
    notify('Please log in first');
    navigate('/login', { state: { from: location.pathname + location.search } });
    return true;
  };

  const run = async (fn, okMsg) => {
    try {
      const r = await fn();
      if (okMsg) notify(okMsg);
      return r;
    } catch (e) {
      notify(errMsg(e));
      return null;
    }
  };

  const addToCart = async (productId, qty = 1) => {
    if (needLogin()) return;
    const r = await run(() => api.post('/cart', { productId, qty }), 'Added to your cart');
    if (r) setCart(r.data);
  };
  const updateQty = async (productId, qty) => {
    const r = await run(() => api.put(`/cart/${productId}`, { qty }));
    if (r) setCart(r.data);
  };
  const removeFromCart = async (productId) => {
    const r = await run(() => api.delete(`/cart/${productId}`), 'Removed from cart');
    if (r) setCart(r.data);
  };
  const refreshCart = () => api.get('/cart').then((r) => setCart(r.data));

  const toggleWishlist = async (productId) => {
    if (needLogin()) return;
    const has = wishIds.includes(productId);
    const r = await run(
      () => (has ? api.delete(`/wishlist/${productId}`) : api.post(`/wishlist/${productId}`)),
      has ? 'Removed from wishlist' : 'Saved to wishlist'
    );
    if (r) setWishIds(r.data.ids);
  };

  const applyCoupon = async (code) => {
    try {
      const r = await api.post('/cart/coupon', { code });
      setCoupon(r.data);
      notify(`Coupon ${r.data.code} applied`);
      return true;
    } catch (e) {
      notify(errMsg(e));
      return false;
    }
  };

  return (
    <ShopContext.Provider
      value={{
        settings, rates, cart, wishIds, coupon, toast, notify,
        addToCart, updateQty, removeFromCart, refreshCart, toggleWishlist, applyCoupon,
        removeCoupon: () => setCoupon(null),
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => useContext(ShopContext);
