import * as Joi from '@hapi/joi';
import { NextFunction, Request, Response } from 'express';
import { userModel } from '../models/user';

class User {
  static validateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const schema = Joi.object().keys({
      username: Joi.string()
        .trim()
        .max(50)
        .required(),
    });
    const { username } = req.params;
    Joi.validate({ username }, schema, (err, val) => {
      if (!err) {
        req.params = val;
        next();
      } else res.status(400).send(err.details);
    });
  };

  static profile = async (req: Request, res: Response) => {
    try {
      const account = await userModel
        .findOne({ 'shared.username': req.params.username })
        .exec();
      if (account) {
        const { avatarId, fullName, bio, username, webSite, country } = account.shared;
        const { updatedAt, createdAt } = account;
        res
          .status(200)
          .send({ avatarId, fullName, updatedAt, createdAt, bio, username, webSite, country });
      } else res.status(400).send({ message: 'Server Error' });
    } catch (error) {
      res.status(400).send({ message: 'Server Error', error });
    }
  };
}

export { User };
