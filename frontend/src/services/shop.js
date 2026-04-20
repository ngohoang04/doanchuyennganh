import api from './Api';

const emitCartChanged = (cart) => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: cart }));
    }
};

const emitOrdersChanged = (order) => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('orders-updated', { detail: order }));
    }
};

export const getProducts = () => api.get('/products');
export const getProductById = (id) => api.get(`/products/${id}`);
export const getCategories = () => api.get('/categories');
export const getCategoryById = (id) => api.get(`/categories/${id}`);

export const getCart = (userId) => api.get(`/cart/${userId}`);
export const addToCart = async (productId, quantity = 1) => {
    const response = await api.post('/cart/add', { productId, quantity }, { skipAuthRedirect: true });
    emitCartChanged(response.data);
    return response;
};
export const updateCartItem = async (id, quantity) => {
    const response = await api.put(`/cart-items/${id}`, { quantity }, { skipAuthRedirect: true });
    emitCartChanged(response.data);
    return response;
};
export const deleteCartItem = async (id) => {
    const response = await api.delete(`/cart-items/${id}`, { skipAuthRedirect: true });
    emitCartChanged();
    return response;
};

export const checkout = async (payload) => {
    const response = await api.post('/orders/checkout', payload, { skipAuthRedirect: true });
    emitCartChanged({ items: [] });
    emitOrdersChanged(response.data);
    return response;
};
export const getOrders = () => api.get('/orders', { skipAuthRedirect: true });
export const getOrderById = (id) => api.get(`/orders/${id}`, { skipAuthRedirect: true });
export const cancelOrder = async (id) => {
    const response = await api.put(`/orders/${id}/cancel`, {}, { skipAuthRedirect: true });
    emitOrdersChanged(response.data);
    return response;
};
export const returnOrder = async (id) => {
    const response = await api.put(`/orders/${id}/return`, {}, { skipAuthRedirect: true });
    emitOrdersChanged(response.data);
    return response;
};
export const getChatContacts = () => api.get('/messages/contacts', { skipAuthRedirect: true });
export const getConversation = (userId) => api.get(`/messages/conversation/${userId}`, { skipAuthRedirect: true });
export const sendChatMessage = (payload) => api.post('/messages', payload, { skipAuthRedirect: true });
export const getManageVouchers = () => api.get('/vouchers/manage', { skipAuthRedirect: true });
export const createVoucher = (payload) => api.post('/vouchers', payload, { skipAuthRedirect: true });
export const updateVoucher = (id, payload) => api.put(`/vouchers/${id}`, payload, { skipAuthRedirect: true });
export const deleteVoucher = (id) => api.delete(`/vouchers/${id}`, { skipAuthRedirect: true });
export const getAvailableVouchers = (subtotal) =>
    api.get('/vouchers/available', { params: { subtotal }, skipAuthRedirect: true });

export const getReviewsByProduct = (productId) => api.get(`/reviews/product/${productId}`);
export const getReviewEligibility = (productId) =>
    api.get(`/reviews/product/${productId}/eligibility`, { skipAuthRedirect: true });
export const createReview = (payload) => api.post('/reviews', payload, { skipAuthRedirect: true });
