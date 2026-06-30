const fetch = require("node-fetch");

/**
 * Seedance API client (ByteDance Volcengine).
 * ponytail: wraps the two-step submit→poll pattern; upgrade to webhooks if the API adds them.
 */
class SeedanceClient {
  constructor(apiKey, baseUrl = "https://ark.ap-southeast.bytepluses.com/api/v3") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  get headers() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  /**
   * Submit a video generation task.
   * Returns { task_id }
   */
  async submitTask({ prompt, model = "seedance-2.0", duration = "5", ratio = "16:9", resolution = "720p", imageUrl = null }) {
    const body = {
      model,
      content: [
        {
          type: "text",
          text: prompt,
        },
      ],
      parameters: {
        duration: parseInt(duration, 10) || 5,
        ratio,
        resolution,
      },
    };

    if (imageUrl) {
      body.content.unshift({ type: "image_url", image_url: { url: imageUrl } });
    }

    const res = await fetch(`${this.baseUrl}/contents/generations/tasks`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message || `Seedance submit failed: ${res.status}`);
    }

    return data; // { id, status, ... }
  }

  /**
   * Poll task status.
   * Returns { id, status, content: [{ type: "video_url", video_url: { url } }] }
   */
  async getTask(taskId) {
    const res = await fetch(`${this.baseUrl}/contents/generations/tasks/${taskId}`, {
      headers: this.headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message || `Seedance poll failed: ${res.status}`);
    }

    return data;
  }

  /** Extract video URL from completed task response */
  static extractVideoUrl(taskData) {
    const content = taskData?.content || [];
    const item = content.find((c) => c.type === "video_url");
    return item?.video_url?.url || null;
  }
}

module.exports = SeedanceClient;