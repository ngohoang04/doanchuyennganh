import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { demoCategories, demoProducts } from '../services/demoData';
import { getCategories, getProducts } from '../services/shop';
import './home.css';

const slugify = (value) => (value || '').toLowerCase().trim().replace(/\s+/g, '-');

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

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{currentCategory?.name || slug}</h2>
                <button className="btn btn-outline-secondary" onClick={() => navigate('/products')}>
                    Xem tat ca
                </button>
            </div>

            {loading ? (
                <div>Dang tai...</div>
            ) : (
                <div className="categories-grid">
                    {filteredProducts.length === 0 ? (
                        <p>Khong co san pham trong danh muc nay.</p>
                    ) : (
                        filteredProducts.map((product) => (
                            <div key={product.id} className="category-card">
                                <div className="category-image">
                                    <img
                                        src={product.image || 'https://via.placeholder.com/300x200?text=TechShop'}
                                        alt={product.name}
                                    />
                                </div>
                                <div className="category-info">
                                    <h3>{product.name}</h3>
                                    <p style={{ color: '#666' }}>{product.description}</p>
                                    <p style={{ color: 'red', fontWeight: 700 }}>
                                        {Number(product.price || 0).toLocaleString('vi-VN')} VND
                                    </p>
                                    <button className="category-btn" onClick={() => navigate(`/product/${product.id}`)}>
                                        Xem chi tiet
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default CategoryPage;
