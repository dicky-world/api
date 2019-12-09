import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

interface GoldPriceModelInterface extends Document {
  ouncePriceUsd: number;
}

const goldPrice: Schema = new Schema(
  {
    ouncePriceUsd: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const goldPriceModel = mongoose.model<GoldPriceModelInterface>(
  'GoldPrice',
  goldPrice
);

export { goldPriceModel, GoldPriceModelInterface };
