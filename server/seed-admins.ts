import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

export async function seedAdmins() {
  try {
    const adminFilePath = path.join(process.cwd(), "admin-accounts.json");
    
    if (!fs.existsSync(adminFilePath)) {
      return;
    }

    const adminAccounts = JSON.parse(fs.readFileSync(adminFilePath, "utf8"));

    for (const admin of adminAccounts) {
      const existing = await db.query.users.findFirst({
        where: eq(users.username, admin.username),
      });

      if (!existing) {
        await db.insert(users).values(admin);
        console.log(`✓ Created admin account: ${admin.username}`);
      }
    }
  } catch (error) {
    console.log("Admin seed skipped (file not found or already exists)");
  }
}
