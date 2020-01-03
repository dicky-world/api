import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

interface PhotoModelInterface extends Document {
  dhash: string;
  flagged: boolean;
  published: boolean;
  photoId: string;
  size: string;
  source: string;
  sourceType: string;
  userId: string;
  vehicleId: string;
}

const photoSchema: Schema = new Schema(
  {
    dhash: { type: String },
    flagged: { type: Boolean },
    photoId: { type: String },
    published: { type: Boolean },
    size: { type: String },
    source: { type: String },
    sourceType: { type: String },
    userId: { type: mongoose.Types.ObjectId, index: true },
    vehicleId: { type: mongoose.Types.ObjectId, index: true },
  },
  {
    timestamps: true,
  }
);

const photoModel = mongoose.model<PhotoModelInterface>('Photo', photoSchema);
export { photoModel, PhotoModelInterface };
