import pool from '../../config/db.js';

class CarRepository {
  async findAll(filters = {}) {
    const { 
      page = 1, 
      limit = 10, 
      brand, 
      model, 
      minPrice, 
      maxPrice, 
      location, 
      available 
    } = filters;

    const offset = (page - 1) * limit;
    const values = [];
    let query = 'SELECT * FROM cars WHERE 1=1';

    if (brand) {
      values.push(`%${brand}%`);
      query += ` AND brand ILIKE $${values.length}`;
    }
    if (model) {
      values.push(`%${model}%`);
      query += ` AND model ILIKE $${values.length}`;
    }
    if (location) {
      values.push(`%${location}%`);
      query += ` AND location ILIKE $${values.length}`;
    }
    if (minPrice) {
      values.push(minPrice);
      query += ` AND price_per_day >= $${values.length}`;
    }
    if (maxPrice) {
      values.push(maxPrice);
      query += ` AND price_per_day <= $${values.length}`;
    }
    if (available !== undefined) {
      values.push(available);
      query += ` AND is_available = $${values.length}`;
    }

    // Add sorting and pagination
    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    // Get total count for pagination metadata
    const countResult = await pool.query('SELECT COUNT(*) FROM cars');
    const total = parseInt(countResult.rows[0].count);

    return {
      cars: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM cars WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async create(carData) {
    const { owner_id, brand, model, year, price_per_day, location, image_url } = carData;
    const result = await pool.query(
      'INSERT INTO cars (owner_id, brand, model, year, price_per_day, location, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [owner_id, brand, model, year, price_per_day, location, image_url]
    );
    return result.rows[0];
  }

  async update(id, carData) {
    const { brand, model, year, price_per_day, location, is_available, image_url } = carData;
    const result = await pool.query(
      `UPDATE cars SET 
        brand = COALESCE($1, brand), 
        model = COALESCE($2, model), 
        year = COALESCE($3, year), 
        price_per_day = COALESCE($4, price_per_day), 
        location = COALESCE($5, location), 
        is_available = COALESCE($6, is_available),
        image_url = COALESCE($7, image_url),
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = $8 RETURNING *`,
      [brand, model, year, price_per_day, location, is_available, image_url, id]
    );
    return result.rows[0];
  }

  async delete(id) {
    await pool.query('DELETE FROM cars WHERE id = $1', [id]);
  }
}

export default new CarRepository();
