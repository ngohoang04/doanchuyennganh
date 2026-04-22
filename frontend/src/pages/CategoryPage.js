import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { demoCategories, demoProducts } from '../services/demoData';
import { getCategories, getProducts } from '../services/shop';
import './home.css';

const slugify = (value) => (value || '').toLowerCase().trim().replace(/\s+/g, '-');
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

function CategoryPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [slug]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsRes, categoriesRes] = await Promise.all([getProducts(), getCategories()]);
            const productsList = productsRes.data || [];
            const categoriesList = categoriesRes.data || [];
            setProducts(productsList.length ? productsList : demoProducts);
            setCategories(categoriesList.length ? categoriesList : demoCategories);
        } catch (err) {
            console.error(err);
            setProducts(demoProducts);
            setCategories(demoCategories);
        } finally {
            setLoading(false);
        }
    };

    const currentCategory = useMemo(
        () => categories.find((category) => slugify(category.name) === slug),
        [categories, slug]
    );

    const filteredProducts = useMemo(
        () => products.filter((product) => product.categoryId === currentCategory?.id),
        [products, currentCategory]
    );

    const openProductDetail = (product) => {
        navigate(`/product/${product.id}`, { state: { product } });
    };

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{currentCategory?.name || slug}</h2>
                <button className="btn btn-outline-secondary" onClick={() => navigate('/products')}>
                    Xem tất cả
                </button>
            </div>

            {loading ? (
                <div>Đang tải...</div>
            ) : (
                <div className="categories-grid">
                    {filteredProducts.length === 0 ? (
                        <p>Không có sản phẩm trong danh mục này.</p>
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
            )}
        </div>
    );
}

export default CategoryPage;
