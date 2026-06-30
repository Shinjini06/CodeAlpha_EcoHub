import express from 'express';
import { createOrder, addOrderItem, getUserOrders, getOrderById, getProductById, decreaseProductStock } from '../db/queries.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ============ CREATE NEW ORDER ============
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    const userId = req.user.id;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    // Calculate total and check stock
    let totalPrice = 0;
    for (const item of items) {
      const product = await getProductById(item.productId);
      
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      totalPrice += product.price * item.quantity;
    }

    // Create order
    const order = await createOrder(userId, totalPrice, shippingAddress);

    // Add order items and decrease stock
    for (const item of items) {
      const product = await getProductById(item.productId);
      await addOrderItem(order.id, item.productId, item.quantity, product.price);
      await decreaseProductStock(item.productId, item.quantity);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        totalPrice
      }
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Server error creating order' });
  }
});

// ============ GET USER'S ORDERS ============
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await getUserOrders(userId);

    res.json({
      count: orders.length,
      orders
    });
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

// ============ GET SINGLE ORDER ============
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const order = await getOrderById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user owns this order (optional but recommended for security)
    if (order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    res.json({ order });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ error: 'Server error fetching order' });
  }
});

export default router;
