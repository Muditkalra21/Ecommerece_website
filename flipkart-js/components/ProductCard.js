import Link from 'next/link';
import { useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { addToCart, addToWishlist, removeFromWishlist } from '../lib/api';
import toast from 'react-hot-toast';

export default function ProductCard({ product, isWishlisted = false, onWishlistChange }) {
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [addingCart, setAddingCart] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (addingCart) return;
    setAddingCart(true);
    try {
      await addToCart(product.id);
      toast.success('Added to cart!');
      window.dispatchEvent(new Event('cart-updated'));
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingCart(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    try {
      if (wishlisted) {
        await removeFromWishlist(product.id);
        setWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(product.id);
        setWishlisted(true);
        toast.success('Added to wishlist!');
      }
      window.dispatchEvent(new Event('wishlist-updated'));
      if (onWishlistChange) onWishlistChange();
    } catch (err) {
      if (err?.response?.status === 400) toast.error('Already in wishlist');
      else toast.error('Failed to update wishlist');
    }
  };

  const discount = product.discount_percent ?? 0;
  const rating = product.rating ?? 0;

  return (
    <Link href={`/product/${product.id}`}>
      <div className="card" style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'visible' }}>
        {/* Discount badge */}
        {discount > 0 && (
          <div style={{
            position: 'absolute', top: '8px', left: '8px', zIndex: 2,
            background: 'linear-gradient(135deg, #ff6161, #ff4040)',
            color: 'white', borderRadius: '2px', padding: '2px 6px',
            fontSize: '11px', fontWeight: 700,
          }}>
            {discount}% OFF
          </div>
        )}

        {/* Wishlist button */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={handleWishlist}
          style={{
            position: 'absolute', top: '8px', right: '8px', zIndex: 2,
            background: 'white', border: 'none', borderRadius: '50%',
            width: '32px', height: '32px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transition: 'all 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          aria-label="Toggle wishlist"
        >
          <Heart size={16} fill={wishlisted ? '#ff4040' : 'none'} color={wishlisted ? '#ff4040' : '#878787'} />
        </button>

        {/* Image */}
        <div style={{ background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', height: '200px', overflow: 'hidden' }}>
          <img
            src={imgError
              ? `https://placehold.co/200x200/f9f9f9/878787?text=${encodeURIComponent(product.name.substring(0, 10))}`
              : (product.image_url || 'https://placehold.co/200x200')}
            alt={product.name}
            onError={() => setImgError(true)}
            style={{ maxHeight: '168px', maxWidth: '100%', objectFit: 'contain', transition: 'transform 0.3s ease' }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        </div>

        {/* Info */}
        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p style={{ fontSize: '14px', color: '#212121', fontWeight: 500, lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </p>

          {rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="star-rating">{rating.toFixed(1)} <Star size={10} fill="white" /></span>
              <span style={{ fontSize: '12px', color: '#878787' }}>({product.rating_count?.toLocaleString()})</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
            <span className="price-current">₹{product.price.toLocaleString()}</span>
            {product.original_price && product.original_price > product.price && (
              <span className="price-original">₹{product.original_price.toLocaleString()}</span>
            )}
            {discount > 0 && <span className="price-discount">{discount}% off</span>}
          </div>

          {product.brand && <p style={{ fontSize: '12px', color: '#878787' }}>{product.brand}</p>}

          {product.stock <= 5 && product.stock > 0 && (
            <p style={{ fontSize: '12px', color: '#ff6161', fontWeight: 600 }}>Only {product.stock} left!</p>
          )}

          <button
            id={`add-to-cart-${product.id}`}
            onClick={handleAddToCart}
            disabled={addingCart || product.stock === 0}
            style={{
              marginTop: 'auto', padding: '10px',
              background: product.stock === 0 ? '#ccc' : (addingCart ? '#1a5dc8' : '#2874f0'),
              color: 'white', border: 'none', borderRadius: '4px',
              fontSize: '13px', fontWeight: 600,
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <ShoppingCart size={14} />
            {product.stock === 0 ? 'Out of Stock' : (addingCart ? 'Adding...' : 'Add to Cart')}
          </button>
        </div>
      </div>
    </Link>
  );
}
