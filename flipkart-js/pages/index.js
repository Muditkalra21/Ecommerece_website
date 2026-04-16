import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { getProducts, getCategories } from '../lib/api';
import ProductCard from '../components/ProductCard';

const SORT_OPTIONS = [
  { label: 'Relevance', value: '' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Biggest Discount', value: 'discount' },
];

const HERO_BANNERS = [
  { bg: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)', text: 'Big Billion Days', sub: "Prices so low, you won't believe!", tag: 'UP TO 80% OFF' },
  { bg: 'linear-gradient(135deg, #e91e63 0%, #880e4f 100%)', text: 'Fashion Fiesta', sub: 'Trendiest styles at unbeatable prices', tag: 'MIN 50% OFF' },
  { bg: 'linear-gradient(135deg, #00897b 0%, #004d40 100%)', text: 'Electronics Bonanza', sub: 'Top brands. Lowest prices. Guaranteed.', tag: 'BEST DEALS' },
];

export default function HomePage() {
  const router = useRouter();
  const { search: searchParam, category: catParam } = router.query;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [filters, setFilters] = useState({ page: 1, per_page: 20, category: '', search: '', sort_by: '' });

  // Hero auto-scroll
  useEffect(() => {
    const t = setInterval(() => setBannerIndex(i => (i + 1) % HERO_BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  // Sync URL → filters
  useEffect(() => {
    setFilters(f => ({ ...f, search: searchParam || '', category: catParam || '', page: 1 }));
  }, [searchParam, catParam]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts(filters);
      setProducts(res.products);
      setTotalPages(res.total_pages);
      setTotal(res.total);
    } catch {}
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);

  const setCategory = (slug) => {
    setFilters(f => ({ ...f, category: slug, page: 1 }));
    const q = slug ? `?category=${slug}` : '/';
    router.push(q, undefined, { shallow: true });
  };

  const setSort = (val) => setFilters(f => ({ ...f, sort_by: val, page: 1 }));

  const setPage = (p) => {
    setFilters(f => ({ ...f, page: p }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({ page: 1, per_page: 20, category: '', search: '', sort_by: '' });
    router.push('/');
  };

  const activeBanner = HERO_BANNERS[bannerIndex];
  const activeSearch = filters.search;
  const activeCategory = filters.category;

  return (
    <>
      <Head>
        <title>Flipkart – Shop Online</title>
        <meta name="description" content="Shop millions of products at best prices" />
      </Head>
      <div>
        {/* Hero */}
        {!activeSearch && !activeCategory && (
          <div style={{ background: activeBanner.bg, padding: '48px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden', transition: 'background 0.8s ease' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 40%)' }} />
            <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: 'white', padding: '4px 16px', borderRadius: '16px', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', marginBottom: '16px' }}>
                {activeBanner.tag}
              </div>
              <h1 style={{ color: 'white', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.2, marginBottom: '12px' }}>
                {activeBanner.text}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px', marginBottom: '24px' }}>{activeBanner.sub}</p>
            </div>
            {/* Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', position: 'relative', zIndex: 1 }}>
              {HERO_BANNERS.map((_, i) => (
                <button key={i} onClick={() => setBannerIndex(i)} style={{
                  width: i === bannerIndex ? '24px' : '8px', height: '8px', borderRadius: '4px',
                  background: i === bannerIndex ? 'white' : 'rgba(255,255,255,0.5)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Category chips */}
        <div style={{ background: 'white', padding: '12px 0', borderBottom: '1px solid #e0e0e0', position: 'sticky', top: '56px', zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div className="container">
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
              <button onClick={() => setCategory('')} className={`chip${!activeCategory ? ' active' : ''}`}>🛍️ All</button>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.slug)} className={`chip${activeCategory === cat.slug ? ' active' : ''}`}>
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '20px 16px' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#212121' }}>
                {activeSearch ? `Results for "${activeSearch}"` : activeCategory ? (categories.find(c => c.slug === activeCategory)?.name || 'Products') : 'All Products'}
              </h2>
              <p style={{ fontSize: '13px', color: '#878787', marginTop: '2px' }}>{total.toLocaleString()} products found</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {(activeSearch || activeCategory) && (
                <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#fff0f0', color: '#ff4040', border: '1px solid #ffcccc', borderRadius: '4px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  <X size={14} /> Clear
                </button>
              )}
              <select value={filters.sort_by || ''} onChange={e => setSort(e.target.value)}
                style={{ padding: '8px 12px', border: '1.5px solid #e0e0e0', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', outline: 'none', background: 'white', color: '#212121' }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '4px', overflow: 'hidden', padding: '16px' }}>
                  <div className="skeleton" style={{ height: '180px', marginBottom: '12px' }} />
                  <div className="skeleton" style={{ height: '16px', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ height: '14px', width: '60%', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ height: '20px', width: '40%' }} />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', color: '#878787' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: '#212121' }}>No products found</h3>
              <p style={{ fontSize: '14px' }}>Try adjusting your search or filters</p>
              <button onClick={clearFilters} className="btn-primary" style={{ marginTop: '24px' }}>Browse All Products</button>
            </div>
          ) : (
            <div className="product-grid animate-fade-in">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
              <button
                onClick={() => setPage(Math.max(1, (filters.page || 1) - 1))}
                disabled={(filters.page || 1) <= 1}
                style={{ padding: '8px 16px', background: 'white', border: '1.5px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: (filters.page || 1) <= 1 ? '#ccc' : '#212121' }}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                const page = filters.page || 1;
                let pageNum;
                if (totalPages <= 7) pageNum = i + 1;
                else if (page <= 4) pageNum = i + 1;
                else if (page >= totalPages - 3) pageNum = totalPages - 6 + i;
                else pageNum = page - 3 + i;
                return (
                  <button key={pageNum} onClick={() => setPage(pageNum)} style={{
                    width: '36px', height: '36px', borderRadius: '4px',
                    border: pageNum === page ? '2px solid #2874f0' : '1.5px solid #e0e0e0',
                    background: pageNum === page ? '#2874f0' : 'white',
                    color: pageNum === page ? 'white' : '#212121',
                    fontWeight: pageNum === page ? 700 : 400,
                    cursor: 'pointer', fontSize: '14px',
                  }}>
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setPage(Math.min(totalPages, (filters.page || 1) + 1))}
                disabled={(filters.page || 1) >= totalPages}
                style={{ padding: '8px 16px', background: 'white', border: '1.5px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: (filters.page || 1) >= totalPages ? '#ccc' : '#212121' }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
