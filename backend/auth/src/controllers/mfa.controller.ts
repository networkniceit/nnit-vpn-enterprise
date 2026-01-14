import { Request, Response } from 'express';
import { mfaService } from '../services/mfa.service';
import { logger } from '../utils/logger';

export class MFAController {
  /**
   * Setup TOTP for user
   */
  async setupTOTP(req: Request, res: Response): Promise<void> {
    try {
      const { userId, email } = req.body;
      
      if (!userId || !email) {
        res.status(400).json({ error: 'UserId and email are required' });
        return;
      }

      const setup = await mfaService.setupTOTP(userId, email);
      
      res.json({
        success: true,
        message: 'TOTP setup initiated',
        ...setup,
      });
    } catch (error: any) {
      logger.error('TOTP setup controller error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Verify TOTP token
   */
  async verifyTOTP(req: Request, res: Response): Promise<void> {
    try {
      const { secret, token } = req.body;
      
      if (!secret || !token) {
        res.status(400).json({ error: 'Secret and token are required' });
        return;
      }

      const isValid = mfaService.verifyTOTP(secret, token);
      
      if (isValid) {
        res.json({
          success: true,
          message: 'TOTP verified successfully',
        });
      } else {
        res.status(401).json({
          success: false,
          error: 'Invalid TOTP token',
        });
      }
    } catch (error: any) {
      logger.error('TOTP verification controller error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Send SMS verification code
   */
  async sendSMS(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        res.status(400).json({ error: 'Phone number is required' });
        return;
      }

      const code = await mfaService.sendSMSCode(phoneNumber);
      
      // In production, don't send the code back - store it server-side
      res.json({
        success: true,
        message: 'SMS code sent',
        // Only for dev - remove in production
        code: process.env.NODE_ENV === 'development' ? code : undefined,
      });
    } catch (error: any) {
      logger.error('SMS sending controller error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Verify SMS code
   */
  async verifySMS(req: Request, res: Response): Promise<void> {
    try {
      const { code, expectedCode } = req.body;
      
      if (!code || !expectedCode) {
        res.status(400).json({ error: 'Code and expectedCode are required' });
        return;
      }

      const isValid = mfaService.verifySMSCode(code, expectedCode);
      
      if (isValid) {
        res.json({
          success: true,
          message: 'SMS code verified successfully',
        });
      } else {
        res.status(401).json({
          success: false,
          error: 'Invalid SMS code',
        });
      }
    } catch (error: any) {
      logger.error('SMS verification controller error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Generate backup codes
   */
  async generateBackupCodes(req: Request, res: Response): Promise<void> {
    try {
      const codes = mfaService.generateBackupCodes();
      
      res.json({
        success: true,
        message: 'Backup codes generated',
        codes,
      });
    } catch (error: any) {
      logger.error('Backup codes generation controller error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

export const mfaController = new MFAController();
