import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/products');
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products", error);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Latest Products</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                {products.map((product) => (
                    <div key={product.id} style={{ background: 'white', border: '1px solid #e1e1e1', borderRadius: '8px', padding: '15px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
                        <img src={product.image || 'https://via.placeholder.com/200'} alt={product.name} style={{ width: '100%', height: '180px', objectFit: 'contain', marginBottom: '10px' }} />
                        <h4 style={{ margin: '10px 0', fontSize: '16px', color: '#333', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{product.name}</h4>
                        <p style={{ color: '#ee4d2d', fontWeight: 'bold', fontSize: '18px', margin: '5px 0' }}>${product.price}</p>
                        <Link to={`/product/${product.id}`} style={{ display: 'inline-block', marginTop: '10px', padding: '8px 15px', background: '#ee4d2d', color: 'white', textDecoration: 'none', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}>View Details</Link>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Home;