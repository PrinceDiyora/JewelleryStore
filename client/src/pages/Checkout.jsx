import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errMsg, metalLabel, money } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { Totals } from './Cart';

const FIELDS = [
  ['name', 'Full name', 'sm:col-span-2'],
  ['phone', 'Phone number', ''],
  ['pincode', 'Pincode', ''],
  ['line1', 'Address line 1', 'sm:col-span-2'],
  ['line2', 'Address line 2 (optional)', 'sm:col-span-2'],
  ['city', 'City', ''],
  ['state', 'State', ''],
];

// Dynamically load the Razorpay checkout script
function useRazorpayScript() {
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current || document.getElementById('rzp-script')) return;
    const s = document.createElement('script');
    s.id  = 'rzp-script';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(s);
    loaded.current = true;
  }, []);
}

// Open Razorpay popup and return a promise that resolves with the payment response
function openRazorpay({ keyId, razorpayOrderId, amount, name, email, phone, description }) {
  return new Promise((resolve, reject) => {
    const options = {
      key:         keyId,
      amount,                          // in paise, already set by server
      currency:    'INR',
      name:        'Aurelia Jewellers',
      description,
      order_id:    razorpayOrderId,
      prefill:     { name, email, contact: phone },
      theme:       { color: '#8B1A2E' },
      handler:     resolve,             // called on successful payment
      modal:       { ondismiss: () => reject(new Error('Payment cancelled')) },
    };
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (resp) => reject(new Error(resp.error.description)));
    rzp.open();
  });
}

export default function Checkout() {
  const { user } = useAuth();
  const { cart, coupon, refreshCart } = useShop();
  const navigate = useNavigate();
  const [methods, setMethods]   = useState([]);
  const [method, setMethod]     = useState('COD');
  const [note, setNote]         = useState('');
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [addr, setAddr] = useState({
    name: user.name, phone: user.phone || '', line1: '', line2: '', city: '', state: '', pincode: '', ...user.address,
  });

  useRazorpayScript();

  useEffect(() => {
    api.get('/payment-methods').then((r) => { setMethods(r.data); if (r.data[0]) setMethod(r.data[0].key); });
  }, []);

  if (!cart.items.length)
    return <div className="p-16 text-center"><p>Your cart is empty.</p><Link to="/products" className="btn-primary mt-4">Browse jewellery</Link></div>;

  const place = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true); setStatusMsg('Placing order…');

    try {
      // 1. Create order on server (stocks reserved, price locked)
      const { data: order } = await api.post('/orders', {
        address: addr, couponCode: coupon?.code, paymentMethod: method, note,
      });

      // 2. If Razorpay selected — open the payment popup
      if (method === 'RAZORPAY') {
        setStatusMsg('Opening payment gateway…');
        const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
        try {
          const paymentResp = await openRazorpay({
            keyId,
            razorpayOrderId: order.paymentInfo.razorpayOrderId,
            amount:          Math.round(order.total * 100),
            name:            addr.name,
            email:           user.email,
            phone:           addr.phone,
            description:     `Order ${order.orderNumber}`,
          });

          // 3. Verify signature on server
          setStatusMsg('Verifying payment…');
          await api.post(`/orders/${order._id}/verify`, {
            razorpay_order_id:   paymentResp.razorpay_order_id,
            razorpay_payment_id: paymentResp.razorpay_payment_id,
            razorpay_signature:  paymentResp.razorpay_signature,
          });
        } catch (payErr) {
          // Payment failed or cancelled — order exists but is Pending/Failed
          setError(`Payment not completed: ${payErr.message}. Your order is saved — you can retry from My Orders.`);
          await refreshCart();
          setBusy(false);
          setStatusMsg('');
          navigate(`/orders/${order._id}`, { state: { placed: true } });
          return;
        }
      }

      // 4. Success — clear cart and go to order confirmation
      await refreshCart();
      navigate(`/orders/${order._id}`, { state: { placed: true } });

    } catch (err) {
      setError(errMsg(err));
      refreshCart();
    } finally {
      setBusy(false);
      setStatusMsg('');
    }
  };

  return (
    <form onSubmit={place} className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl">Checkout</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-4 text-xl">Delivery address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {FIELDS.map(([key, label, span]) => (
                <div key={key} className={span}>
                  <label className="label" htmlFor={key}>{label}</label>
                  <input id={key} className="input" required={key !== 'line2'} value={addr[key] || ''} onChange={(e) => setAddr({ ...addr, [key]: e.target.value })} />
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="mb-4 text-xl">Payment</h2>
            {methods.map((m) => (
              <label key={m.key} className="flex cursor-pointer items-start gap-3 rounded border border-mist p-3 has-[:checked]:border-garnet has-[:checked]:bg-garnet-soft">
                <input type="radio" name="pay" className="mt-1 accent-garnet" checked={method === m.key} onChange={() => setMethod(m.key)} />
                <span>
                  <span className="font-medium">{m.label}</span>
                  {m.key === 'RAZORPAY' && (
                    <span className="ml-2 rounded bg-blue-50 px-1.5 py-0.5 text-xs font-semibold text-blue-700">UPI · Cards · Net Banking</span>
                  )}
                  <br /><span className="text-sm text-ink/60">{m.description}</span>
                </span>
              </label>
            ))}
            <label className="label mt-4" htmlFor="note">Note for the shop (optional)</label>
            <textarea id="note" rows={2} className="input" value={note} onChange={(e) => setNote(e.target.value)} />
          </section>
        </div>

        <aside className="card h-fit p-5">
          <h2 className="mb-4 text-xl">Your order</h2>
          <ul className="mb-4 space-y-2 text-sm">
            {cart.items.map(({ product: p, qty, lineTotal }) => (
              <li key={p._id} className="flex justify-between gap-3">
                <span>{p.name} <span className="text-ink/50">× {qty}</span><br /><span className="text-xs text-ink/50">{metalLabel(p)}, {p.weight} g</span></span>
                <span>{money(lineTotal)}</span>
              </li>
            ))}
          </ul>
          <Totals cart={cart} coupon={coupon} />
          {error && <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button className="btn-primary mt-5 w-full py-3" disabled={busy}>
            {busy ? (statusMsg || 'Please wait…') : method === 'RAZORPAY' ? 'Proceed to Payment' : 'Place order'}
          </button>
          <p className="mt-2 text-center text-xs text-ink/50">Final prices are confirmed at today's metal rate when you place the order.</p>
        </aside>
      </div>
    </form>
  );
}
