import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { metalLabel, money } from '../lib/api';
import ProductImage from '../components/ProductImage';

export function Totals({ cart, coupon }) {
  const total = cart.subtotal - (coupon ? coupon.discount : 0);
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between"><span className="text-ink/70">Items ({cart.count}), GST included</span><span>{money(cart.subtotal, 2)}</span></div>
      {coupon && <div className="flex justify-between text-emerald-700"><span>Coupon {coupon.code}</span><span>− {money(coupon.discount, 2)}</span></div>}
      <div className="flex justify-between"><span className="text-ink/70">Delivery</span><span>Free</span></div>
      <div className="flex justify-between border-t border-ink/30 pt-3 text-lg font-semibold"><span>Total</span><span className="text-gold">{money(total, 2)}</span></div>
    </div>
  );
}

export default function Cart() {
  const { cart, updateQty, removeFromCart, coupon, applyCoupon, removeCoupon } = useShop();
  const [code, setCode] = useState('');

  if (!cart.items.length)
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-3xl">Your cart is empty</h1>
        <p className="mt-2 text-ink/60">Pick something you love and it will wait for you here.</p>
        <Link to="/products" className="btn-primary mt-6">Browse jewellery</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl">Your cart</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          {cart.items.map(({ product: p, qty, lineTotal, inStock }) => (
            <li key={p._id} className="card flex gap-4 p-4">
              <Link to={`/product/${p._id}`}><ProductImage src={p.images?.[0]} alt={p.name} className="h-24 w-24 rounded" /></Link>
              <div className="flex-1">
                <Link to={`/product/${p._id}`} className="font-medium hover:text-garnet">{p.name}</Link>
                <p className="text-sm text-ink/60">{metalLabel(p)} &middot; {p.weight} g &middot; {money(p.finalPrice)} each</p>
                {!inStock && <p className="mt-1 text-sm text-red-700">Only {p.stock} left. Please reduce the quantity.</p>}
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center rounded border border-mist">
                    <button className="px-2.5 py-1" aria-label="Decrease quantity" onClick={() => updateQty(p._id, qty - 1)}>−</button>
                    <span className="w-7 text-center text-sm">{qty}</span>
                    <button className="px-2.5 py-1" aria-label="Increase quantity" onClick={() => updateQty(p._id, qty + 1)}>+</button>
                  </div>
                  <button className="text-sm text-garnet hover:underline" onClick={() => removeFromCart(p._id)}>Remove</button>
                </div>
              </div>
              <p className="font-semibold">{money(lineTotal)}</p>
            </li>
          ))}
        </ul>

        <aside className="card h-fit p-5">
          <h2 className="mb-4 text-xl">Order summary</h2>
          <div className="mb-4">
            {coupon ? (
              <p className="flex items-center justify-between rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {coupon.code} applied <button className="underline" onClick={removeCoupon}>Remove</button>
              </p>
            ) : (
              <form className="flex gap-2" onSubmit={async (e) => { e.preventDefault(); if (code.trim() && (await applyCoupon(code))) setCode(''); }}>
                <input className="input" placeholder="Coupon code" aria-label="Coupon code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
                <button className="btn-outline">Apply</button>
              </form>
            )}
          </div>
          <Totals cart={cart} coupon={coupon} />
          <Link to="/checkout" className={`btn-primary mt-5 w-full py-3 ${cart.items.some((i) => !i.inStock) ? 'pointer-events-none opacity-50' : ''}`}>Proceed to checkout</Link>
        </aside>
      </div>
    </div>
  );
}
