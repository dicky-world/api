import * as Joi from '@hapi/joi';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { orderModel, OrderModelInterface } from '../models/order';

class Purchase {
  static validateTokens = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const schema = Joi.object().keys({
      jwtToken: Joi.string().regex(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
      ),
      note: Joi.string(),
      phoneNumber: Joi.string(),
      tokenPrice: Joi.number(),
      tokenQty: Joi.number(),
      total: Joi.number(),
      userId: Joi.string(),
    });
    const {
      jwtToken,
      note,
      phoneNumber,
      tokenPrice,
      tokenQty,
      total,
      userId,
    } = req.body;
    Joi.validate(
      { jwtToken, note, phoneNumber, tokenPrice, tokenQty, total, userId },
      schema,
      (err, val) => {
        if (!err) {
          req.body = val;
          next();
        } else res.status(400).send(err.details);
      }
    );
  };

  static tokens = async (req: Request, res: Response) => {
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
        const userId = jwtData.id;
        const { note, phoneNumber, tokenPrice, tokenQty, total } = req.body;
        const user = new orderModel({
          note,
          phoneNumber,
          tokenPrice,
          tokenQty,
          total,
          userId,
        } as OrderModelInterface);
        const confirmed = await user.save();
        if (confirmed) res.status(200).send({ message: 'Order Saved' });
        else res.status(400).send({ message: 'Server Error1' });
      } else {
        res.status(400).send({ message: 'Invalid Token' });
      }
    } catch (error) {
      res.status(400).send({ message: 'Server Error', error });
    }
  };
}

export { Purchase };
