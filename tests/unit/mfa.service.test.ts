import { mfaService } from '../../../backend/auth/src/services/mfa.service';

describe('MFAService', () => {
  describe('generateBackupCodes', () => {
    it('should generate specified number of backup codes', () => {
      const codes = mfaService.generateBackupCodes(10);
      expect(codes).toHaveLength(10);
      expect(codes[0]).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    });
  });

  describe('verifyTOTP', () => {
    it('should return false for invalid token', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const isValid = mfaService.verifyTOTP(secret, '000000');
      expect(isValid).toBe(false);
    });
  });

  describe('verifySMSCode', () => {
    it('should verify correct SMS code', () => {
      const actualCode = '123456';
      const isValid = mfaService.verifySMSCode('123456', actualCode);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect SMS code', () => {
      const actualCode = '123456';
      const isValid = mfaService.verifySMSCode('654321', actualCode);
      expect(isValid).toBe(false);
    });
  });
});
