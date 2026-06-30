export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  
  if (err.code === '23505') {
    // Unique constraint violation
    return res.status(409).json({ error: 'Email already registered' });
  }
  
  if (err.message.includes('Invalid or expired token')) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  res.status(500).json({ 
    error: err.message || 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
};
