import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env, isDevelopment } from './config/env';
import { prisma } from './config/database';
import passport from './config/passport';
import authRoutes from './routes/auth';
import ticketRoutes from './routes/tickets';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Create Express application
const app = express();

// Trust proxy (for rate limiting and IP detection behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalRateLimit);

// Request logging
if (isDevelopment()) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Passport
app.use(passport.initialize());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Server is unhealthy',
      error: 'Database connection failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// API version info
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Power CRM API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: {
        base: '/api/auth',
        routes: ['POST /login', 'POST /verify', 'GET /profile', 'POST /refresh', 'POST /logout', 'GET /me']
      },
      tickets: {
        base: '/api/tickets',
        routes: ['GET /', 'POST /', 'GET /:id', 'PUT /:id', 'PUT /:id/status', 'DELETE /:id', 'GET /:id/history', 'GET /stats']
      },
      users: '/api/users (coming soon)',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

// Future routes (placeholders)
// app.use('/api/users', userRoutes);

// Handle 404 for unknown routes
app.use(notFoundHandler);

// Global error handler (should be last)
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  // Close database connection
  await prisma.$disconnect();

  // Exit process
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Start the server
    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT}`);
      console.log(`📱 Environment: ${env.NODE_ENV}`);
      console.log(`🌐 API URL: http://localhost:${env.PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${env.PORT}/health`);

      if (isDevelopment()) {
        console.log(`📊 Prisma Studio: npx prisma studio`);
      }
    });

    // Graceful shutdown when server closes
    server.on('close', async () => {
      await prisma.$disconnect();
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();

export default app;
