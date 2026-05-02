-- Optimized indexes for production
CREATE INDEX IF NOT EXISTS idx_cars_status_owner ON cars(status, owner_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_status_user ON bookings(status, user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_status_car ON bookings(status, car_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_target_id_soft ON reviews(target_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_user ON audit_logs(action, user_id);
CREATE INDEX IF NOT EXISTS idx_users_phone_soft ON users(phone) WHERE deleted_at IS NULL;
