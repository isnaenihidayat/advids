const express = require("express");
const multer = require("multer");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|mp4|webm|mov)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { type } = req.query;
    const assets = await prisma.asset.findMany({
      where: {
        userId: req.user.id,
        ...(type && { type }),
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(assets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch assets" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const asset = await prisma.asset.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }
    res.json(asset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch asset" });
  }
});

router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const { type } = req.body;
    const fileType = type || (req.file.mimetype.startsWith("video") ? "video" : "image");

    const asset = await prisma.asset.create({
      data: {
        userId: req.user.id,
        filename: req.file.originalname,
        type: fileType,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
      },
    });

    res.status(201).json(asset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const asset = await prisma.asset.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    await prisma.asset.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete asset" });
  }
});

module.exports = router;
