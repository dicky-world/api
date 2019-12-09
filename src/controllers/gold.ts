import * as Joi from '@hapi/joi';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { goldPriceModel, GoldPriceModelInterface } from '../models/goldPrice';

class Gold {
  static validatePrice = async (
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

  static price = async (req: Request, res: Response) => {
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
        const price = await goldPriceModel
          .find()
          .sort({ createdAt: -1 })
          .limit(50)
          .exec();
        if (!price) {
          res.status(400).send({ message: 'There are no gold prices' });
        } else {
          res.status(200).send({ message: 'Gold Prices Found', price });
        }
      } else {
        res.status(400).send({ message: 'Invalid Token' });
      }
    } catch (error) {
      res.status(400).send({ message: 'Server Error', error });
    }
  };
}

export { Gold };
