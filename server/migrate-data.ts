import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { readFileSync } from 'fs';
import bcrypt from 'bcryptjs';

// Configure Neon for serverless
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

async function migrateData() {
  try {
    console.log('Starting data migration...');

    // Read JSON files
    const usersData = JSON.parse(readFileSync('/tmp/users.json', 'utf-8'));
    const gamesData = JSON.parse(readFileSync('/tmp/games.json', 'utf-8'));
    const commentsData = JSON.parse(readFileSync('/tmp/comments.json', 'utf-8'));
    const threadsData = JSON.parse(readFileSync('/tmp/threads.json', 'utf-8'));
    const threadMessagesData = JSON.parse(readFileSync('/tmp/thread_messages.json', 'utf-8'));
    const requestsData = JSON.parse(readFileSync('/tmp/requests.json', 'utf-8'));

    // Migrate Users
    console.log('Migrating users...');
    const userIdMap = new Map<number, string>();
    
    for (const user of usersData) {
      const [newUser] = await db.insert(schema.users).values({
        username: user.username,
        email: user.username + '@steamtools.local', // Generate email if not present
        password: user.password, // Already hashed
        role: user.role,
        avatar: user.avatar || '🎮',
        bio: user.bio,
        theme: user.theme || 'dark',
      }).returning();
      
      userIdMap.set(user.id, newUser.id);
      console.log(`Migrated user: ${user.username}`);
    }

    // Migrate Games
    console.log('Migrating games...');
    const gameIdMap = new Map<number, string>();
    
    for (const game of gamesData) {
      // Find uploader user ID
      const uploaderOldId = usersData.find((u: any) => u.username === game.added_by)?.id;
      const uploaderId = uploaderOldId ? userIdMap.get(uploaderOldId) : undefined;

      const [newGame] = await db.insert(schema.games).values({
        title: game.title,
        description: game.full_description || game.short_description || 'No description available',
        shortDescription: game.short_description,
        genre: game.genre || 'Action',
        imageUrl: game.image,
        downloadUrl: game.download_link,
        steamId: game.id?.toString(),
        minRequirements: game.requirements,
        verified: true,
        featured: false,
        uploaderId: uploaderId,
      }).returning();
      
      gameIdMap.set(game.id, newGame.id);
      console.log(`Migrated game: ${game.title}`);
    }

    // Migrate Comments
    if (commentsData && commentsData.length > 0) {
      console.log('Migrating comments...');
      for (const comment of commentsData) {
        const userId = userIdMap.get(comment.user_id);
        const gameId = gameIdMap.get(comment.game_id);
        
        if (userId && gameId) {
          await db.insert(schema.comments).values({
            content: comment.content,
            gameId: gameId,
            userId: userId,
            likes: comment.likes || 0,
          });
        }
      }
      console.log(`Migrated ${commentsData.length} comments`);
    }

    // Migrate Threads
    if (threadsData && threadsData.length > 0) {
      console.log('Migrating threads...');
      const threadIdMap = new Map<number, string>();
      
      for (const thread of threadsData) {
        const userId = userIdMap.get(thread.user_id);
        const gameId = thread.game_id ? gameIdMap.get(thread.game_id) : undefined;
        
        if (userId) {
          const [newThread] = await db.insert(schema.threads).values({
            title: thread.title,
            gameId: gameId,
            userId: userId,
          }).returning();
          
          threadIdMap.set(thread.id, newThread.id);
        }
      }
      console.log(`Migrated ${threadsData.length} threads`);

      // Migrate Thread Messages
      if (threadMessagesData && threadMessagesData.length > 0) {
        console.log('Migrating thread messages...');
        for (const message of threadMessagesData) {
          const userId = userIdMap.get(message.user_id);
          const threadId = threadIdMap.get(message.thread_id);
          
          if (userId && threadId) {
            await db.insert(schema.threadMessages).values({
              content: message.content,
              threadId: threadId,
              userId: userId,
            });
          }
        }
        console.log(`Migrated ${threadMessagesData.length} thread messages`);
      }
    }

    // Migrate Requests
    if (requestsData && requestsData.length > 0) {
      console.log('Migrating requests...');
      for (const request of requestsData) {
        const userId = userIdMap.get(request.user_id);
        
        if (userId) {
          await db.insert(schema.requests).values({
            gameName: request.game_name,
            steamId: request.steam_id,
            description: request.description,
            userId: userId,
            status: request.status || 'pending',
          });
        }
      }
      console.log(`Migrated ${requestsData.length} requests`);
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateData();
