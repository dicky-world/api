import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

interface PhotoModelInterface extends Document {
  category: string;
  flagged: boolean;
  previewId: string;
  published: boolean;
  size: string;
  thumbnailId: string;
  userId: string;
  vehicleId: string;
  zoomId: string;
}

const photoSchema: Schema = new Schema(
  {
    category: { type: String },
    flagged: { type: Boolean },
    previewId: { type: String },
    published: { type: Boolean },
    size: { type: String },
    thumbnailId: { type: String },
    userId: { type: mongoose.Types.ObjectId, index: true },
    vehicleId: { type: mongoose.Types.ObjectId, index: true },
    zoomId: { type: String },
  },
  {
    timestamps: true,
  }
);

const photoModel = mongoose.model<PhotoModelInterface>('Photo', photoSchema);
export { photoModel, PhotoModelInterface };
