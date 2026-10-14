import { sendWebPush, validateSubscription } from "./web-push.js";

// One object per signed installation cookie. No chat history or other app data.
export class LiminalPushDevice {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.storage = ctx.storage;
    this.env = env;
  }

  fetch(request) {
    return this.ctx.blockConcurrencyWhile(() => this.handleRequest(request));
  }

  async handleRequest(request) {
    const path = new URL(request.url).pathname;
    if (path === "/status") {
      const record = await this.storage.get("subscription");
      const enabled = Boolean(record && record.authorizedUntil > Date.now());
      if (record && !enabled) await this.revoke();
      return Response.json({ enabled, lastTest: await this.storage.get("lastTest") || null });
    }
    if (path === "/subscribe") {
      const input = await request.json();
      const subscription = await validateSubscription(input.subscription);
      await this.revoke();
      await this.storage.put("subscription", {
        subscription, authorizedUntil: input.authorizedUntil, origin: input.origin,
        publicKey: input.publicKey
      });
      return Response.json({ enabled: true });
    }
    if (path === "/unsubscribe") {
      await this.revoke();
      return Response.json({ enabled: false });
    }
    if (path === "/test") {
      const input = await request.json();
      const record = await this.storage.get("subscription");
      if (!record || record.authorizedUntil <= Date.now()) {
        await this.revoke();
        return Response.json({ error: "请先开启本设备通知。" }, { status: 409 });
      }
      if (record.publicKey !== input.publicKey) {
        return Response.json({ error: "通知密钥已更新，请关闭通知后重新开启。" }, { status: 409 });
      }
      const pending = await this.storage.get("pendingTest");
      const lastTest = await this.storage.get("lastTest");
      if (pending || (lastTest && Date.now() - Date.parse(lastTest.createdAt) < 10000)) {
        return Response.json({ error: "测试通知正在处理，请稍后再试。" }, { status: 429 });
      }
      const createdAt = new Date().toISOString();
      const job = {
        eventId: crypto.randomUUID(), createdAt, personId: input.personId,
        dueAt: Date.now() + input.delaySeconds * 1000, attempts: 0
      };
      await this.storage.put("pendingTest", job);
      await this.storage.put("lastTest", { ...job, state: "queued" });
      if (input.delaySeconds === 0) {
        await this.deliver();
        const result = await this.storage.get("lastTest");
        return Response.json({ lastTest: result }, {
          status: result.state === "accepted" ? 200 : result.state === "retrying" ? 202 : 502
        });
      }
      await this.storage.setAlarm(job.dueAt);
      return Response.json({ lastTest: { ...job, state: "queued" } }, { status: 202 });
    }
    return new Response("Not Found", { status: 404 });
  }

  alarm() {
    return this.ctx.blockConcurrencyWhile(() => this.deliver());
  }

  async revoke() {
    await this.storage.deleteAlarm();
    await this.storage.delete(["subscription", "pendingTest", "lastTest"]);
  }

  async deliver() {
    const job = await this.storage.get("pendingTest");
    if (!job) return;
    const record = await this.storage.get("subscription");
    if (!record || record.authorizedUntil <= Date.now()) {
      await this.revoke();
      return;
    }
    if (job.dueAt > Date.now()) {
      await this.storage.setAlarm(job.dueAt);
      return;
    }
    const personName = job.personId === "jasper" ? "Jasper" : "榛榛";
    const payload = {
      version: 1, kind: "test", eventId: job.eventId, personId: job.personId,
      createdAt: job.createdAt, title: "Liminal · 测试通知",
      body: `通知通道已连通。点此进入与${personName}的聊天。`,
      url: new URL(`chat.html?person=${job.personId}`, `${record.origin}/`).href
    };
    let result;
    try {
      result = await sendWebPush(record.subscription, payload, this.env);
    } catch {
      result = { accepted: false, expired: false, status: 0 };
    }
    if (result.expired) {
      await this.revoke();
      await this.storage.put("lastTest", { ...job, state: "expired" });
      return;
    }
    if (result.accepted) {
      await this.storage.put("lastTest", { ...job, state: "accepted", sentAt: new Date().toISOString() });
      await this.storage.delete("pendingTest");
      await this.storage.deleteAlarm();
      return;
    }
    // Limited retry of network / provider failures, preserving the event ID.
    const retryable = result.status === 0 || result.status === 429 || result.status >= 500;
    if (retryable && job.attempts < 2) {
      job.attempts += 1;
      job.dueAt = Date.now() + job.attempts * 10000;
      await this.storage.put("pendingTest", job);
      await this.storage.put("lastTest", { ...job, state: "retrying" });
      await this.storage.setAlarm(job.dueAt);
      return;
    }
    await this.storage.put("lastTest", { ...job, state: "failed" });
    await this.storage.delete("pendingTest");
    await this.storage.deleteAlarm();
  }
}
