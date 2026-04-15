import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState({});

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
                setProduct(data);
            } catch (error) {
                console.error("Error fetching product", error);
            }
        };
        fetchProduct();
    }, [id]);

    return (
        <div style={{ display: 'flex', gap: '40px', marginTop: '30px', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
                <img src={product.image || 'https://via.placeholder.com/400'} alt={product.name} style={{ maxWidth: '100%', objectFit: 'contain', borderRadius: '8px' }} />
            </div>
            <div style={{ flex: '2', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h2 style={{ fontSize: '28px', color: '#333', marginBottom: '10px' }}>{product.name}</h2>
                <div style={{ background: '#fafafa', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
                    <p style={{ color: '#ee4d2d', fontSize: '32px', fontWeight: 'bold', margin: '0' }}>${product.price}</p>
                </div>
                <p><strong>Category:</strong> <span style={{ textTransform: 'capitalize' }}>{product.category || 'N/A'}</span></p>
                <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#555', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>{product.description || "No description available for this product."}</p>

                <button style={{ marginTop: '30px', padding: '12px 30px', background: '#ee4d2d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', alignSelf: 'flex-start' }}>Add to Cart</button>
            </div>
        </div>
    );
};
export default ProductDetail;