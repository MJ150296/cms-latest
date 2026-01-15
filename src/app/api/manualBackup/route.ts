// /api/manual-backup/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import dbConnect from "@/app/utils/dbConnect";
import { triggerManualBackup } from "@/app/utils/backup";

export async function GET() {
  try {
    await dbConnect();
    await triggerManualBackup();

    const backupsDir = path.join(process.cwd(), "backups");
    const files = await fs.readdir(backupsDir);

    const latestBackup = files
      .filter((f) => f.startsWith("backup-"))
      .sort()
      .pop();

    if (!latestBackup) {
      return NextResponse.json(
        { error: "No backup found" },
        { status: 404 }
      );
    }

    const filePath = path.join(backupsDir, latestBackup);
    const fileBuffer = await fs.readFile(filePath);

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${latestBackup}"`,
      },
    });
  } catch (error) {
    console.error("❌ Backup route failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
