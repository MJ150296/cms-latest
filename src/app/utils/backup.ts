import path from "path";
import fs from "fs/promises";
import mongoose from "mongoose";
import archiver from "archiver";
import { createWriteStream } from "fs";

/**
 * Triggers a full MongoDB backup and stores it as a ZIP file.
 * NOTE: On Vercel, filesystem is ephemeral.
 */
export async function triggerManualBackup(): Promise<string> {
  if (!mongoose.connection || !mongoose.connection.db) {
    throw new Error("Database connection not available for backup");
  }

  const db = mongoose.connection.db;

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const tempDir = path.join(process.cwd(), "temp-backup", timestamp);
  const backupsDir = path.join(process.cwd(), "backups");
  const zipPath = path.join(backupsDir, `backup-${timestamp}.zip`);

  await fs.mkdir(tempDir, { recursive: true });
  await fs.mkdir(backupsDir, { recursive: true });

  try {
    const collections = await db.listCollections().toArray();

    // Export each collection as JSON
    for (const col of collections) {
      const docs = await db.collection(col.name).find({}).toArray();
      const filePath = path.join(tempDir, `${col.name}.json`);
      await fs.writeFile(filePath, JSON.stringify(docs, null, 2), "utf-8");
    }

    // Zip everything
    await zipDirectory(tempDir, zipPath);

    // Cleanup temp files
    await fs.rm(tempDir, { recursive: true, force: true });

    return zipPath;
  } catch (error) {
    await fs.rm(tempDir, { recursive: true, force: true });
    throw error;
  }
}

/**
 * Zips a directory
 */
function zipDirectory(sourceDir: string, outPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    archive.on("error", (err) => reject(err));

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}
