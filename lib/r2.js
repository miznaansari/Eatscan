import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "06a01c2fb5b4407c8bd70e689657f416";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "4fd223325ca4e7e2e7434e8f6e5e148a";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "10a953a8d129cc4e06c4b614c610b45bafddcac7114159f359a7f94fb4eef4a8";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "samad";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-4fe9fabf5ae54320b8b25b8f0d18ff6b.r2.dev";

export const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const RESOLUTIONS = [
  { name: "180", width: 180 },
  { name: "360", width: 360 },
  { name: "480", width: 480 },
  { name: "720", width: 720 },
  { name: "1080", width: 1080 },
];

/**
 * Resizes and uploads image to Cloudflare R2 across multi-resolution folders:
 * - menuItem/original, menuItem/1080, menuItem/720, menuItem/480, menuItem/360, menuItem/180
 * - category/original, category/1080, ...
 * - restaurant/original, restaurant/1080, ...
 */
export async function processAndUploadImage(fileBuffer, folderType = "menuItem", originalFilename = "image") {
  const sanitizeName = originalFilename.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const baseName = `${sanitizeName}_${uniqueId}`;

  // Validate folderType
  const validFolders = ["menuItem", "category", "restaurant"];
  const targetFolder = validFolders.includes(folderType) ? folderType : "menuItem";

  const uploadedUrls = {};

  // 1. Process & Upload "original" (Optimized WebP)
  const originalBuffer = await sharp(fileBuffer)
    .toFormat("webp", { quality: 85 })
    .toBuffer();

  const originalKey = `${targetFolder}/original/${baseName}.webp`;
  await s3Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: originalKey,
      Body: originalBuffer,
      ContentType: "image/webp",
    })
  );
  uploadedUrls["original"] = `${R2_PUBLIC_URL}/${originalKey}`;

  // 2. Process & Upload resized variants (1080, 720, 480, 360, 180)
  for (const res of RESOLUTIONS) {
    const resizedBuffer = await sharp(fileBuffer)
      .resize({ width: res.width, fit: "inside", withoutEnlargement: true })
      .toFormat("webp", { quality: 80 })
      .toBuffer();

    const key = `${targetFolder}/${res.name}/${baseName}.webp`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: resizedBuffer,
        ContentType: "image/webp",
      })
    );
    uploadedUrls[res.name] = `${R2_PUBLIC_URL}/${key}`;
  }

  // Primary image URL defaults to 720 or original
  const primaryUrl = uploadedUrls["720"] || uploadedUrls["original"];

  return {
    success: true,
    primaryUrl,
    urls: uploadedUrls,
  };
}
