import CrudPage from './CrudPage';
import ProductImage from '../components/ProductImage';
import { metalLabel, money, fmtDate } from '../lib/api';

const Pill = ({ ok, yes = 'Active', no = 'Hidden' }) => (
  <span className={`badge ${ok ? 'bg-emerald-50 text-emerald-800' : 'bg-mist text-ink/60'}`}>{ok ? yes : no}</span>
);

export const ProductsPage = () => (
  <CrudPage
    title="Products" noun="Product" endpoint="products" searchable
    intro="Prices are never typed in. Each product's price is worked out from today's metal rate, its weight, making charges and GST."
    blank={{ name: '', description: '', metal: 'gold', purity: '22K', makingType: 'fixed', makingCharges: 0, stoneCharges: 0, stock: 0, weight: '', images: [], collections: [], featured: false, active: true }}
    columns={[
      { label: 'Product', render: (r) => (<div className="flex items-center gap-3"><ProductImage src={r.images?.[0]} alt="" className="h-10 w-10 rounded" /><div><p className="font-medium">{r.name}</p><p className="text-xs text-ink/50">{r.category?.name}</p></div></div>) },
      { label: 'Metal', render: (r) => `${metalLabel(r)}, ${r.weight} g` },
      { label: 'Current price', render: (r) => (r.price.available ? money(r.finalPrice) : <span className="text-red-700">No rate set</span>) },
      { label: 'Stock', render: (r) => <span className={r.stock <= 5 ? 'font-semibold text-red-700' : ''}>{r.stock}</span> },
      { label: 'Status', render: (r) => <div className="flex gap-1"><Pill ok={r.active} />{r.featured && <span className="badge bg-gold-soft text-gold">Featured</span>}</div> },
    ]}
    fields={[
      { name: 'name', label: 'Product name', required: true, full: true },
      { name: 'category', label: 'Category', type: 'select', from: 'categories', required: true },
      { name: 'metal', label: 'Metal', type: 'select', required: true, options: [{ value: 'gold', label: 'Gold' }, { value: 'silver', label: 'Silver' }, { value: 'diamond', label: 'Diamond (priced on gold content)' }] },
      { name: 'purity', label: 'Purity', type: 'select', required: true, options: [{ value: '22K', label: '22K' }, { value: '18K', label: '18K' }, { value: '925', label: '925 (silver only)' }], help: 'Silver is always saved as 925.' },
      { name: 'weight', label: 'Weight (grams)', type: 'number', step: '0.01', required: true },
      { name: 'makingType', label: 'Making charge type', type: 'select', options: [{ value: 'fixed', label: 'Fixed amount (₹)' }, { value: 'percent', label: 'Percent of metal value (%)' }] },
      { name: 'makingCharges', label: 'Making charges', type: 'number' },
      { name: 'stoneCharges', label: 'Stone / diamond charges (₹)', type: 'number' },
      { name: 'stock', label: 'Stock (pieces)', type: 'number', step: '1' },
      { name: 'collections', label: 'Collections', type: 'multiselect', from: 'collections' },
      { name: 'images', label: 'Images', type: 'images' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'featured', label: 'Featured on home page', type: 'checkbox', hint: 'Show on the home page' },
      { name: 'active', label: 'Visible in store', type: 'checkbox', hint: 'Visible to customers' },
    ]}
  />
);

const simple = { name: '', description: '', image: '', order: 0, active: true };
const simpleFields = (what) => [
  { name: 'name', label: 'Name', required: true },
  { name: 'order', label: 'Display order', type: 'number', step: '1', help: 'Lower numbers appear first.' },
  { name: 'description', label: 'Short description', type: 'textarea' },
  { name: 'image', label: `${what} image`, type: 'image' },
  { name: 'active', label: 'Visible in store', type: 'checkbox', hint: 'Visible to customers' },
];
const simpleCols = [
  { label: 'Name', render: (r) => (<div className="flex items-center gap-3"><ProductImage src={r.image} alt="" className="h-10 w-10 rounded" /><span className="font-medium">{r.name}</span></div>) },
  { label: 'Description', render: (r) => <span className="text-ink/60">{r.description}</span> },
  { label: 'Order', key: 'order' },
  { label: 'Status', render: (r) => <Pill ok={r.active} /> },
];

export const CategoriesPage = () => (
  <CrudPage title="Categories" noun="Category" endpoint="categories" blank={simple} columns={simpleCols} fields={simpleFields('Category')}
    intro="Categories (Rings, Necklaces, Earrings, Bangles) appear on the home page, the menu and the filters." />
);

export const CollectionsPage = () => (
  <CrudPage title="Collections" noun="Collection" endpoint="collections" blank={simple} columns={simpleCols} fields={simpleFields('Collection')}
    intro="Collections group products across categories, such as Bridal or Festive. Assign them on each product." />
);

export const BannersPage = () => (
  <CrudPage
    title="Banners" noun="Banner" endpoint="banners"
    intro="Banners rotate at the top of the home page. Without an image, a plain colour background is used."
    blank={{ title: '', subtitle: '', image: '', link: '/products', ctaText: 'Shop now', order: 0, active: true }}
    columns={[
      { label: 'Banner', render: (r) => (<div className="flex items-center gap-3"><ProductImage src={r.image} alt="" className="h-10 w-16 rounded" /><div><p className="font-medium">{r.title}</p><p className="text-xs text-ink/50">{r.subtitle}</p></div></div>) },
      { label: 'Links to', key: 'link' },
      { label: 'Order', key: 'order' },
      { label: 'Status', render: (r) => <Pill ok={r.active} /> },
    ]}
    fields={[
      { name: 'title', label: 'Headline', required: true, full: true },
      { name: 'subtitle', label: 'Supporting text', type: 'textarea' },
      { name: 'ctaText', label: 'Button text' },
      { name: 'link', label: 'Button link', help: 'For example /products or /products?metal=silver' },
      { name: 'order', label: 'Display order', type: 'number', step: '1' },
      { name: 'image', label: 'Background image', type: 'image' },
      { name: 'active', label: 'Visible in store', type: 'checkbox', hint: 'Visible to customers' },
    ]}
  />
);

export const CouponsPage = () => (
  <CrudPage
    title="Coupons" noun="Coupon" endpoint="coupons"
    intro="Customers enter a coupon code in the cart. Discounts are checked again when the order is placed."
    blank={{ code: '', type: 'percent', value: 10, minOrder: 0, maxDiscount: 0, usageLimit: 0, expiresAt: '', active: true }}
    columns={[
      { label: 'Code', render: (r) => <span className="font-semibold">{r.code}</span> },
      { label: 'Discount', render: (r) => (r.type === 'percent' ? `${r.value}%${r.maxDiscount ? ` (max ${money(r.maxDiscount)})` : ''}` : money(r.value)) },
      { label: 'Min order', render: (r) => money(r.minOrder) },
      { label: 'Used', render: (r) => `${r.usedCount}${r.usageLimit ? ` / ${r.usageLimit}` : ''}` },
      { label: 'Expires', render: (r) => (r.expiresAt ? fmtDate(r.expiresAt) : 'Never') },
      { label: 'Status', render: (r) => <Pill ok={r.active} yes="Active" no="Off" /> },
    ]}
    fields={[
      { name: 'code', label: 'Coupon code', required: true },
      { name: 'type', label: 'Discount type', type: 'select', options: [{ value: 'percent', label: 'Percent (%)' }, { value: 'flat', label: 'Flat amount (₹)' }] },
      { name: 'value', label: 'Discount value', type: 'number', required: true },
      { name: 'minOrder', label: 'Minimum order (₹)', type: 'number' },
      { name: 'maxDiscount', label: 'Maximum discount (₹)', type: 'number', help: '0 means no limit. Applies to percent coupons.' },
      { name: 'usageLimit', label: 'Total uses allowed', type: 'number', step: '1', help: '0 means unlimited.' },
      { name: 'expiresAt', label: 'Expiry date', type: 'date' },
      { name: 'active', label: 'Active', type: 'checkbox', hint: 'Customers can use this coupon' },
    ]}
  />
);
