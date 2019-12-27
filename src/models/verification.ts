import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

interface VerificationModelInterface extends Document {
  addressProof: {
    confirmed: boolean;
    fileId: string;
    locked: boolean;
    rejectionMessage: string;
  };
  govId: {
    confirmed: boolean;
    fileId: string;
    locked: boolean;
    rejectionMessage: string;
  };
  selfieFace: {
    confirmed: boolean;
    fileId: string;
    locked: boolean;
    rejectionMessage: string;
  };
  selfieId: {
    confirmed: boolean;
    fileId: string;
    locked: boolean;
    rejectionMessage: string;
  };
  userId: string;
}

const verificationSchema: Schema = new Schema(
  {
    addressProof: {
      confirmed: { type: Boolean, default: false },
      fileId: { type: String, unique: true, index: true },
      locked: { type: Boolean, default: false },
      rejectionMessage: { type: String },
    },
    govId: {
      confirmed: { type: Boolean, default: false },
      fileId: { type: String, unique: true, index: true },
      locked: { type: Boolean, default: false },
      rejectionMessage: { type: String },
    },
    selfieFace: {
      confirmed: { type: Boolean, default: false },
      fileId: { type: String, unique: true, index: true },
      locked: { type: Boolean, default: false },
      rejectionMessage: { type: String },
    },
    selfieId: {
      confirmed: { type: Boolean, default: false },
      fileId: { type: String, unique: true, index: true },
      locked: { type: Boolean, default: false },
      rejectionMessage: { type: String },
    },
    userId: { type: mongoose.Types.ObjectId, index: true  },
  },
  {
    timestamps: true,
  }
);

const verificationModel = mongoose.model<VerificationModelInterface>(
  'Verification',
  verificationSchema
);

export { verificationModel, VerificationModelInterface };
