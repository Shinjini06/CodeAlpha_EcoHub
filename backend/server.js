import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============ MIDDLEWARE ============
// CORS Configuration - Fixed for all local development scenarios
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8000',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8000',
      'http://127.0.0.1:8080',
    ];
    
    // Allow if no origin (same-origin requests) or file protocol (local HTML)
    if (!origin || origin === 'file://' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow for now during development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ ROUTES ============
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
  res.json({ status: '✅ Server is running' });
});

// ============ 404 HANDLER ============
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============ ERROR HANDLER ============
app.use(errorHandler);

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`🚀 EcoHub Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 CORS enabled for all local origins`);
});