const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Lazy import to avoid circular dep; worker is started in index.js
let _triggerWorker = null;
function setWorkerTrigger(fn) { _triggerWorker = fn; }
module.exports.setWorkerTrigger = setWorkerTrigger;

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { search, status } = req.query;
    const videos = await prisma.video.findMany({
      where: {
        userId: req.user.id,
        ...(status && { status }),
        ...(search && { prompt: { contains: search, mode: "insensitive" } }),
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const video = await prisma.video.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }
    res.json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch video" });
  }
});

router.get("/:id/status", authMiddleware, async (req, res) => {
  try {
    const video = await prisma.video.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }
    res.json({
      id: video.id,
      status: video.status,
      videoUrl: video.videoUrl,
      errorMessage: video.errorMessage,
      jobId: video.jobId,
      completedAt: video.completedAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch video status" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { prompt, resolution, ratio, aiModel, duration, assetIds, recipeData } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt required" });
    }

    const video = await prisma.video.create({
      data: {
        userId: req.user.id,
        prompt,
        resolution: resolution || "1080p",
        ratio: ratio || "9:16",
        aiModel: aiModel || "seedance-2.0",
        duration: duration || "5s",
        assetIds: assetIds || [],
        recipeData: recipeData || {},
      },
    });

    // Enqueue for generation
    await prisma.queueItem.create({
      data: {
        userId: req.user.id,
        title: prompt.slice(0, 80),
        payloadJson: { prompt, resolution, ratio, aiModel, duration, assetIds },
        videoId: video.id,
      },
    });

    if (_triggerWorker) _triggerWorker();

    res.status(201).json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create video" });
  }
});

router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const video = await prisma.video.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    const updated = await prisma.video.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update video" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const video = await prisma.video.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    await prisma.video.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete video" });
  }
});

module.exports = router;