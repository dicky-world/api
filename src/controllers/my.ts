import * as Joi from '@hapi/joi';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import sha1 = require('sha1');
import { Store } from '../components/store';
import { userModel } from '../models/user';

class My {
  static validateLocation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const schema = Joi.object().keys({
        jwtToken: Joi.string()
          .required()
          .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/),
        location: Joi.string()
          .trim()
          .max(70)
          .required(),
      });
      const { jwtToken, location } = req.body;
      Joi.validate({ jwtToken, location }, schema, (err, val) => {
        if (err) throw new Error('Failed to validate input');
        req.body = val;
        next();
      });
    } catch (error) {
      res.status(400).send({
        code: sha1(
          'validateLocation' + error.message || 'Internal Server Error'
        ),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static location = async (req: Request, res: Response) => {
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
            $set: { 'shared.location': req.body.location },
          },
          {
            new: true,
          }
        )
        .exec();
      if (!account) throw new Error('Database failed to find');
      res
        .status(200)
        .send({ shared: account.shared, jwtToken: req.body.jwtToken });
    } catch (error) {
      res.status(400).send({
        code: sha1('location' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static validateAvatar = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const schema = Joi.object().keys({
        avatarId: Joi.string()
          .trim()
          .max(70)
          .required(),
        jwtToken: Joi.string()
          .required()
          .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/),
      });
      const { avatarId, jwtToken } = req.body;
      Joi.validate({ avatarId, jwtToken }, schema, (err, val) => {
        if (err) throw new Error('Failed to validate input');
        req.body = val;
        next();
      });
    } catch (error) {
      res.status(400).send({
        code: sha1('validateAvatar' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static avatar = async (req: Request, res: Response) => {
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
            $set: { 'shared.avatarId': req.body.avatarId },
          }
        )
        .exec();
      if (!account) throw new Error('Database failed to find');
      if (account.shared.avatarId) {
      const deletedOldImg = await Store.deleteObject(account.shared.avatarId);
      if (!deletedOldImg) throw new Error('Old Image was not deleted');
      account.shared.avatarId = req.body.avatarId;
      res
        .status(200)
        .send({ shared: account.shared, jwtToken: req.body.jwtToken });
    } catch (error) {
      res.status(400).send({
        code: sha1('avatar' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };
}

export { My };
