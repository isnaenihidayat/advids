const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

const uploadsDir = path.join(process.cwd(), "apps/backend/uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, "-");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|mp4|webm|mov)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

const ASSET_TYPES = new Set(["product", "model", "background"]);

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
    res.json(
      assets.map((asset) => ({
        ...asset,
        url: `/uploads/${path.basename(asset.filepath)}`,
      }))
    );
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
    res.json({
      ...asset,
      url: `/uploads/${path.basename(asset.filepath)}`,
    });
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

    const type = String(req.body.type || "");
    if (!ASSET_TYPES.has(type)) {
      return res.status(400).json({ error: "Invalid asset type" });
    }

    const asset = await prisma.asset.create({
      data: {
        userId: req.user.id,
        filename: req.file.originalname,
        type,
        filepath: req.file.path,
        filesize: req.file.size,
      },
    });

    res.status(201).json({
      ...asset,
      url: `/uploads/${path.basename(asset.filepath)}`,
    });
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

    if (asset.filepath && fs.existsSync(asset.filepath)) {
      fs.unlinkSync(asset.filepath);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete asset" });
  }
});

module.exports = router;