import request from 'supertest';
import app from '../src/app.js';
import { createTestUser, createTestCar, createTestBooking } from './helpers.js';

describe('Bookings Module', () => {
  let token;
  let user;
  let car;

  beforeEach(async () => {
    user = await createTestUser();
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ phone: user.phone, password: user.plainPassword });
    token = loginRes.body.data.tokens.accessToken;
    
    // Create an owner for the car
    const owner = await createTestUser({ phone: '+998901111111' });
    car = await createTestCar(owner.id);
  });

  describe('POST /api/v1/bookings', () => {
    it('should create a new booking successfully', async () => {
      const bookingData = {
        car_id: car.id,
        start_date: '2026-12-01',
        end_date: '2026-12-05'
      };

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.booking.car_id).toBe(car.id);
    });

    it('should fail if dates overlap with an existing booking', async () => {
      // Create existing booking: Dec 10 to Dec 15
      await createTestBooking(car.id, user.id, {
        start_date: '2026-12-10',
        end_date: '2026-12-15'
      });

      // Try to book overlapping: Dec 12 to Dec 17
      const overlappingData = {
        car_id: car.id,
        start_date: '2026-12-12',
        end_date: '2026-12-17'
      };

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(overlappingData);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('should fail if car is not available', async () => {
       // Set car availability to false
       const owner = await createTestUser({ phone: '+998902222222' });
       const unavailableCar = await createTestCar(owner.id, { is_available: false });

       const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          car_id: unavailableCar.id,
          start_date: '2026-11-01',
          end_date: '2026-11-05'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/bookings/my', () => {
    it('should list user bookings', async () => {
      await createTestBooking(car.id, user.id);

      const res = await request(app)
        .get('/api/v1/bookings/my')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.bookings).toBeInstanceOf(Array);
      expect(res.body.results).toBeGreaterThan(0);
    });
  });
});
