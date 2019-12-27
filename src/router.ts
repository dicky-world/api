import { Router } from 'express';
import { Health } from './controllers/health';
import { Join } from './controllers/join';
import { Login } from './controllers/login';
import { My } from './controllers/my';
import { Upload } from './controllers/upload';
import { User } from './controllers/user';

const router = Router();

router.get('/health', Health.check);

router.post('/user/profile', User.validateProfile, User.profile);
router.post('/user/follow', User.validateFollow, User.follow);
router.post('/user/unfollow', User.validateUnfollow, User.unfollow);
router.post('/user/followers', User.validateFollowers, User.followers);
router.post('/user/following', User.validateFollowing, User.following);

router.post('/login', Login.validateLogin, Login.login);
router.post('/login/2fa', Login.validateTwoFactorCode, Login.twoFactorCode);
router.post('/join', Join.validateJoin, Join.join);
router.post('/join/resend-email', Join.validateResendEmail, Join.resendEmail);

router.post('/upload/signed-url', Upload.validateSignedUrl, Upload.signedUrl);

router.post('/my/profile', My.validateProfile, My.profile);
router.post('/my/preferences', My.validatePreferences, My.preferences);
router.post('/my/password', My.validatePassword, My.password);
router.put('/my/location', My.validateLocation, My.location);
router.post('/my/avatar', My.validateAvatar, My.avatar);
router.post('/my/cover', My.validateCover, My.cover);
router.post('/my/2fa', My.validateTwoFactorAuth, My.twoFactorAuth);

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
