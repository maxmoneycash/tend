import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const maxVideoBytes = 5 * 1024 * 1024;
const videosDirectory = path.join(process.cwd(), "public", "videos");
const videoNames = (await readdir(videosDirectory))
  .filter((name) => name.toLowerCase().endsWith(".mp4"))
  .sort();
const videos = await Promise.all(
  videoNames.map(async (name) => ({
    name,
    size: (await stat(path.join(videosDirectory, name))).size,
  })),
);
const totalVideoBytes = videos.reduce((total, video) => total + video.size, 0);
const bytes = new Intl.NumberFormat("en-US");

for (const video of videos) {
  console.log(`public/videos/${video.name}: ${bytes.format(video.size)} B`);
}
console.log(
  `Combined MP4 size: ${bytes.format(totalVideoBytes)} B / ${bytes.format(maxVideoBytes)} B (5 MiB)`,
);

if (totalVideoBytes > maxVideoBytes) {
  console.error(
    `Media budget failed by ${bytes.format(totalVideoBytes - maxVideoBytes)} B.`,
  );
  process.exitCode = 1;
} else {
  console.log("Media budget passed.");
}
