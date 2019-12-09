import * as Joi from '@hapi/joi';
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
        password: Joi.string()
          .trim()
          .min(8)
          .max(70)
          .required(),
      });
      const { email, password } = req.body;
      Joi.validate({ email, password }, schema, (err, val) => {
        if (err) throw new Error('Failed to validate input');
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
      const { email, password } = req.body;
      const account = await userModel.findOne({ 'shared.email': email }).exec();
      if (!account) throw new Error('You have not registered');
      const passwordsMatch = await bcrypt.compare(
        password,
        account.password.hash
      );
      if (!passwordsMatch) throw new Error('Email or password error');
      const jwtToken = jwt.sign(
        { email: account.shared.email, id: account._id },
        process.env.JWT_SECRET
      );
      if (!jwtToken) throw new Error('JWT failed to generate');
      res.status(200).send({ shared: account.shared, jwtToken });
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
        if (err) throw new Error('Failed to validate input');
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
        if (err) throw new Error('Failed to validate input');
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
}

export { Login };
