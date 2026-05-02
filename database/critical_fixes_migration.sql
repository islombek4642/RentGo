-- 1. Fix Phone Conflict: Partial unique index
-- Drop the constraint instead of the index directly
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_key;

-- Now create the partial unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_unique_active ON users(phone) WHERE deleted_at IS NULL;

-- 2. Performance: Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_cars_region_id ON cars(region_id);
CREATE INDEX IF NOT EXISTS idx_cars_district_id ON cars(district_id);

-- 3. Additional consistency indexes
CREATE INDEX IF NOT EXISTS idx_bookings_car_dates ON bookings(car_id, start_date, end_date) WHERE status IN ('pending', 'confirmed', 'in_progress');
