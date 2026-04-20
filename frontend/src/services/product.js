import api from './Api';

export const getProducts = () => {
    return api.get('/products');
};

export const getProductById = (id) => {
    return api.get(`/products/${id}`);
};

export const createProduct = (data) => {
    return api.post('/products', data);
};

export const updateProduct = (id, data) => {
    return api.put(`/products/${id}`, data);
};

export const deleteProduct = (id) => {
    return api.delete(`/products/${id}`);
};

export const getCategories = () => {
    return api.get('/categories');
};

export const getCategoryById = (id) => {
    return api.get(`/categories/${id}`);
};

export const createCategory = (data) => {
    return api.post('/categories', data);
};

export const updateCategory = (id, data) => {
    return api.put(`/categories/${id}`, data);
};

export const deleteCategory = (id) => {
    return api.delete(`/categories/${id}`);
};