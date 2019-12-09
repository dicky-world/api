import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

interface UserModelInterface extends Document {
  email: {
    confirmationCode: string;
    confirmed: boolean;
    confirmationSentAt: string;
  };
  investor: {
    certificateUrl: string;
    document: string;
    url: string;
    submittedAt: string;
    confirmedAt: string;
  };
  password: {
    hash: string;
    resetCode: string;
    sentAt: string;
  };
  shared: {
    avatarId: string;
    email: string;
    fullName: string;
    investorSubmitted: boolean;
    investorConfirmed: boolean;
    language: string;
    location: string;
    loggedIn: boolean;
    warningMessage: string;
    worbliAccountName: string;
    worbliConfirmed: boolean;
  };
}

const userSchema: Schema = new Schema(
  {
    email: {
      confirmationCode: { type: String, unique: true, index: true },
      confirmationSentAt: { type: Date },
      confirmed: { type: Boolean, default: false },
    },
    investor: {
      certificateUrl: { type: String },
      confirmedAt: { type: Date },
      documentId: { type: String },
      documentUrl: { type: String },
      submittedAt: { type: Date },
    },
    password: {
      hash: { type: String },
      resetCode: { type: String, unique: true, index: true },
      sentAt: { type: Date },
    },
    shared: {
      avatarId: { type: String },
      email: { type: String, required: true, unique: true, index: true },
      fullName: { type: String },
      investorConfirmed: { type: Boolean, default: false },
      investorSubmitted: { type: Boolean, default: false },
      language: { type: String, default: 'en' },
      location: { type: String },
      loggedIn: { type: Boolean, default: true },
      warningMessage: { type: String, default: 'verify' },
      worbliAccountName: { type: String },
      worbliConfirmed: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model<UserModelInterface>('User', userSchema);

export { userModel, UserModelInterface };
