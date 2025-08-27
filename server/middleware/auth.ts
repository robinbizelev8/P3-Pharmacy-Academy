import type { Request, Response, NextFunction } from "express";
import type { User, UserRole } from "@shared/schema";

// Create a proper authenticated user type
export type AuthenticatedUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  profileImageUrl: string | null;
  provider: string | null;
  emailVerified: boolean | null;
  institution: string | null;
  licenseNumber: string | null;
  specializations: string[] | null;
  yearsExperience: number | null;
  supervisorCertified: boolean | null;
  lastLoginAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export interface AuthRequest extends Request {
  user: AuthenticatedUser;
}

// Basic authentication middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }
  next();
}

// Role-based authorization middleware
export function requireRole(allowedRoles: UserRole | UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const userRole = req.user.role as UserRole;
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${userRole}`
      });
    }
    
    next();
  };
}

// Specific role middleware functions
export const requireStudent = requireRole('student');
export const requireSupervisor = requireRole('supervisor');
export const requireAdmin = requireRole('admin');
export const requireSupervisorOrAdmin = requireRole(['supervisor', 'admin']);

// Middleware to check if user can access another user's data
export function requireUserOrRole(allowedRoles: UserRole | UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }

    const targetUserId = req.params.userId || req.params.traineeId;
    const currentUserId = req.user.id;
    const userRole = req.user.role as UserRole;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Allow if accessing own data
    if (targetUserId === currentUserId) {
      return next();
    }

    // Allow if user has required role
    if (roles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({ 
      error: 'Insufficient permissions',
      message: 'You can only access your own data or need appropriate role permissions'
    });
  };
}

// Middleware to check if supervisor has access to specific trainee
export async function requireSupervisorAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }

  const userRole = req.user.role as UserRole;
  const traineeId = req.params.traineeId;

  // Allow admin access to everything
  if (userRole === 'admin') {
    return next();
  }

  // Check if supervisor has access to this trainee
  if (userRole === 'supervisor') {
    try {
      // This would require a storage method to check supervisor-trainee relationship
      // For now, we'll implement basic supervisor access
      return next();
    } catch (error) {
      return res.status(500).json({
        error: 'Error checking supervisor access',
        message: 'Unable to verify supervisor permissions'
      });
    }
  }

  return res.status(403).json({ 
    error: 'Insufficient permissions',
    message: 'Only supervisors and admins can access trainee data'
  });
}

// Middleware to validate email verification
export function requireEmailVerified(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({ 
      error: 'Email verification required',
      message: 'Please verify your email address to access this resource'
    });
  }

  next();
}

// Middleware to check institution access (for multi-tenant scenarios)
export function requireSameInstitution(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }

  const userRole = req.user.role as UserRole;
  
  // Admin can access all institutions
  if (userRole === 'admin') {
    return next();
  }

  // For now, allow access. In a multi-tenant system, you'd check institutions match
  next();
}

// Rate limiting middleware for auth endpoints
export function rateLimitAuth(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    const keysToDelete: string[] = [];
    attempts.forEach((value, key) => {
      if (now > value.resetTime) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => attempts.delete(key));
    
    const current = attempts.get(ip) || { count: 0, resetTime: now + windowMs };
    
    if (current.count >= maxAttempts && now < current.resetTime) {
      return res.status(429).json({
        error: 'Too many attempts',
        message: `Too many authentication attempts. Please try again in ${Math.ceil((current.resetTime - now) / 1000)} seconds.`
      });
    }
    
    current.count++;
    attempts.set(ip, current);
    
    next();
  };
}

// Middleware to log authentication events
export function logAuthEvent(event: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const userId = req.user?.id || 'anonymous';
    
    console.log(`[AUTH EVENT] ${event} - User: ${userId}, IP: ${ip}, UA: ${userAgent}`);
    
    next();
  };
}