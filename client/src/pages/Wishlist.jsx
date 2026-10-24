import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { wishIds } = useShop();
  const [items, setItems] = useState(null);

  useEffect(() => {
    api.get('/wishlist').then((r) => setItems(r.data.items));
  }, [wishIds.length]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl">Your wishlist</h1>
      {items === null ? (
        <p className="mt-6 text-ink/60">Loading…</p>
      ) : items.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-ink/60">Tap the heart on any piece to save it here.</p>
          <Link to="/products" className="btn-primary mt-4">Browse jewellery</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {items.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
