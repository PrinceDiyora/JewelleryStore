import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { metalLabel, money } from '../lib/api';
import { HeartIcon } from './Icons';
import ProductImage from './ProductImage';

export default function ProductCard({ product }) {
  const { wishIds, toggleWishlist } = useShop();
  const liked = wishIds.includes(String(product._id));
  const out = product.stock < 1;

  return (
    <div className="group relative">
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative overflow-hidden rounded-lg border border-mist bg-white">
          <ProductImage src={product.images?.[0]} alt={product.name} className="aspect-square w-full" />
          {out && <span className="badge absolute left-2 top-2 bg-ink text-white">Out of stock</span>}
        </div>
        <h3 className="mt-3 text-base font-medium leading-snug">{product.name}</h3>
        <p className="mt-0.5 text-sm text-ink/60">
          {metalLabel(product)} &middot; {product.weight} g
        </p>
        <p className="mt-1 font-semibold text-gold">
          {product.price.available ? money(product.finalPrice) : 'Price on request'}
        </p>
      </Link>
      <button
        onClick={() => toggleWishlist(String(product._id))}
        aria-label={liked ? 'Remove from wishlist' : 'Save to wishlist'}
        aria-pressed={liked}
        className={`absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow-sm transition-colors hover:text-garnet ${liked ? 'text-garnet' : 'text-ink/60'}`}
      >
        <HeartIcon filled={liked} width={18} height={18} />
      </button>
    </div>
  );
}
