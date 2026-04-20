import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addToCart, createReview, getProductById, getReviewsByProduct } from '../services/shop';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [selectedImage, setSelectedImage] = useState('');

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productRes, reviewsRes] = await Promise.all([
                getProductById(id),
                getReviewsByProduct(id)
            ]);
            setProduct(productRes.data);
            const gallery = Array.isArray(productRes.data?.images) && productRes.data.images.length > 0
                ? productRes.data.images
                : [productRes.data?.image].filter(Boolean);
            setSelectedImage(gallery[0] || '');
            setReviews(reviewsRes.data || []);
            setError('');
        } catch (err) {
            setError('Khong the tai chi tiet san pham');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated || !user) {
            navigate('/login');
            return;
        }

        try {
            setSubmitting(true);
            await addToCart(product.id, quantity);
            window.alert('Da them san pham vao gio hang');
        } catch (err) {
            window.alert(err.response?.data?.message || 'Khong the them vao gio hang');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!isAuthenticated || !user) {
            navigate('/login');
            return;
        }

        try {
            setSubmitting(true);
            await createReview({
                productId: product.id,
                userId: user.id,
                rating: Number(reviewForm.rating),
                comment: reviewForm.comment
            });
            setReviewForm({ rating: 5, comment: '' });
            await fetchData();
        } catch (err) {
            window.alert(err.response?.data?.message || 'Khong the gui danh gia');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container py-5">Dang tai...</div>;
    if (!product) return <div className="container py-5">Khong tim thay san pham.</div>;

    return (
        <div className="container py-5">
            {error && <div className="alert alert-danger">{error}</div>}
            {(() => {
                const gallery = Array.isArray(product.images) && product.images.length > 0
                    ? product.images
                    : [product.image].filter(Boolean);

                return (

                    <div className="row g-4">
                        <div className="col-lg-5">
                            <img
                                src={selectedImage || product.image || 'https://via.placeholder.com/600x400?text=TechShop'}
                                alt={product.name}
                                className="img-fluid rounded shadow-sm"
                            />
                            {gallery.length > 1 && (
                                <div className="d-flex gap-2 flex-wrap mt-3">
                                    {gallery.map((image, index) => (
                                        <button
                                            key={`${image}-${index}`}
                                            type="button"
                                            className={`btn p-0 border ${selectedImage === image ? 'border-primary' : 'border-light'}`}
                                            onClick={() => setSelectedImage(image)}
                                        >
                                            <img
                                                src={image}
                                                alt={`${product.name} ${index + 1}`}
                                                style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 8 }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="col-lg-7">
                            <p className="text-muted mb-2">{product.category?.name || 'San pham'}</p>
                            <h1>{product.name}</h1>
                            <p className="fs-3 fw-bold text-danger">
                                {Number(product.price || 0).toLocaleString('vi-VN')} VND
                            </p>
                            <p>{product.description || 'Chua co mo ta cho san pham nay.'}</p>
                            <p><strong>Ton kho:</strong> {product.stock ?? 0}</p>
                            <p><strong>Nguoi ban:</strong> {product.seller?.shopName || product.seller?.lastName || product.seller?.firstName || 'TechShop'}</p>

                            <div className="d-flex gap-3 align-items-center my-4">
                                <input
                                    type="number"
                                    min="1"
                                    max={product.stock || 1}
                                    className="form-control"
                                    style={{ width: 120 }}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                                />
                                <button
                                    className="btn btn-primary btn-lg"
                                    disabled={submitting || !product.stock}
                                    onClick={handleAddToCart}
                                >
                                    Them vao gio hang
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <div className="row mt-5">
                <div className="col-lg-7">
                    <h3 className="mb-3">Danh gia</h3>
                    {reviews.length === 0 ? (
                        <p className="text-muted">Chua co danh gia nao.</p>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {reviews.map((review) => (
                                <div key={review.id} className="border rounded p-3 bg-white">
                                    <div className="d-flex justify-content-between">
                                        <strong>{review.user?.lastName || review.user?.firstName || 'Nguoi dung'}</strong>
                                        <span>{'★'.repeat(review.rating || 0)}</span>
                                    </div>
                                    <p className="mb-0 mt-2">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="col-lg-5">
                    <h3 className="mb-3">Viet danh gia</h3>
                    <form onSubmit={handleSubmitReview} className="border rounded p-3 bg-white">
                        <div className="mb-3">
                            <label className="form-label">So sao</label>
                            <select
                                className="form-select"
                                value={reviewForm.rating}
                                onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                            >
                                {[5, 4, 3, 2, 1].map((value) => (
                                    <option key={value} value={value}>{value} sao</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Nhan xet</label>
                            <textarea
                                className="form-control"
                                rows="4"
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                required
                            />
                        </div>
                        <button className="btn btn-dark" disabled={submitting}>Gui danh gia</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;
