import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, ArrowLeft, Shield, Truck, RotateCcw, Package, Loader2 } from 'lucide-react';
import { getProduct, addToCart, addToWishlist, removeFromWishlist, getWishlist } from '../../lib/api';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prod, wishlist] = await Promise.all([getProduct(Number(id)), getWishlist()]);
        setProduct(prod);
        setWishlisted(wishlist.items.some(w => w.product_id === Number(id)));
      } catch {
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || addingCart) return;
    setAddingCart(true);
    try {
      await addToCart(product.id, quantity);
      toast.success(`${quantity > 1 ? quantity + 'x ' : ''}${product.name.substring(0, 30)}... added to cart!`);
      window.dispatchEvent(new Event('cart-updated'));
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/cart');
  };

  const handleWishlist = async () => {
    if (!product) return;
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
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '32px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div className="skeleton" style={{ height: '400px', borderRadius: '4px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="skeleton" style={{ height: '32px' }} />
            <div className="skeleton" style={{ height: '24px', width: '60%' }} />
            <div className="skeleton" style={{ height: '48px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const specs = product.specifications ? JSON.parse(product.specifications) : null;
  const allImages = product.images ? JSON.parse(product.images) : [product.image_url].filter(Boolean);
  const displayImages = allImages.length > 0 ? allImages : [product.image_url || 'https://placehold.co/400x400'];

  return (
    <>
      <Head>
        <title>{product.name} – Flipkart</title>
        <meta name="description" content={product.description || product.name} />
      </Head>
      <div style={{ background: '#f1f3f6', minHeight: '100vh' }}>
        <div className="container" style={{ padding: '16px' }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '13px', color: '#878787' }}>
            <Link href="/" style={{ color: '#2874f0', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={14} /> Home
            </Link>
            <span>/</span>
            <Link href={`/?category=${product.category.slug}`} style={{ color: '#2874f0' }}>
              {product.category.name}
            </Link>
            <span>/</span>
            <span style={{ color: '#212121', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
              {product.name}
            </span>
          </nav>

          <div style={{ background: 'white', borderRadius: '4px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: '32px' }}>
              {/* Left: Images */}
              <div>
                {/* Main image */}
                <div style={{ border: '1px solid #f0f0f0', borderRadius: '4px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '360px', background: '#fafafa', marginBottom: '12px', position: 'sticky', top: '72px' }}>
                  {product.discount_percent > 0 && (
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'linear-gradient(135deg, #ff6161, #ff4040)', color: 'white', borderRadius: '2px', padding: '4px 10px', fontSize: '12px', fontWeight: 700 }}>
                      {product.discount_percent}% OFF
                    </div>
                  )}
                  <img
                    src={imgError ? `https://placehold.co/400x400/fafafa/878787?text=${encodeURIComponent(product.name.substring(0, 15))}` : displayImages[selectedImage]}
                    alt={product.name}
                    onError={() => setImgError(true)}
                    style={{ maxHeight: '300px', maxWidth: '100%', objectFit: 'contain', transition: 'transform 0.3s' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>

                {/* Thumbnails */}
                {displayImages.length > 1 && (
                  <div style={{ display: 'flex', gap: '8px', overflow: 'auto' }}>
                    {displayImages.map((img, i) => (
                      <button key={i} onClick={() => setSelectedImage(i)}
                        style={{ border: i === selectedImage ? '2px solid #2874f0' : '2px solid #e0e0e0', borderRadius: '4px', padding: '6px', cursor: 'pointer', background: 'white', flexShrink: 0 }}>
                        <img src={img} alt="" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                      </button>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button
                    id="add-to-cart-detail"
                    onClick={handleAddToCart}
                    disabled={addingCart || product.stock === 0}
                    style={{ flex: 1, padding: '16px', background: product.stock === 0 ? '#ccc' : '#ff9f00', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 700, cursor: product.stock === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: product.stock === 0 ? 'none' : '0 4px 12px rgba(255,159,0,0.4)', transition: 'all 0.2s' }}
                  >
                    <ShoppingCart size={20} />
                    {product.stock === 0 ? 'Out of Stock' : (addingCart ? 'Adding...' : 'ADD TO CART')}
                  </button>
                  <button
                    id="buy-now-btn"
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    style={{ flex: 1, padding: '16px', background: product.stock === 0 ? '#ccc' : '#2874f0', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 700, cursor: product.stock === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: product.stock === 0 ? 'none' : '0 4px 12px rgba(40,116,240,0.4)', transition: 'all 0.2s' }}
                  >
                    ⚡ BUY NOW
                  </button>
                </div>
              </div>

              {/* Right: Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {product.brand && <p style={{ color: '#2874f0', fontSize: '14px', fontWeight: 600 }}>{product.brand}</p>}
                <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#212121', lineHeight: 1.4 }}>{product.name}</h1>

                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="star-rating" style={{ fontSize: '14px', padding: '3px 8px' }}>
                    {product.rating.toFixed(1)} <Star size={12} fill="white" />
                  </span>
                  <span style={{ fontSize: '13px', color: '#878787' }}>{product.rating_count.toLocaleString()} Ratings &amp; Reviews</span>
                </div>

                {/* Price */}
                <div style={{ borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', padding: '16px 0', display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '28px', fontWeight: 700, color: '#212121' }}>₹{product.price.toLocaleString()}</span>
                  {product.original_price && product.original_price > product.price && (
                    <span style={{ fontSize: '16px', color: '#878787', textDecoration: 'line-through' }}>₹{product.original_price.toLocaleString()}</span>
                  )}
                  {product.discount_percent > 0 && (
                    <span style={{ fontSize: '18px', color: '#26a541', fontWeight: 600 }}>{product.discount_percent}% off</span>
                  )}
                </div>

                {/* Delivery */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#212121', marginBottom: '8px' }}>
                    <Truck size={18} color="#26a541" />
                    <span><strong>Free delivery</strong> by {new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#212121' }}>
                    <RotateCcw size={18} color="#2874f0" />
                    <span><strong>7 Days</strong> Replacement Policy</span>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#878787', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quantity</p>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e0e0e0', borderRadius: '4px', width: 'fit-content' }}>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '36px', height: '36px', background: 'none', border: 'none', fontSize: '18px', fontWeight: 700, cursor: 'pointer', color: '#2874f0' }}>−</button>
                    <span style={{ width: '48px', textAlign: 'center', fontSize: '16px', fontWeight: 600 }}>{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} style={{ width: '36px', height: '36px', background: 'none', border: 'none', fontSize: '18px', fontWeight: 700, cursor: 'pointer', color: '#2874f0' }}>+</button>
                  </div>
                  {product.stock <= 10 && product.stock > 0 && (
                    <p style={{ fontSize: '12px', color: '#ff6161', marginTop: '6px', fontWeight: 600 }}>Only {product.stock} in stock!</p>
                  )}
                  {product.stock === 0 && <p style={{ fontSize: '14px', color: '#ff4040', marginTop: '6px', fontWeight: 600 }}>❌ Out of Stock</p>}
                </div>

                {/* Wishlist */}
                <button
                  id="wishlist-detail-btn"
                  onClick={handleWishlist}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', width: 'fit-content', border: `2px solid ${wishlisted ? '#ff4040' : '#e0e0e0'}`, borderRadius: '4px', background: wishlisted ? '#fff0f0' : 'white', color: wishlisted ? '#ff4040' : '#212121', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <Heart size={18} fill={wishlisted ? '#ff4040' : 'none'} color={wishlisted ? '#ff4040' : '#212121'} />
                  {wishlisted ? 'Wishlisted' : 'Wishlist'}
                </button>

                {/* Highlights */}
                <div style={{ background: '#f9f9f9', borderRadius: '4px', padding: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { icon: <Shield size={18} color="#2874f0" />, text: '100% Authentic' },
                      { icon: <Truck size={18} color="#26a541" />, text: 'Free Delivery' },
                      { icon: <RotateCcw size={18} color="#ff9f00" />, text: 'Easy Returns' },
                      { icon: <Package size={18} color="#9c27b0" />, text: 'Secure Packaging' },
                    ].map(({ icon, text }, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#212121' }}>
                        {icon} {text}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabs */}
                <div>
                  <div style={{ display: 'flex', borderBottom: '2px solid #f0f0f0', marginBottom: '16px' }}>
                    {['description', 'specs'].map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '12px 20px', background: 'none', border: 'none',
                        borderBottom: activeTab === tab ? '2px solid #2874f0' : 'none',
                        marginBottom: '-2px',
                        color: activeTab === tab ? '#2874f0' : '#878787',
                        fontWeight: activeTab === tab ? 700 : 400,
                        cursor: 'pointer', fontSize: '14px', textTransform: 'capitalize', transition: 'color 0.2s',
                      }}>
                        {tab === 'description' ? 'Description' : 'Specifications'}
                      </button>
                    ))}
                  </div>

                  {activeTab === 'description' && (
                    <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.8 }}>
                      {product.description || 'No description available for this product.'}
                    </p>
                  )}

                  {activeTab === 'specs' && (
                    specs ? (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <tbody>
                          {Object.entries(specs).map(([key, value], i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                              <td style={{ padding: '10px 12px', color: '#878787', fontWeight: 500, width: '40%', background: '#fafafa' }}>{key}</td>
                              <td style={{ padding: '10px 12px', color: '#212121' }}>{String(value)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : <p style={{ fontSize: '14px', color: '#878787' }}>No specifications available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
