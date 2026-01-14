import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config/config';
import { logger } from '../utils/logger';

// Initialize Firebase Admin
if (config.firebase.projectId) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase.projectId,
      clientEmail: config.firebase.clientEmail,
      privateKey: config.firebase.privateKey,
    }),
  });
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
}

export class AuthService {
  /**
   * Register a new user with email and password
   */
  async register(email: string, password: string): Promise<any> {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user in Firebase
      const userRecord = await admin.auth().createUser({
        email,
        password,
        emailVerified: false,
      });

      logger.info(`User registered: ${email}`);
      
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
      };
    } catch (error: any) {
      logger.error('Registration error:', error);
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    try {
      // Get user by email
      const userRecord = await admin.auth().getUserByEmail(email);
      
      // Generate tokens
      const accessToken = this.generateAccessToken({
        userId: userRecord.uid,
        email: userRecord.email!,
      });
      
      const refreshToken = this.generateRefreshToken({
        userId: userRecord.uid,
        email: userRecord.email!,
      });

      logger.info(`User logged in: ${email}`);
      
      return {
        accessToken,
        refreshToken,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          emailVerified: userRecord.emailVerified,
        },
      };
    } catch (error: any) {
      logger.error('Login error:', error);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Verify Firebase token
   */
  async verifyFirebaseToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await admin.auth().verifyIdToken(token);
    } catch (error: any) {
      logger.error('Token verification error:', error);
      throw new Error('Invalid token');
    }
  }

  /**
   * Generate JWT access token
   */
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Generate JWT refresh token
   */
  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string, isRefreshToken = false): TokenPayload {
    try {
      const secret = isRefreshToken ? config.jwt.refreshSecret : config.jwt.secret;
      return jwt.verify(token, secret) as TokenPayload;
    } catch (error: any) {
      logger.error('JWT verification error:', error);
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.verifyToken(refreshToken, true);
      const accessToken = this.generateAccessToken({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      });
      
      return { accessToken };
    } catch (error: any) {
      logger.error('Token refresh error:', error);
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await admin.auth().generatePasswordResetLink(email);
      logger.info(`Password reset email sent to: ${email}`);
    } catch (error: any) {
      logger.error('Password reset error:', error);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(email: string): Promise<void> {
    try {
      const user = await admin.auth().getUserByEmail(email);
      await admin.auth().generateEmailVerificationLink(email);
      logger.info(`Verification email sent to: ${email}`);
    } catch (error: any) {
      logger.error('Email verification error:', error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  /**
   * Delete user account
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await admin.auth().deleteUser(userId);
      logger.info(`User deleted: ${userId}`);
    } catch (error: any) {
      logger.error('User deletion error:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}

export const authService = new AuthService();
