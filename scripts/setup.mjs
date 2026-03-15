// Setup script: generates the knock sound file if it doesn't exist
import { existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

// Generate WAV, then we'll reference it as knock.mp3 (browsers handle WAV fine)
// But let's just name it knock.mp3 for the component
const wavPath = join(publicDir, "knock.wav");
const mp3Path = join(publicDir, "knock.mp3");

if (!existsSync(mp3Path) && !existsSync(wavPath)) {
  execSync("node scripts/generate-knock.mjs", { stdio: "inherit" });
  // Copy wav as mp3 (browsers play wav from audio element just fine)
  const { copyFileSync } = await import("fs");
  copyFileSync(wavPath, mp3Path);
  console.log("Copied knock.wav -> knock.mp3");
} else {
  console.log("Sound file already exists, skipping generation.");
}
