import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

// Automatically copy any image files dropped into root directory into public/images
try {
  const rootDir = process.cwd();
  const publicImagesDir = path.join(rootDir, "public", "images");
  if (!fs.existsSync(publicImagesDir)) {
    fs.mkdirSync(publicImagesDir, { recursive: true });
  }
  const files = fs.readdirSync(rootDir);
  for (const file of files) {
    if (file.endsWith(".jpg") || file.endsWith(".jpeg") || file.endsWith(".png") || file.endsWith(".webp")) {
      const src = path.join(rootDir, file);
      const dest = path.join(publicImagesDir, file);
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(src, dest);
      }
    }
  }
} catch (e) {
  console.error("Auto image sync error:", e);
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
