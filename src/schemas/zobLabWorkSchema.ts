// File: src/schemas/zodLabWorkSchema.ts
import { Types } from "mongoose";
import { z } from "zod";

// Zod Schema
export const labWorkSchema = z.object({
  patientId: z.custom<Types.ObjectId>(), // not z.string()
  doctorId: z.custom<Types.ObjectId>(),
  labName: z.string().min(1, "Lab name is required"),
  orderType: z.enum([
    "Crown",
    "Bridge",
    "Denture",
    "Aligner",
    "Implant",
    "Inlay/Onlay",
    "Veneer",
    "Others",
  ]),
  othersText: z.string().optional().nullable(),

  toothNumbers: z.array(z.string()).optional(),
  shade: z.string().optional(),
  material: z.string().optional(),

  impressionsTakenOn: z.coerce.date().optional(),
  sentToLabOn: z.coerce.date().optional(),
  expectedDeliveryDate: z.coerce.date().optional(),
  receivedFromLabOn: z.coerce.date().optional(),
  fittedOn: z.coerce.date().optional(),

  status: z
    .enum(["Pending", "In Progress", "Received", "Fitted", "Cancelled"])
    .optional()
    .default("Pending"),

  remarks: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

export type LabWorkInput = z.infer<typeof labWorkSchema>;
