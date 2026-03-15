// Run this script with Node.js to generate a synthetic knock sound as WAV
// Usage: node scripts/generate-knock.mjs > public/knock.wav
// Or just place any short "knock" mp3/wav at public/knock.mp3

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const sampleRate = 22050;
const duration = 0.15;
const numSamples = Math.floor(sampleRate * duration);
const samples = new Int16Array(numSamples);

for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  const envelope = Math.exp(-t * 30);
  const freq1 = 180;
  const freq2 = 90;
  const val =
    envelope *
    (0.6 * Math.sin(2 * Math.PI * freq1 * t) +
      0.4 * Math.sin(2 * Math.PI * freq2 * t) +
      0.2 * (Math.random() * 2 - 1) * Math.exp(-t * 60));
  samples[i] = Math.max(-32768, Math.min(32767, Math.floor(val * 32767)));
}

// Build WAV file
const dataSize = numSamples * 2;
const buffer = Buffer.alloc(44 + dataSize);
buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20); // PCM
buffer.writeUInt16LE(1, 22); // mono
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(dataSize, 40);

for (let i = 0; i < numSamples; i++) {
  buffer.writeInt16LE(samples[i], 44 + i * 2);
}

const outPath = join(__dirname, "..", "public", "knock.wav");
writeFileSync(outPath, buffer);
console.log("Generated:", outPath);
