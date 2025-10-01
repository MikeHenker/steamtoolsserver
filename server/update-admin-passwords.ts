import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import ws from "ws";
import * as schema from "@shared/schema";
import bcrypt from 'bcryptjs';

// Configure Neon for serverless
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

async function updatePasswords() {
  try {
    console.log('Updating admin passwords...');

    // Update jupiter password
    const jupiterHash = await bcrypt.hash('jupitery', 10);
    await db.update(schema.users)
      .set({ password: jupiterHash, role: 'admin' })
      .where(eq(schema.users.username, 'jupiter'));
    console.log('Updated jupiter password');

    // Update malte password and set as admin
    const malteHash = await bcrypt.hash('maltese21', 10);
    await db.update(schema.users)
      .set({ password: malteHash, role: 'admin' })
      .where(eq(schema.users.username, 'malte'));
    console.log('Updated malte password and set as admin');

    // Update khaedus password
    const khaedusHash = await bcrypt.hash('coolgang27', 10);
    await db.update(schema.users)
      .set({ password: khaedusHash, role: 'admin' })
      .where(eq(schema.users.username, 'khaedus'));
    console.log('Updated khaedus password');

    console.log('All admin passwords updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Password update failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updatePasswords();
