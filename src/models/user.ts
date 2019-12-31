import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

interface UserModelInterface extends Document {
  email: {
    confirmationCode: string;
    confirmationSentAt: string;
    confirmed: boolean;
  };
  password: {
    formattedKey: string;
    hash: string;
    resetCode: string;
    sentAt: string;
  };
  shared: {
    avatarId: string;
    bio: string;
    canFollow: boolean;
    country: string;
    coverId: string;
    currency: string;
    dob: string;
    email: string;
    followers: number,
    following: number,
    fullName: string;
    gender: string;
    isMe: boolean;
    language: string;
    location: string;
    loggedIn: boolean;
    mobileCode: string;
    mobileNumber: string;
    twofactor: boolean;
    username: string;
    warningMessage: string;
    webSite: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema = new Schema(
  {
    email: {
      confirmationCode: { type: String },
      confirmationSentAt: { type: Date },
      confirmed: { type: Boolean, default: false },
    },
    password: {
      formattedKey: { type: String },
      hash: { type: String },
      resetCode: { type: String },
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
      email: { type: String, required: true },
      followers: { type: Number, default: 0},
      following: { type: Number, default: 0},
      fullName: { type: String },
      gender: { type: String },
      isMe: {type: Boolean},
      language: { type: String, default: 'en' },
      location: { type: String },
      loggedIn: { type: Boolean, default: true },
      mobileCode: { type: String },
      mobileNumber: { type: String },
      twofactor: {type: Boolean, default: false},
      username: { type: String},
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
