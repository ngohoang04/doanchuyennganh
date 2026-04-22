import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { demoProducts } from '../services/demoData';
import { getProducts } from '../services/shop';
import './home.css';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const getDerivedSoldCount = (product) => {
    if (typeof product.soldCount === 'number') return product.soldCount;
    if (Array.isArray(product.orderItems)) {
        return product.orderItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    }
    return (Number(product.id || 0) * 7) % 120;
};

const getDerivedReviewCount = (product) => {
    if (typeof product.reviewCount === 'number') return product.reviewCount;
    if (Array.isArray(product.reviews)) {
        return product.reviews.length;
    }
    return (Number(product.id || 0) * 3) % 40;
};

const getDerivedAverageRating = (product) => {
    if (typeof product.averageRating === 'number') return product.averageRating;
    if (Array.isArray(product.reviews) && product.reviews.length > 0) {
        const total = product.reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
        return Number((total / product.reviews.length).toFixed(1));
    }
    return 0;
};

const getPriceRange = (value) => {
    if (value === 'under-5m') return (price) => price < 5000000;
    if (value === '5m-15m') return (price) => price >= 5000000 && price <= 15000000;
    if (value === '15m-30m') return (price) => price > 15000000 && price <= 30000000;
    if (value === 'over-30m') return (price) => price > 30000000;
    return () => true;
};

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [priceRange, setPriceRange] = useState('all');
    const [minSoldCount, setMinSoldCount] = useState('all');
    const [minReviewCount, setMinReviewCount] = useState('all');
    const location = useLocation();
    const q = useQuery();
    const navigate = useNavigate();

    useEffect(() => {
        const qparam = q.get('q') || '';
        setQuery(qparam);
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await getProducts();
            const list = res.data || [];
            setProducts(list.length ? list : demoProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts(demoProducts);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = useMemo(() => {
        const search = query.trim().toLowerCase();
        const inPriceRange = getPriceRange(priceRange);
        const soldThreshold = minSoldCount === 'all' ? 0 : Number(minSoldCount);
        const reviewThreshold = minReviewCount === 'all' ? 0 : Number(minReviewCount);

        return products.filter((product) => {
            const price = Number(product.price || 0);
            const soldCount = getDerivedSoldCount(product);
            const reviewCount = getDerivedReviewCount(product);
            const matchesSearch =
                !search ||
                (product.name || '').toLowerCase().includes(search) ||
                (product.description || '').toLowerCase().includes(search) ||
                (product.category?.name || '').toLowerCase().includes(search);

            return (
                matchesSearch &&
                inPriceRange(price) &&
                soldCount >= soldThreshold &&
                reviewCount >= reviewThreshold
            );
        });
    }, [products, query, priceRange, minSoldCount, minReviewCount]);

    const onSearch = () => {
        if (query.trim()) navigate(`/products?q=${encodeURIComponent(query.trim())}`);
        else navigate('/products');
    };

    const clearFilters = () => {
        setPriceRange('all');
        setMinSoldCount('all');
        setMinReviewCount('all');
    };

    const openProductDetail = (product) => {
        navigate(`/product/${product.id}`, { state: { product } });
    };

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <h2>Tất Cả Sản Phẩm</h2>
                <div className="d-flex">
                    <input
                        type="text"
                        className="form-control me-2"
                        placeholder="Tìm sản phẩm..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={onSearch}>Tìm</button>
                </div>
            </div>

            <div className="products-layout">
                <aside className="products-filter-panel">
                    <div className="products-filter-card">
                        <div className="products-filter-header">
                            <h4>Bộ lọc</h4>
                            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={clearFilters}>
                                Đặt lại
                            </button>
                        </div>

                        <div className="products-filter-group">
                            <label className="form-label">Mức giá</label>
                            <select className="form-select" value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
                                <option value="all">Tất cả</option>
                                <option value="under-5m">Dưới 5 triệu</option>
                                <option value="5m-15m">Từ 5 đến 15 triệu</option>
                                <option value="15m-30m">Từ 15 đến 30 triệu</option>
                                <option value="over-30m">Trên 30 triệu</option>
                            </select>
                        </div>

                        <div className="products-filter-group">
                            <label className="form-label">Lượt bán tối thiểu</label>
                            <select className="form-select" value={minSoldCount} onChange={(e) => setMinSoldCount(e.target.value)}>
                                <option value="all">Tất cả</option>
                                <option value="10">Từ 10</option>
                                <option value="30">Từ 30</option>
                                <option value="50">Từ 50</option>
                                <option value="100">Từ 100</option>
                            </select>
                        </div>

                        <div className="products-filter-group">
                            <label className="form-label">Lượt đánh giá tối thiểu</label>
                            <select className="form-select" value={minReviewCount} onChange={(e) => setMinReviewCount(e.target.value)}>
                                <option value="all">Tất cả</option>
                                <option value="5">Từ 5</option>
                                <option value="10">Từ 10</option>
                                <option value="20">Từ 20</option>
                                <option value="30">Từ 30</option>
                            </select>
                        </div>
                    </div>
                </aside>

                <section className="products-content">
                    {loading ? (
                        <div className="text-center">Đang tải...</div>
                    ) : (
                        <>
                            <div className="products-summary">
                                <strong>{filteredProducts.length}</strong> sản phẩm phù hợp
                            </div>
                            <div className="categories-grid">
                                {filteredProducts.length === 0 ? (
                                    <p>Không có sản phẩm phù hợp.</p>
                                ) : (
                                    filteredProducts.map((product) => {
                                        const soldCount = getDerivedSoldCount(product);
                                        const reviewCount = getDerivedReviewCount(product);
                                        const averageRating = getDerivedAverageRating(product);

                                        return (
                                            <div
                                                key={product.id}
                                                className="category-card product-card-clickable"
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => openProductDetail(product)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        openProductDetail(product);
                                                    }
                                                }}
                                            >
                                                <div className="category-image">
                                                    <img
                                                        src={product.image || 'https://via.placeholder.com/300x200?text=TechShop'}
                                                        alt={product.name}
                                                    />
                                                </div>
                                                <div className="category-info">
                                                    <h3>{product.name}</h3>
                                                    <p className="products-meta">
                                                        <span>{soldCount} đã bán</span>
                                                        {averageRating > 0 && <span>{averageRating}/5 sao</span>}
                                                        <span>{reviewCount} đánh giá</span>
                                                    </p>
                                                    <p style={{ color: '#666' }}>{product.description}</p>
                                                    <p style={{ color: 'red', fontWeight: 700 }}>
                                                        {Number(product.price || 0).toLocaleString('vi-VN')} VND
                                                    </p>
                                                    <button
                                                        className="category-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openProductDetail(product);
                                                        }}
                                                    >
                                                        Xem chi tiết
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}

export default Products;
