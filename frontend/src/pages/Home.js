import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { demoCategories, demoProducts } from '../services/demoData';
import { getCategories, getProducts } from '../services/shop';
import './home.css';

const getDerivedSoldCount = (product) => {
    if (typeof product.soldCount === 'number') return product.soldCount;
    if (Array.isArray(product.orderItems)) {
        return product.orderItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    }
    return 0;
};

const getDerivedReviewCount = (product) => {
    if (typeof product.reviewCount === 'number') return product.reviewCount;
    if (Array.isArray(product.reviews)) return product.reviews.length;
    return 0;
};

const getDerivedAverageRating = (product) => {
    if (typeof product.averageRating === 'number') return product.averageRating;
    if (Array.isArray(product.reviews) && product.reviews.length > 0) {
        const total = product.reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
        return Number((total / product.reviews.length).toFixed(1));
    }
    return 0;
};

function Home() {
    const [categories, setCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, productsRes] = await Promise.all([
                    getCategories(),
                    getProducts()
                ]);

                const mappedCategories = (categoriesRes.data || []).map((category) => ({
                    ...category,
                    slug: category.name.toLowerCase().trim().replace(/\s+/g, '-'),
                    image: category.image || `https://picsum.photos/seed/category-${category.id}/600/420`
                }));

                setCategories(mappedCategories);
                setFeaturedProducts((productsRes.data || []).slice(0, 4));
            } catch (error) {
                setCategories(
                    demoCategories.map((category) => ({
                        ...category,
                        slug: category.name.toLowerCase().trim().replace(/\s+/g, '-'),
                        image: category.image || `https://picsum.photos/seed/category-${category.id}/600/420`
                    }))
                );
                setFeaturedProducts(demoProducts.slice(0, 4));
            }
        };

        fetchData();
    }, []);

    const announcements = [
        { id: 1, icon: 'bi-percent', title: 'Giảm giá đến 50%', description: 'Ưu đãi hấp dẫn cho nhiều sản phẩm công nghệ bán chạy.' },
        { id: 2, icon: 'bi-truck', title: 'Miễn phí vận chuyển', description: 'Áp dụng cho đơn hàng từ 500.000 VND trở lên.' },
        { id: 3, icon: 'bi-shield-check', title: 'Bảo hành chính hãng', description: 'Cam kết hàng chính hãng, rõ ràng chính sách sau mua.' },
        { id: 4, icon: 'bi-clock', title: 'Giao hàng nhanh', description: 'Xử lý đơn linh hoạt và giao hàng trên toàn quốc.' }
    ];

    const openProductDetail = (product) => {
        navigate(`/product/${product.id}`, { state: { product } });
    };

    return (
        <div className="home-container">
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">Mua Sắm Công Nghệ Chính Hãng</h1>
                    <p className="hero-subtitle">Săn ưu đãi mỗi ngày với hàng loạt thiết bị cho học tập, làm việc và giải trí.</p>
                    <button className="hero-btn" onClick={() => navigate('/products')}>Xem sản phẩm</button>
                </div>
            </section>

            <section className="announcements-section container">
                <div className="announcements-grid">
                    {announcements.map((announcement) => (
                        <div key={announcement.id} className="announcement-card">
                            <div className="announcement-icon">
                                <i className={`bi ${announcement.icon}`}></i>
                            </div>
                            <h3>{announcement.title}</h3>
                            <p>{announcement.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="categories-section container">
                <div className="section-header">
                    <h2>Danh Mục Nổi Bật</h2>
                    <p>Chọn nhanh nhóm sản phẩm phù hợp với nhu cầu mua sắm của bạn.</p>
                </div>

                <div className="categories-grid">
                    {categories.map((category) => (
                        <div key={category.id} className="category-card">
                            <div className="category-image">
                                <img src={category.image} alt={category.name} />
                                <div className="category-overlay">
                                    <button className="category-btn" onClick={() => navigate(`/category/${category.slug}`)}>
                                        Xem danh mục
                                    </button>
                                </div>
                            </div>
                            <div className="category-info">
                                <h3>{category.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="categories-section container">
                <div className="section-header">
                    <h2>Sản Phẩm Nổi Bật</h2>
                    <p>Khám phá các lựa chọn nổi bật được nhiều khách hàng quan tâm.</p>
                </div>

                <div className="categories-grid">
                    {featuredProducts.map((product) => (
                        (() => {
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
                                        <img src={product.image || `https://picsum.photos/seed/product-${product.id}/600/420`} alt={product.name} />
                                        <div className="category-overlay">
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
                                    <div className="category-info">
                                        <h3>{product.name}</h3>
                                        <p className="products-meta">
                                            <span>{soldCount} đã bán</span>
                                            {averageRating > 0 && <span>{averageRating}/5 sao</span>}
                                            <span>{reviewCount} đánh giá</span>
                                        </p>
                                        <p>{Number(product.price || 0).toLocaleString('vi-VN')} VND</p>
                                    </div>
                                </div>
                            );
                        })()
                    ))}
                </div>
            </section>

            <section className="promo-section">
                <div className="container">
                    <div className="promo-content">
                        <h2>Ưu Đãi Hôm Nay</h2>
                        <p>Cập nhật deal tốt mỗi ngày để bạn mua sắm nhanh hơn và tiết kiệm hơn.</p>
                        <button className="promo-btn" onClick={() => navigate('/products')}>Xem sản phẩm</button>
                    </div>
                </div>
            </section>

            <section className="newsletter-section">
                <div className="container">
                    <div className="newsletter-content">
                        <h2>Mua Sắm Thuận Tiện Tại TechShop</h2>
                        <p>Từ danh mục, giỏ hàng đến đơn hàng, mọi thao tác đều được đồng bộ để bạn mua sắm liền mạch.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
