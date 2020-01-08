import * as Joi from '@hapi/joi';
import { NextFunction, Request, Response } from 'express';
import sha1 = require('sha1');
import { photoModel } from '../models/photos';

class All {

  static validatePhotos = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const schema = Joi.object().keys({
        limit: Joi.number()
          .max(100)
          .required(),
        sortBy: Joi.string()
          .lowercase()
          .trim()
          .max(70)
          .required(),
      });
      const { limit, sortBy } = req.query;
      Joi.validate({ limit, sortBy }, schema, (err, val) => {
        if (err) {
          throw new Error('Failed to validate input ' + err.details[0].message);
        }
        req.query = val;
        next();
      });
    } catch (error) {
      res.status(400).send({
        code: sha1('validatePhotos' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static photos = async (req: Request, res: Response) => {
    try {
      const { limit, sortBy } = req.query;
      const photos = await photoModel.find({published: true}).sort({createdAt: -1.0}).limit(limit);
      res.status(200).send({photos});
    } catch (error) {
      res.status(400).send({
        code: sha1('photos' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static validatePhotosDetail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const schema = Joi.object().keys({
        id: Joi.string()
          .lowercase()
          .trim()
          .max(70)
          .required(),
      });
      const { id } = req.query;
      Joi.validate({ id }, schema, (err, val) => {
        if (err) {
          throw new Error('Failed to validate input ' + err.details[0].message);
        }
        req.query = val;
        next();
      });
    } catch (error) {
      res.status(400).send({
        code: sha1('validatePhotos' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static photosDetail = async (req: Request, res: Response) => {
    try {
      const { id } = req.query;
      const photos = await photoModel.findOne({_id: id});
      res.status(200).send(photos);
    } catch (error) {
      res.status(400).send({
        code: sha1('photos' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };
}

export { All };
