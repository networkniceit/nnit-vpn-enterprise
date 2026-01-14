import { Router } from 'express';
import { mfaController } from '../controllers/mfa.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All MFA routes require authentication
router.use(authMiddleware);

router.post('/totp/setup', mfaController.setupTOTP.bind(mfaController));
router.post('/totp/verify', mfaController.verifyTOTP.bind(mfaController));
router.post('/sms/send', mfaController.sendSMS.bind(mfaController));
router.post('/sms/verify', mfaController.verifySMS.bind(mfaController));
router.post('/backup-codes', mfaController.generateBackupCodes.bind(mfaController));

export default router;
