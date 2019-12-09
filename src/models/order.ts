import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

interface OrderModelInterface extends Document {
  note: string;
  phoneNumber: string;
  tokenPrice: number;
  tokenQty: number;
  total: number;
  userId: string;
}

const orderSchema: Schema = new Schema(
  {
    note: { type: String },
    phoneNumber: { type: String, required: true },
    tokenPrice: { type: Number, required: true },
    tokenQty: { type: Number, required: true },
    total: { type: Number, required: true },
    userId: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

const orderModel = mongoose.model<OrderModelInterface>('Order', orderSchema);

export { orderModel, OrderModelInterface };
