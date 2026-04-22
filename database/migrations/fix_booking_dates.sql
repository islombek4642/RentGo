-- Migration: Fix Booking Date Logic
-- Date: 2026-04-22
-- Description: Fixes zero-day bookings and updates the check constraint
--              to enforce half-open interval model [start_date, end_date)

-- 1) Find and fix zero-day bookings (start_date = end_date)
-- Set end_date to start_date + 1 day (minimum 1-day booking)
UPDATE bookings
SET end_date = start_date + INTERVAL '1 day',
    total_price = (
      SELECT c.price_per_day
      FROM cars c
      WHERE c.id = bookings.car_id
    ),
    updated_at = CURRENT_TIMESTAMP
WHERE start_date = end_date;

-- 2) Drop the old constraint and add the corrected one
-- The old constraint allowed end_date = start_date (zero-day bookings)
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS check_dates;
ALTER TABLE bookings ADD CONSTRAINT check_dates CHECK (end_date > start_date);

-- 3) Verify: no zero-day bookings should remain
-- SELECT id, car_id, start_date, end_date FROM bookings WHERE start_date >= end_date;
