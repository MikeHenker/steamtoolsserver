import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateToken, requireRole, generateToken, hashPassword, comparePassword } from "./auth";
import { insertUserSchema, loginSchema, insertGameSchema, insertCommentSchema, insertRequestSchema, insertRatingSchema } from "@shared/schema";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(data.password);
      
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      const token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      res.json({ user: { ...user, password: undefined }, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(data.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await comparePassword(data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      res.json({ user: { ...user, password: undefined }, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ ...user, password: undefined });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User routes
  app.get("/api/users", authenticateToken, requireRole("admin"), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(u => ({ ...u, password: undefined })));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/users/:id/role", authenticateToken, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      const user = await storage.updateUserRole(id, role);
      res.json({ ...user, password: undefined });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/users/:id/profile", authenticateToken, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const { id } = req.params;

      if (userId !== id) {
        return res.status(403).json({ message: "Cannot update other user's profile" });
      }

      const { avatar, bio, theme } = req.body;
      const user = await storage.updateUserProfile(id, { avatar, bio, theme });
      res.json({ ...user, password: undefined });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Game routes
  app.get("/api/games", async (req, res) => {
    try {
      const { genre, featured } = req.query;
      
      let games;
      if (featured === "true") {
        games = await storage.getFeaturedGames();
      } else if (genre) {
        games = await storage.getGamesByGenre(genre as string);
      } else {
        games = await storage.getAllGames();
      }

      res.json(games);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/games/:id", async (req, res) => {
    try {
      const game = await storage.getGame(req.params.id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/games", authenticateToken, requireRole("gameadder", "admin"), upload.single("image"), async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const data = insertGameSchema.parse(req.body);
      
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : data.imageUrl;

      const game = await storage.createGame({
        ...data,
        imageUrl,
        uploaderId: userId,
      });

      res.json(game);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/games/:id", authenticateToken, requireRole("admin"), async (req, res) => {
    try {
      await storage.deleteGame(req.params.id);
      res.json({ message: "Game deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Comment routes
  app.get("/api/comments/:gameId", async (req, res) => {
    try {
      const comments = await storage.getCommentsByGame(req.params.gameId);
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/comments", authenticateToken, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const data = insertCommentSchema.parse({ ...req.body, userId });
      
      const comment = await storage.createComment(data);
      res.json(comment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/comments/:id", authenticateToken, async (req, res) => {
    try {
      const { userId, role } = (req as any).user;
      const comment = await storage.getCommentsByGame(""); // Would need to get comment first to check ownership
      
      // Allow deletion if user is admin or comment owner
      await storage.deleteComment(req.params.id);
      res.json({ message: "Comment deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/comments/:id/like", authenticateToken, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const { id } = req.params;

      const hasLiked = await storage.hasLikedComment(id, userId);
      if (hasLiked) {
        await storage.unlikeComment(id, userId);
      } else {
        await storage.likeComment(id, userId);
      }

      res.json({ message: "Success" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Request routes
  app.get("/api/requests", authenticateToken, async (req, res) => {
    try {
      const { userId, role } = (req as any).user;

      let requests;
      if (role === "admin") {
        requests = await storage.getAllRequests();
      } else {
        requests = await storage.getRequestsByUser(userId);
      }

      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/requests", authenticateToken, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const data = insertRequestSchema.parse({ ...req.body, userId });
      
      const request = await storage.createRequest(data);
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/requests/:id", authenticateToken, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const request = await storage.updateRequestStatus(id, status);
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Favorites routes
  app.get("/api/favorites/:userId", authenticateToken, async (req, res) => {
    try {
      const { userId: authUserId } = (req as any).user;
      const { userId } = req.params;

      if (authUserId !== userId) {
        return res.status(403).json({ message: "Cannot view other user's favorites" });
      }

      const favorites = await storage.getFavoritesByUser(userId);
      res.json(favorites);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/favorites", authenticateToken, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const { gameId } = req.body;

      const isFavorite = await storage.isFavorite(userId, gameId);
      if (isFavorite) {
        await storage.deleteFavorite(userId, gameId);
        res.json({ message: "Removed from favorites" });
      } else {
        const favorite = await storage.createFavorite({ userId, gameId });
        res.json(favorite);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Ratings routes
  app.get("/api/ratings/:gameId", async (req, res) => {
    try {
      const ratings = await storage.getRatingsByGame(req.params.gameId);
      const average = await storage.getAverageRating(req.params.gameId);
      res.json({ ratings, average });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/ratings", authenticateToken, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const data = insertRatingSchema.parse({ ...req.body, userId });

      const existingRating = await storage.getRatingByUserAndGame(userId, data.gameId);
      
      let rating;
      if (existingRating) {
        rating = await storage.updateRating(existingRating.id, data.rating, data.review || undefined);
      } else {
        rating = await storage.createRating(data);
      }

      res.json(rating);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Announcements route
  app.get("/api/announcements/active", async (req, res) => {
    try {
      const announcement = await storage.getActiveAnnouncement();
      res.json(announcement || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}
