import fs from 'fs';
import path from 'path';
import pool from '../src/config/db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyMigration() {
  try {
    console.log('Reading migration file...');
    const sql = fs.readFileSync(path.join(__dirname, '../database/advanced_security_migration.sql'), 'utf8');
    
    console.log('Applying migration to database...');
    await pool.query(sql);
    
    console.log('Migration applied successfully! ✅');
    process.exit(0);
  } catch (error) {
    console.error('Error applying migration: ❌', error);
    process.exit(1);
  }
}

applyMigration();
