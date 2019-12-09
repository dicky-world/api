import * as Joi from '@hapi/joi';
import { randomBytes } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { Store } from '../components/store';
import { userModel } from '../models/user';

class Upload {
  static validateGetSignedUrl = async (
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

  static getSignedUrl = async (req: Request, res: Response) => {
    try {
      interface JwtInterface {
        email: string;
        id: string;
      }
      const fileName = randomBytes(20).toString('hex');
      const contentType = 'image/jpeg';
      const jwtData = jwt.verify(req.body.jwtToken, process.env.JWT_SECRET);
      const isJWTData = (input: object | string): input is JwtInterface => {
        return typeof input === 'object' && 'id' in input;
      };
      if (isJWTData(jwtData)) {
        const email = jwtData.email;
        const account = await userModel.findOne({ email }).exec();
        const { _id } = account;
        const key = `${_id}/${fileName}.jpg`;
        const expires = 60;
        const signedUrl = await Store.getSignedUrl(contentType, key, expires);
        // TODO: Save signedUrl to tempoary table, check this table against the bucket and keep clean
        if (!signedUrl) {
          res.status(400).send({ message: 'Signed URL was not created' });
        } else res.status(200).send({ signedUrl });
      } else {
        res.status(400).send({ message: 'Invalid Token' });
      }
    } catch (error) {
      res.status(400).send({ message: 'Invalid Token', error });
    }
  };
}

export { Upload };
