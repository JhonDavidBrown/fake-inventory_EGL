const multer = require("multer");
const fs = require("fs");

// Create uploads directory for fallback local storage
const uploadDir = "public/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use memory storage for Backblaze B2
const memoryStorage = multer.memoryStorage();

// Disk storage for fallback (if B2 fails)

// Primary storage (memory for B2)
const storage = memoryStorage;

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("¡Solo se permiten archivos de imagen!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit
  },
});

// Export upload middleware directly for backward compatibility
module.exports = upload;
