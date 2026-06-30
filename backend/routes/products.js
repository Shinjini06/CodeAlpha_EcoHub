import express from 'express';
import { getAllProducts, getProductById, getProductsByCategory } from '../db/queries.js';

const router = express.Router();

// ============ GET ALL PRODUCTS ============
router.get('/', async (req, res) => {
  try {
    const category = req.query.category;
    let products;

    if (category) {
      products = await getProductsByCategory(category);
    } else {
      products = await getAllProducts();
    }

    res.json({
      count: products.length,
      products
    });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Server error fetching products' });
  }
});

// ============ GET SINGLE PRODUCT ============
router.get('/:id', async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ error: 'Server error fetching product' });
  }
});

export default router;
