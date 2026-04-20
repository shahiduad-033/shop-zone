// src/services/orderService.js

import {
  saveToStorage,
  loadFromStorage,
  STORAGE_KEYS,
} from '../utils/storage';

/*
 * orderService manages all CRUD operations for orders.
 *
 * In a production app these would be API calls:
 *   POST /api/orders       → createOrder
 *   GET  /api/orders/mine  → getUserOrders
 *
 * Here we use localStorage as the backend so the entire
 * flow works end-to-end without a real server.
 */

const orderService = {

  // ── CREATE ────────────────────────────────────────────────────────
  /**
   * Saves a new order and returns it with a generated ID.
   *
   * @param {Object} orderData
   *   cartItems, shippingInfo, totalPrice, userId, etc.
   * @returns {Object} savedOrder — includes id, createdAt, status
   */
  createOrder(orderData) {
    const existing = this.getAllOrders();

    const newOrder = {
      // ── Identity ──────────────────────────────────────────────
      id:          `ORD-${Date.now().toString().slice(-8)}`,
      createdAt:   new Date().toISOString(),

      // ── Status lifecycle ──────────────────────────────────────
      // pending → processing → shipped → delivered
      status:      'processing',

      // ── Spread everything passed in ───────────────────────────
      ...orderData,
    };

    // Prepend so newest orders appear first
    const updated = [newOrder, ...existing];
    saveToStorage(STORAGE_KEYS.ORDERS, updated);

    return newOrder;
  },

  // ── READ ALL (admin / debug) ──────────────────────────────────────
  /**
   * Returns every order stored in localStorage.
   */
  getAllOrders() {
    return loadFromStorage(STORAGE_KEYS.ORDERS, []);
  },

  // ── READ BY USER ──────────────────────────────────────────────────
  /**
   * Returns only the orders that belong to a specific user.
   * Matched by userId OR email (handles guest→registered transition).
   *
   * @param {string} userId
   * @param {string} email
   */
  getUserOrders(userId, email) {
    const all = this.getAllOrders();
    return all.filter(
      (o) =>
        (userId && o.userId === userId) ||
        (email  && o.userEmail === email)
    );
  },

  // ── READ SINGLE ───────────────────────────────────────────────────
  getOrderById(orderId) {
    return this.getAllOrders().find((o) => o.id === orderId) || null;
  },

  // ── UPDATE STATUS ─────────────────────────────────────────────────
  /**
   * Updates the status of a single order.
   * Used to simulate order progress (processing → shipped → delivered).
   */
  updateOrderStatus(orderId, status) {
    const all     = this.getAllOrders();
    const updated = all.map((o) =>
      o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
    );
    saveToStorage(STORAGE_KEYS.ORDERS, updated);
    return updated.find((o) => o.id === orderId);
  },

  // ── DELETE ────────────────────────────────────────────────────────
  deleteOrder(orderId) {
    const filtered = this.getAllOrders().filter((o) => o.id !== orderId);
    saveToStorage(STORAGE_KEYS.ORDERS, filtered);
  },

  // ── STATS ─────────────────────────────────────────────────────────
  /**
   * Returns aggregated statistics for a user's orders.
   * Used by the Dashboard summary cards.
   */
  getUserStats(userId, email) {
    const orders = this.getUserOrders(userId, email);

    return orders.reduce(
      (acc, order) => ({
        totalOrders:   acc.totalOrders   + 1,
        totalSpent:    acc.totalSpent    + (order.grandTotal || 0),
        totalItems:    acc.totalItems    + (order.itemCount  || 0),
        // Count by status
        delivered:     acc.delivered  + (order.status === 'delivered'  ? 1 : 0),
        processing:    acc.processing + (order.status === 'processing' ? 1 : 0),
        shipped:       acc.shipped    + (order.status === 'shipped'    ? 1 : 0),
      }),
      {
        totalOrders: 0, totalSpent: 0, totalItems: 0,
        delivered: 0,   processing: 0, shipped: 0,
      }
    );
  },

  // ── ESTIMATED DELIVERY ────────────────────────────────────────────
  /**
   * Returns a human-readable estimated delivery date.
   * Free shipping → 3 days, standard → 5 days.
   */
  getEstimatedDelivery(isFreeShipping = false) {
    const date = new Date();
    date.setDate(date.getDate() + (isFreeShipping ? 3 : 5));
    return date.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });
  },
};

export default orderService;