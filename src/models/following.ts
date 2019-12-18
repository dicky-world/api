import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

interface FollowingModelInterface extends Document {
  followingId: string;
  userId: string;
}

const followingSchema: Schema = new Schema(
  {
    followingId: { type: mongoose.Types.ObjectId, index: true  },
    userId: { type: mongoose.Types.ObjectId, index: true },
  },
  {
    timestamps: true,
  }
);

const followingModel = mongoose.model<FollowingModelInterface>('Following', followingSchema);

export { followingModel, FollowingModelInterface };
