import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

const JWT_SECRET = process.env.JWT_SECRET || "c61b4c5214731a4c62fa973623b5ab856983c380b75eb2fac8e408631e15a536d4b7597a482aaf6df061d09fccf69c3380e53b881fec288c313c9745ba3b39d2";
const JWT_EXPIRES_IN = "7d"; // 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Set JWT cookie
export function setAuthCookie(res: Response, token: string): void {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  
  // Detect production environment more reliably for Replit deployments
  const isProduction = process.env.NODE_ENV === 'production' || 
                      process.env.REPLIT_ENVIRONMENT === 'production' ||
                      process.env.REPLIT_DEPLOYMENT === 'true' ||
                      process.env.REPL_SLUG !== undefined;
  
  console.log(`Setting auth cookie for user login`);
  
  // For Replit deployments, use secure: false even in production to ensure cookies work
  const cookieOptions: any = {
    httpOnly: true,
    secure: false, // Set to false for Replit deployments
    sameSite: 'lax',
    maxAge,
    path: '/'
  };
  
  res.cookie('auth-token', token, cookieOptions);
}

// Clear JWT cookie
export function clearAuthCookie(res: Response): void {
  res.clearCookie('auth-token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/'
  });
}

// JWT Authentication Middleware
export async function jwtAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies['auth-token'];
    
    if (!token) {
      console.log('JWT Auth: No token found in cookies');
      (req as any).user = null;
      return next();
    }

    const payload = verifyToken(token);
    if (!payload) {
      console.log('JWT Auth: Invalid or expired token');
      (req as any).user = null;
      return next();
    }

    // Get full user data from database
    const user = await storage.getUserById(payload.userId);
    if (!user) {
      console.log('JWT Auth: User not found for token payload');
      (req as any).user = null;
      return next();
    }

    // Attach user to request
    (req as any).user = user;
    console.log(`JWT Auth: Successfully authenticated user ${user.email}`);
    next();
  } catch (error) {
    console.error('JWT Auth error:', error);
    (req as any).user = null;
    next();
  }
}

// Require Authentication Middleware
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // Skip auth for knowledge initialization endpoint during development
  if (req.path === '/api/knowledge/initialize' || (req as any).skipAuth) {
    return next();
  }
  
  const user = (req as any).user;
  
  if (!user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
    return;
  }
  
  next();
}

// Require Role Middleware
export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    
    if (!user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
      return;
    }
    
    if (!roles.includes(user.role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have permission to access this resource'
      });
      return;
    }
    
    next();
  };
}

// Helper functions for specific roles
export const requireStudent = requireRole(['student']);
export const requireSupervisor = requireRole(['supervisor', 'admin']);
export const requireAdmin = requireRole(['admin']);