import * as Joi from '@hapi/joi';
import * as bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { userModel } from '../models/user';

class User {
  static validateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const schema = Joi.object().keys({
      email: Joi.string()
        .trim()
        .max(50)
        .required(),
      fullName: Joi.string()
        .trim()
        .max(30)
        .required(),
      jwtToken: Joi.string().regex(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
      ),
    });
    const { email, fullName, jwtToken } = req.body;
    Joi.validate({ email, fullName, jwtToken }, schema, (err, val) => {
      if (!err) {
        req.body = val;
        next();
      } else res.status(400).send(err.details);
    });
  };

  static profile = async (req: Request, res: Response) => {
    try {
      interface JwtInterface {
        email: string;
        id: string;
      }
      const jwtData = jwt.verify(req.body.jwtToken, process.env.JWT_SECRET);
      const isJWTData = (input: object | string): input is JwtInterface => {
        return typeof input === 'object' && 'id' in input;
      };
      if (isJWTData(jwtData)) {
        const email = jwtData.email;
        const fullName = req.body.fullName;
        const confirmed = await userModel
          .findOneAndUpdate(
            { email },
            {
              $set: { fullName, email },
            }
          )
          .exec();
        if (confirmed) res.status(200).send({ message: 'Profile Saved' });
        else res.status(400).send({ message: 'Server Error' });
      } else {
        res.status(400).send({ message: 'Invalid Token' });
      }
    } catch (error) {
      res.status(400).send({ message: 'Server Error', error });
    }
  };

  static validatePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const schema = Joi.object().keys({
      jwtToken: Joi.string().regex(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
      ),
      password: Joi.string()
        .trim()
        .max(30)
        .required(),
    });
    const { password, jwtToken } = req.body;
    Joi.validate({ password, jwtToken }, schema, (err, val) => {
      if (!err) {
        req.body = val;
        next();
      } else res.status(400).send(err.details);
    });
  };

  static password = async (req: Request, res: Response) => {
    try {
      interface JwtInterface {
        email: string;
        id: string;
      }
      const jwtData = jwt.verify(req.body.jwtToken, process.env.JWT_SECRET);
      const isJWTData = (input: object | string): input is JwtInterface => {
        return typeof input === 'object' && 'id' in input;
      };
      if (isJWTData(jwtData)) {
        const email = jwtData.email;
        const password = req.body.password;
        const hashedPassword = await bcrypt.hash(password, 10);
        if (!hashedPassword) {
          res.status(500).send({ message: 'Failed to encrypt your password' });
        } else {
          const confirmed = await userModel
            .findOneAndUpdate(
              { email },
              {
                $set: { password: hashedPassword },
              }
            )
            .exec();
          if (confirmed)
            res.status(200).send({ message: 'New Password Saved' });
          else res.status(400).send({ message: 'Server Error' });
        }
      } else {
        res.status(400).send({ message: 'Invalid Token' });
      }
    } catch (error) {
      res.status(400).send({ message: 'Server Error', error });
    }
  };
}

export { User };
