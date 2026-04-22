import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { demoProducts } from '../services/demoData';
import {
    addToCart,
    createReview,
    getProductById,
    getProducts,
    getReviewEligibility,
    getReviewsByProduct
} from '../services/shop';

function ProductDetail() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [selectedImage, setSelectedImage] = useState('');
    const [reviewEligibility, setReviewEligibility] = useState(null);
    const reviewSectionRef = useRef(null);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isAuthenticated, user]);

    useEffect(() => {
        if (!loading && product && location.state?.focusReview && reviewEligibility?.canReview) {
            reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [loading, product, location.state, reviewEligibility]);

    const currentCategoryId = useMemo(
        () => product?.categoryId || product?.category?.id || null,
        [product]
    );

    const fetchData = async () => {
        const fallbackProductFromState = location.state?.product && String(location.state.product.id) === String(id)
            ? location.state.product
            : null;
        const fallbackProductFromDemo = demoProducts.find((item) => String(item.id) === String(id)) || null;
        const fallbackProduct = fallbackProductFromState || fallbackProductFromDemo;

        try {
            setLoading(true);
            const [productRes, reviewsRes, productsRes] = await Promise.all([
                getProductById(id),
                getReviewsByProduct(id),
                getProducts()
            ]);

            const currentProduct = productRes.data;
            const allProducts = productsRes.data || [];

            setProduct(currentProduct);
            setReviews(reviewsRes.data || []);

            const gallery = Array.isArray(currentProduct?.images) && currentProduct.images.length > 0
                ? currentProduct.images
                : [currentProduct?.image].filter(Boolean);
            setSelectedImage(gallery[0] || '');

            setSimilarProducts(
                allProducts
                    .filter((item) => {
                        const itemCategoryId = item.categoryId || item.category?.id;
                        const productCategoryId = currentProduct.categoryId || currentProduct.category?.id;
                        return String(item.id) !== String(currentProduct.id) && String(itemCategoryId) === String(productCategoryId);
                    })
                    .slice(0, 4)
            );

            if (isAuthenticated && user) {
                try {
                    const eligibilityRes = await getReviewEligibility(id);
                    setReviewEligibility(eligibilityRes?.data || null);
                } catch (eligibilityError) {
                    setReviewEligibility({
                        canReview: false,
                        hasPurchased: false,
                        hasReviewed: false,
                        message: eligibilityError.response?.data?.message || 'Chưa thể kiểm tra quyền đánh giá'
                    });
                }
            } else {
                setReviewEligibility(null);
            }

            setError('');
        } catch (err) {
            if (fallbackProduct) {
                setProduct(fallbackProduct);
                setReviews([]);
                setReviewEligibility(null);
                setError('');

                const gallery = Array.isArray(fallbackProduct?.images) && fallbackProduct.images.length > 0
                    ? fallbackProduct.images
                    : [fallbackProduct?.image].filter(Boolean);
                setSelectedImage(gallery[0] || '');

                const fallbackCategoryId = fallbackProduct.categoryId || fallbackProduct.category?.id;
                setSimilarProducts(
                    demoProducts
                        .filter((item) => String(item.id) !== String(fallbackProduct.id) && String(item.categoryId || item.category?.id) === String(fallbackCategoryId))
                        .slice(0, 4)
                );
            } else {
                setError('Không thể tải chi tiết sản phẩm');
                setProduct(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated || !user) {
            window.dispatchEvent(new Event('open-login-modal'));
            return;
        }

        try {
            setSubmitting(true);
            await addToCart(product.id, quantity);
            window.alert('Đã thêm sản phẩm vào giỏ hàng');
        } catch (err) {
            window.alert(err.response?.data?.message || 'Không thể thêm vào giỏ hàng');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!isAuthenticated || !user) {
            window.dispatchEvent(new Event('open-login-modal'));
            return;
        }

        try {
            setSubmitting(true);
            await createReview({
                productId: product.id,
                rating: Number(reviewForm.rating),
                comment: reviewForm.comment
            });
            setReviewForm({ rating: 5, comment: '' });
            await fetchData();
        } catch (err) {
            window.alert(err.response?.data?.message || 'Không thể gửi đánh giá');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenChat = () => {
        if (!isAuthenticated || !user) {
            window.dispatchEvent(new Event('open-login-modal'));
            return;
        }

        const seller = product?.seller;
        if (!seller?.id || String(seller.id) === String(user.id)) return;

        window.dispatchEvent(new CustomEvent('open-chat', {
            detail: {
                id: seller.id,
                firstName: seller.firstName,
                lastName: seller.lastName,
                email: seller.email,
                avatar: seller.avatar || seller.shopLogo || null,
                role: seller.role,
                shopName: seller.shopName
            }
        }));
    };

    const openProduct = (nextProduct) => {
        navigate(`/product/${nextProduct.id}`, { state: { product: nextProduct } });
    };

    if (loading) return <div className="container py-5">Đang tải...</div>;
    if (!product) return <div className="container py-5">Không tìm thấy sản phẩm.</div>;

    const reviewNotice = !isAuthenticated || !user
        ? 'Chỉ khách đã mua hàng mới có thể đánh giá sản phẩm.'
        : reviewEligibility?.message || 'Bạn chỉ có thể đánh giá sau khi đơn hàng đã hoàn thành.';
    const canReview = Boolean(reviewEligibility?.canReview);
    const hasReviewed = Boolean(reviewEligibility?.hasReviewed);
    const gallery = Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : [product.image].filter(Boolean);

    return (
        <div className="container py-5">
            {error && <div className="alert alert-danger">{error}</div>}

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
                    <p className="text-muted mb-2">{product.category?.name || 'Sản phẩm'}</p>
                    <h1>{product.name}</h1>
                    <p className="fs-3 fw-bold text-danger">
                        {Number(product.price || 0).toLocaleString('vi-VN')} VND
                    </p>
                    <p><strong>Tồn kho:</strong> {product.stock ?? 0}</p>
                    <p><strong>Người bán:</strong> {product.seller?.shopName || product.seller?.lastName || product.seller?.firstName || 'TechShop'}</p>

                    <div className="d-flex gap-3 align-items-center my-4 flex-wrap">
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
                            Thêm vào giỏ hàng
                        </button>
                        {product?.seller?.id && String(product.seller.id) !== String(user?.id) && (
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-lg"
                                onClick={handleOpenChat}
                            >
                                Chat với shop
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <section className="mt-5">
                <div className="border rounded-4 bg-white shadow-sm p-4">
                    <h3 className="mb-3">Mô tả chi tiết</h3>
                    <div style={{ whiteSpace: 'pre-line', lineHeight: 1.8, color: '#4b5563' }}>
                        {product.description || 'Sản phẩm hiện chưa có mô tả chi tiết.'}
                    </div>
                </div>
            </section>

            <div className="row mt-5">
                <div className={canReview ? 'col-lg-7' : 'col-12'}>
                    <h3 className="mb-3">Đánh giá</h3>
                    {!canReview && (
                        <div className="alert alert-light border mb-3">
                            {hasReviewed ? 'Bạn đã đánh giá sản phẩm này.' : reviewNotice}
                        </div>
                    )}
                    {reviews.length === 0 ? (
                        <p className="text-muted">Chưa có đánh giá nào.</p>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {reviews.map((review) => (
                                <div key={review.id} className="border rounded p-3 bg-white">
                                    <div className="d-flex justify-content-between">
                                        <strong>{review.user?.lastName || review.user?.firstName || 'Người dùng'}</strong>
                                        <span>{'★'.repeat(review.rating || 0)}</span>
                                    </div>
                                    <p className="mb-0 mt-2">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {canReview && !hasReviewed && (
                    <div className="col-lg-5" ref={reviewSectionRef}>
                        <h3 className="mb-3">Viết đánh giá</h3>
                        <div className="border rounded p-3 bg-white">
                            <div className="alert alert-success mb-3">
                                {reviewNotice}
                            </div>

                            <form onSubmit={handleSubmitReview}>
                                <div className="mb-3">
                                    <label className="form-label">Số sao</label>
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
                                    <label className="form-label">Nhận xét</label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        required
                                    />
                                </div>
                                <button className="btn btn-dark" disabled={submitting}>Gửi đánh giá</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {similarProducts.length > 0 && (
                <section className="mt-5">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3 className="mb-0">Sản phẩm tương tự</h3>
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => navigate(currentCategoryId ? `/category/${(product.category?.name || '').toLowerCase().trim().replace(/\s+/g, '-')}` : '/products')}
                        >
                            Xem thêm
                        </button>
                    </div>

                    <div className="row g-3">
                        {similarProducts.map((item) => (
                            <div key={item.id} className="col-md-6 col-xl-3">
                                <div
                                    className="border rounded p-3 h-100 bg-white"
                                    role="button"
                                    tabIndex={0}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => openProduct(item)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            openProduct(item);
                                        }
                                    }}
                                >
                                    <img
                                        src={item.image || 'https://via.placeholder.com/300x220?text=TechShop'}
                                        alt={item.name}
                                        className="img-fluid rounded mb-3"
                                        style={{ width: '100%', height: 180, objectFit: 'cover' }}
                                    />
                                    <div className="fw-semibold mb-2">{item.name}</div>
                                    <div className="text-muted small mb-2">{item.category?.name || product.category?.name}</div>
                                    <div className="text-danger fw-bold">
                                        {Number(item.price || 0).toLocaleString('vi-VN')} VND
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default ProductDetail;
