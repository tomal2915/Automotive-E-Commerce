import "dotenv/config";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

// Runs mongodump to export the entire database to a timestamped local
// folder. Requires the MongoDB Database Tools (mongodump) installed
// separately — this script just orchestrates it.
const backupDir = path.join(process.cwd(), "backups");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputPath = path.join(backupDir, `backup-${timestamp}`);

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const command = `mongodump --uri="${process.env.MONGODB_URI}" --out="${outputPath}"`;

console.log("Starting database backup...");

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error("Backup failed:", error.message);
    process.exit(1);
  }
  console.log(`Backup completed successfully: ${outputPath}`);
});
