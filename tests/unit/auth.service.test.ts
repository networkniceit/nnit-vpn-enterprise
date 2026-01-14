import { authService } from '../../../backend/auth/src/services/auth.service';

describe('AuthService', () => {
  describe('generateAccessToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
      };
      
      const token = authService.generateAccessToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
      };
      
      const token = authService.generateAccessToken(payload);
      const decoded = authService.verifyToken(token);
      
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        authService.verifyToken('invalid-token');
      }).toThrow();
    });
  });
});
