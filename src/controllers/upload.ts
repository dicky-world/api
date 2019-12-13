import * as Joi from '@hapi/joi';
import { randomBytes } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import sha1 = require('sha1');
import { Store } from '../components/store';

class Upload {
  static validateSignedUrl = async (
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
        if (err) throw new Error('Failed to validate input ' + err.details[0].message);
        req.body = val;
        next();
      });
    } catch (error) {
      res.status(400).send({
        code: sha1(
          'validateGetSignedUrl' + error.message || 'Internal Server Error'
        ),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static signedUrl = async (req: Request, res: Response) => {
    try {
      interface JwtInterface {
        email: string;
        id: string;
      }
      const jwtData = jwt.verify(req.body.jwtToken, process.env.JWT_SECRET);
      const isJWTData = (input: object | string): input is JwtInterface => {
        return typeof input === 'object' && 'id' in input;
      };
      if (!isJWTData(jwtData)) throw new Error('JWT could not be verified');
      const id = jwtData.id;
      const fileName = randomBytes(20).toString('hex');
      const key = `${id}/${fileName}.jpg`;
      const expires = 60;
      const contentType = 'image/jpeg';
      const signedUrl = await Store.getSignedUrl(contentType, key, expires);
      // TODO: Save signedUrl to temporary table, check this table against the bucket and keep clean
      if (!signedUrl) throw new Error('Signed URL was not created');
      res.status(200).send({
        jwtToken: req.body.jwtToken,
        signedUrl,
      });
    } catch (error) {
      res.status(400).send({
        code: sha1('getSignedUrl' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };
}

export { Upload };
