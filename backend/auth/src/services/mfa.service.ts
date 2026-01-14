import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { Twilio } from 'twilio';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import crypto from 'crypto';

export interface MFASetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export class MFAService {
  private twilioClient?: Twilio;

  constructor() {
    if (config.twilio.accountSid && config.twilio.authToken) {
      this.twilioClient = new Twilio(
        config.twilio.accountSid,
        config.twilio.authToken
      );
    }
  }

  /**
   * Setup TOTP (Time-based One-Time Password) for user
   */
  async setupTOTP(userId: string, email: string): Promise<MFASetup> {
    try {
      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `NNIT VPN (${email})`,
        issuer: 'NNIT VPN Enterprise',
      });

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

      // Generate backup codes
      const backupCodes = this.generateBackupCodes();

      logger.info(`TOTP setup initiated for user: ${userId}`);

      return {
        secret: secret.base32,
        qrCode,
        backupCodes,
      };
    } catch (error: any) {
      logger.error('TOTP setup error:', error);
      throw new Error(`Failed to setup TOTP: ${error.message}`);
    }
  }

  /**
   * Verify TOTP token
   */
  verifyTOTP(secret: string, token: string): boolean {
    try {
      return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2, // Allow 2 time steps before/after for clock skew
      });
    } catch (error: any) {
      logger.error('TOTP verification error:', error);
      return false;
    }
  }

  /**
   * Send SMS verification code
   */
  async sendSMSCode(phoneNumber: string): Promise<string> {
    try {
      if (!this.twilioClient) {
        throw new Error('Twilio not configured');
      }

      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Send SMS
      await this.twilioClient.messages.create({
        body: `Your NNIT VPN verification code is: ${code}. Valid for 5 minutes.`,
        from: config.twilio.phoneNumber,
        to: phoneNumber,
      });

      logger.info(`SMS code sent to: ${phoneNumber}`);
      return code;
    } catch (error: any) {
      logger.error('SMS sending error:', error);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  /**
   * Verify SMS code
   */
  verifySMSCode(providedCode: string, actualCode: string): boolean {
    return providedCode === actualCode;
  }

  /**
   * Generate backup codes
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
  }

  /**
   * Verify backup code
   */
  verifyBackupCode(providedCode: string, backupCodes: string[]): boolean {
    return backupCodes.includes(providedCode);
  }

  /**
   * Hash backup codes for storage
   */
  async hashBackupCodes(codes: string[]): Promise<string[]> {
    const bcrypt = await import('bcrypt');
    return Promise.all(codes.map(code => bcrypt.hash(code, 10)));
  }

  /**
   * Verify hashed backup code
   */
  async verifyHashedBackupCode(providedCode: string, hashedCodes: string[]): Promise<boolean> {
    const bcrypt = await import('bcrypt');
    for (const hashedCode of hashedCodes) {
      const isMatch = await bcrypt.compare(providedCode, hashedCode);
      if (isMatch) return true;
    }
    return false;
  }
}

export const mfaService = new MFAService();
