import type { Express, RequestHandler } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { storage } from "./memoryStorage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const MemoryStoreSession = MemoryStore(session);
  const sessionStore = new MemoryStoreSession({
    checkPeriod: 86400000, // prune expired entries every 24h
  });
  return session({
    secret: "offline-taskvibe-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for local/offline development
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Simple offline login - creates/gets a default user
  app.get("/api/login", async (req: any, res) => {
    try {
      // Create or get a default offline user
      const defaultUser = await storage.upsertUser({
        id: "offline-user",
        email: "offline@taskvibe.local",
        firstName: "TaskVibe",
        lastName: "User",
        profileImageUrl: null,
        nickname: null,
        theme: "system",
        level: 1,
        xp: 0,
        streak: 0,
        lastActiveDate: new Date(),
        completedOnboarding: false,
      });

      // Set user session
      req.session.user = {
        id: defaultUser.id,
        ...defaultUser
      };

      res.redirect("/");
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/logout", (req: any, res) => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Add user info to request
  req.user = {
    claims: {
      sub: req.session.user.id
    }
  };
  
  next();
};