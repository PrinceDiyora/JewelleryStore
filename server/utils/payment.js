// ---------------------------------------------------------------------------
// Payment methods registry. Only Cash on Delivery is enabled for now.
// To add Razorpay/Stripe later:
//   1. add an entry below (e.g. RAZORPAY) with a prepare() that creates the
//      gateway order and returns { status: 'Pending', info: {...} }
//   2. add a verify/webhook route that sets order.paymentStatus = 'Paid'
//   3. the checkout page already renders whatever /api/payment-methods returns
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

exports.listMethods = () =>
  Object.entries(methods).map(([key, m]) => ({ key, label: m.label, description: m.description }));

exports.getMethod = (key) => methods[key];
