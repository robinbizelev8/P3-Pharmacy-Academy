import type { Express, Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { rateLimitAuth, logAuthEvent } from "./middleware/auth";
import { generateToken, setAuthCookie, clearAuthCookie, jwtAuth } from "./jwt-auth";
import { emailService } from "./services/email-service.js";
import crypto from "crypto";

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['student', 'supervisor', 'admin']).default('student'),
  institution: z.string().optional(),
  licenseNumber: z.string().optional(),
  specializations: z.array(z.string()).default([]),
  yearsExperience: z.number().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

// Password reset tokens storage (in production, use Redis or database)
const resetTokens = new Map<string, { email: string; expires: number }>();

// Hash password utility
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password utility
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Password validation
function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function setupJWTAuthRoutes(app: Express) {
  // Add JWT middleware to all routes
  app.use(jwtAuth);

  // Registration
  app.post('/api/auth/register', 
    rateLimitAuth(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
    logAuthEvent('REGISTRATION_ATTEMPT'),
    async (req: Request, res: Response) => {
      try {
        const validation = registerSchema.safeParse(req.body);
        
        if (!validation.success) {
          return res.status(400).json({
            error: 'Validation failed',
            details: validation.error.issues
          });
        }

        const { email, password, firstName, lastName, role, institution, licenseNumber, specializations, yearsExperience } = validation.data;

        // Check if user already exists
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
          return res.status(409).json({
            error: 'User already exists',
            message: 'A user with this email already exists. Please try logging in instead.'
          });
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
          return res.status(400).json({
            error: 'Password validation failed',
            details: passwordValidation.errors
          });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const userData = {
          email,
          firstName,
          lastName,
          role,
          provider: 'email' as const,
          hashedPassword,
          emailVerified: false,
          institution,
          licenseNumber,
          specializations,
          yearsExperience,
          supervisorCertified: role === 'supervisor' ? false : undefined,
        };

        const user = await storage.createUser(userData);

        console.log(`User registered: ${user.id} (${user.email})`);

        res.status(201).json({
          success: true,
          message: 'User registered successfully.',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            emailVerified: user.emailVerified
          }
        });

      } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
          error: 'Registration failed',
          message: 'An error occurred during registration. Please try again.'
        });
      }
    }
  );

  // Login
  app.post('/api/auth/login',
    rateLimitAuth(5, 15 * 60 * 1000),
    logAuthEvent('LOGIN_ATTEMPT'),
    async (req: Request, res: Response) => {
      try {
        const validation = loginSchema.safeParse(req.body);
        
        if (!validation.success) {
          return res.status(400).json({
            error: 'Validation failed',
            details: validation.error.issues
          });
        }

        const { email, password } = validation.data;

        // Get user by email
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return res.status(401).json({
            error: 'Authentication failed',
            message: 'Invalid email or password'
          });
        }

        // Check if user has a password (email-based account)
        if (!user.hashedPassword) {
          return res.status(401).json({
            error: 'Authentication failed',
            message: 'Please reset your password to continue'
          });
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.hashedPassword);
        if (!isValidPassword) {
          return res.status(401).json({
            error: 'Authentication failed',
            message: 'Invalid email or password'
          });
        }

        // Update last login
        await storage.updateUser(user.id, {
          lastLoginAt: new Date()
        });

        // Generate JWT token
        const token = generateToken({
          userId: user.id,
          email: user.email || '',
          role: user.role || 'student'
        });

        // Set HTTP-only cookie
        setAuthCookie(res, token);

        console.log(`User logged in: ${user.id} (${user.email})`);
        
        res.json({
          success: true,
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            emailVerified: user.emailVerified,
            institution: user.institution
          }
        });

      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
          error: 'Login failed',
          message: 'An error occurred during login. Please try again.'
        });
      }
    }
  );

  // Logout
  app.post('/api/auth/logout',
    logAuthEvent('LOGOUT'),
    (req: Request, res: Response) => {
      clearAuthCookie(res);
      console.log('User logged out');
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    }
  );

  // Get Current User
  app.get('/api/auth/user', (req: Request, res: Response) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        error: 'Not authenticated',
        message: 'No active session found'
      });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      emailVerified: user.emailVerified,
      institution: user.institution,
      profileImageUrl: user.profileImageUrl,
      lastLoginAt: user.lastLoginAt
    });
  });

  // Forgot Password
  app.post('/api/auth/forgot-password',
    rateLimitAuth(3, 60 * 60 * 1000),
    logAuthEvent('FORGOT_PASSWORD'),
    async (req: Request, res: Response) => {
      try {
        const validation = forgotPasswordSchema.safeParse(req.body);
        
        if (!validation.success) {
          return res.status(400).json({
            error: 'Validation failed',
            details: validation.error.issues
          });
        }

        const { email } = validation.data;
        const user = await storage.getUserByEmail(email);

        // Always return success to prevent email enumeration
        res.json({
          success: true,
          message: 'If an account with that email exists, we have sent a password reset link.'
        });

        if (!user || user.provider !== 'email') {
          return; // User doesn't exist
        }

        // Generate reset token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + 60 * 60 * 1000; // 1 hour

        resetTokens.set(token, { email, expires });

        // Send password reset email
        console.log(`Password reset requested for: ${email}, token: ${token}`);
        
        try {
          const emailSent = await emailService.sendPasswordResetEmail({
            email,
            token,
            userName: user.firstName || user.email || 'User'
          });
          
          if (emailSent) {
            console.log(`Password reset email sent successfully to: ${email}`);
          } else {
            console.log(`Password reset email failed to send to: ${email}, but logged to console`);
          }
        } catch (emailError) {
          console.error('Email service error:', emailError);
        }

      } catch (error) {
        console.error('Forgot password error:', error);
        res.json({
          success: true,
          message: 'If an account with that email exists, we have sent a password reset link.'
        });
      }
    }
  );

  // Reset Password
  app.post('/api/auth/reset-password',
    rateLimitAuth(5, 15 * 60 * 1000),
    logAuthEvent('RESET_PASSWORD'),
    async (req: Request, res: Response) => {
      try {
        const validation = resetPasswordSchema.safeParse(req.body);
        
        if (!validation.success) {
          return res.status(400).json({
            error: 'Validation failed',
            details: validation.error.issues
          });
        }

        const { token, password } = validation.data;

        // Check token validity
        const tokenData = resetTokens.get(token);
        if (!tokenData || Date.now() > tokenData.expires) {
          return res.status(400).json({
            error: 'Invalid token',
            message: 'Password reset token is invalid or expired.'
          });
        }

        // Validate new password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
          return res.status(400).json({
            error: 'Password validation failed',
            details: passwordValidation.errors
          });
        }

        // Get user and update password
        const user = await storage.getUserByEmail(tokenData.email);
        if (!user) {
          return res.status(404).json({
            error: 'User not found',
            message: 'Unable to reset password for this user.'
          });
        }

        const hashedPassword = await hashPassword(password);
        await storage.updateUser(user.id, { hashedPassword });

        // Remove used token
        resetTokens.delete(token);

        console.log(`Password reset completed for: ${user.email}`);

        res.json({
          success: true,
          message: 'Password reset successfully. You can now log in with your new password.'
        });

      } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
          error: 'Password reset failed',
          message: 'An error occurred while resetting your password. Please try again.'
        });
      }
    }
  );

  // Change Password (authenticated users)
  app.post('/api/auth/change-password',
    (req: Request, res: Response, next) => {
      if (!(req as any).user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'You must be logged in to change your password'
        });
      }
      next();
    },
    rateLimitAuth(3, 15 * 60 * 1000),
    logAuthEvent('CHANGE_PASSWORD'),
    async (req: Request, res: Response) => {
      try {
        const validation = changePasswordSchema.safeParse(req.body);
        
        if (!validation.success) {
          return res.status(400).json({
            error: 'Validation failed',
            details: validation.error.issues
          });
        }

        const { currentPassword, newPassword } = validation.data;
        const user = (req as any).user;

        // Verify current password
        if (!user.hashedPassword) {
          return res.status(400).json({
            error: 'Password change not allowed',
            message: 'This account cannot change password.'
          });
        }

        const isCurrentPasswordValid = await verifyPassword(currentPassword, user.hashedPassword);
        
        if (!isCurrentPasswordValid) {
          return res.status(400).json({
            error: 'Invalid current password',
            message: 'The current password you entered is incorrect.'
          });
        }

        // Validate new password
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
          return res.status(400).json({
            error: 'Password validation failed',
            details: passwordValidation.errors
          });
        }

        // Hash and update new password
        const hashedPassword = await hashPassword(newPassword);
        await storage.updateUser(user.id, { hashedPassword });

        console.log(`Password changed for user: ${user.email}`);

        res.json({
          success: true,
          message: 'Password changed successfully'
        });

      } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
          error: 'Password change failed',
          message: 'An error occurred while changing your password. Please try again.'
        });
      }
    }
  );
}