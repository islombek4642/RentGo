import pool from '../../config/db.js';

class CarRepository {
  async findAll(filters = {}) {
    const { 
      page = 1, 
      limit = 10, 
      search,
      minPrice,
      maxPrice,
      location,
      region_id,
      district_id,
      available 
    } = filters;

    const offset = (page - 1) * limit;
    const values = [];
    let query = `
      SELECT c.*, 
             r.name_uz as region_name_uz, r.name_ru as region_name_ru, r.name_oz as region_name_oz,
             d.name_uz as district_name_uz, d.name_ru as district_name_ru, d.name_oz as district_name_oz
      FROM cars c
      LEFT JOIN regions r ON c.region_id = r.id
      LEFT JOIN districts d ON c.district_id = d.id
      WHERE 1=1
    `;

    if (search) {
      values.push(`%${search}%`);
      query += ` AND (c.brand ILIKE $${values.length} OR c.model ILIKE $${values.length})`;
    }
    if (location) {
      values.push(`%${location}%`);
      query += ` AND c.location ILIKE $${values.length}`;
    }
    if (region_id) {
      values.push(region_id);
      query += ` AND c.region_id = $${values.length}`;
    }
    if (district_id) {
      values.push(district_id);
      query += ` AND c.district_id = $${values.length}`;
    }
    if (minPrice) {
      values.push(minPrice);
      query += ` AND c.price_per_day >= $${values.length}`;
    }
    if (maxPrice) {
      values.push(maxPrice);
      query += ` AND c.price_per_day <= $${values.length}`;
    }
    if (available !== undefined) {
      values.push(available);
      query += ` AND c.is_available = $${values.length}`;
    }

    // Add sorting and pagination
    query += ` ORDER BY c.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
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
    const result = await pool.query(`
      SELECT c.*, 
             r.name_uz as region_name_uz, r.name_ru as region_name_ru, r.name_oz as region_name_oz,
             d.name_uz as district_name_uz, d.name_ru as district_name_ru, d.name_oz as district_name_oz
      FROM cars c
      LEFT JOIN regions r ON c.region_id = r.id
      LEFT JOIN districts d ON c.district_id = d.id
      WHERE c.id = $1
    `, [id]);
    return result.rows[0];
  }

  async create(carData) {
    const { owner_id, brand, model, year, price_per_day, location, region_id, district_id, image_url } = carData;
    const result = await pool.query(
      'INSERT INTO cars (owner_id, brand, model, year, price_per_day, location, region_id, district_id, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [owner_id, brand, model, year, price_per_day, location, region_id, district_id, image_url]
    );
    return result.rows[0];
  }

  async update(id, carData) {
    const { brand, model, year, price_per_day, location, region_id, district_id, is_available, image_url } = carData;
    const result = await pool.query(
      `UPDATE cars SET 
        brand = COALESCE($1, brand), 
        model = COALESCE($2, model), 
        year = COALESCE($3, year), 
        price_per_day = COALESCE($4, price_per_day), 
        location = COALESCE($5, location), 
        region_id = $6,
        district_id = $7,
        is_available = COALESCE($8, is_available),
        image_url = COALESCE($9, image_url),
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = $10 RETURNING *`,
      [brand, model, year, price_per_day, location, region_id, district_id, is_available, image_url, id]
    );
    // Note: for region_id/district_id we don't COALESCE because they might be intentionally set to null if needed, 
    // though for new flow they should be present.
    return result.rows[0];
  }

  async delete(id) {
    await pool.query('DELETE FROM cars WHERE id = $1', [id]);
  }

  async findAllByOwner(ownerId) {
    const result = await pool.query(`
      SELECT c.*, 
             r.name_uz as region_name_uz, r.name_ru as region_name_ru, r.name_oz as region_name_oz,
             d.name_uz as district_name_uz, d.name_ru as district_name_ru, d.name_oz as district_name_oz
      FROM cars c
      LEFT JOIN regions r ON c.region_id = r.id
      LEFT JOIN districts d ON c.district_id = d.id
      WHERE c.owner_id = $1 
      ORDER BY c.created_at DESC
    `, [ownerId]);
    return result.rows;
  }
}

export default new CarRepository();
