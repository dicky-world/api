import { Router } from 'express';
// import { Gold } from './controllers/gold';
// import { Health } from './controllers/health';
import { Join } from './controllers/join';
import { Login } from './controllers/login';
import { My } from './controllers/my';
// import { Purchase } from './controllers/purchase';
// import { Upload } from './controllers/upload';
// import { User } from './controllers/user';
// import { Verify } from './controllers/verify';

const router = Router();

// router.get('/health', Health.check);
// router.post('/gold/price', Gold.validatePrice, Gold.price);
router.put('/my/location', My.validateLocation, My.location);
router.post('/login', Login.validateLogin, Login.login);
router.post('/join', Join.validateJoin, Join.join);
router.post('/join/resend-email', Join.validateResendEmail, Join.resendEmail);
// router.post('/store/upload', Upload.validateGetSignedUrl, Upload.getSignedUrl);
// router.post('/verify/worbli', Verify.validateWorbli, Verify.worbli);
// router.post('/verify/investor', Verify.validateInvestor, Verify.investor);
// router.post('/user/profile', User.validateProfile, User.profile);
// router.post('/user/password', User.validatePassword, User.password);
// router.post('/purchase/tokens', Purchase.validateTokens, Purchase.tokens);

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

// router.post(
//   '/verify/investor-img',
//   Verify.validateInvestorImg,
//   Verify.investorImg
// );

// router.post(
//   '/verify/investor-url',
//   Verify.validateInvestorUrl,
//   Verify.investorUrl
// );

export { router };
