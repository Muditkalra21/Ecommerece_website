'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ShoppingCart, Heart, Package, Search, Menu, X, User, ChevronDown } from 'lucide-react';
import { getCart, getWishlist } from '../lib/api';

export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const fetchCounts = async () => {
    try {
      const [cart, wishlist] = await Promise.all([getCart(), getWishlist()]);
      setCartCount(cart.total_items);
      setWishlistCount(wishlist.total);
    } catch {}
  };

  useEffect(() => {
    fetchCounts();
    window.addEventListener('cart-updated', fetchCounts);
    window.addEventListener('wishlist-updated', fetchCounts);
    return () => {
      window.removeEventListener('cart-updated', fetchCounts);
      window.removeEventListener('wishlist-updated', fetchCounts);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinkStyle = {
    padding: '6px 12px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderRadius: '4px',
    transition: 'background 0.2s',
    position: 'relative',
    cursor: 'pointer',
  };

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'linear-gradient(135deg, #2874f0 0%, #1a5dc8 100%)',
      boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.15)',
      transition: 'box-shadow 0.3s ease',
    }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', height: '56px', gap: '16px' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', flexDirection: 'column', minWidth: 'fit-content' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px', lineHeight: 1 }}>
              Flipkart
            </span>
            <span style={{ color: '#ffe066', fontSize: '10px', fontStyle: 'italic', fontWeight: 500 }}>
              ⚡ Explore <span style={{ textDecoration: 'underline' }}>Plus</span>
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '680px' }}>
            <div style={{ position: 'relative', display: 'flex' }}>
              <input
                id="search-input"
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '10px 48px 10px 16px',
                  borderRadius: '2px', border: 'none', fontSize: '14px',
                  outline: 'none', color: '#333', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
              <button type="submit" style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: '44px',
                background: 'linear-gradient(135deg, #2874f0, #1557d0)',
                border: 'none', borderRadius: '0 2px 2px 0', color: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hide-mobile">
            <div style={{ ...navLinkStyle }}>
              <User size={16} /> Mudit <ChevronDown size={14} />
            </div>

            <Link href="/orders" style={navLinkStyle}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
              <Package size={16} /> Orders
            </Link>

            <Link href="/wishlist" style={{ ...navLinkStyle }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
              <Heart size={16} /> Wishlist
              {wishlistCount > 0 && (
                <span style={{
                  position: 'absolute', top: '4px', right: '6px',
                  background: '#ff4040', color: 'white', borderRadius: '50%',
                  width: '16px', height: '16px', fontSize: '10px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" style={{ ...navLinkStyle }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
              <ShoppingCart size={16} /> Cart
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '4px', right: '8px',
                  background: '#ff6161', color: 'white', borderRadius: '50%',
                  width: '18px', height: '18px', fontSize: '11px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', color: 'white', padding: '8px', border: 'none' }}
            className="show-mobile"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div style={{ background: 'white', borderTop: '1px solid #eee', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link href="/orders" style={{ padding: '12px', color: '#212121', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setMobileMenuOpen(false)}>
            <Package size={18} /> My Orders
          </Link>
          <Link href="/wishlist" style={{ padding: '12px', color: '#212121', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setMobileMenuOpen(false)}>
            <Heart size={18} /> Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
          </Link>
          <Link href="/cart" style={{ padding: '12px', color: '#212121', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setMobileMenuOpen(false)}>
            <ShoppingCart size={18} /> Cart {cartCount > 0 && `(${cartCount})`}
          </Link>
        </div>
      )}
    </header>
  );
}
