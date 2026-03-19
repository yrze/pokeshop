import { cpSync, existsSync, mkdirSync, rmSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, "..");
const nextDir = path.join(projectDir, ".next");
const standaloneDir = path.join(nextDir, "standalone");
const standaloneNextDir = path.join(standaloneDir, ".next");
const staticSourceDir = path.join(nextDir, "static");
const staticTargetDir = path.join(standaloneNextDir, "static");
const publicSourceDir = path.join(projectDir, "public");
const publicTargetDir = path.join(standaloneDir, "public");

mkdirSync(standaloneNextDir, { recursive: true });

if (existsSync(staticTargetDir)) {
  rmSync(staticTargetDir, { recursive: true, force: true });
}

cpSync(staticSourceDir, staticTargetDir, { recursive: true });

if (existsSync(publicSourceDir)) {
  if (existsSync(publicTargetDir)) {
    rmSync(publicTargetDir, { recursive: true, force: true });
  }

  cpSync(publicSourceDir, publicTargetDir, { recursive: true });
}
