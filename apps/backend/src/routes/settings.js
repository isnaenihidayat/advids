const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const settings = await prisma.settings.findUnique({
      where: { userId: req.user.id },
    });

    if (!settings) {
      return res.status(404).json({ error: "Settings not found" });
    }

    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.patch("/", authMiddleware, async (req, res) => {
  try {
    const settings = await prisma.settings.findUnique({
      where: { userId: req.user.id },
    });

    if (!settings) {
      return res.status(404).json({ error: "Settings not found" });
    }

    const updated = await prisma.settings.update({
      where: { userId: req.user.id },
      data: req.body,
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

module.exports = router;