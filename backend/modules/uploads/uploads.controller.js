const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const resolveStorageProvider = () => {
  const explicitProvider = process.env.STORAGE_PROVIDER;
  if (explicitProvider) {
    return explicitProvider.toLowerCase();
  }
  return process.env.NODE_ENV === "production" ? "b2" : "supabase";
};

const storageProvider = resolveStorageProvider();
const isSupabaseProvider = storageProvider === "supabase";

const createS3Client = () => {
  if (isSupabaseProvider) {
    if (
      !process.env.SUPABASE_S3_ENDPOINT ||
      !process.env.SUPABASE_S3_ACCESS_KEY ||
      !process.env.SUPABASE_S3_SECRET_KEY
    ) {
      return null;
    }

    return new S3Client({
      region: process.env.SUPABASE_S3_REGION || "us-east-1",
      endpoint: process.env.SUPABASE_S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY,
        secretAccessKey: process.env.SUPABASE_S3_SECRET_KEY,
      },
    });
  }

  if (
    !process.env.B2_ACCESS_KEY_ID ||
    !process.env.B2_SECRET_ACCESS_KEY
  ) {
    return null;
  }

  return new S3Client({
    region: process.env.B2_REGION || "us-east-005",
    endpoint: process.env.B2_ENDPOINT || "https://s3.us-east-005.backblazeb2.com",
    credentials: {
      accessKeyId: process.env.B2_ACCESS_KEY_ID,
      secretAccessKey: process.env.B2_SECRET_ACCESS_KEY,
    },
  });
};

const s3Client = createS3Client();

const getBucketName = () => {
  if (isSupabaseProvider) {
    return process.env.SUPABASE_STORAGE_BUCKET;
  }
  return (
    process.env.B2_BUCKET ||
    process.env.B2_BUCKET_NAME ||
    "inventario-pantalones-img"
  );
};

const getSupabasePublicBaseUrl = () => {
  if (!isSupabaseProvider) {
    return null;
  }
  if (process.env.SUPABASE_PUBLIC_BASE_URL) {
    return process.env.SUPABASE_PUBLIC_BASE_URL.replace(/\/$/, "");
  }
  if (!process.env.SUPABASE_S3_ENDPOINT) {
    return null;
  }
  return process.env.SUPABASE_S3_ENDPOINT.replace(/\/s3$/, "/object/public");
};

const buildPublicUrl = (fileName) => {
  const bucketName = getBucketName();
  if (isSupabaseProvider) {
    const publicBase = getSupabasePublicBaseUrl();
    if (!publicBase || !bucketName) {
      return null;
    }
    return `${publicBase}/${bucketName}/${fileName}`;
  }

  const region = process.env.B2_REGION || "us-east-005";
  return `https://${bucketName}.s3.${region}.backblazeb2.com/${fileName}`;
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "No se proporcionó ningún archivo de imagen." });
    }

    // Check if remote storage credentials are configured
    const bucketName = getBucketName();
    if (!s3Client || !bucketName) {
      console.warn(
        `Credenciales no configuradas para el proveedor ${storageProvider}, usando almacenamiento local`
      );

      // Save to local storage as fallback
      const fs = require("fs");
      const path = require("path");
      const uploadDir = "public/uploads";

      const timestamp = Date.now();
      const randomSuffix = Math.round(Math.random() * 1e9);
      const fileExtension = req.file.originalname.split(".").pop();
      const fileName = `image-${timestamp}-${randomSuffix}.${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);

      // Write buffer to disk
      fs.writeFileSync(filePath, req.file.buffer);

      const fileUrl = `${req.protocol}://${req.get(
        "host"
      )}/uploads/${fileName}`;
      return res.status(201).json({
        message: "Archivo subido correctamente (almacenamiento local).",
        imageUrl: fileUrl,
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1e9);
    const fileExtension = req.file.originalname.split(".").pop();
    const fileName = `pantalon-${timestamp}-${randomSuffix}.${fileExtension}`;

    // Upload to remote storage (Supabase in desarrollo, Backblaze en producción)
    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    if (!isSupabaseProvider) {
      uploadParams.ACL = "public-read";
    }

    const upload = new Upload({
      client: s3Client,
      params: uploadParams,
    });

    await upload.done();

    // Construct the public URL
    const publicUrl = buildPublicUrl(fileName);

    console.log(
      `Imagen subida a ${isSupabaseProvider ? "Supabase" : "Backblaze"}:`,
      publicUrl
    );

    res.status(201).json({
      message: `Archivo subido correctamente a ${
        isSupabaseProvider ? "Supabase" : "Backblaze B2"
      }`,
      imageUrl: publicUrl,
    });
  } catch (error) {
    console.error(
      `Error subiendo a ${isSupabaseProvider ? "Supabase" : "Backblaze B2"}:`,
      error
    );

    // Fallback to local storage on error
    if (req.file && req.file.buffer) {
      try {
        const fs = require("fs");
        const path = require("path");
        const uploadDir = "public/uploads";

        const timestamp = Date.now();
        const randomSuffix = Math.round(Math.random() * 1e9);
        const fileExtension = req.file.originalname.split(".").pop();
        const fileName = `image-${timestamp}-${randomSuffix}.${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);

        // Write buffer to disk as fallback
        fs.writeFileSync(filePath, req.file.buffer);

        const fileUrl = `${req.protocol}://${req.get(
          "host"
        )}/uploads/${fileName}`;
        return res.status(201).json({
          message: "Error en el proveedor remoto, usando almacenamiento local.",
          imageUrl: fileUrl,
        });
      } catch (fallbackError) {
        console.error("Error in local storage fallback:", fallbackError);
      }
    }

    res.status(500).json({
      error: "Error al subir la imagen",
      details: error.message,
    });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res
        .status(400)
        .json({ error: "No se proporcionó URL de imagen." });
    }

    // Delete from Supabase Storage
    const supabasePublicBase = getSupabasePublicBaseUrl();
    const supabaseBucket = getBucketName();
    const supabaseUrlPrefix =
      isSupabaseProvider &&
      supabasePublicBase &&
      supabaseBucket
        ? `${supabasePublicBase}/${supabaseBucket}/`
        : null;

    if (
      supabaseUrlPrefix &&
      imageUrl.startsWith(supabaseUrlPrefix) &&
      s3Client
    ) {
      try {
        const key = imageUrl.replace(supabaseUrlPrefix, "");
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: supabaseBucket,
            Key: key,
          })
        );

        console.log(`Imagen eliminada de Supabase: ${key}`);

        return res
          .status(200)
          .json({ message: "Imagen eliminada permanentemente de Supabase." });
      } catch (error) {
        console.error("Error deleting from Supabase Storage:", error);
        return res.status(500).json({
          error: "Error al eliminar imagen de Supabase",
          details: error.message,
        });
      }
    }

    // Delete from Backblaze B2
    if (imageUrl.includes("backblazeb2.com")) {
      try {
        const B2 = require('backblaze-b2');

        // Initialize B2 client
        const b2 = new B2({
          applicationKeyId: process.env.B2_ACCESS_KEY_ID,
          applicationKey: process.env.B2_SECRET_ACCESS_KEY,
        });

        // Authorize
        await b2.authorize();

        // Extract filename from URL
        const urlParts = imageUrl.split("/");
        const fileName = urlParts[urlParts.length - 1];

        // Get bucket info
        const buckets = await b2.listBuckets();
        const bucketName = getBucketName();
        const bucket = buckets.data.buckets.find(b => b.bucketName === bucketName);

        if (!bucket) {
          throw new Error(`Bucket ${bucketName} not found`);
        }

        // List all file versions
        const fileVersions = await b2.listFileVersions({
          bucketId: bucket.bucketId,
          startFileName: fileName,
          maxFileCount: 100,
        });

        // Filter files that match our filename exactly
        const matchingFiles = fileVersions.data.files.filter(file => file.fileName === fileName);

        // Delete all versions of the file
        for (const file of matchingFiles) {
          await b2.deleteFileVersion({
            fileId: file.fileId,
            fileName: file.fileName,
          });
          console.log(`Permanently deleted file version: ${file.fileId} - ${file.fileName}`);
        }

        console.log(`All versions of ${fileName} permanently deleted from B2`);
        
        // Invalidate cache on frontend
        try {
          const axios = require('axios');
          await axios.get(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/revalidate-image?url=${encodeURIComponent(imageUrl)}`);
        } catch (cacheError) {
          console.warn('Failed to invalidate image cache:', cacheError.message);
        }
        
        return res
          .status(200)
          .json({ message: "Imagen eliminada permanentemente de Backblaze B2." });
      } catch (error) {
        console.error("Error deleting from B2:", error);
        return res
          .status(500)
          .json({
            error: "Error al eliminar imagen de B2",
            details: error.message,
          });
      }
    }

    // Delete local image
    if (imageUrl.includes("localhost")) {
      try {
        const fs = require("fs");
        const path = require("path");
        const urlParts = imageUrl.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const filePath = path.join("public/uploads", fileName);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Local image deleted: ${fileName}`);
          
          // Invalidate cache on frontend
          try {
            const axios = require('axios');
            await axios.get(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/revalidate-image?url=${encodeURIComponent(imageUrl)}`);
          } catch (cacheError) {
            console.warn('Failed to invalidate image cache:', cacheError.message);
          }
          
          return res.status(200).json({ message: "Imagen local eliminada." });
        } else {
          return res.status(404).json({ error: "Imagen local no encontrada." });
        }
      } catch (error) {
        console.error("Error deleting local image:", error);
        return res
          .status(500)
          .json({
            error: "Error al eliminar imagen local",
            details: error.message,
          });
      }
    }

    res.status(400).json({ error: "URL de imagen no válida." });
  } catch (error) {
    console.error("Error in deleteImage:", error);
    res
      .status(500)
      .json({ error: "Error al eliminar imagen", details: error.message });
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};
