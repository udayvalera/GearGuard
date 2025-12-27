import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import rbacRoutes from './routes/rbac.routes.js';
import equipmentRoutes from './routes/equipment.routes.js'; // 👈 Added

dotenv.config();

const app = express();
const apiVersion = '/api/v1';

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use(`${apiVersion}/auth`, authRoutes);
app.use(`${apiVersion}/rbac`, rbacRoutes);
app.use(`${apiVersion}/equipment`, equipmentRoutes); // 👈 Mount RBAC routes

// Health Check
app.get('/', (req: Request, res: Response) => {
  res.send('GearGuard API is running...');
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err.message);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Endpoint: http://localhost:${PORT}${apiVersion}`);
});