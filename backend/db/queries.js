import { pool } from '../config/db.js';

// ============ USERS QUERIES ============

export const getUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

export const getUserById = async (id) => {
  const result = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

export const createUser = async (name, email, hashedPassword) => {
  const result = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
    [name, email, hashedPassword]
  );
  return result.rows[0];
};

// ============ PRODUCTS QUERIES ============

export const getAllProducts = async () => {
  const result = await pool.query(
    'SELECT id, name, category, price, stock, description, verified FROM products WHERE verified = true ORDER BY created_at DESC'
  );
  return result.rows;
};

export const getProductById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM products WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

export const getProductsByCategory = async (category) => {
  const result = await pool.query(
    'SELECT id, name, category, price, stock, description FROM products WHERE category = $1 AND verified = true',
    [category]
  );
  return result.rows;
};

export const decreaseProductStock = async (productId, quantity) => {
  const result = await pool.query(
    'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING stock',
    [quantity, productId]
  );
  return result.rows[0];
};

// ============ ORDERS QUERIES ============

export const createOrder = async (userId, totalPrice, shippingAddress) => {
  const orderNumber = `ORD-${Date.now()}`;
  const result = await pool.query(
    'INSERT INTO orders (order_number, user_id, total_price, status, shipping_address) VALUES ($1, $2, $3, $4, $5) RETURNING id, order_number, status',
    [orderNumber, userId, totalPrice, 'pending', shippingAddress]
  );
  return result.rows[0];
};

export const addOrderItem = async (orderId, productId, quantity, price) => {
  const result = await pool.query(
    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING id',
    [orderId, productId, quantity, price]
  );
  return result.rows[0];
};

export const getUserOrders = async (userId) => {
  const result = await pool.query(
    `SELECT o.id, o.order_number, o.total_price, o.status, o.created_at,
            json_agg(json_build_object('product_id', oi.product_id, 'quantity', oi.quantity, 'price', oi.price, 'name', p.name)) as items
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE o.user_id = $1
     GROUP BY o.id, o.order_number, o.total_price, o.status, o.created_at
     ORDER BY o.created_at DESC`,
    [userId]
  );
  return result.rows;
};

export const getOrderById = async (orderId) => {
  const result = await pool.query(
    `SELECT o.*, 
            json_agg(json_build_object('product_id', oi.product_id, 'quantity', oi.quantity, 'price', oi.price)) as items
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     WHERE o.id = $1
     GROUP BY o.id`,
    [orderId]
  );
  return result.rows[0];
};

// ============ ARTICLES QUERIES ============

export const getAllArticles = async () => {
  const result = await pool.query(
    'SELECT id, title, category, reading_time, created_at FROM articles WHERE published = true ORDER BY created_at DESC LIMIT 10'
  );
  return result.rows;
};

export const getArticleById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM articles WHERE id = $1 AND published = true',
    [id]
  );
  return result.rows[0];
};

// ============ SUBSCRIBERS QUERIES ============

export const subscribeToNewsletter = async (email) => {
  const result = await pool.query(
    'INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO UPDATE SET active = true RETURNING id',
    [email]
  );
  return result.rows[0];
};

export const getUserSubscriptionStatus = async (userId) => {
  const result = await pool.query(
    'SELECT newsletter_subscribed FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0];
};

export const updateUserSubscriptionStatus = async (userId, subscribed) => {
  const result = await pool.query(
    'UPDATE users SET newsletter_subscribed = $1 WHERE id = $2 RETURNING newsletter_subscribed',
    [subscribed, userId]
  );
  return result.rows[0];
};
