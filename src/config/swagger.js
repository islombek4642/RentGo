import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from './env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RentGo API',
      version: '1.0.0',
      description:
        'The official API documentation for RentGo — Car Rental Marketplace in Uzbekistan.\n\nAll protected endpoints require a Bearer JWT token in the Authorization header.\nUse the `/auth/login` endpoint to obtain tokens.',
      contact: {
        name: 'RentGo Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/v1`,
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication & token management' },
      { name: 'Users', description: 'User profile operations' },
      { name: 'Cars', description: 'Car listing & management' },
      { name: 'Bookings', description: 'Booking operations' },
      { name: 'System', description: 'Health checks & system info' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your access token obtained from /auth/login',
        },
      },
      schemas: {
        // ─── User ─────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            },
            name: { type: 'string', example: 'Islombek' },
            phone: { type: 'string', example: '+998901234567' },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              example: 'user',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-04-17T15:00:00.000Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-04-17T15:00:00.000Z',
            },
          },
        },

        // ─── Car ──────────────────────────────────────────
        Car: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
            },
            owner_id: {
              type: 'string',
              format: 'uuid',
              example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            },
            brand: { type: 'string', example: 'Chevrolet' },
            model: { type: 'string', example: 'Malibu' },
            year: { type: 'integer', example: 2023 },
            price_per_day: { type: 'number', format: 'float', example: 500000 },
            location: { type: 'string', example: 'Tashkent' },
            is_available: { type: 'boolean', example: true },
            image_url: {
              type: 'string',
              nullable: true,
              example: 'uploads/car-image.jpg',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-04-17T15:00:00.000Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-04-17T15:00:00.000Z',
            },
          },
        },

        // ─── Booking ──────────────────────────────────────
        Booking: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
            },
            car_id: {
              type: 'string',
              format: 'uuid',
              example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
            },
            user_id: {
              type: 'string',
              format: 'uuid',
              example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            },
            start_date: {
              type: 'string',
              format: 'date',
              example: '2026-05-01',
            },
            end_date: {
              type: 'string',
              format: 'date',
              example: '2026-05-05',
            },
            total_price: { type: 'number', format: 'float', example: 2500000 },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'cancelled', 'completed'],
              example: 'pending',
            },
            brand: {
              type: 'string',
              description: 'Joined from cars table (in list responses)',
              example: 'Chevrolet',
            },
            model: {
              type: 'string',
              description: 'Joined from cars table (in list responses)',
              example: 'Malibu',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-04-17T15:00:00.000Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-04-17T15:00:00.000Z',
            },
          },
        },

        // ─── Token Pair ───────────────────────────────────
        TokenPair: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },

        // ─── Auth Response ────────────────────────────────
        AuthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string', example: 'Tizimga muvaffaqiyatli kirdingiz' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                tokens: { $ref: '#/components/schemas/TokenPair' },
              },
            },
          },
        },

        // ─── Pagination ───────────────────────────────────
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 25 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            totalPages: { type: 'integer', example: 3 },
          },
        },

        // ─── Error Response ───────────────────────────────
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'fail' },
            message: {
              type: 'string',
              example: 'Validation error or descriptive message',
            },
          },
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.js', './src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'RentGo API Docs',
  }));

  // Also expose swagger spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};
