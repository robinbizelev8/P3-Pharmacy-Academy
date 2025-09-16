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
  
  // Detect if we're in a Replit deployment
  const isReplitDeployment = process.env.REPLIT_DEPLOYMENT === 'true' || 
                            process.env.REPL_SLUG !== undefined ||
                            process.env.NODE_ENV === 'production';
  
  console.log(`Setting auth cookie - isReplitDeployment: ${isReplitDeployment}, NODE_ENV: ${process.env.NODE_ENV}`);
  
  // Cookie settings optimized for Replit compatibility
  const cookieOptions: any = {
    httpOnly: false, // Allow client access in Replit  
    secure: false,   // false for development/http
    sameSite: 'lax', // Back to 'lax' since 'none' requires secure: true
    maxAge,
    path: '/'
    // Removed domain to let browser set automatically
  };
  
  console.log('🔥 COOKIE DEBUG: Setting cookie with options:', cookieOptions);
  res.cookie('auth-token', token, cookieOptions);
  
  // Set an additional header for debugging
  res.setHeader('X-Auth-Cookie-Set', 'true');
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
    console.log(`🔐 JWT Auth: ${req.method} ${req.path}`);
    
    // Try multiple ways to get the token - prioritize headers over cookies for Replit compatibility
    let token = req.headers['x-auth-token'] ||
                req.headers['authorization']?.replace('Bearer ', '') ||
                req.cookies['auth-token'];
    
    if (!token) {
      console.log(`🔐 JWT Auth: No token found for ${req.path}`);
      (req as any).user = null;
      return next();
    }

    const payload = verifyToken(token);
    if (!payload) {
      console.log(`🔐 JWT Auth: Invalid token for ${req.path}`);
      (req as any).user = null;
      return next();
    }

    // Get full user data from database
    const user = await storage.getUserById(payload.userId);
    if (!user) {
      console.log(`🔐 JWT Auth: User not found for token payload ${payload.userId} on ${req.path}`);
      (req as any).user = null;
      return next();
    }

    // Attach user to request
    (req as any).user = user;
    console.log(`🔐 JWT Auth: Authenticated user ${user.email} (${user.role}) for ${req.path}`);
    next();
  } catch (error) {
    console.error(`🔐 JWT Auth: Error on ${req.path}:`, error);
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
    
    console.log(`🔒 Role Auth: ${req.method} ${req.path} - Required: [${roles.join(', ')}], User: ${user ? `${user.email} (${user.role})` : 'none'}`);
    
    if (!user) {
      console.log(`🔒 Role Auth: DENIED - No authenticated user for ${req.path}`);
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
      return;
    }
    
    if (!roles.includes(user.role)) {
      console.log(`🔒 Role Auth: DENIED - User ${user.email} role '${user.role}' not in required roles [${roles.join(', ')}] for ${req.path}`);
      res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have permission to access this resource'
      });
      return;
    }
    
    console.log(`🔒 Role Auth: ALLOWED - User ${user.email} (${user.role}) for ${req.path}`);
    next();
  };
}

// Helper functions for specific roles
export const requireStudent = requireRole(['student']);
export const requireSupervisor = requireRole(['supervisor', 'admin']);
export const requireAdmin = requireRole(['admin']);