import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";
import mime from "mime-types";


const s3Client = new S3Client({
  region: process.env.B2_REGION || "eu-central-003",
  endpoint:
    process.env.B2_ENDPOINT || "https://s3.eu-central-003.backblazeb2.com",
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.B2_BUCKET_NAME;

function validateEnvironmentVariables() {
  const requiredVars = [
    "B2_KEY_ID",
    "B2_APPLICATION_KEY",
    "B2_BUCKET_NAME",
    "B2_ENDPOINT",
    "B2_REGION",
    "B2_FRIENDLY_URL",
  ];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
}

async function validateFile(filePath) {
  try {
    await fs.access(filePath);
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      throw new Error(`Path ${filePath} is not a file`);
    }
  } catch (error) {
    throw new Error(`File validation failed: ${error.message}`);
  }
}

function getContentType(filePath) {
  const contentType = mime.lookup(filePath);

  // Default to image/jpeg if MIME type cannot be determined
  if (!contentType) {
    console.warn(
      `Could not determine content type for ${filePath}, defaulting to image/jpeg`
    );
    return "image/jpeg";
  }

  // Ensure it's an image type
  if (!contentType.startsWith("image/")) {
    console.warn(
      `File ${filePath} is not an image (${contentType}), but proceeding with upload`
    );
  }

  return contentType;
}

function getPublicUrl(key) {
  const baseUrl = process.env.B2_FRIENDLY_URL;
  return `${baseUrl}/file/${BUCKET_NAME}/${key}`;
}

// async function uploadImage(file, key) {
//   try {
//     validateEnvironmentVariables();

//     let fileBuffer;
//     let contentType;
//     if (Buffer.isBuffer(file)) {
//       fileBuffer = file;
//       contentType = "image/jpeg";
//     } else if (typeof file === "string") {
//       await validateFile(file);
//       fileBuffer = await fs.readFile(file);
//       contentType = getContentType(file);
//     } else {
//       throw new Error("File must be either a file path string or Buffer");
//     }

//     if (!fileBuffer || fileBuffer.length === 0) {
//       throw new Error("File buffer is empty");
//     }

//     const uploadCommand = new PutObjectCommand({
//       Bucket: BUCKET_NAME,
//       Key: key,
//       Body: fileBuffer,
//       ContentType: contentType,
//       CacheControl: "max-age=31536000",
//       ACL: "public-read",
//     });

//     // Execute upload
//     const result = await s3Client.send(uploadCommand);

//     return {
//       success: true,
//       key: key,
//       url: getPublicUrl(key),
//       etag: result.ETag,
//       bucket: BUCKET_NAME,
//       size: fileBuffer.length,
//       contentType: contentType,
//     };
//   } catch (error) {
//     console.error(`Error uploading image with key ${key}:`, error.message);
//     throw new Error(`Image upload failed: ${error.message}`);
//   }
// }



function safeFileName(input) {
  return String(input).replace(/[^a-zA-Z0-9/_-]/g, "_");
}

async function saveLocally(buffer, key) {
  const uploadsDir = path.join(process.cwd(), "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const safeKey = safeFileName(key).replace(/\//g, "_");
  const filename = `${safeKey}.jpg`;
  const fullPath = path.join(uploadsDir, filename);

  await fs.writeFile(fullPath, buffer);
  return `/uploads/${filename}`; // return relative URL
}
async function uploadImage(file, key) {
  try {
    let fileBuffer;
    let contentType = "image/jpeg";

    if (Buffer.isBuffer(file)) {
      fileBuffer = file;
    } else if (typeof file === "string") {
      await validateFile(file);
      fileBuffer = await fs.readFile(file);
      contentType = getContentType(file);
    } else {
      throw new Error("File must be either a file path string or Buffer");
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error("File buffer is empty");
    }

    // ✅ If B2 env missing, save locally instead of crashing the API
    try {
      validateEnvironmentVariables();
    } catch (e) {
      const url = await saveLocally(fileBuffer, key);
      return { success: true, key, url, local: true, size: fileBuffer.length, contentType };
    }

    // B2 upload (original behavior)
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      CacheControl: "max-age=31536000",
      ACL: "public-read",
    });

    const result = await s3Client.send(uploadCommand);

    return {
      success: true,
      key: key,
      url: getPublicUrl(key),
      etag: result.ETag,
      bucket: BUCKET_NAME,
      size: fileBuffer.length,
      contentType: contentType,
    };
  } catch (error) {
    console.error(`Error uploading image with key ${key}:`, error.message);
    throw new Error(`Image upload failed: ${error.message}`);
  }
}
async function uploadSvg(file, key) {
  try {
    validateEnvironmentVariables();

    let fileBuffer;
    const svgMimeType = "image/svg+xml";

    if (Buffer.isBuffer(file)) {
      fileBuffer = file;
    } else if (typeof file === "string") {
      await validateFile(file);
      fileBuffer = await fs.readFile(file);
    } else {
      throw new Error("File must be either a file path string or Buffer");
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error("File buffer is empty");
    }

    const headerSample = fileBuffer.toString("utf8", 0, 512);
    if (!headerSample.includes("<svg")) {
      throw new Error("Provided file does not appear to be an SVG");
    }

    let contentType = svgMimeType;
    if (typeof file === "string") {
      const detectedType = getContentType(file);
      if (detectedType === svgMimeType) {
        contentType = detectedType;
      }
    }

    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      CacheControl: "max-age=31536000",
      ACL: "public-read",
    });

    const result = await s3Client.send(uploadCommand);

    return {
      success: true,
      key,
      url: getPublicUrl(key),
      etag: result.ETag,
      bucket: BUCKET_NAME,
      size: fileBuffer.length,
      contentType,
      svg: true,
    };
  } catch (error) {
    console.error(`Error uploading svg with key ${key}:`, error.message);
    throw new Error(`SVG upload failed: ${error.message}`);
  }
}

async function uploadThumbnailImage(file, key, options = {}) {
  try {
    // Validate environment variables
    validateEnvironmentVariables();

    // Default thumbnail options
    const {
      width = 300,
      height = 300,
      format = "jpeg",
      quality = 80,
    } = options;

    let fileBuffer;

    // Handle file input - can be either file path or Buffer
    if (Buffer.isBuffer(file)) {
      fileBuffer = file;
    } else if (typeof file === "string") {
      // Validate file exists
      await validateFile(file);

      // Read file
      fileBuffer = await fs.readFile(file);
    } else {
      throw new Error("File must be either a file path string or Buffer");
    }

    // Validate buffer is not empty
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error("File buffer is empty");
    }

    // Resize image using Sharp library
    let resizedBuffer;
    try {
      const sharpInstance = sharp(fileBuffer).resize(width, height, {
        fit: "cover", // Crop to exact dimensions while maintaining aspect ratio
        position: "center", // Center the crop
      });

      // Apply format and quality settings
      if (format === "jpeg") {
        sharpInstance.jpeg({ quality });
      } else if (format === "png") {
        sharpInstance.png({ compressionLevel: 6 });
      } else if (format === "webp") {
        sharpInstance.webp({ quality });
      }

      resizedBuffer = await sharpInstance.toBuffer();
    } catch (error) {
      throw new Error(`Image resizing failed: ${error.message}`);
    }

    // Determine content type based on format
    const contentType = `image/${format}`;

    // Prepare upload command
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: resizedBuffer,
      ContentType: contentType,
      // Set cache control for better performance
      CacheControl: "max-age=31536000", // 1 year
      // Make object publicly readable
      ACL: "public-read",
      // Add metadata to indicate this is a thumbnail
      Metadata: {
        thumbnail: "true",
        "original-format": format,
        "thumbnail-width": width.toString(),
        "thumbnail-height": height.toString(),
      },
    });

    // Execute upload
    const result = await s3Client.send(uploadCommand);

    console.log(
      `Successfully uploaded thumbnail image to key: ${key} (${width}x${height})`
    );

    return {
      success: true,
      key: key,
      url: getPublicUrl(key),
      etag: result.ETag,
      bucket: BUCKET_NAME,
      size: resizedBuffer.length,
      contentType: contentType,
      thumbnail: true,
      dimensions: { width, height },
      format: format,
    };
  } catch (error) {
    console.error(
      `Error uploading thumbnail image with key ${key}:`,
      error.message
    );
    throw new Error(`Thumbnail upload failed: ${error.message}`);
  }
}

async function deleteImage(key) {
  try {
    // Validate environment variables
    validateEnvironmentVariables();

    // Validate key parameter
    if (!key || typeof key !== "string") {
      throw new Error("Key must be a non-empty string");
    }

    // Prepare delete command
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    // Execute deletion
    const result = await s3Client.send(deleteCommand);

    console.log(`Successfully deleted image with key: ${key}`);

    return {
      success: true,
      key: key,
      bucket: BUCKET_NAME,
      deleted: true,
    };
  } catch (error) {
    console.error(`Error deleting image with key ${key}:`, error.message);

    // Check if error is because object doesn't exist
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      console.warn(
        `Image with key ${key} does not exist, considering deletion successful`
      );
      return {
        success: true,
        key: key,
        bucket: BUCKET_NAME,
        deleted: true,
        note: "Object did not exist",
      };
    }

    throw new Error(`Image deletion failed: ${error.message}`);
  }
}

function generateNumericOtp(length = 4) {
  const parsedLength = Number(length);
  const otpLength =
    Number.isFinite(parsedLength) && parsedLength > 0
      ? Math.floor(parsedLength)
      : 4;

  let otp = "";
  for (let i = 0; i < otpLength; i += 1) {
    otp += Math.floor(Math.random() * 10).toString();
  }

  return otp;
}

// Export all functions for use in other modules
export {
  uploadImage,
  uploadSvg,
  uploadThumbnailImage,
  deleteImage,
  getPublicUrl,
  validateEnvironmentVariables,
  generateNumericOtp,
};
