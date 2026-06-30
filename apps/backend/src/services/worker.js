const { PrismaClient } = require("@prisma/client");
const SeedanceClient = require("./seedance");

const prisma = new PrismaClient();

// ponytail: in-process polling worker; ceiling = single-process, no horizontal scale.
// Upgrade path: extract to a separate worker process or use BullMQ when scale is needed.

const POLL_INTERVAL_MS = 10_000; // check queue every 10s
const TASK_POLL_MS = 5_000; // poll Seedance task status every 5s
const MAX_TASK_WAIT_MS = 10 * 60 * 1000; // 10 min timeout per task

let running = false;

async function processNextItem() {
  if (running) return;
  running = true;

  try {
    // Pick the oldest queued item
    const item = await prisma.queueItem.findFirst({
      where: { status: "queued" },
      orderBy: { createdAt: "asc" },
      include: { user: { include: { settings: true } } },
    });

    if (!item) return;

    const { apiKey, apiBaseUrl, defaultModel } = item.user.settings || {};
    if (!apiKey) {
      await prisma.queueItem.update({
        where: { id: item.id },
        data: { status: "failed", errorMessage: "No API key configured in settings" },
      });
      if (item.videoId) {
        await prisma.video.update({
          where: { id: item.videoId },
          data: { status: "failed", errorMessage: "No API key configured in settings" },
        });
      }
      return;
    }

    // Mark as running
    await prisma.queueItem.update({
      where: { id: item.id },
      data: { status: "running", startedAt: new Date() },
    });

    const payload = item.payloadJson;
    const client = new SeedanceClient(apiKey, apiBaseUrl);

    // Submit task to Seedance
    let taskData;
    try {
      taskData = await client.submitTask({
        prompt: payload.prompt,
        model: payload.aiModel || defaultModel || "seedance-2.0",
        duration: (payload.duration || "5s").replace("s", ""),
        ratio: payload.ratio || "16:9",
        resolution: payload.resolution || "720p",
      });
    } catch (err) {
      const msg = err.message || "Failed to submit task";
      await prisma.queueItem.update({ where: { id: item.id }, data: { status: "failed", errorMessage: msg } });
      if (item.videoId) {
        await prisma.video.update({ where: { id: item.videoId }, data: { status: "failed", errorMessage: msg } });
      }
      return;
    }

    const taskId = taskData.id;

    // Update video with jobId
    if (item.videoId) {
      await prisma.video.update({ where: { id: item.videoId }, data: { status: "generating", jobId: taskId } });
    }

    // Poll until done or timeout
    const deadline = Date.now() + MAX_TASK_WAIT_MS;
    while (Date.now() < deadline) {
      await sleep(TASK_POLL_MS);

      let result;
      try {
        result = await client.getTask(taskId);
      } catch (err) {
        console.error(`[worker] poll error for task ${taskId}:`, err.message);
        continue;
      }

      const status = result.status; // "running" | "succeeded" | "failed"

      if (status === "succeeded") {
        const videoUrl = SeedanceClient.extractVideoUrl(result);
        await prisma.queueItem.update({
          where: { id: item.id },
          data: { status: "completed", completedAt: new Date() },
        });
        if (item.videoId) {
          await prisma.video.update({
            where: { id: item.videoId },
            data: { status: "completed", videoUrl, completedAt: new Date() },
          });
        }
        console.log(`[worker] ✓ task ${taskId} completed`);
        return;
      }

      if (status === "failed") {
        const msg = result.error?.message || "Task failed";
        await prisma.queueItem.update({ where: { id: item.id }, data: { status: "failed", errorMessage: msg } });
        if (item.videoId) {
          await prisma.video.update({ where: { id: item.videoId }, data: { status: "failed", errorMessage: msg } });
        }
        console.error(`[worker] ✗ task ${taskId} failed: ${msg}`);
        return;
      }
    }

    // Timeout
    const msg = "Task timed out after 10 minutes";
    await prisma.queueItem.update({ where: { id: item.id }, data: { status: "failed", errorMessage: msg } });
    if (item.videoId) {
      await prisma.video.update({ where: { id: item.videoId }, data: { status: "failed", errorMessage: msg } });
    }
    console.error(`[worker] ✗ task ${taskId} timed out`);
  } catch (err) {
    console.error("[worker] unexpected error:", err);
  } finally {
    running = false;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function startWorker() {
  console.log("[worker] started, polling every", POLL_INTERVAL_MS / 1000, "s");
  setInterval(processNextItem, POLL_INTERVAL_MS);
  // Also run immediately on startup
  processNextItem();
}

module.exports = { startWorker };