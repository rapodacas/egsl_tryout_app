// backend/lib/ffmpeg.js
import ffmpegPath from "ffmpeg-static";
import { spawn } from "child_process";

/**
 * Run ffmpeg with arguments and return stdout/stderr buffers.
 */
export function runFFmpeg(args = []) {
  return new Promise((resolve, reject) => {
    const ff = spawn(ffmpegPath, args);

    let stdout = [];
    let stderr = [];

    ff.stdout.on("data", data => stdout.push(data));
    ff.stderr.on("data", data => stderr.push(data));

    ff.on("close", code => {
      if (code === 0) {
        resolve({
          stdout: Buffer.concat(stdout),
          stderr: Buffer.concat(stderr)
        });
      } else {
        reject(
          new Error(
            `ffmpeg exited with code ${code}: ${Buffer.concat(stderr).toString()}`
          )
        );
      }
    });
  });
}

/**
 * Extract N frames from a remote video URL.
 */
export async function extractFramesFromUrl(videoUrl, frameCount = 6) {
  // 1. Download the video
  const resp = await fetch(videoUrl);
  if (!resp.ok) throw new Error(`Failed to download video: ${resp.status}`);

  const arrayBuffer = await resp.arrayBuffer();
  const videoData = Buffer.from(arrayBuffer);

  // 2. Write input file to /tmp (Vercel writable temp dir)
  const inputPath = `/tmp/input-${Date.now()}.mp4`;
  const fs = await import("fs/promises");
  await fs.writeFile(inputPath, videoData);

  // 3. Extract frames
  const outputPattern = `/tmp/frame-%03d.jpg`;

  await runFFmpeg([
    "-i", inputPath,
    "-vf", `fps=${frameCount}`,
    "-qscale:v", "2",
    outputPattern
  ]);

  // 4. Read frames back
  const frames = [];
  for (let i = 1; i <= frameCount; i++) {
    const name = `/tmp/frame-${String(i).padStart(3, "0")}.jpg`;
    try {
      const data = await fs.readFile(name);
      const base64 = data.toString("base64");
      frames.push({
        index: i - 1,
        dataUrl: `data:image/jpeg;base64,${base64}`
      });
      await fs.unlink(name);
    } catch {
      break;
    }
  }

  // 5. Cleanup
  await fs.unlink(inputPath);

  return frames;
}

export default extractFramesFromUrl;
