import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import type { User } from "@shared/schema";

// Google OAuth disabled - using email/password authentication only

// Email/Password Strategy
export function setupLocalStrategy() {
  passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      if (!user.hashedPassword) {
        return done(null, false, { message: 'Please reset your password to continue' });
      }

      const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
      
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Update last login
      await storage.updateUser(user.id, {
        lastLoginAt: new Date()
      });

      return done(null, user);
    } catch (error) {
      console.error('Local strategy error:', error);
      return done(error, undefined);
    }
  }));
}

// Serialize/Deserialize user for sessions
export function setupPassportSerialization() {
  passport.serializeUser((user: any, done) => {
    console.log(`Serializing user: ${user.id} (${user.email})`);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      console.log(`Deserializing user with ID: ${id}`);
      const user = await storage.getUserById(id);
      if (user) {
        console.log(`User deserialized successfully: ${user.email}`);
        done(null, user);
      } else {
        console.log(`User not found for ID: ${id}`);
        done(null, false);
      }
    } catch (error) {
      console.error('Deserialization error:', error);
      done(error, null);
    }
  });
}

// Hash password utility
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password utility
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Password validation
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
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

// Initialize authentication strategies  
export function initializeAuthStrategies() {
  setupLocalStrategy();
  setupPassportSerialization();
  console.log("Authentication initialized: Email/Password only");
}