import * as Joi from '@hapi/joi';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';
import { followingModel } from '../models/following';
import { userModel } from '../models/user';

class User {
  static validateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const schema = Joi.object().keys({
      jwtToken: Joi.string()
        .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
        .allow(''),
      username: Joi.string()
        .trim()
        .max(50)
        .required(),
    });
    const { jwtToken, username } = req.body;
    Joi.validate({ jwtToken, username }, schema, (err, val) => {
      if (!err) {
        req.params = val;
        next();
      } else res.status(400).send(err.details);
    });
  };

  static profile = async (req: Request, res: Response) => {
    try {
      let id: string;
      const { jwtToken, username } = req.body;
      if (jwtToken) {
        interface JwtInterface {
          email: string;
          id: string;
        }
        const jwtData = jwt.verify(jwtToken, process.env.JWT_SECRET);
        const isJWTData = (input: object | string): input is JwtInterface => {
          return typeof input === 'object' && 'id' in input;
        };
        if (!isJWTData(jwtData)) throw new Error('JWT could not be verified');
        id = jwtData.id;
      }
      const account = await userModel.aggregate([
        { $match: { 'shared.username': username } },
        {
          $lookup: {
            as: 'photos',
            from: 'photos',
            let: {
              local_id: '$_id',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$$local_id', '$userId'],
                  },
                },
              },
              {
                $sort: {
                  createdAt: -1.0,
                },
              },
              {
                $limit: 50.0,
              },
            ],
          },
        },
        {
          $project: {
            _id: 1.0,
            photos: 1.0,
            shared: 1.0,
          },
        },
      ]);
      if (!account[0]) throw new Error('User not found');
      if (id === account[0]._id.toString()) {
        account[0].shared.canFollow = false;
        account[0].shared.isMe = true;
        res
          .status(200)
          .send({ shared: account[0].shared, photos: account[0].photos });
      } else {
        const alreadyFollowing = await followingModel
          .findOne({ userId: id, followingId: account[0]._id })
          .exec();
        if (alreadyFollowing) {
          account[0].shared.canFollow = false;
          res
            .status(200)
            .send({ shared: account[0].shared, photos: account[0].photos });
        } else {
          account[0].shared.canFollow = true;
          res
            .status(200)
            .send({ shared: account[0].shared, photos: account[0].photos });
        }
      }
    } catch (error) {
      res.status(400).send({ message: 'Server Error', error });
    }
  };

  static validateFollow = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const schema = Joi.object().keys({
      jwtToken: Joi.string()
        .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
        .allow(''),
      username: Joi.string()
        .trim()
        .max(50)
        .required(),
    });
    const { jwtToken, username } = req.body;
    Joi.validate({ jwtToken, username }, schema, (err, val) => {
      if (!err) {
        req.params = val;
        next();
      } else res.status(400).send(err.details);
    });
  };

  static follow = async (req: Request, res: Response) => {
    // TODO: move all userModel calls to https://mongoosejs.com/docs/api.html#model_Model.bulkWrite
    try {
      let id: string;
      const { jwtToken, username } = req.body;
      if (jwtToken) {
        interface JwtInterface {
          email: string;
          id: string;
        }
        const jwtData = jwt.verify(jwtToken, process.env.JWT_SECRET);
        const isJWTData = (input: object | string): input is JwtInterface => {
          return typeof input === 'object' && 'id' in input;
        };
        if (!isJWTData(jwtData)) throw new Error('JWT could not be verified');
        id = jwtData.id;
      }

      const getAccount = await userModel
        .findOne({ 'shared.username': username })
        .exec();
      if (!getAccount) throw new Error('User not found');

      const alreadyFollowing = await followingModel
        .findOneAndUpdate(
          {
            followingId: getAccount.id,
            userId: id,
          },
          {
            $set: { followingId: getAccount.id, userId: id },
          },
          {
            new: false,
            upsert: true,
          }
        )
        .exec();
      if (!alreadyFollowing) {
        getAccount.shared.followers++;
        getAccount.shared.canFollow = false;
        res.status(200).send({ shared: getAccount.shared, jwtToken });
        userModel
          .findOneAndUpdate({ _id: id }, { $inc: { 'shared.following': 1 } })
          .exec();
        userModel
          .findOneAndUpdate(
            { _id: getAccount.id },
            { $inc: { 'shared.followers': 1 } }
          )
          .exec();
      } else {
        getAccount.shared.followers++;
        getAccount.shared.canFollow = false;
        res.status(200).send({ shared: getAccount.shared, jwtToken });
      }
    } catch (error) {
      res.status(400).send({ message: 'Server Error', error });
    }
  };

  static validateUnfollow = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const schema = Joi.object().keys({
      jwtToken: Joi.string()
        .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
        .allow(''),
      username: Joi.string()
        .trim()
        .max(50)
        .required(),
    });
    const { jwtToken, username } = req.body;
    Joi.validate({ jwtToken, username }, schema, (err, val) => {
      if (!err) {
        req.params = val;
        next();
      } else res.status(400).send(err.details);
    });
  };

  static unfollow = async (req: Request, res: Response) => {
    // TODO: move all userModel calls to https://mongoosejs.com/docs/api.html#model_Model.bulkWrite
    try {
      let id: string;
      const { jwtToken, username } = req.body;
      if (jwtToken) {
        interface JwtInterface {
          email: string;
          id: string;
        }
        const jwtData = jwt.verify(jwtToken, process.env.JWT_SECRET);
        const isJWTData = (input: object | string): input is JwtInterface => {
          return typeof input === 'object' && 'id' in input;
        };
        if (!isJWTData(jwtData)) throw new Error('JWT could not be verified');
        id = jwtData.id;
      }

      const getAccount = await userModel
        .findOne({ 'shared.username': username })
        .exec();
      if (!getAccount) throw new Error('User not found');

      const removed = await followingModel
        .findOneAndRemove({
          followingId: getAccount.id,
          userId: id,
        })
        .exec();
      if (removed) {
        getAccount.shared.followers--;
        getAccount.shared.canFollow = true;
        res.status(200).send({ shared: getAccount.shared, jwtToken });
        userModel
          .findOneAndUpdate({ _id: id }, { $inc: { 'shared.following': -1 } })
          .exec();
        userModel
          .findOneAndUpdate(
            { _id: getAccount.id },
            { $inc: { 'shared.followers': -1 } }
          )
          .exec();
      } else {
        getAccount.shared.canFollow = true;
        getAccount.shared.followers--;
        res.status(200).send({ shared: getAccount.shared, jwtToken });
      }
    } catch (error) {
      res.status(400).send({ message: 'Server Error', error });
    }
  };

  static validateFollowers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const schema = Joi.object().keys({
      jwtToken: Joi.string()
        .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
        .allow(''),
      username: Joi.string()
        .trim()
        .max(50)
        .required(),
    });
    const { jwtToken, username } = req.body;
    Joi.validate({ jwtToken, username }, schema, (err, val) => {
      if (!err) {
        req.params = val;
        next();
      } else res.status(400).send(err.details);
    });
  };

  static followers = async (req: Request, res: Response) => {
    try {
      let myId: string;
      const { jwtToken, username } = req.body;
      if (jwtToken) {
        interface JwtInterface {
          email: string;
          id: string;
        }
        const jwtData = jwt.verify(jwtToken, process.env.JWT_SECRET);
        const isJWTData = (input: object | string): input is JwtInterface => {
          return typeof input === 'object' && 'id' in input;
        };
        if (!isJWTData(jwtData)) throw new Error('JWT could not be verified');
        myId = jwtData.id;
      }
      const objectId = mongoose.Types.ObjectId(myId);
      const followers = await userModel.aggregate([
        { $match: { 'shared.username': username } },
        {
          $lookup: {
            as: 'followers',
            foreignField: 'followingId',
            from: 'followings',
            localField: '_id',
          },
        },
        { $unwind: { path: '$followers' } },
        {
          $lookup: {
            as: 'followerData',
            foreignField: '_id',
            from: 'users',
            localField: 'followers.userId',
          },
        },
        { $unwind: { path: '$followerData' } },
        {
          $lookup: {
            as: 'amIinThisArray',
            foreignField: 'followingId',
            from: 'followings',
            localField: 'followerData._id',
          },
        },
        {
          $addFields: {
            avatarId: '$followerData.shared.avatarId',
            fullName: '$followerData.shared.fullName',
            imFollowing: {
              $in: [objectId, '$amIinThisArray.userId'],
            },
            username: '$followerData.shared.username',
          },
        },
        {
          $project: {
            _id: 0.0,
            avatarId: 1.0,
            fullName: 1.0,
            imFollowing: 1.0,
            username: 1.0,
          },
        },
      ]);
      res.status(200).send({ followers });
    } catch (error) {
      res.status(400).send({ message: 'Server Error', error });
    }
  };

  static validateFollowing = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const schema = Joi.object().keys({
      jwtToken: Joi.string()
        .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
        .allow(''),
      username: Joi.string()
        .trim()
        .max(50)
        .required(),
    });
    const { jwtToken, username } = req.body;
    Joi.validate({ jwtToken, username }, schema, (err, val) => {
      if (!err) {
        req.params = val;
        next();
      } else res.status(400).send(err.details);
    });
  };

  static following = async (req: Request, res: Response) => {
    try {
      let myId: string;
      const { jwtToken, username } = req.body;
      if (jwtToken) {
        interface JwtInterface {
          email: string;
          id: string;
        }
        const jwtData = jwt.verify(jwtToken, process.env.JWT_SECRET);
        const isJWTData = (input: object | string): input is JwtInterface => {
          return typeof input === 'object' && 'id' in input;
        };
        if (!isJWTData(jwtData)) throw new Error('JWT could not be verified');
        myId = jwtData.id;
      }
      const objectId = mongoose.Types.ObjectId(myId);
      const following = await userModel.aggregate([
        { $match: { 'shared.username': username } },
        {
          $lookup: {
            as: 'followers',
            foreignField: 'userId',
            from: 'followings',
            localField: '_id',
          },
        },
        { $unwind: { path: '$followers' } },
        {
          $lookup: {
            as: 'followerData',
            foreignField: '_id',
            from: 'users',
            localField: 'followers.followingId',
          },
        },
        { $unwind: { path: '$followerData' } },
        {
          $lookup: {
            as: 'amIinThisArray',
            foreignField: 'userId',
            from: 'followings',
            localField: 'followerData._id',
          },
        },
        {
          $addFields: {
            avatarId: '$followerData.shared.avatarId',
            fullName: '$followerData.shared.fullName',
            imFollowing: {
              $in: [objectId, '$amIinThisArray.followingId'],
            },
            username: '$followerData.shared.username',
          },
        },
        {
          $project: {
            _id: 0.0,
            avatarId: 1.0,
            fullName: 1.0,
            imFollowing: 1.0,
            username: 1.0,
          },
        },
      ]);
      res.status(200).send({ following });
    } catch (error) {
      res.status(400).send({ message: 'Server Error', error });
    }
  };
}

export { User };
