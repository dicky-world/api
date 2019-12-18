import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

interface UserModelInterface extends Document {
  email: {
    confirmationCode: string;
    confirmationSentAt: string;
    confirmed: boolean;
  };
  password: {
    hash: string;
    resetCode: string;
    sentAt: string;
  };
  shared: {
    avatarId: string;
    bio: string;
    country: string;
    coverId: string;
    currency: string;
    dob: string;
    email: string;
    followers: number,
    following: number,
    fullName: string;
    gender: string;
    language: string;
    location: string;
    loggedIn: boolean;
    username: string;
    warningMessage: string;
    webSite: string;
    canFollow: boolean;
    isMe: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema = new Schema(
  {
    email: {
      confirmationCode: { type: String, unique: true, index: true },
      confirmationSentAt: { type: Date },
      confirmed: { type: Boolean, default: false },
    },
    password: {
      hash: { type: String },
      resetCode: { type: String, index: true },
      sentAt: { type: Date },
    },
    shared: {
      avatarId: { type: String },
      bio: { type: String },
      canFollow: {type: Boolean},
      country: { type: String },
      coverId: { type: String },
      currency: { type: String, default: 'USD' },
      dob: { type: Date },
      email: { type: String, required: true, unique: true, index: true },
      followers: { type: Number, default: 0},
      following: { type: Number, default: 0},
      fullName: { type: String },
      gender: { type: String },
      isMe: {type: Boolean},
      language: { type: String, default: 'en' },
      location: { type: String },
      loggedIn: { type: Boolean, default: true },
      username: { type: String, unique: true, index: true }, // TODO MAKE REQUIRED
      warningMessage: { type: String, default: 'verify' },
      webSite: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model<UserModelInterface>('User', userSchema);

export { userModel, UserModelInterface };
