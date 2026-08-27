import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({ baseURL: API });

export const getProducts = (params = {}) =>
  client.get("/products", { params }).then((r) => r.data);

export const getProduct = (slug) =>
  client.get(`/products/${slug}`).then((r) => r.data);

export const getCategories = () =>
  client.get("/categories").then((r) => r.data);

export const predictiveSearch = (q) =>
  client.get("/search", { params: { q } }).then((r) => r.data);

export const getCart = (cartId) =>
  client.get(`/cart/${cartId}`).then((r) => r.data);

export const addCartItem = (cartId, payload) =>
  client.post(`/cart/${cartId}/items`, payload).then((r) => r.data);

export const updateCartItem = (cartId, itemId, quantity) =>
  client.put(`/cart/${cartId}/items/${itemId}`, { quantity }).then((r) => r.data);

export const removeCartItem = (cartId, itemId) =>
  client.delete(`/cart/${cartId}/items/${itemId}`).then((r) => r.data);

export const subscribeNewsletter = (email) =>
  client.post("/newsletter", { email }).then((r) => r.data);

export const sendContact = (payload) =>
  client.post("/contact", payload).then((r) => r.data);

export const checkout = (payload) =>
  client.post("/checkout", payload).then((r) => r.data);

export const getOrder = (orderNo) =>
  client.get(`/orders/${orderNo}`).then((r) => r.data);

export default client;
