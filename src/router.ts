import { Router } from 'express';
import { Health } from './controllers/health';
import { Join } from './controllers/join';
import { Login } from './controllers/login';
import { My } from './controllers/my';
import { Upload } from './controllers/upload';
// import { User } from './controllers/user';

const router = Router();

router.get('/health', Health.check);

router.put('/my/location', My.validateLocation, My.location);
router.post('/my/avatar', My.validateAvatar, My.avatar);
router.post('/login', Login.validateLogin, Login.login);
router.post('/join', Join.validateJoin, Join.join);
router.post('/join/resend-email', Join.validateResendEmail, Join.resendEmail);
router.post('/upload/signed-url', Upload.validateSignedUrl, Upload.signedUrl);
router.post('/my/profile', My.validateProfile, My.profile);
router.post('/my/password', My.validatePassword, My.password);

router.post(
  '/login/reset-password',
  Login.validateResetPassword,
  Login.resetPassword
);

router.post(
  '/login/confirm-password',
  Login.validateConfirmPassword,
  Login.confirmPassword
);

router.post(
  '/join/confirm-email',
  Join.validateConfirmEmail,
  Join.confirmEmail
);

export { router };
