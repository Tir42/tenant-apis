const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// Initialize standard S3 client for Cloudflare R2
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Uploads a file buffer to Cloudflare R2 bucket.
 * @param {Buffer} fileBuffer - The file buffer to upload.
 * @param {string} fileName - Original filename or desired name.
 * @param {string} contentType - The MIME type of the file.
 * @returns {Promise<string>} The public URL of the uploaded file.
 */
const uploadToR2 = async (fileBuffer, fileName, contentType = "application/pdf") => {
  const accountId = process.env.R2_ACCOUNT_ID;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !bucketName) {
    throw new Error("Missing Cloudflare R2 credentials (R2_ACCOUNT_ID or R2_BUCKET_NAME) in environment variables.");
  }

  const key = `${Date.now()}-${fileName.replace(/\s+/g, "_")}`;

  const uploadParams = {
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType || "application/pdf",
  };

  await r2Client.send(new PutObjectCommand(uploadParams));

  // Determine standard / custom public URL
  if (process.env.R2_PUBLIC_URL) {
    const baseUrl = process.env.R2_PUBLIC_URL.replace(/\/$/, "");
    return `${baseUrl}/${key}`;
  }

  return `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;
};

module.exports = {
  uploadToR2,
};
