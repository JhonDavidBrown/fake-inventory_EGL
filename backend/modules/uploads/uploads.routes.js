const express = require("express");
const router = express.Router();
const uploadController = require("./uploads.controller");
const {
  authenticateRequest,
} = require("../../shared/middleware/auth.middleware");
const upload = require("../../shared/middleware/upload.middleware");

router.use(authenticateRequest);

router.post("/image", upload.single("image"), uploadController.uploadImage);

router.delete("/image", uploadController.deleteImage);

module.exports = router;
