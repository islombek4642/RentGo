import request from 'supertest';
import app from '../src/app.js';
import { createTestUser } from './helpers.js';

describe('Auth Module', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        phone: '+998901112233',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.phone).toBe(userData.phone);
      expect(res.body.data.tokens).toHaveProperty('accessToken');
    });

    it('should fail if phone number is already registered', async () => {
      await createTestUser({ phone: '+998901112233' });

      const userData = {
        name: 'Jane Doe',
        phone: '+998901112233',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await createTestUser({ phone: '+998901234567', password: 'password123' });
    });

    it('should login successfully with correct credentials', async () => {
      const loginData = {
        phone: '+998901234567',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.tokens).toHaveProperty('accessToken');
    });

    it('should fail with incorrect password', async () => {
      const loginData = {
        phone: '+998901234567',
        password: 'wrongpassword'
      };

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData);

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('fail');
    });
  });
});
