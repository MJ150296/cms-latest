import { NextRequest, NextResponse } from "next/server";
import LabWorkModel from "@/app/model/LabWork.model";
import dbConnect from "@/app/utils/dbConnect";
import { labWorkSchema } from "@/schemas/zobLabWorkSchema"; // Zod schema
import { z } from "zod";

// ✅ Controller logic inside the route
async function createLabWork(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();

    // ✅ Validate incoming data with Zod
    const parsed = labWorkSchema.parse(body);

    // ✅ Inject today's date for sentToLabOn
    const withSentToLabOn = {
      ...parsed,
      sentToLabOn: new Date(), // sets to current date and time
    };

    // ✅ Save to database
    const newLabWork = await LabWorkModel.create(withSentToLabOn);

    return {
      success: true,
      data: newLabWork,
    };
  } catch (error) {
    console.error("[LABWORK_CREATE_ERROR]", error);

    // Zod validation error
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        details: error.errors,
        status: 400,
      };
    }

    return {
      success: false,
      error: "Failed to create lab work entry",
      status: 500,
    };
  }
}

// ✅ POST handler
export async function POST(req: NextRequest) {
  const response = await createLabWork(req);

  if (!response.success) {
    return NextResponse.json(
      { error: response.error, details: response.details || null },
      { status: response.status || 500 }
    );
  }

  return NextResponse.json(response.data, { status: 201 });
}
