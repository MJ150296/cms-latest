// models/labWork.model.ts
import { LabWorkInput } from "@/schemas/zobLabWorkSchema";
import mongoose, { Schema, model, Types, Document } from "mongoose";

// Extend LabWorkInput with Mongoose's Document
export interface ILabWork extends LabWorkInput, Document {
  _id: Types.ObjectId;
}

const LabWorkSchema = new Schema<ILabWork>({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  labName: {
    type: String,
    required: true,
  },
  orderType: {
    type: String,
    enum: [
      "Crown",
      "Bridge",
      "Denture",
      "Aligner",
      "Implant",
      "Inlay/Onlay",
      "Veneer",
      "Others",
    ],
    required: true,
  },
  othersText: { type: String },
  toothNumbers: [{ type: String }],
  shade: { type: String },
  material: { type: String },
  impressionsTakenOn: { type: Date },
  sentToLabOn: { type: Date },
  expectedDeliveryDate: { type: Date },
  receivedFromLabOn: { type: Date },
  fittedOn: { type: Date },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Received", "Fitted", "Cancelled"],
    default: "Pending",
  },
  remarks: String,
  attachments: [{ type: String }],
});

const LabWorkModel =
  mongoose.models.LabWork || model<ILabWork>("LabWork", LabWorkSchema);

export default LabWorkModel;
