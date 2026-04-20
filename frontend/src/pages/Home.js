import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { demoCategories, demoProducts } from '../services/demoData';
import { getCategories, getProducts } from '../services/shop';
import './home.css';

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

                const icons = ['bi-phone', 'bi-laptop', 'bi-headphones', 'bi-controller', 'bi-display', 'bi-cpu'];
                const mappedCategories = (categoriesRes.data || []).map((category, index) => ({
                    ...category,
                    slug: category.name.toLowerCase().trim().replace(/\s+/g, '-'),
                    icon: icons[index % icons.length],
                    image: `https://picsum.photos/seed/category-${category.id}/600/420`
                }));

                setCategories(mappedCategories);
                setFeaturedProducts((productsRes.data || []).slice(0, 4));
            } catch (error) {
                const icons = ['bi-phone', 'bi-laptop', 'bi-headphones', 'bi-controller', 'bi-display', 'bi-cpu'];
                setCategories(
                    demoCategories.map((category, index) => ({
                        ...category,
                        slug: category.name.toLowerCase().trim().replace(/\s+/g, '-'),
                        icon: icons[index % icons.length],
                        image: `https://picsum.photos/seed/category-${category.id}/600/420`
                    }))
                );
                setFeaturedProducts(demoProducts.slice(0, 4));
            }
        };

        fetchData();
    }, []);

    const announcements = [
        { id: 1, icon: 'bi-percent', title: 'Giam gia den 50%', description: 'Khuyen mai lon cho nhieu san pham cong nghe' },
        { id: 2, icon: 'bi-truck', title: 'Mien phi van chuyen', description: 'Cho don hang tu 500.000 VND tro len' },
        { id: 3, icon: 'bi-shield-check', title: 'Bao hanh chinh hang', description: 'San pham co bao hanh ro rang tu nha ban' },
        { id: 4, icon: 'bi-clock', title: 'Giao hang nhanh', description: 'Xu ly don nhanh va ho tro tren toan quoc' }
    ];

    return (
        <div className="home-container">
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">Chao mung den TechShop</h1>
                    <p className="hero-subtitle">Nen tang mua sam cong nghe dua tren du lieu that tu he thong</p>
                    <button className="hero-btn" onClick={() => navigate('/products')}>Kham pha ngay</button>
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
                    <h2>Danh muc san pham</h2>
                    <p>Kham pha danh muc duoc lay tu database hien tai</p>
                </div>

                <div className="categories-grid">
                    {categories.map((category) => (
                        <div key={category.id} className="category-card">
                            <div className="category-image">
                                <img src={category.image} alt={category.name} />
                                <div className="category-overlay">
                                    <button className="category-btn" onClick={() => navigate(`/category/${category.slug}`)}>
                                        Xem danh muc
                                    </button>
                                </div>
                            </div>
                            <div className="category-info">
                                <i className={`bi ${category.icon}`}></i>
                                <h3>{category.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="categories-section container">
                <div className="section-header">
                    <h2>San pham noi bat</h2>
                    <p>Mot so san pham duoc hien thi nhanh tu database</p>
                </div>

                <div className="categories-grid">
                    {featuredProducts.map((product) => (
                        <div key={product.id} className="category-card">
                            <div className="category-image">
                                <img src={product.image || `https://picsum.photos/seed/product-${product.id}/600/420`} alt={product.name} />
                                <div className="category-overlay">
                                    <button className="category-btn" onClick={() => navigate(`/product/${product.id}`)}>
                                        Xem chi tiet
                                    </button>
                                </div>
                            </div>
                            <div className="category-info">
                                <h3>{product.name}</h3>
                                <p>{Number(product.price || 0).toLocaleString('vi-VN')} VND</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="promo-section">
                <div className="container">
                    <div className="promo-content">
                        <h2>Dac biet hom nay</h2>
                        <p>Mua sam thong minh, quan ly tap trung tren mot nen tang</p>
                        <button className="promo-btn" onClick={() => navigate('/products')}>Xem san pham</button>
                    </div>
                </div>
            </section>

            <section className="newsletter-section">
                <div className="container">
                    <div className="newsletter-content">
                        <h2>Trai nghiem du lieu that</h2>
                        <p>San pham, danh muc, gio hang va don hang deu duoc doc ghi qua API va database hien tai</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
