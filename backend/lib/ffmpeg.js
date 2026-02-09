// backend/lib/ffmpeg.js

import { createFFmpeg } from "@ffmpeg/ffmpeg";

export function getFFmpeg() {
  return createFFmpeg({ log: true });
}

async function ensureFFmpegLoaded() {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }
}

async function extractFramesFromUrl(videoUrl, frameCount = 6) {
  await ensureFFmpegLoaded();

  const resp = await fetch(videoUrl);
  if (!resp.ok) throw new Error(`Failed to download video: ${resp.status}`);

  const arrayBuffer = await resp.arrayBuffer();
  const videoData = new Uint8Array(arrayBuffer);

  ffmpeg.FS("writeFile", "input.mp4", await fetchFile(videoData));

  await ffmpeg.run(
    "-i", "input.mp4",
    "-vf", `fps=${frameCount}`,
    "-qscale:v", "2",
    "frame-%03d.jpg"
  );

  const frames = [];
  for (let i = 1; i <= frameCount; i++) {
    const name = `frame-${String(i).padStart(3, "0")}.jpg`;
    try {
      const data = ffmpeg.FS("readFile", name);
      const base64 = Buffer.from(data).toString("base64");
      frames.push({
        index: i - 1,
        dataUrl: `data:image/jpeg;base64,${base64}`
      });
      ffmpeg.FS("unlink", name);
    } catch {
      break;
    }
  }

  ffmpeg.FS("unlink", "input.mp4");
  return frames;
}

module.exports = { extractFramesFromUrl };
