import {
  users,
  games,
  comments,
  commentLikes,
  threads,
  threadMessages,
  requests,
  favorites,
  ratings,
  announcements,
  type User,
  type InsertUser,
  type Game,
  type InsertGame,
  type Comment,
  type InsertComment,
  type Thread,
  type InsertThread,
  type ThreadMessage,
  type InsertThreadMessage,
  type Request as GameRequest,
  type InsertRequest,
  type Favorite,
  type InsertFavorite,
  type Rating,
  type InsertRating,
  type Announcement,
  type InsertAnnouncement,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User>;
  updateUserProfile(id: string, data: { avatar?: string; bio?: string; theme?: string }): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Games
  getAllGames(): Promise<Game[]>;
  getGame(id: string): Promise<Game | undefined>;
  getGamesByGenre(genre: string): Promise<Game[]>;
  getFeaturedGames(): Promise<Game[]>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: string, game: Partial<InsertGame>): Promise<Game>;
  deleteGame(id: string): Promise<void>;

  // Comments
  getCommentsByGame(gameId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: string, content: string): Promise<Comment>;
  deleteComment(id: string): Promise<void>;
  likeComment(commentId: string, userId: string): Promise<void>;
  unlikeComment(commentId: string, userId: string): Promise<void>;
  hasLikedComment(commentId: string, userId: string): Promise<boolean>;

  // Threads
  getAllThreads(): Promise<Thread[]>;
  getThread(id: string): Promise<Thread | undefined>;
  getThreadsByGame(gameId: string): Promise<Thread[]>;
  createThread(thread: InsertThread): Promise<Thread>;
  deleteThread(id: string): Promise<void>;

  // Thread Messages
  getMessagesByThread(threadId: string): Promise<ThreadMessage[]>;
  createThreadMessage(message: InsertThreadMessage): Promise<ThreadMessage>;
  deleteThreadMessage(id: string): Promise<void>;

  // Requests
  getAllRequests(): Promise<GameRequest[]>;
  getRequestsByUser(userId: string): Promise<GameRequest[]>;
  createRequest(request: InsertRequest): Promise<GameRequest>;
  updateRequestStatus(id: string, status: string): Promise<GameRequest>;
  deleteRequest(id: string): Promise<void>;

  // Favorites
  getFavoritesByUser(userId: string): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(userId: string, gameId: string): Promise<void>;
  isFavorite(userId: string, gameId: string): Promise<boolean>;

  // Ratings
  getRatingsByGame(gameId: string): Promise<Rating[]>;
  getRatingByUserAndGame(userId: string, gameId: string): Promise<Rating | undefined>;
  createRating(rating: InsertRating): Promise<Rating>;
  updateRating(id: string, rating: number, review?: string): Promise<Rating>;
  getAverageRating(gameId: string): Promise<number>;

  // Announcements
  getActiveAnnouncement(): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: string, data: Partial<InsertAnnouncement>): Promise<Announcement>;

  // Stats
  getStats(): Promise<{
    totalGames: number;
    totalUsers: number;
    totalDownloads: number;
    averageRating: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const [user] = await db.update(users).set({ role: role as any }).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserProfile(id: string, data: { avatar?: string; bio?: string; theme?: string }): Promise<User> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Games
  async getAllGames(): Promise<Game[]> {
    return db.select().from(games).orderBy(desc(games.createdAt));
  }

  async getGame(id: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game || undefined;
  }

  async getGamesByGenre(genre: string): Promise<Game[]> {
    return db.select().from(games).where(eq(games.genre, genre));
  }

  async getFeaturedGames(): Promise<Game[]> {
    return db.select().from(games).where(eq(games.featured, true));
  }

  async createGame(game: InsertGame): Promise<Game> {
    const [newGame] = await db.insert(games).values(game).returning();
    return newGame;
  }

  async updateGame(id: string, game: Partial<InsertGame>): Promise<Game> {
    const [updatedGame] = await db.update(games).set(game).where(eq(games.id, id)).returning();
    return updatedGame;
  }

  async deleteGame(id: string): Promise<void> {
    await db.delete(games).where(eq(games.id, id));
  }

  // Comments
  async getCommentsByGame(gameId: string): Promise<Comment[]> {
    return db.select().from(comments).where(eq(comments.gameId, gameId)).orderBy(desc(comments.createdAt));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async updateComment(id: string, content: string): Promise<Comment> {
    const [updatedComment] = await db.update(comments).set({ content }).where(eq(comments.id, id)).returning();
    return updatedComment;
  }

  async deleteComment(id: string): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  async likeComment(commentId: string, userId: string): Promise<void> {
    await db.insert(commentLikes).values({ commentId, userId });
    await db.update(comments).set({ likes: sql`${comments.likes} + 1` }).where(eq(comments.id, commentId));
  }

  async unlikeComment(commentId: string, userId: string): Promise<void> {
    await db.delete(commentLikes).where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)));
    await db.update(comments).set({ likes: sql`${comments.likes} - 1` }).where(eq(comments.id, commentId));
  }

  async hasLikedComment(commentId: string, userId: string): Promise<boolean> {
    const [like] = await db.select().from(commentLikes).where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)));
    return !!like;
  }

  // Threads
  async getAllThreads(): Promise<Thread[]> {
    return db.select().from(threads).orderBy(desc(threads.createdAt));
  }

  async getThread(id: string): Promise<Thread | undefined> {
    const [thread] = await db.select().from(threads).where(eq(threads.id, id));
    return thread || undefined;
  }

  async getThreadsByGame(gameId: string): Promise<Thread[]> {
    return db.select().from(threads).where(eq(threads.gameId, gameId));
  }

  async createThread(thread: InsertThread): Promise<Thread> {
    const [newThread] = await db.insert(threads).values(thread).returning();
    return newThread;
  }

  async deleteThread(id: string): Promise<void> {
    await db.delete(threads).where(eq(threads.id, id));
  }

  // Thread Messages
  async getMessagesByThread(threadId: string): Promise<ThreadMessage[]> {
    return db.select().from(threadMessages).where(eq(threadMessages.threadId, threadId)).orderBy(desc(threadMessages.createdAt));
  }

  async createThreadMessage(message: InsertThreadMessage): Promise<ThreadMessage> {
    const [newMessage] = await db.insert(threadMessages).values(message).returning();
    return newMessage;
  }

  async deleteThreadMessage(id: string): Promise<void> {
    await db.delete(threadMessages).where(eq(threadMessages.id, id));
  }

  // Requests
  async getAllRequests(): Promise<GameRequest[]> {
    return db.select().from(requests).orderBy(desc(requests.createdAt));
  }

  async getRequestsByUser(userId: string): Promise<GameRequest[]> {
    return db.select().from(requests).where(eq(requests.userId, userId)).orderBy(desc(requests.createdAt));
  }

  async createRequest(request: InsertRequest): Promise<GameRequest> {
    const [newRequest] = await db.insert(requests).values(request).returning();
    return newRequest;
  }

  async updateRequestStatus(id: string, status: string): Promise<GameRequest> {
    const [updatedRequest] = await db.update(requests).set({ status }).where(eq(requests.id, id)).returning();
    return updatedRequest;
  }

  async deleteRequest(id: string): Promise<void> {
    await db.delete(requests).where(eq(requests.id, id));
  }

  // Favorites
  async getFavoritesByUser(userId: string): Promise<Favorite[]> {
    return db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async createFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db.insert(favorites).values(favorite).returning();
    return newFavorite;
  }

  async deleteFavorite(userId: string, gameId: string): Promise<void> {
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.gameId, gameId)));
  }

  async isFavorite(userId: string, gameId: string): Promise<boolean> {
    const [favorite] = await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.gameId, gameId)));
    return !!favorite;
  }

  // Ratings
  async getRatingsByGame(gameId: string): Promise<Rating[]> {
    return db.select().from(ratings).where(eq(ratings.gameId, gameId));
  }

  async getRatingByUserAndGame(userId: string, gameId: string): Promise<Rating | undefined> {
    const [rating] = await db.select().from(ratings).where(and(eq(ratings.userId, userId), eq(ratings.gameId, gameId)));
    return rating || undefined;
  }

  async createRating(rating: InsertRating): Promise<Rating> {
    const [newRating] = await db.insert(ratings).values(rating).returning();
    return newRating;
  }

  async updateRating(id: string, rating: number, review?: string): Promise<Rating> {
    const [updatedRating] = await db.update(ratings).set({ rating, review }).where(eq(ratings.id, id)).returning();
    return updatedRating;
  }

  async getAverageRating(gameId: string): Promise<number> {
    const result = await db.select({ avg: sql<number>`avg(${ratings.rating})` }).from(ratings).where(eq(ratings.gameId, gameId));
    return result[0]?.avg || 0;
  }

  // Announcements
  async getActiveAnnouncement(): Promise<Announcement | undefined> {
    const [announcement] = await db.select().from(announcements).where(eq(announcements.active, true)).orderBy(desc(announcements.createdAt));
    return announcement || undefined;
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db.insert(announcements).values(announcement).returning();
    return newAnnouncement;
  }

  async updateAnnouncement(id: string, data: Partial<InsertAnnouncement>): Promise<Announcement> {
    const [updatedAnnouncement] = await db.update(announcements).set(data).where(eq(announcements.id, id)).returning();
    return updatedAnnouncement;
  }

  // Stats
  async getStats(): Promise<{ totalGames: number; totalUsers: number; totalDownloads: number; averageRating: number }> {
    const totalGamesResult = await db.select({ count: sql<number>`count(*)` }).from(games);
    const totalUsersResult = await db.select({ count: sql<number>`count(*)` }).from(users);
    const avgRatingResult = await db.select({ avg: sql<number>`avg(${ratings.rating})` }).from(ratings);

    return {
      totalGames: totalGamesResult[0]?.count || 0,
      totalUsers: totalUsersResult[0]?.count || 0,
      totalDownloads: 0, // Would need to track downloads separately
      averageRating: avgRatingResult[0]?.avg || 0,
    };
  }
}

export const storage = new DatabaseStorage();
