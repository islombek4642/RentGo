import pool from '../config/db.js';

/**
 * Idempotency Middleware
 * Prevents duplicate POST/PATCH requests (e.g., double booking)
 * Client sends header: X-Idempotency-Key: <unique-key>
 */
export const idempotency = async (req, res, next) => {
  const key = req.headers['x-idempotency-key'];
  if (!key) return next(); // No key = skip

  try {
    const existing = await pool.query(
      'SELECT response_code, response_body FROM idempotency_keys WHERE key = $1',
      [key]
    );

    if (existing.rows[0]) {
      const { response_code, response_body } = existing.rows[0];
      return res.status(response_code).json(response_body);
    }

    // Override res.json to capture the response
    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      try {
        await pool.query(
          'INSERT INTO idempotency_keys (key, user_id, response_code, response_body) VALUES ($1, $2, $3, $4) ON CONFLICT (key) DO NOTHING',
          [key, req.user?.id || 'anonymous', res.statusCode, JSON.stringify(body)]
        );
      } catch (err) {
        // Don't block response on cache failure
      }
      return originalJson(body);
    };

    next();
  } catch (error) {
    next(); // On DB error, skip idempotency (fail-open)
  }
};
