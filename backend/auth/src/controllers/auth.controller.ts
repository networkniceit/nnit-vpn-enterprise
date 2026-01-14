import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { logger } from '../utils/logger';
import Joi from 'joi';

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export class AuthController {
  /**
   * Register new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { email, password } = value;
      const user = await authService.register(email, password);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user,
      });
    } catch (error: any) {
      logger.error('Registration controller error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { email, password } = value;
      const result = await authService.login(email, password);

      res.json({
        success: true,
        message: 'Login successful',
        ...result,
      });
    } catch (error: any) {
      logger.error('Login controller error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Refresh access token
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token is required' });
        return;
      }

      const result = await authService.refreshAccessToken(refreshToken);
      res.json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      logger.error('Token refresh controller error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      await authService.sendPasswordResetEmail(email);
      res.json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (error: any) {
      logger.error('Forgot password controller error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      await authService.sendEmailVerification(email);
      res.json({
        success: true,
        message: 'Verification email sent',
      });
    } catch (error: any) {
      logger.error('Email verification controller error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // In a production app, you would invalidate the token here
      // For now, we'll just return success
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      logger.error('Logout controller error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const authController = new AuthController();
