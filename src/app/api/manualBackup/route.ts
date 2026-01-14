// // /api/manual-backup.ts
// import { NextResponse } from "next/server";
// import path from "path";
// import { createReadStream } from "fs";
// import dbConnect from "@/app/utils/dbConnect";

// export async function GET() {
//   try {
//     await dbConnect();
//     await triggerManualBackup();

//     const backupsDir = path.join(process.cwd(), "backups");
//     const files = await fs.promises.readdir(backupsDir);
//     const latestBackup = files
//       .filter((f) => f.startsWith("backup-"))
//       .sort()
//       .pop();

//     if (!latestBackup) {
//       return NextResponse.json({ error: "No backup found" }, { status: 404 });
//     }

//     const filePath = path.join(backupsDir, latestBackup);
//     const fileStream = createReadStream(filePath);

//     return new Response(fileStream, {
//       headers: {
//         "Content-Type": "application/zip",
//         "Content-Disposition": `attachment; filename="${latestBackup}"`,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Backup route failed:", error);
//     return NextResponse.json(
//       { error: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }
