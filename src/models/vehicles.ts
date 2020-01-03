import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

interface VehicleModelInterface extends Document {
  bodyNumber: string;
  bodyType: string;
  category: string;
  chassisNumber: string;
  coachBuilder: string;
  coachBuilderModel: string;
  fleetNumber: string;
  manufacturer: string;
  modelName: string;
  registration: string;
  seating: string;
  userId: string;
  yearOfManufacture: string;
}

const vehicleSchema: Schema = new Schema(
  {
    bodyNumber: { type: String },
    bodyType: { type: String },
    category: { type: String },
    chassisNumber: { type: String },
    coachBuilder: { type: String },
    coachBuilderModel: { type: String },
    fleetNumber: { type: String },
    manufacturer: { type: String },
    modelName: { type: String },
    registration: { type: String },
    seating: { type: String },
    userId: { type: mongoose.Types.ObjectId, index: true },
    yearOfManufacture: { type: String },
  },
  {
    timestamps: true,
  }
);

const vehicleModel = mongoose.model<VehicleModelInterface>('Vehicle', vehicleSchema);
export { vehicleModel, VehicleModelInterface };
