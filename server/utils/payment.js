// ---------------------------------------------------------------------------
// Payment methods registry.
// COD is always available. Razorpay is enabled when RAZORPAY_KEY_ID is set.
// ---------------------------------------------------------------------------
const methods = {
  COD: {
    label: 'Cash on Delivery',
    description: 'Pay in cash when your order arrives.',
    async prepare() {
      return { status: 'Pending', info: null };
    },
  },
};

// Lazily add Razorpay only if credentials are present in env
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  const Razorpay = require('razorpay');
  const rzp = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  methods.RAZORPAY = {
    label: 'Pay Online',
    description: 'UPI, Credit / Debit card, Net Banking via Razorpay.',
    async prepare({ total }) {
      // Amount must be in paise (1 INR = 100 paise)
      const order = await rzp.orders.create({
        amount:   Math.round(total * 100),
        currency: 'INR',
        receipt:  `receipt_${Date.now()}`,
      });
      return { status: 'Pending', info: { razorpayOrderId: order.id } };
    },
  };

  // Export so the verify controller can use the same instance
  exports.rzp = rzp;
}

exports.listMethods = () =>
  Object.entries(methods).map(([key, m]) => ({ key, label: m.label, description: m.description }));

exports.getMethod = (key) => methods[key];
