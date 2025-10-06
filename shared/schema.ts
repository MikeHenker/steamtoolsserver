import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User role enum
export const userRoleEnum = pgEnum('user_role', ['basic', 'gameadder', 'admin']);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default('basic'),
  avatar: text("avatar").default('🎮'),
  profilePicture: text("profile_picture"), // Base64 encoded image
  bio: text("bio"),
  theme: text("theme").default('dark'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Games table
export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  genre: text("genre").notNull(),
  imageUrl: text("image_url"),
  downloadUrl: text("download_url").notNull(),
  manifestUrl: text("manifest_url"),
  steamId: text("steam_id"),
  minRequirements: text("min_requirements"),
  recRequirements: text("rec_requirements"),
  verified: boolean("verified").default(false),
  featured: boolean("featured").default(false),
  uploaderId: varchar("uploader_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Comments table
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  gameId: varchar("game_id").references(() => games.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Comment likes table (to track who liked what)
export const commentLikes = pgTable("comment_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commentId: varchar("comment_id").references(() => comments.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
});

// Threads table
export const threads = pgTable("threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  gameId: varchar("game_id").references(() => games.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Thread messages table
export const threadMessages = pgTable("thread_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  threadId: varchar("thread_id").references(() => threads.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Requests table
export const requests = pgTable("requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameName: text("game_name").notNull(),
  steamId: text("steam_id"),
  description: text("description"),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  status: text("status").default('pending'), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Global Chat Messages table
export const globalChatMessages = pgTable("global_chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Support Tickets table
export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  status: text("status").default('open'), // open, in_progress, completed
  priority: text("priority").default('medium'), // low, medium, high
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Support Ticket Messages table
export const supportTicketMessages = pgTable("support_ticket_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  ticketId: varchar("ticket_id").references(() => supportTickets.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  isAdminReply: boolean("is_admin_reply").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Favorites table
export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  gameId: varchar("game_id").references(() => games.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Ratings table
export const ratings = pgTable("ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  gameId: varchar("game_id").references(() => games.id, { onDelete: "cascade" }).notNull(),
  rating: integer("rating").notNull(), // 1-10
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Announcements table
export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  message: text("message").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  games: many(games),
  comments: many(comments),
  threads: many(threads),
  threadMessages: many(threadMessages),
  requests: many(requests),
  favorites: many(favorites),
  ratings: many(ratings),
  globalChatMessages: many(globalChatMessages),
  supportTickets: many(supportTickets),
  supportTicketMessages: many(supportTicketMessages),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  uploader: one(users, {
    fields: [games.uploaderId],
    references: [users.id],
  }),
  comments: many(comments),
  threads: many(threads),
  favorites: many(favorites),
  ratings: many(ratings),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  game: one(games, {
    fields: [comments.gameId],
    references: [games.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  likes: many(commentLikes),
}));

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  comment: one(comments, {
    fields: [commentLikes.commentId],
    references: [comments.id],
  }),
  user: one(users, {
    fields: [commentLikes.userId],
    references: [users.id],
  }),
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
  game: one(games, {
    fields: [threads.gameId],
    references: [games.id],
  }),
  user: one(users, {
    fields: [threads.userId],
    references: [users.id],
  }),
  messages: many(threadMessages),
}));

export const threadMessagesRelations = relations(threadMessages, ({ one }) => ({
  thread: one(threads, {
    fields: [threadMessages.threadId],
    references: [threads.id],
  }),
  user: one(users, {
    fields: [threadMessages.userId],
    references: [users.id],
  }),
}));

export const requestsRelations = relations(requests, ({ one }) => ({
  user: one(users, {
    fields: [requests.userId],
    references: [users.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [favorites.gameId],
    references: [games.id],
  }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [ratings.gameId],
    references: [games.id],
  }),
}));

export const globalChatMessagesRelations = relations(globalChatMessages, ({ one }) => ({
  user: one(users, {
    fields: [globalChatMessages.userId],
    references: [users.id],
  }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one, many }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
  messages: many(supportTicketMessages),
}));

export const supportTicketMessagesRelations = relations(supportTicketMessages, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [supportTicketMessages.ticketId],
    references: [supportTickets.id],
  }),
  user: one(users, {
    fields: [supportTicketMessages.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  likes: true,
  createdAt: true,
});

export const insertThreadSchema = createInsertSchema(threads).omit({
  id: true,
  createdAt: true,
});

export const insertThreadMessageSchema = createInsertSchema(threadMessages).omit({
  id: true,
  createdAt: true,
});

export const insertRequestSchema = createInsertSchema(requests).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});

export const insertGlobalChatMessageSchema = createInsertSchema(globalChatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  status: true,
  createdAt: true,
  completedAt: true,
});

export const insertSupportTicketMessageSchema = createInsertSchema(supportTicketMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Thread = typeof threads.$inferSelect;
export type InsertThread = z.infer<typeof insertThreadSchema>;
export type ThreadMessage = typeof threadMessages.$inferSelect;
export type InsertThreadMessage = z.infer<typeof insertThreadMessageSchema>;
export type Request = typeof requests.$inferSelect;
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type GlobalChatMessage = typeof globalChatMessages.$inferSelect;
export type InsertGlobalChatMessage = z.infer<typeof insertGlobalChatMessageSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicketMessage = typeof supportTicketMessages.$inferSelect;
export type InsertSupportTicketMessage = z.infer<typeof insertSupportTicketMessageSchema>;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
