import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';

export const money = (n, decimals = 0) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

// Images are stored as "/uploads/..." (local) or full https URLs (Cloudinary etc.)
const ORIGIN = API.startsWith('http') ? API.replace(/\/api\/?$/, '') : '';
export const imgUrl = (u) => (!u ? '' : u.startsWith('http') ? u : ORIGIN + u);

export const rateLabel = (r) => (r.metal === 'gold' ? `Gold ${r.purity}` : 'Silver 925');
export const metalLabel = (p) =>
  p.metal === 'silver' ? 'Silver 925' : p.metal === 'diamond' ? `Diamond, ${p.purity} gold` : `Gold ${p.purity}`;
export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
