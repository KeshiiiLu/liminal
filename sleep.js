/* Liminal Sleep · page controller. */

(function () {
  "use strict";

  const core = window.LiminalSleepCore;
  const app = document.getElementById("sleepApp");
  const locationLabel = document.getElementById("sleepLocationLabel");
  const clock = document.getElementById("sleepClock");
  let pendingLocation = null;
  let refreshTimer = null;

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;"
    })[character]);
  }

  function setTheme(phase, morning = false) {
    document.body.dataset.phase = phase || "idle";
    if (morning) document.body.dataset.mode = "morning";
    else delete document.body.dataset.mode;
    const color = morning ? "#e1e1de" : ["quiet_sleep", "night_wake", "sleep_retry"].includes(phase) ? "#11151c" : "#252a33";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
  }

  function updateClock() {
    clock.textContent = core.timeLabel(new Date());
  }

  function contextCopy(session) {
    const plan = session.wakePlan;
    if (plan?.nextHardEvent) {
      return `<strong>明天 ${core.timeLabel(plan.eventStartAt)} · ${escapeHTML(plan.eventTitle)}</strong><br>` +
        `${core.timeLabel(plan.idealWakeAt)} 开始认真醒来 · ${core.timeLabel(plan.leaveAt)} 出门`;
    }
    return "明天没有识别到需要赶早的硬日程，可以慢一点醒。";
  }

  function renderLocationChoice() {
    setTheme("idle");
    locationLabel.textContent = "Liminal · quiet hours";
    app.innerHTML = `
      <p class="sleep-eyebrow">Tonight</p>
      <h2 class="sleep-title">今晚睡哪里？</h2>
      <p class="sleep-intro">先把今晚放在一个地方。只用于这一晚的 Sleep session。</p>
      <div class="sleep-options">
        <button class="sleep-option" type="button" data-action="choose-location" data-location="loft">
          <span><strong>回 Loft</strong><small>Loft · 二楼主卧</small></span><span>›</span>
        </button>
        <button class="sleep-option" type="button" data-action="choose-location" data-location="main_world">
          <span><strong>留在主世界</strong><small>今晚留在现实这边</small></span><span>›</span>
        </button>
      </div>`;
  }

  function renderEntryChoice() {
    setTheme("idle");
    const loft = pendingLocation === "loft";
    locationLabel.textContent = loft ? "Loft · 二楼主卧" : "主世界 · 今晚";
    app.innerHTML = `
      <p class="sleep-eyebrow">${loft ? "Loft · 二楼主卧" : "Main world"}</p>
      <h2 class="sleep-title">今晚想怎么睡？</h2>
      <p class="sleep-intro">不用完成任务。选一个最接近现在的状态就好。</p>
      <div class="sleep-options">
        <button class="sleep-option" type="button" data-action="start" data-mode="delay">
          <span><strong>我还想玩一会儿</strong><small>再窝一会儿</small></span><span>›</span>
        </button>
        <button class="sleep-option" type="button" data-action="start" data-mode="soothing">
          <span><strong>榛榛哄我睡</strong><small>我准备开始睡了</small></span><span>›</span>
        </button>
        <button class="sleep-option" type="button" data-action="start" data-mode="direct">
          <span><strong>今天直接睡</strong><small>今天不磨蹭</small></span><span>›</span>
        </button>
        <button class="sleep-text-button" type="button" data-action="back-location">换一个地方</button>
      </div>`;
  }

  function renderWakeReady(session) {
    setTheme("soft_wake", true);
    locationLabel.textContent = session.location === "loft" ? "Loft · morning" : "主世界 · morning";
    app.innerHTML = `
      <p class="sleep-eyebrow">Good morning</p>
      <h2 class="sleep-title">醒一点就好。</h2>
      <p class="sleep-intro">后面的节奏交给榛榛，不需要一遍遍点下一步。</p>
      <div class="sleep-context">${contextCopy(session)}</div>
      <button class="sleep-wake-button" type="button" data-action="begin-wake">该起床了</button>`;
  }

  function renderWake(session) {
    const phase = core.deriveWakePhase(session, new Date());
    const line = core.pickCorpus(session, phase);
    const corpusText = core.formatCorpusItem(line);
    setTheme(phase, true);
    locationLabel.textContent = session.wakePlan?.nextHardEvent ? "Morning · 有日程" : "Morning · 慢慢来";
    const hard = session.wakePlan?.hardWakeAt;
    const status = phase === "hard_wake"
      ? `现在要认真起来了${session.wakePlan?.leaveAt ? ` · ${core.timeLabel(session.wakePlan.leaveAt)} 出门` : ""}`
      : `${phase === "soft_wake" ? "先醒一醒" : phase === "cuddle_buffer" ? "可以再抱一小会儿" : phase === "gentle_wake" ? "慢慢睁眼" : "开始坐起来"}${hard ? ` · ${core.timeLabel(hard)} 前不再睡回去` : ""}`;
    app.innerHTML = `
      <p class="sleep-eyebrow">${escapeHTML(phase.replaceAll("_", " "))}</p>
      <div class="sleep-phrase">${escapeHTML(corpusText || "我在。慢慢醒。")}</div>
      <p class="sleep-status">${escapeHTML(status)}</p>
      <div class="sleep-progress"><span style="--progress:${wakeProgress(phase)}%"></span></div>
      <div class="sleep-actions">
        <button class="sleep-text-button" type="button" data-action="confirm-wake">我真的起来了</button>
      </div>`;
  }

  function wakeProgress(phase) {
    return ({ soft_wake: 18, cuddle_buffer: 38, gentle_wake: 62, getting_up: 82, hard_wake: 100 })[phase] || 12;
  }

  function renderEvening(session) {
    const phase = session.phase;
    const line = core.pickCorpus(session, phase);
    const corpusText = core.formatCorpusItem(line);
    setTheme(phase);
    locationLabel.textContent = session.location === "loft" ? "Loft · 二楼主卧" : "主世界 · tonight";
    const now = new Date();
    const remaining = session.phaseEndsAt ? Math.max(0, Math.ceil(core.minutesUntil(session.phaseEndsAt, now))) : 0;
    let status = "接下来不用再点了。页面会自己慢慢安静下来。";
    let actions = "";

    if (phase === "delay") {
      status = `缓冲中 · 还有约 ${remaining} 分钟${session.effectiveDelayMinutes < core.CONFIG.defaultDelayMinutes ? " · 明早要赶早" : ""}`;
      const canExtend = session.delayExtensionCount < core.CONFIG.maxDelayExtensions;
      actions = `<div class="sleep-actions two">
        <button class="sleep-primary" type="button" data-action="soothe">嗯，来哄我睡</button>
        ${canExtend ? '<button class="sleep-secondary" type="button" data-action="extend">再给我一点点</button>' : '<span></span>'}
      </div>`;
    } else if (phase === "winding_down") {
      status = "这一点结束就回来。没有新的任务。";
      actions = `<div class="sleep-actions"><button class="sleep-primary" type="button" data-action="soothe">嗯，来哄我睡</button></div>`;
    } else if (phase === "direct") {
      status = "今晚：直接睡了。再看这一眼就够了。";
    } else if (phase === "quiet_sleep") {
      status = `推定入睡 · ≈${core.timeLabel(session.estimatedSleepAt)}`;
      actions = `<div class="sleep-actions two">
        <button class="sleep-secondary" type="button" data-action="retry">我还是睡不着</button>
        <button class="sleep-secondary" type="button" data-action="night-wake">我醒了一下</button>
      </div>`;
    } else if (phase === "sleep_retry" || phase === "night_wake") {
      status = "不用再做什么。把屏幕留在这里也可以。";
    }

    app.innerHTML = `
      <div class="sleep-context">${contextCopy(session)}</div>
      <p class="sleep-eyebrow">${escapeHTML(phase.replaceAll("_", " "))}</p>
      <div class="sleep-phrase">${escapeHTML(corpusText || "我在。")}</div>
      <p class="sleep-status">${escapeHTML(status)}</p>
      ${phase !== "quiet_sleep" ? `<div class="sleep-progress"><span style="--progress:${eveningProgress(phase)}%"></span></div>` : ""}
      ${actions}`;
  }

  function eveningProgress(phase) {
    return ({ delay: 14, winding_down: 34, soothing: 57, direct: 72, phone_down: 82, sleep_retry: 62, night_wake: 62, quiet_sleep: 100 })[phase] || 10;
  }

  function renderCompleted(session) {
    setTheme("getting_up", true);
    locationLabel.textContent = "Morning · awake";
    app.innerHTML = `
      <p class="sleep-eyebrow">Awake</p>
      <h2 class="sleep-title">嗯，起来了。</h2>
      <p class="sleep-intro">昨晚的记录已经留在 Calendar。今晚再回来就好。</p>`;
  }

  function scheduleRefresh(session) {
    window.clearTimeout(refreshTimer);
    const targets = [session?.phaseEndsAt, core.getNextCorpusAt(session)]
      .filter(Boolean)
      .map((value) => new Date(value).getTime())
      .filter(Number.isFinite);
    let target = targets.length ? Math.min(...targets) : Date.now() + 30000;
    if (session?.wakeStartedAt) target = Date.now() + 30000;
    const delay = Math.min(30000, Math.max(250, target - Date.now() + 40));
    refreshTimer = window.setTimeout(render, delay);
  }

  function render() {
    updateClock();
    let session = core.loadState();
    if (!session) {
      pendingLocation ? renderEntryChoice() : renderLocationChoice();
      return;
    }
    const result = core.reconcile(session, new Date());
    session = result.session;
    if (session.status === "completed") {
      if (core.localHour(new Date()) >= 17 && core.nightDateKey(new Date()) !== session.date) {
        pendingLocation ? renderEntryChoice() : renderLocationChoice();
      } else {
        renderCompleted(session);
      }
      return;
    }
    if (session.wakeStartedAt) renderWake(session);
    else if (core.isWakeWindow(session, new Date())) renderWakeReady(session);
    else renderEvening(session);
    scheduleRefresh(session);
  }

  app.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    let session = core.loadState();

    if (action === "choose-location") {
      pendingLocation = button.dataset.location;
      renderEntryChoice();
      return;
    }
    if (action === "back-location") {
      pendingLocation = null;
      renderLocationChoice();
      return;
    }
    if (action === "start" && pendingLocation) {
      session = core.createSession(pendingLocation, button.dataset.mode, new Date());
      core.saveState(session);
    } else if (!session) {
      return;
    } else if (action === "extend") {
      core.extendDelay(session);
    } else if (action === "soothe") {
      core.beginSoothing(session);
    } else if (action === "retry") {
      core.startRetry(session, "sleep_retry");
    } else if (action === "night-wake") {
      core.startRetry(session, "night_wake");
    } else if (action === "begin-wake") {
      core.beginWake(session);
    } else if (action === "confirm-wake") {
      core.confirmWake(session);
    }
    pendingLocation = null;
    render();
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) render();
  });
  window.addEventListener("pageshow", render);
  window.LiminalSleepApp = Object.freeze({ render });
  render();
})();
