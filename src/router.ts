import {Router} from 'express';
import {Login} from './controllers/login';
import {Register} from './controllers/register';

const router = Router();

router.post('/login', Login.validateLogin, Login.login);
router.post('/login/reset-password', Login.validateResetPassword, Login.resetPassword);
router.post('/login/confirm-password', Login.validateConfirmPassword, Login.confirmPassword);

router.post('/register', Register.validateRegister, Register.register);
router.post('/register/resend-email', Register.validateResendEmail, Register.resendEmail);
router.post('/register/confirm-email', Register.validateConfirmEmail, Register.confirmEmail);

export {router};
