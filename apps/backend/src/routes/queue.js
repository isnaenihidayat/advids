const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    const items = await prisma.queueItem.findMany({
      where: {
        userId: req.user.id,
        ...(status && { status }),
      },
      orderBy: { createdAt: "asc" },
    });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch queue items" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const item = await prisma.queueItem.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!item) {
      return res.status(404).json({ error: "Queue item not found" });
    }
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch queue item" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, payload, videoId } = req.body;

    if (!payload) {
      return res.status(400).json({ error: "Payload required" });
    }

    const item = await prisma.queueItem.create({
      data: {
        userId: req.user.id,
        title: title || "Untitled video",
        payloadJson: payload,
        videoId: videoId || null,
      },
    });

    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create queue item" });
  }
});

router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const item = await prisma.queueItem.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!item) {
      return res.status(404).json({ error: "Queue item not found" });
    }

    const updated = await prisma.queueItem.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update queue item" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const item = await prisma.queueItem.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!item) {
      return res.status(404).json({ error: "Queue item not found" });
    }

    if (!["queued", "paused", "failed"].includes(item.status)) {
      return res.status(400).json({ error: "Cannot delete running or completed items" });
    }

    await prisma.queueItem.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete queue item" });
  }
});

module.exports = router;