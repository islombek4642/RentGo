import request from 'supertest';
import app from '../src/app.js';
import { createTestUser, createTestCar } from './helpers.js';

describe('Cars Module', () => {
  let token;
  let user;

  beforeEach(async () => {
    user = await createTestUser();
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ phone: user.phone, password: user.plainPassword });
    token = loginRes.body.data.tokens.accessToken;
  });

  describe('POST /api/v1/cars', () => {
    it('should create a new car successfully', async () => {
      const carData = {
        brand: 'Byd',
        model: 'Song Plus',
        year: 2024,
        price_per_day: 700000,
        location: 'Tashkent'
      };

      const res = await request(app)
        .post('/api/v1/cars')
        .set('Authorization', `Bearer ${token}`)
        .send(carData);

      expect(res.status).toBe(201);
      expect(res.body.data.car.brand).toBe(carData.brand);
      expect(res.body.data.car.owner_id).toBe(user.id);
    });

    it('should fail if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/cars')
        .set('Authorization', `Bearer ${token}`)
        .send({ brand: 'Test' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/cars', () => {
    it('should list all cars with pagination', async () => {
      await createTestCar(user.id);
      
      const res = await request(app).get('/api/v1/cars');
      
      expect(res.status).toBe(200);
      expect(res.body.data.cars).toBeInstanceOf(Array);
      expect(res.body.data.pagination).toHaveProperty('total');
    });
  });

  describe('DELETE /api/v1/cars/:id', () => {
    it('should delete a car (owner only)', async () => {
      const car = await createTestCar(user.id);
      
      const res = await request(app)
        .delete(`/api/v1/cars/${car.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(204);
    });

    it('should fail if non-owner tries to delete', async () => {
      const otherUser = await createTestUser({ phone: '+998909999999' });
      const car = await createTestCar(otherUser.id);
      
      const res = await request(app)
        .delete(`/api/v1/cars/${car.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });
});
