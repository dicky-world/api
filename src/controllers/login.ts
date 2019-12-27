import * as Joi from '@hapi/joi';
import * as authenticator from 'authenticator';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import sha1 = require('sha1');
import { Email } from '../components/email';
import { userModel } from '../models/user';

class Login {
  static validateLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const schema = Joi.object().keys({
        email: Joi.string()
          .lowercase()
          .trim()
          .max(320)
          .email({ minDomainSegments: 2 })
          .required(),
        formattedToken: Joi.string()
          .trim()
          .min(6)
          .max(6)
          .allow('')
          .required(),
        password: Joi.string()
          .trim()
          .min(8)
          .max(70)
          .required(),
      });
      const { email, password, formattedToken } = req.body;
      Joi.validate({ email, password, formattedToken }, schema, (err, val) => {
        if (err) {
          throw new Error('Failed to validate input ' + err.details[0].message);
        }
        req.body = val;
        next();
      });
    } catch (error) {
      res.status(400).send({
        code: sha1('validateLogin' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password, formattedToken } = req.body;
      const account = await userModel.findOne({ 'shared.email': email }).exec();
      if (!account) throw new Error('You have not registered');
      const jwtToken = jwt.sign(
        { email: account.shared.email, id: account._id },
        process.env.JWT_SECRET
      );
      if (!jwtToken) throw new Error('JWT failed to generate');
      const passwordsMatch = await bcrypt.compare(
        password,
        account.password.hash
      );
      if (!passwordsMatch) throw new Error('Email or password error');
      if (account.shared.twofactor && !formattedToken) {
        res.status(200).send({ twoFactor: true });
      } else if (account.shared.twofactor && formattedToken) {
        const verified = authenticator.verifyToken(account.password.formattedKey, formattedToken);
        if (!verified) throw new Error('Invalid 2FA code');
        res
        .status(200)
        .send({ shared: account.shared, jwtToken, twoFactor: false });
      } else {
        res
          .status(200)
          .send({ shared: account.shared, jwtToken, twoFactor: false });
      }
    } catch (error) {
      res.status(400).send({
        code: sha1('login' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static validateResetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const schema = Joi.object().keys({
        email: Joi.string()
          .lowercase()
          .trim()
          .max(320)
          .email({ minDomainSegments: 2 })
          .required(),
      });
      const { email } = req.body;
      Joi.validate({ email }, schema, (err, val) => {
        if (err) {
          throw new Error('Failed to validate input ' + err.details[0].message);
        }
        req.body = val;
        next();
      });
    } catch (error) {
      res.status(400).send({
        code: sha1(
          'validateResetPassword' + error.message || 'Internal Server Error'
        ),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static resetPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const resetCode = randomBytes(20).toString('hex');
      if (!resetCode) throw new Error('Reset code not created');
      const account = await userModel
        .findOneAndUpdate(
          { 'shared.email': email },
          {
            $set: {
              'password.resetCode': resetCode,
              'password.sentAt': Date.now(),
            },
          }
        )
        .exec();
      if (!account) throw new Error('Database failed to find');
      const { fullName } = account.shared;
      const sent = await Email.resetPassword(fullName, email, resetCode);
      if (!sent) throw new Error('Email not sent');
      res.status(200).send({});
    } catch (error) {
      res.status(400).send({
        code: sha1('resetPassword' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static validateConfirmPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const schema = Joi.object().keys({
        newPassword: Joi.string()
          .trim()
          .min(8)
          .max(70)
          .required(),
        resetCode: Joi.string()
          .trim()
          .min(40)
          .max(40)
          .required(),
      });
      const { newPassword, resetCode } = req.body;
      Joi.validate({ newPassword, resetCode }, schema, (err, val) => {
        if (err) {
          throw new Error('Failed to validate input ' + err.details[0].message);
        }
        req.body = val;
        next();
      });
    } catch (error) {
      res.status(400).send({
        code: sha1(
          'validateConfirmPassword' + error.message || 'Internal Server Error'
        ),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static confirmPassword = async (req: Request, res: Response) => {
    try {
      const { newPassword, resetCode } = req.body;
      const account = await userModel
        .findOne({ 'password.resetCode': resetCode })
        .exec();
      if (!account) throw new Error('Reset code not found');
      const hours = Math.floor(
        (Date.now() - Date.parse(account.password.sentAt)) / 3600000
      );
      if (hours >= 12) throw new Error('Reset code has expired');
      const jwtToken = jwt.sign(
        { email: account.email, id: account._id },
        process.env.JWT_SECRET
      );
      if (!jwtToken) throw new Error('JWT Failed to create');
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      if (!hashedPassword) throw new Error('New password failed to hash');
      const updated = await userModel
        .findOneAndUpdate(
          { 'password.resetCode': resetCode },
          {
            $set: {
              'password.hash': hashedPassword,
              'shared.warningMessage': '',
            },
            $unset: {
              'password.resetCode': '',
              'password.sentAt': '',
            },
          }
        )
        .exec();
      if (!updated) throw new Error('Database failed to save');
      res.status(200).send({ shared: account.shared, jwtToken });
    } catch (error) {
      res.status(400).send({
        code: sha1(
          'confirmPassword' + error.message || 'Internal Server Error'
        ),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static validateTwoFactorCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const schema = Joi.object().keys({
        email: Joi.string()
          .lowercase()
          .trim()
          .allow('')
          .max(320)
          .email({ minDomainSegments: 2 }),
        formattedToken: Joi.string()
          .trim()
          .min(6)
          .max(6)
          .required(),
        jwtToken: Joi.string()
          .required()
          .allow('')
          .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/),
      });
      const { email, jwtToken, formattedToken } = req.body;
      Joi.validate({ email, jwtToken, formattedToken }, schema, (err, val) => {
        if (err) {
          throw new Error('Failed to validate input ' + err.details[0].message);
        }
        req.body = val;
        next();
      });
    } catch (error) {
      res.status(400).send({
        code: sha1(
          'validateConfirmPassword' + error.message || 'Internal Server Error'
        ),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static twoFactorCode = async (req: Request, res: Response) => {
    try {
      const { email, jwtToken, formattedToken } = req.body;
      let _email: string;
      let query = {};
      if (email) {
        query = { 'shared.email': email };
        _email = email;
      }
      if (jwtToken) {
        interface JwtInterface {
          email: string;
          id: string;
        }
        const jwtData = jwt.verify(jwtToken, process.env.JWT_SECRET);
        const isJWTData = (input: object | string): input is JwtInterface => {
          return typeof input === 'object' && 'id' in input;
        };
        if (!isJWTData(jwtData)) throw new Error('JWT could not be verified');
        _email = jwtData.email;
        query = { 'shared.email': _email };
      }
      if (!query) throw new Error('Must supply JWT or email');
      const account = await userModel.findOne(query).exec();
      if (!account) throw new Error('Not found in database');
      const { formattedKey } = account.password;
      const verified = authenticator.verifyToken(formattedKey, formattedToken);
      if (!verified) throw new Error('Invalid token');
      const updated = await userModel
        .findOneAndUpdate(
          { 'shared.email': _email },
          {
            $set: {
              'shared.loggedIn': true,
              'shared.twofactor': true,
            },
          },
          {
            new: true,
          }
        )
        .exec();
      if (!updated) throw new Error('Database failed to find');
      const _jwtToken = jwt.sign(
        { email: updated.shared.email, id: updated._id },
        process.env.JWT_SECRET
      );
      if (!_jwtToken) throw new Error('JWT failed to generate');
      res.status(200).send({ shared: updated.shared, jwtToken: _jwtToken });
    } catch (error) {
      res.status(400).send({
        code: sha1(
          'confirmPassword' + error.message || 'Internal Server Error'
        ),
        error: error.message || 'Internal Server Error',
      });
    }
  };
}

export { Login };
