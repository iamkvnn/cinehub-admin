import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import { env } from './config/env';
import { AppDataSource } from './config/data-source';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { errorConverter, errorHandler } from './middlewares/error.middleware';
import { ApiError } from './utils/ApiError';
import { SocketService } from './websocket/socket';

const app = express();
const httpServer = createServer(app);

// Middlewares
app.use(helmet());
app.use(cors({ origin: env.cors.origin }));
app.use(express.json());
app.use(morgan('dev'));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/v1', routes);

// 404 Handler
app.use((req, res, next) => {
  next(new ApiError(404, 'Not found'));
});

// Error Handler
app.use(errorConverter);
app.use(errorHandler);

// Initialize Database and Server
AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');

    // Initialize Socket.IO
    SocketService.getInstance().init(httpServer);

    httpServer.listen(env.port, () => {
      console.log(`Server is running on port ${env.port}`);
    });
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
