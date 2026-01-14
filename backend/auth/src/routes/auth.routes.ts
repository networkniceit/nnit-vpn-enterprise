import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));
router.post('/forgot-password', authController.forgotPassword.bind(authController));
router.post('/verify-email', authController.verifyEmail.bind(authController));

// Protected routes
router.post('/logout', authMiddleware, authController.logout.bind(authController));

export default router;
