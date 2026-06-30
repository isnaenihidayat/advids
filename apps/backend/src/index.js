const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const { authMiddleware } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const assetRoutes = require("./routes/assets");
const videoRoutes = require("./routes/videos");
const queueRoutes = require("./routes/queue");
const settingsRoutes = require("./routes/settings");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/settings", settingsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err?.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});