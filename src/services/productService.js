import api from './api';

const productService = {
  getAll:        ()     => api.get('/products').then((r) => r.data),
  getLimited:    (n)    => api.get(`/products?limit=${n}`).then((r) => r.data),
  getById:       (id)   => api.get(`/products/${id}`).then((r) => r.data),
  getByCategory: (cat)  => api.get(`/products/category/${encodeURIComponent(cat)}`).then((r) => r.data),
  getCategories: ()     => api.get('/products/categories').then((r) => r.data),
};

export default productService;
