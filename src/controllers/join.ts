import * as Joi from '@hapi/joi';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import sha1 = require('sha1');
import { Email } from '../components/email';
import { userModel, UserModelInterface } from '../models/user';

class Join {
  static validateJoin = async (
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
        fullName: Joi.string()
          .trim()
          .max(70)
          .required(),
        password: Joi.string()
          .trim()
          .min(8)
          .max(70)
          .required(),
      });
      const { email, password, fullName } = req.body;
      Joi.validate({ email, password, fullName }, schema, (err, val) => {
        if (err) throw new Error('Failed to validate input');
        req.body = val;
        next();
      });
    } catch (error) {
      res.status(400).send({
        code: sha1('validateJoin' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static join = async (req: Request, res: Response) => {
    try {
      const { email, password, fullName } = req.body;
      const confirmationCode = randomBytes(20).toString('hex');
      const alreadyRegistered = await userModel
        .findOne({ 'shared.email': email })
        .exec();
      if (alreadyRegistered) throw new Error('You have already registered');
      const hash = await bcrypt.hash(password, 10);
      if (!hash) throw new Error('Failed to hash password');
      const user = new userModel({
        email: { confirmationCode },
        password: { hash },
        shared: { email, fullName },
      } as UserModelInterface);
      const saved = await user.save();
      if (!saved) throw new Error('Database failed to save');
      const jwtToken = jwt.sign(
        { email: saved.shared.email, id: saved._id },
        process.env.JWT_SECRET
      );
      if (!jwtToken) throw new Error('JWT failed to generate');
      const sent = await Email.confirmEmail(
        saved.shared.fullName,
        saved.shared.email,
        saved.email.confirmationCode
      );
      if (!sent) throw new Error('Email failed to send');
      res.status(200).send({ shared: saved.shared, jwtToken });
    } catch (error) {
      res.status(400).send({
        code: sha1('join' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static validateConfirmEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const schema = Joi.object().keys({
        confirmationCode: Joi.string()
          .trim()
          .min(40)
          .max(40)
          .required(),
      });
      const { confirmationCode } = req.body;
      Joi.validate({ confirmationCode }, schema, (err, val) => {
        if (err) throw new Error('Failed to validate input');
        req.body = val;
        next();
      });
    } catch (error) {
      res.status(400).send({
        code: sha1(
          'validateConfirmEmail' + error.message || 'Internal Server Error'
        ),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static confirmEmail = async (req: Request, res: Response) => {
    try {
      const { confirmationCode } = req.body;
      const saved = await userModel
        .findOneAndUpdate(
          { 'email.confirmationCode': confirmationCode },
          {
            $set: { 'shared.warningMessage': '', 'email.confirmed': true },
            $unset: { 'email.confirmationCode': '' },
          },
          {
            new: true,
          }
        )
        .exec();
      if (!saved) throw new Error('Invalid confirmation code');
      const jwtToken = jwt.sign(
        { email: saved.shared.email, id: saved._id },
        process.env.JWT_SECRET
      );
      if (!jwtToken) throw new Error('JWT failed to generate');

      res.status(200).send({ shared: saved.shared, jwtToken });
    } catch (error) {
      res.status(400).send({
        code: sha1('confirmEmail' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static validateResendEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const schema = Joi.object().keys({
        jwtToken: Joi.string().regex(
          /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
        ),
      });
      const { jwtToken } = req.body;
      Joi.validate({ jwtToken }, schema, (err, val) => {
        if (err) throw new Error('Failed to validate input');
        req.body = val;
        next();
      });
    } catch (error) {
      res.status(400).send({
        code: sha1(
          'validateResendEmail' + error.message || 'Internal Server Error'
        ),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static resendEmail = async (req: Request, res: Response) => {
    try {
      interface JwtInterface {
        email: string;
        id: string;
      }
      const jwtToken = jwt.verify(req.body.jwtToken, process.env.JWT_SECRET);
      const isJWTData = (input: object | string): input is JwtInterface => {
        return typeof input === 'object' && 'id' in input;
      };
      if (!isJWTData(jwtToken)) throw new Error('JWT could not be verified');
      const email = jwtToken.email;
      const account = await userModel
        .findOneAndUpdate(
          { 'shared.email': email },
          {
            $set: {
              'email.confirmationSentAt': Date.now(),
            },
          }
        )
        .exec();
      if (!account) throw new Error('Database failed to find');
      const { fullName } = account.shared;
      const { confirmationCode } = account.email;
      const sent = await Email.confirmEmail(fullName, email, confirmationCode);
      if (!sent) throw new Error('Email failed to send');
      res
        .status(200)
        .send({ shared: account.shared, jwtToken: req.body.jwtToken });
    } catch (error) {
      res.status(400).send({
        code: sha1(
          'validateResendEmail' + error.message || 'Internal Server Error'
        ),
        error: error.message || 'Internal Server Error',
      });
    }
  };
}

export { Join };
