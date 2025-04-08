import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

// Import routes
import leetcodeRoutes from './routes/leetcode.routes.js';

const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow requests from any origin that includes credentials
  credentials: true,
  allowedHeaders: ['Content-Type', 'x-csrftoken', 'Cookie', 'Origin', 'Referer', 'User-Agent'],
  exposedHeaders: ['set-cookie'],
  methods: ['GET', 'POST', 'OPTIONS']
}));
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 5000;

// Routes
app.use('/api/leetcode', leetcodeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the Server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));