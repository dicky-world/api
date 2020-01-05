import * as Joi from '@hapi/joi';
import * as authenticator from 'authenticator';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import sha1 = require('sha1');
import { Email } from '../components/email';
import { Store } from '../components/store';
import { photoModel, PhotoModelInterface } from '../models/photos';
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
        if (err) {
          throw new Error('Failed to validate input ' + err.details[0].message);
        }
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
      const { jwtToken, location } = req.body;
      const jwtData = jwt.verify(jwtToken, process.env.JWT_SECRET);
      const isJWTData = (input: object | string): input is JwtInterface => {
        return typeof input === 'object' && 'id' in input;
      };
      if (!isJWTData(jwtData)) throw new Error('JWT could not be verified');
      const email = jwtData.email;
      const account = await userModel
        .findOneAndUpdate(
          { 'shared.email': email },
          {
            $set: { 'shared.location': location },
          },
          {
            new: true,
          }
        )
        .exec();
      if (!account) throw new Error('Database failed to find');
      res.status(200).send({ shared: account.shared, jwtToken });
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
        if (err) {
          throw new Error('Failed to validate input ' + err.details[0].message);
        }
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
      const { jwtToken, avatarId } = req.body;
      const jwtData = jwt.verify(jwtToken, process.env.JWT_SECRET);
      const isJWTData = (input: object | string): input is JwtInterface => {
        return typeof input === 'object' && 'id' in input;
      };
      if (!isJWTData(jwtData)) throw new Error('JWT could not be verified');
      const email = jwtData.email;
      const account = await userModel
        .findOneAndUpdate(
          { 'shared.email': email },
          {
            $set: { 'shared.avatarId': avatarId },
          }
        )
        .exec();
      if (!account) throw new Error('Database failed to find');
      if (account.shared.avatarId) {
        const deletedOldImg = await Store.deleteObject(account.shared.avatarId);
        if (!deletedOldImg) throw new Error('Old Image was not deleted');
      }
      account.shared.avatarId = avatarId;
      res.status(200).send({ shared: account.shared, jwtToken });
    } catch (error) {
      res.status(400).send({
        code: sha1('avatar' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static validateCover = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const schema = Joi.object().keys({
        coverId: Joi.string()
          .trim()
          .max(70)
          .required(),
        jwtToken: Joi.string()
          .required()
          .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/),
      });
      const { coverId, jwtToken } = req.body;
      Joi.validate({ coverId, jwtToken }, schema, (err, val) => {
        if (err) {
          throw new Error('Failed to validate input ' + err.details[0].message);
        }
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

  static cover = async (req: Request, res: Response) => {
    try {
      interface JwtInterface {
        email: string;
        id: string;
      }
      const { jwtToken, coverId } = req.body;
      const jwtData = jwt.verify(jwtToken, process.env.JWT_SECRET);
      const isJWTData = (input: object | string): input is JwtInterface => {
        return typeof input === 'object' && 'id' in input;
      };
      if (!isJWTData(jwtData)) throw new Error('JWT could not be verified');
      const email = jwtData.email;
      const account = await userModel
        .findOneAndUpdate(
          { 'shared.email': email },
          {
            $set: { 'shared.coverId': coverId },
          }
        )
        .exec();
      if (!account) throw new Error('Database failed to find');
      if (account.shared.coverId) {
        const deletedOldImg = await Store.deleteObject(account.shared.coverId);
        if (!deletedOldImg) throw new Error('Old Image was not deleted');
      }
      account.shared.coverId = coverId;
      res.status(200).send({ shared: account.shared, jwtToken });
    } catch (error) {
      res.status(400).send({
        code: sha1('avatar' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static validateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const schema = Joi.object().keys({
        bio: Joi.string()
          .trim()
          .allow('')
          .max(256),
        country: Joi.string()
          .trim()
          .allow('')
          .max(2),
        day: Joi.string().max(2),
        email: Joi.string()
          .lowercase()
          .trim()
          .max(320)
          .email({ minDomainSegments: 2 })
          .required(),
        emailChanged: Joi.boolean().required(),
        fullName: Joi.string()
          .trim()
          .max(70)
          .required(),
        gender: Joi.string()
          .trim()
          .max(6)
          .min(4),
        jwtToken: Joi.string()
          .required()
          .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/),
        mobileCode: Joi.string()
          .allow('')
          .max(4),
        mobileNumber: Joi.string()
          .allow('')
          .max(15),
        month: Joi.string().max(2),
        username: Joi.string()
          .trim()
          .max(20),
        webSite: Joi.string()
          .trim()
          .allow('')
          .max(50),
        year: Joi.string().max(4),
      });
      const {
        bio,
        country,
        day,
        email,
        emailChanged,
        fullName,
        gender,
        jwtToken,
        mobileCode,
        mobileNumber,
        month,
        webSite,
        year,
      } = req.body;
      Joi.validate(
        {
          bio,
          country,
          day,
          email,
          emailChanged,
          fullName,
          gender,
          jwtToken,
          mobileCode,
          mobileNumber,
          month,
          webSite,
          year,
        },
        schema,
        (err, val) => {
          if (err) {
            throw new Error(
              'Failed to validate input ' + err.details[0].message
            );
          }
          req.body = val;
          next();
        }
      );
    } catch (error) {
      res.status(400).send({
        code: sha1(
          'validateProfile' + error.message || 'Internal Server Error'
        ),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static profile = async (req: Request, res: Response) => {
    try {
      const confirmationCode = randomBytes(20).toString('hex');
      interface JwtInterface {
        email: string;
        id: string;
      }
      const {
        bio,
        country,
        emailChanged,
        fullName,
        gender,
        jwtToken,
        webSite,
        day,
        mobileCode,
        mobileNumber,
        month,
        year,
      } = req.body;
      const jwtData = jwt.verify(jwtToken, process.env.JWT_SECRET);
      const isJWTData = (input: object | string): input is JwtInterface => {
        return typeof input === 'object' && 'id' in input;
      };
      if (!isJWTData(jwtData)) throw new Error('JWT could not be verified');
      const email = jwtData.email;

      interface DataInterface {
        ['email.confirmationCode']?: string;
        ['email.confirmed']?: boolean;
        ['shared.bio']?: string;
        ['shared.country']?: string;
        ['shared.dob']?: Date;
        ['shared.email']?: string;
        ['shared.fullName']?: string;
        ['shared.gender']?: string;
        ['shared.mobileCode']?: string;
        ['shared.mobileNumber']?: string;
        ['shared.username']?: string;
        ['shared.warningMessage']?: 'verify' | '';
        ['shared.webSite']?: string;
      }

      const data: DataInterface = {};
      if (mobileCode) data['shared.mobileCode'] = mobileCode;
      if (mobileNumber) data['shared.mobileNumber'] = mobileNumber;
      if (bio) data['shared.bio'] = bio;
      if (country) data['shared.country'] = country;
      if (email) data['shared.email'] = req.body.email;
      if (emailChanged) {
        data['shared.warningMessage'] = 'verify';
        data['email.confirmationCode'] = confirmationCode;
        data['email.confirmed'] = false;
      }
      if (fullName) data['shared.fullName'] = fullName;
      if (gender) data['shared.gender'] = gender;
      if (webSite) data['shared.webSite'] = webSite;
      if (day !== '0' && month !== '0' && year !== '0') {
        const dob = new Date(`${year}-${month}-${day}`);
        dob.setHours(0, 0, 0, 0);
        data['shared.dob'] = dob;
      }
      const account = await userModel
        .findOneAndUpdate(
          { 'shared.email': email },
          { $set: data },
          { new: true }
        )
        .exec();
      if (!account) throw new Error('Database failed to find');
      if (emailChanged) {
        const sent = await Email.confirmEmail(
          account.shared.fullName,
          account.shared.email,
          account.email.confirmationCode
        );
        if (!sent) throw new Error('Email failed to send');
      }
      res.status(200).send({ shared: account.shared, jwtToken });
    } catch (error) {
      res.status(400).send({
        code: sha1('profile' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static validatePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const schema = Joi.object().keys({
        currentPassword: Joi.string()
          .trim()
          .max(70)
          .required(),
        jwtToken: Joi.string()
          .required()
          .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/),
        newPassword: Joi.string()
          .trim()
          .max(70)
          .required(),
      });
      const { currentPassword, jwtToken, newPassword } = req.body;
      Joi.validate(
        { currentPassword, jwtToken, newPassword },
        schema,
        (err, val) => {
          if (err) {
            throw new Error(
              'Failed to validate input ' + err.details[0].message
            );
          }
          req.body = val;
          next();
        }
      );
    } catch (error) {
      res.status(400).send({
        code: sha1(
          'validatePassword' + error.message || 'Internal Server Error'
        ),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static password = async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword, jwtToken } = req.body;
      interface JwtInterface {
        email: string;
        id: string;
      }
      const jwtData = jwt.verify(jwtToken, process.env.JWT_SECRET);
      const isJWTData = (input: object | string): input is JwtInterface => {
        return typeof input === 'object' && 'id' in input;
      };
      if (!isJWTData(jwtData)) throw new Error('JWT could not be verified');
      const { email } = jwtData;
      const account = await userModel.findOne({ 'shared.email': email }).exec();
      if (!account) throw new Error('Database failed to find');
      const passwordsMatch = await bcrypt.compare(
        currentPassword,
        account.password.hash
      );
      if (!passwordsMatch) throw new Error('Current password error');
      const hash = await bcrypt.hash(newPassword, 10);
      if (!hash) throw new Error('Failed to hash password');
      const account2 = await userModel
        .findOneAndUpdate(
          { 'shared.email': email },
          {
            $set: { 'password.hash': hash },
          }
        )
        .exec();
      if (!account2) throw new Error('Database failed to find');
      res.status(200).send({ shared: account2.shared, jwtToken });
    } catch (error) {
      res.status(400).send({
        code: sha1('password' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static validatePreferences = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const schema = Joi.object().keys({
        currency: Joi.string()
          .trim()
          .max(3)
          .required(),
        jwtToken: Joi.string()
          .required()
          .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/),
        language: Joi.string()
          .trim()
          .max(10)
          .required(),
      });
      const { currency, jwtToken, language } = req.body;
      Joi.validate({ currency, jwtToken, language }, schema, (err, val) => {
        if (err) {
          throw new Error('Failed to validate input ' + err.details[0].message);
        }
        req.body = val;
        next();
      });
    } catch (error) {
      res.status(400).send({
        code: sha1(
          'validatePreferences' + error.message || 'Internal Server Error'
        ),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static preferences = async (req: Request, res: Response) => {
    try {
      const { currency, jwtToken, language } = req.body;
      interface JwtInterface {
        email: string;
        id: string;
      }
      const jwtData = jwt.verify(jwtToken, process.env.JWT_SECRET);
      const isJWTData = (input: object | string): input is JwtInterface => {
        return typeof input === 'object' && 'id' in input;
      };
      if (!isJWTData(jwtData)) throw new Error('JWT could not be verified');
      const { email } = jwtData;
      const account = await userModel
        .findOneAndUpdate(
          { 'shared.email': email },
          {
            $set: { 'shared.language': language, 'shared.currency': currency },
          },
          { new: true }
        )
        .exec();
      if (!account) throw new Error('Database failed to find');
      res.status(200).send({ shared: account.shared, jwtToken });
    } catch (error) {
      res.status(400).send({
        code: sha1('preferences' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static validateTwoFactorAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const schema = Joi.object().keys({
        jwtToken: Joi.string()
          .required()
          .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/),
      });
      const { jwtToken } = req.body;
      Joi.validate({ jwtToken }, schema, (err, val) => {
        if (err) {
          throw new Error('Failed to validate input ' + err.details[0].message);
        }
        req.body = val;
        next();
      });
    } catch (error) {
      res.status(400).send({
        code: sha1('validateTwoFactorAuth' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static twoFactorAuth = async (req: Request, res: Response) => {
    try {
      const { jwtToken } = req.body;
      interface JwtInterface {
        email: string;
        id: string;
      }
      const jwtData = jwt.verify(jwtToken, process.env.JWT_SECRET);
      const isJWTData = (input: object | string): input is JwtInterface => {
        return typeof input === 'object' && 'id' in input;
      };
      if (!isJWTData(jwtData)) throw new Error('JWT could not be verified');
      const { email } = jwtData;
      const exists = await userModel.findOne({ 'shared.email': email }).exec();
      if (!exists) throw new Error('Database failed to find');
      let formattedKey: string;
      if (exists.password.formattedKey) {
        formattedKey = exists.password.formattedKey;
      } else {
        formattedKey = authenticator.generateKey();
      }
      const account = await userModel
        .findOneAndUpdate(
          { 'shared.email': email },
          {
            $set: { 'password.formattedKey': formattedKey },
          },
          { new: true }
        )
        .exec();
      if (!account) throw new Error('Database failed to find');
      const totpUri = authenticator.generateTotpUri(
        formattedKey,
        email,
        'DICKY',
        'SHA1',
        6,
        30
      );
      res.status(200).send({ jwtToken, totpUri, formattedKey });
    } catch (error) {
      res.status(400).send({
        code: sha1('twoFactorAuth' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static validateAddPhoto = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const schema = Joi.object().keys({
        category: Joi.string()
          .trim()
          .max(50)
          .required(),
        jwtToken: Joi.string()
          .required()
          .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/),
        previewId: Joi.string()
          .trim()
          .max(100)
          .required(),
        thumbnailId: Joi.string()
          .trim()
          .max(100)
          .required(),
        zoomId: Joi.string()
          .trim()
          .max(100)
          .required(),
      });
      const { category, jwtToken, previewId, thumbnailId, zoomId } = req.body;
      Joi.validate(
        { category, jwtToken, previewId, thumbnailId, zoomId },
        schema,
        (err, val) => {
          if (err) {
            throw new Error(
              'Failed to validate input ' + err.details[0].message
            );
          }
          req.body = val;
          next();
        }
      );
    } catch (error) {
      res.status(400).send({
        code: sha1(
          'validateAddPhoto' + error.message || 'Internal Server Error'
        ),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static addPhoto = async (req: Request, res: Response) => {
    try {
      const { category, jwtToken, previewId, thumbnailId, zoomId } = req.body;
      interface JwtInterface {
        email: string;
        id: string;
      }
      const jwtData = jwt.verify(jwtToken, process.env.JWT_SECRET);
      const isJWTData = (input: object | string): input is JwtInterface => {
        return typeof input === 'object' && 'id' in input;
      };
      if (!isJWTData(jwtData)) throw new Error('JWT could not be verified');
      const { id } = jwtData;
      const user = new photoModel({
        category,
        previewId,
        published: true,
        thumbnailId,
        userId: id,
        zoomId,
      } as PhotoModelInterface);
      const saved = await user.save();
      if (!saved) throw new Error('Database failed to save');
      res.status(200).send({ jwtToken });
    } catch (error) {
      res.status(400).send({
        code: sha1('addPhoto' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static validateMyPhotos = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const schema = Joi.object().keys({
        jwtToken: Joi.string()
          .required()
          .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/),
      });
      const { jwtToken } = req.body;
      Joi.validate({ jwtToken }, schema, (err, val) => {
        if (err) {
          throw new Error('Failed to validate input ' + err.details[0].message);
        }
        req.body = val;
        next();
      });
    } catch (error) {
      res.status(400).send({
        code: sha1(
          'validateMyPhotos' + error.message || 'Internal Server Error'
        ),
        error: error.message || 'Internal Server Error',
      });
    }
  };

  static myPhotos = async (req: Request, res: Response) => {
    try {
      const { jwtToken } = req.body;
      interface JwtInterface {
        email: string;
        id: string;
      }
      const jwtData = jwt.verify(jwtToken, process.env.JWT_SECRET);
      const isJWTData = (input: object | string): input is JwtInterface => {
        return typeof input === 'object' && 'id' in input;
      };
      if (!isJWTData(jwtData)) throw new Error('JWT could not be verified');
      const { id } = jwtData;
      // TODO: sort by time stamp
      const myPhotos = await photoModel.find({ userId: id }).limit(100).exec();
      res.status(200).send({ jwtToken, myPhotos });
    } catch (error) {
      res.status(400).send({
        code: sha1('myPhoto' + error.message || 'Internal Server Error'),
        error: error.message || 'Internal Server Error',
      });
    }
  };
}

export { My };
