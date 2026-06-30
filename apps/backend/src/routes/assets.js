const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

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