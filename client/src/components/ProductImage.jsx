import { imgUrl } from '../lib/api';
import { GemIcon } from './Icons';

// Shows the uploaded image, or a quiet placeholder until the admin uploads one
export default function ProductImage({ src, alt = '', className = '' }) {
  if (src) return <img src={imgUrl(src)} alt={alt} loading="lazy" className={`object-cover ${className}`} />;
  return (
    <div role="img" aria-label={alt} className={`flex items-center justify-center bg-gradient-to-br from-mist/70 to-pearl text-garnet/40 ${className}`}>
      <GemIcon width={36} height={36} />
    </div>
  );
}
