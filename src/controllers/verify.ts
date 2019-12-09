import * as Joi from '@hapi/joi';
import { randomBytes } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { Store } from '../components/store';
import { userModel } from '../models/user';

class Verify {
  static validateWorbli = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const schema = Joi.object().keys({
      accountName: Joi.string()
        .trim()
        .max(30)
        .required(),
      jwtToken: Joi.string().regex(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
      ),
    });
    const { accountName, jwtToken } = req.body;
    Joi.validate({ accountName, jwtToken }, schema, (err, val) => {
      if (!err) {
        req.body = val;
        next();
      } else res.status(400).send(err.details);
    });
  };

  static worbli = async (req: Request, res: Response) => {
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
        const worbliAccountName = req.body.accountName;
        const worbliConfirmed = true;
        const check = await userModel.findOne({ email }).exec();
        if (!check.worbliConfirmed) {
          const confirmed = await userModel
            .findOneAndUpdate(
              { email },
              {
                $set: { worbliConfirmed, worbliAccountName },
              }
            )
            .exec();
          if (confirmed) res.status(200).send({ message: 'Account Saved' });
          else res.status(400).send({ message: 'Server Error' });
        }
      } else {
        res.status(400).send({ message: 'Invalid Token' });
      }
    } catch (error) {
      res.status(400).send({ message: 'Invalid Token', error });
    }
  };

  static validateInvestorImg = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const schema = Joi.object().keys({
      fileName: Joi.string()
        .trim()
        .required(),
      jwtToken: Joi.string().regex(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
      ),
    });
    const { fileName, jwtToken } = req.body;
    Joi.validate({ fileName, jwtToken }, schema, (err, val) => {
      if (!err) {
        req.body = val;
        next();
      } else res.status(400).send(err.details);
    });
  };

  static investorImg = async (req: Request, res: Response) => {
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
        const fileName = req.body.fileName;
        const check = await userModel.findOne({ email }).exec();
        if (!check.investorSubmitted) {
          const confirmed = await userModel
            .findOneAndUpdate(
              { email },
              {
                $set: { fileName, investorSubmitted: true },
              }
            )
            .exec();
          if (confirmed) res.status(200).send({ message: 'Image Saved' });
          else res.status(400).send({ message: 'Server Error' });
        }
      } else {
        res.status(400).send({ message: 'Invalid Token' });
      }
    } catch (error) {
      res.status(400).send({ message: 'Invalid Token', error });
    }
  };

  static validateInvestorUrl = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const schema = Joi.object().keys({
      certificateUrl: Joi.string()
        .trim()
        .max(30)
        .required(),
      jwtToken: Joi.string().regex(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
      ),
    });
    const { certificateUrl, jwtToken } = req.body;
    Joi.validate({ certificateUrl, jwtToken }, schema, (err, val) => {
      if (!err) {
        req.body = val;
        next();
      } else res.status(400).send(err.details);
    });
  };

  static investorUrl = async (req: Request, res: Response) => {
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
        const certificateUrl = req.body.certificateUrl;
        const check = await userModel.findOne({ email }).exec();
        if (!check.investorSubmitted) {
          const confirmed = await userModel
            .findOneAndUpdate(
              { email },
              {
                $set: { certificateUrl, investorSubmitted: true },
              }
            )
            .exec();
          if (confirmed) res.status(200).send({ message: 'URL Submitted' });
          else res.status(400).send({ message: 'Server Error' });
        }
      } else {
        res.status(400).send({ message: 'Invalid Token' });
      }
    } catch (error) {
      res.status(400).send({ message: 'Invalid Token', error });
    }
  };

  static validateInvestor = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const schema = Joi.object().keys({
      jwtToken: Joi.string().regex(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
      ),
    });
    const { jwtToken } = req.body;
    Joi.validate({ jwtToken }, schema, (err, val) => {
      if (!err) {
        req.body = val;
        next();
      } else res.status(400).send(err.details);
    });
  };

  static investor = async (req: Request, res: Response) => {
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
        const confirmed = await userModel.findOne({ email }).exec();
        if (confirmed) {
          const investorSubmitted = confirmed.investorSubmitted;
          const investorConfirmed = confirmed.investorConfirmed;
          res.status(200).send({
            investorConfirmed,
            investorSubmitted,
            message: 'Investor Status',
          });
        } else res.status(400).send({ message: 'Server Error' });
      } else {
        res.status(400).send({ message: 'Invalid Token' });
      }
    } catch (error) {
      res.status(400).send({ message: 'Invalid Token', error });
    }
  };
}

export { Verify };
