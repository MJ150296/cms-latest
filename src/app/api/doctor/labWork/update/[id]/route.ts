import { NextRequest, NextResponse } from "next/server";
import LabWorkModel from "@/app/model/LabWork.model";
import dbConnect from "@/app/utils/dbConnect";
import { labWorkSchema } from "@/schemas/zobLabWorkSchema";
import { z } from "zod";

export async function PUT(request: NextRequest) {
  try {
    // Extract ID from URL path
    const pathSegments = request.nextUrl.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];

    // Validate ID
    if (!id) {
      return NextResponse.json(
        { error: "Missing lab work ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const body = await request.json();

    // Convert toothNumbers from string to array if needed
    if (body.toothNumbers && typeof body.toothNumbers === "string") {
      body.toothNumbers = body.toothNumbers
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);
    }

    // ✅ Automatic date handling based on status
    if (body.status === "Received" && !body.receivedFromLabOn) {
      body.receivedFromLabOn = new Date();
    }

    if (body.status === "Fitted" && !body.fittedOn) {
      body.fittedOn = new Date();
    }

    // Validate partial input using Zod
    const parsed = labWorkSchema.partial().parse(body);

    // Update LabWork by ID
    const updatedLabWork = await LabWorkModel.findByIdAndUpdate(id, parsed, {
      new: true,
      runValidators: true,
    });

    if (!updatedLabWork) {
      return NextResponse.json(
        { error: "Lab work not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedLabWork, { status: 200 });
  } catch (error) {
    console.error("[LABWORK_UPDATE_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update lab work entry" },
      { status: 500 }
    );
  }
}
