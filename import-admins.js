import { Pool } from '@neondatabase/serverless';
import fs from 'fs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function importAdmins() {
  const admins = JSON.parse(fs.readFileSync('admin-accounts.json', 'utf8'));
  
  for (const admin of admins) {
    await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING',
      [admin.username, admin.email, admin.password, admin.role]
    );
    console.log(`✓ Imported admin: ${admin.username}`);
  }
  
  console.log('Admin import complete!');
  await pool.end();
}

importAdmins().catch(console.error);
