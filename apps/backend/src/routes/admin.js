const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { adminMiddleware } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/stats", adminMiddleware, async (req, res) => {
  try {
    const [users, videos, assets, queueItems] = await Promise.all([
      prisma.user.count(),
      prisma.video.count(),
      prisma.asset.count(),
      prisma.queueItem.count(),
    ]);

    const [completedVideos, failedVideos, pendingVideos] = await Promise.all([
      prisma.video.count({ where: { status: "completed" } }),
      prisma.video.count({ where: { status: "failed" } }),
      prisma.video.count({ where: { status: "pending" } }),
    ]);

    res.json({
      users,
      videos,
      assets,
      queueItems,
      completedVideos,
      failedVideos,
      pendingVideos,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
});

router.get("/users", adminMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            videos: true,
            assets: true,
            queueItems: true,
          },
        },
      },
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.patch("/users/:id/role", adminMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["USER", "ADMIN"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update user role" });
  }
});

module.exports = router;