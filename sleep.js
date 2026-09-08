/* Liminal Sleep · bedside conversation UI controller. */

(function () {
  "use strict";

  const core = window.LiminalSleepCore;
  const app = document.getElementById("sleepApp");
  const locationLabel = document.getElementById("sleepLocationLabel");
  const personStatus = document.getElementById("sleepPersonState");
  const clock = document.getElementById("sleepClock");
  const footerHint = document.getElementById("sleepFooterHint");

  if (!core || !app || !locationLabel || !personStatus || !clock || !footerHint) {
    console.error("[Liminal Sleep] The page shell or Sleep core is unavailable.");
    return;
  }

  let pendingLocation = null;
  let refreshTimer = null;
  let bubbleSequence = 0;
  let conversationMode = "setup";
  let screenName = "";
  let delayNextPartnerBubble = false;
  const bubbleMemory = [];

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>'"]/g, function (character) {
      return ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
      })[character];
    });
  }

  function normalizeLocation(location) {
    return location === "main_world" ? "main_world" : "loft";
  }

  function locationCopy(location, morning) {
    if (location === "loft") return "Loft · 二楼主卧";
    return morning ? "主世界 · 清晨" : "主世界";
  }

  function phasePersonStatus(phase, morning) {
    if (morning) {
      return ({
        soft_wake: "陆榛 · 刚醒",
        cuddle_buffer: "陆榛 · 还在床上",
        gentle_wake: "陆榛 · 慢慢清醒",
        getting_up: "陆榛 · 已经坐起来",
        hard_wake: "陆榛 · 已醒",
        completed: "陆榛 · 已醒"
      })[phase] || "陆榛 · 已醒";
    }

    return ({
      idle: "陆榛 · 在旁边",
      delay: "陆榛 · 靠在旁边",
      winding_down: "陆榛 · 有点困",
      soothing: "陆榛 · 声音很轻",
      direct: "陆榛 · 准备睡了",
      phone_down: "陆榛 · 快睡着了",
      quiet_sleep: "陆榛 · 已经安静下来",
      sleep_retry: "陆榛 · 还陪着你",
      night_wake: "陆榛 · 半梦半醒"
    })[phase] || "陆榛 · 在旁边";
  }

  function phaseFooter(phase, morning) {
    if (phase === "quiet_sleep") return "";
    if (morning) {
      return ({
        soft_wake: "不用一下子全醒。",
        cuddle_buffer: "再抱一小会儿。",
        gentle_wake: "天已经慢慢亮了。",
        getting_up: "慢慢坐起来。",
        hard_wake: "今天也开始了。",
        completed: "今晚再回来。"
      })[phase] || "慢慢醒。";
    }
    return ({
      idle: "今晚不用完成什么。",
      delay: "再窝一下也没关系。",
      winding_down: "这一点结束就回来。",
      soothing: "不用等下一句。",
      direct: "再看这一眼就够了。",
      phone_down: "屏幕可以放下了。",
      sleep_retry: "不用再做什么。",
      night_wake: "我还在。"
    })[phase] || "慢慢来。";
  }

  function setTheme(phase, morning, location) {
    const nextPhase = phase || "idle";
    document.body.dataset.phase = nextPhase;
    document.body.dataset.location = normalizeLocation(location || pendingLocation);
    if (morning) document.body.dataset.mode = "morning";
    else delete document.body.dataset.mode;

    const eveningColors = {
      idle: "#252b35",
      delay: "#272d37",
      winding_down: "#202630",
      soothing: "#191f28",
      direct: "#191f28",
      phone_down: "#141922",
      quiet_sleep: "#0e1218",
      sleep_retry: "#0e1218",
      night_wake: "#0e1218"
    };
    const morningColors = {
      soft_wake: "#252a31",
      cuddle_buffer: "#34383d",
      gentle_wake: "#62615f",
      getting_up: "#aaa59c",
      hard_wake: "#d0cbc0",
      completed: "#d0cbc0"
    };
    const color = morning
      ? morningColors[nextPhase] || morningColors.soft_wake
      : eveningColors[nextPhase] || eveningColors.idle;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
  }

  function updateChrome(phase, morning, location) {
    const normalized = normalizeLocation(location || pendingLocation);
    locationLabel.textContent = locationCopy(normalized, morning);
    personStatus.textContent = phasePersonStatus(phase, morning);
    footerHint.textContent = phaseFooter(phase, morning);
  }

  function updateClock() {
    clock.textContent = core.timeLabel(new Date());
  }

  function resetConversation(mode, firstLine) {
    bubbleMemory.length = 0;
    conversationMode = mode;
    if (firstLine) pushBubble("partner", firstLine, { key: mode + ":opening" });
  }

  function pushBubble(speaker, text, options) {
    const settings = options || {};
    const normalizedText = String(text || "").trim();
    const normalizedAction = String(settings.actionText || "").trim();
    if (!normalizedText && !normalizedAction) return null;

    const key = settings.key || "bubble:" + (++bubbleSequence);
    const duplicate = bubbleMemory.find(function (bubble) { return bubble.key === key; });
    if (duplicate) return duplicate;

    const bubble = {
      key: key,
      speaker: speaker === "user" ? "user" : "partner",
      text: normalizedText,
      actionText: normalizedAction,
      isNew: true,
      delayed: Boolean(settings.delayed)
    };
    bubbleMemory.push(bubble);
    if (bubbleMemory.length > 10) bubbleMemory.splice(0, bubbleMemory.length - 10);
    return bubble;
  }

  function pushUserReply(text) {
    return pushBubble("user", text, { key: "user:" + (++bubbleSequence) });
  }

  function corpusParts(item) {
    const formatted = core.formatCorpusItem(item);
    const firstBreak = formatted.indexOf("\n");
    const firstLine = firstBreak >= 0 ? formatted.slice(0, firstBreak) : formatted;
    if (firstLine.startsWith("［") && firstLine.endsWith("］")) {
      return {
        actionText: firstLine.slice(1, -1),
        text: firstBreak >= 0 ? formatted.slice(firstBreak + 1) : ""
      };
    }
    return { actionText: "", text: formatted };
  }

  function rememberCorpus(session, phase, item) {
    if (!item) return null;
    const parts = corpusParts(item);
    const selectedAt = session.corpus?.current?.selectedAt || session.phaseStartedAt || "current";
    const bubble = pushBubble("partner", parts.text || (!parts.actionText ? "我在。" : ""), {
      actionText: parts.actionText,
      key: "corpus:" + session.sessionId + ":" + phase + ":" + item.id + ":" + selectedAt,
      delayed: delayNextPartnerBubble
    });
    delayNextPartnerBubble = false;
    return bubble;
  }

  function visibleBubbles(phase) {
    if (phase === "quiet_sleep") {
      return bubbleMemory.filter(function (bubble) { return bubble.speaker === "partner"; }).slice(-1);
    }
    if (phase === "phone_down") return bubbleMemory.slice(-2);
    return bubbleMemory.slice(-4);
  }

  function bubbleMarkup(phase) {
    const visible = visibleBubbles(phase);
    return visible.map(function (bubble, index) {
      const age = visible.length - 1 - index;
      const previous = visible[index - 1];
      const showSpeaker = bubble.speaker === "partner" && (!previous || previous.speaker !== "partner");
      const classes = [
        "sleep-bubble-row",
        bubble.speaker === "user" ? "is-user" : "is-partner",
        "is-age-" + Math.min(age, 3),
        bubble.isNew ? "is-new" : "",
        bubble.delayed ? "is-delayed" : ""
      ].filter(Boolean).join(" ");
      const speaker = showSpeaker ? '<span class="sleep-speaker">陆榛</span>' : "";
      const action = bubble.actionText
        ? '<span class="sleep-physical-action">' + escapeHTML(bubble.actionText) + "。</span>"
        : "";
      const text = bubble.text
        ? '<div class="sleep-bubble">' + escapeHTML(bubble.text) + "</div>"
        : "";
      return '<div class="' + classes + '">' + speaker + action + text + "</div>";
    }).join("");
  }

  function replyMarkup(reply) {
    const subtle = reply.subtle ? " is-subtle" : "";
    const subcopy = reply.subcopy ? "<small>" + escapeHTML(reply.subcopy) + "</small>" : "";
    const attributes = Object.entries(reply.data || {}).map(function (entry) {
      return " data-" + entry[0] + '="' + escapeHTML(entry[1]) + '"';
    }).join("");
    return '<button class="sleep-reply-chip' + subtle + '" type="button" data-action="' +
      escapeHTML(reply.action) + '" data-reply="' + escapeHTML(reply.label) + '"' + attributes + ">" +
      escapeHTML(reply.label) + subcopy + "</button>";
  }

  function planMarkup(copy, label, extraClass) {
    if (!copy) return "";
    return '<details class="sleep-plan ' + (extraClass || "") + '">' +
      "<summary>" + escapeHTML(label || "明早安排") + "</summary>" +
      '<div class="sleep-plan-copy">' + copy + "</div></details>";
  }

  function renderScene(options) {
    const settings = options || {};
    const phase = settings.phase || "idle";
    const replies = Array.isArray(settings.replies) ? settings.replies : [];
    const replyArea = replies.length
      ? '<div class="sleep-reply-area"><p class="sleep-reply-prompt">' +
        escapeHTML(settings.prompt || "") + '</p><div class="sleep-replies">' +
        replies.map(replyMarkup).join("") + "</div></div>"
      : "";
    app.innerHTML = '<div class="sleep-scene"><div class="sleep-bubble-stage">' +
      bubbleMarkup(phase) + "</div>" +
      (settings.plan || "") + replyArea + (settings.extra || "") + "</div>";
    bubbleMemory.forEach(function (bubble) {
      bubble.isNew = false;
      bubble.delayed = false;
    });
  }

  function contextCopy(session) {
    const plan = session.wakePlan;
    if (plan?.nextHardEvent) {
      return "<strong>明天 " + core.timeLabel(plan.eventStartAt) + " · " + escapeHTML(plan.eventTitle) + "</strong><br>" +
        core.timeLabel(plan.idealWakeAt) + " 开始认真醒来 · " + core.timeLabel(plan.leaveAt) + " 出门";
    }
    return "明天没有需要赶早的硬日程，可以慢一点醒。";
  }

  function renderLocationChoice() {
    if (screenName !== "location") {
      resetConversation("setup", "还没睡啊。");
      screenName = "location";
    }
    setTheme("idle", false, "loft");
    updateChrome("idle", false, "loft");
    locationLabel.textContent = "今晚";
    renderScene({
      phase: "idle",
      prompt: "今晚睡哪里？",
      replies: [
        { action: "choose-location", label: "回 Loft", data: { location: "loft" } },
        { action: "choose-location", label: "留在主世界", data: { location: "main_world" } }
      ]
    });
  }

  function renderEntryChoice() {
    screenName = "entry";
    const location = normalizeLocation(pendingLocation);
    setTheme("idle", false, location);
    updateChrome("idle", false, location);
    renderScene({
      phase: "idle",
      prompt: "今晚想怎么睡？",
      replies: [
        { action: "start", label: "再玩一会儿", subcopy: "再窝一下", data: { mode: "delay" } },
        { action: "start", label: "哄我睡", subcopy: "准备睡了", data: { mode: "soothing" } },
        { action: "start", label: "直接睡", subcopy: "今天不磨蹭", data: { mode: "direct" } },
        { action: "back-location", label: "换一个地方", subtle: true }
      ]
    });
  }

  function ensureEveningConversation() {
    if (conversationMode === "morning") resetConversation("evening", "我在。");
    else conversationMode = "evening";
  }

  function ensureMorningConversation(openingLine) {
    if (conversationMode !== "morning") resetConversation("morning", openingLine || "……早。");
  }

  function renderWakeReady(session) {
    ensureMorningConversation("……天亮了一点。");
    screenName = "wake-ready";
    setTheme("soft_wake", true, session.location);
    updateChrome("soft_wake", true, session.location);
    renderScene({
      phase: "soft_wake",
      prompt: "醒一点就好。",
      replies: [
        { action: "begin-wake", label: "该起床了" }
      ],
      plan: planMarkup(contextCopy(session), "今天的安排")
    });
  }

  function renderWake(session) {
    ensureMorningConversation("……醒啦？");
    screenName = "wake";
    const phase = core.deriveWakePhase(session, new Date());
    const line = core.pickCorpus(session, phase);
    rememberCorpus(session, phase, line);
    setTheme(phase, true, session.location);
    updateChrome(phase, true, session.location);

    const replies = phase === "hard_wake" || phase === "getting_up"
      ? [{ action: "confirm-wake", label: "我真的起来了", subtle: phase !== "hard_wake" }]
      : [];
    renderScene({
      phase: phase,
      prompt: replies.length ? "已经站稳了吗？" : "",
      replies: replies
    });
  }

  function quietToolsMarkup() {
    return '<details class="sleep-plan sleep-quiet-tools"><summary>还醒着</summary>' +
      '<div class="sleep-replies">' +
      replyMarkup({ action: "retry", label: "我还是睡不着", subtle: true }) +
      replyMarkup({ action: "night-wake", label: "我醒了一下", subtle: true }) +
      "</div></details>";
  }

  function renderEvening(session) {
    ensureEveningConversation();
    screenName = "evening";
    const phase = session.phase;
    const line = core.pickCorpus(session, phase);
    rememberCorpus(session, phase, line);
    setTheme(phase, false, session.location);
    updateChrome(phase, false, session.location);

    let replies = [];
    let prompt = "";
    let plan = "";
    let extra = "";

    if (phase === "delay") {
      prompt = "想回来的时候，告诉我。";
      replies = [
        { action: "soothe", label: "哄我睡" }
      ];
      if (session.delayExtensionCount < core.CONFIG.maxDelayExtensions) {
        replies.push({ action: "extend", label: "再玩一点点", subtle: true });
      }
      plan = planMarkup(contextCopy(session), "明早安排");
    } else if (phase === "winding_down") {
      prompt = "这一点结束了吗？";
      replies = [{ action: "soothe", label: "哄我睡" }];
    } else if (phase === "quiet_sleep") {
      extra = quietToolsMarkup();
    }

    renderScene({ phase: phase, prompt: prompt, replies: replies, plan: plan, extra: extra });
  }

  function renderCompleted(session) {
    ensureMorningConversation("嗯，起来了。");
    pushBubble("partner", "昨晚已经安静地留在 Calendar 里了。今晚再回来。", {
      key: "completed:" + session.sessionId
    });
    screenName = "completed";
    setTheme("completed", true, session.location);
    updateChrome("completed", true, session.location);
    renderScene({ phase: "completed" });
  }

  function scheduleRefresh(session) {
    window.clearTimeout(refreshTimer);
    const targets = [session?.phaseEndsAt, core.getNextCorpusAt(session)]
      .filter(Boolean)
      .map(function (value) { return new Date(value).getTime(); })
      .filter(Number.isFinite);
    let target = targets.length ? Math.min.apply(Math, targets) : Date.now() + 30000;
    if (session?.wakeStartedAt) target = Date.now() + 30000;
    const delay = Math.min(30000, Math.max(250, target - Date.now() + 40));
    refreshTimer = window.setTimeout(render, delay);
  }

  function render() {
    updateClock();
    let session = core.loadState();
    if (!session) {
      if (pendingLocation) renderEntryChoice();
      else renderLocationChoice();
      return;
    }

    const result = core.reconcile(session, new Date());
    session = result.session;
    if (session.status === "completed") {
      if (core.localHour(new Date()) >= 17 && core.nightDateKey(new Date()) !== session.date) {
        if (pendingLocation) renderEntryChoice();
        else renderLocationChoice();
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

  app.addEventListener("click", function (event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    let session = core.loadState();

    if (action === "choose-location") {
      const location = normalizeLocation(button.dataset.location);
      pushUserReply(button.dataset.reply || button.textContent.trim());
      pendingLocation = location;
      pushBubble("partner", location === "loft" ? "嗯。回家睡。" : "好，今晚留在这里。", {
        key: "location-answer:" + location + ":" + (++bubbleSequence),
        delayed: true
      });
      renderEntryChoice();
      return;
    }

    if (action === "back-location") {
      pendingLocation = null;
      screenName = "";
      renderLocationChoice();
      return;
    }

    if (action === "start" && pendingLocation) {
      pushUserReply(button.dataset.reply || button.textContent.trim());
      delayNextPartnerBubble = true;
      session = core.createSession(pendingLocation, button.dataset.mode, new Date());
      core.saveState(session);
    } else if (!session) {
      return;
    } else if (action === "extend") {
      pushUserReply(button.dataset.reply || "再玩一点点");
      core.extendDelay(session);
    } else if (action === "soothe") {
      pushUserReply(button.dataset.reply || "哄我睡");
      delayNextPartnerBubble = true;
      core.beginSoothing(session);
    } else if (action === "retry") {
      pushUserReply(button.dataset.reply || "我还是睡不着");
      delayNextPartnerBubble = true;
      core.startRetry(session, "sleep_retry");
    } else if (action === "night-wake") {
      pushUserReply(button.dataset.reply || "我醒了一下");
      delayNextPartnerBubble = true;
      core.startRetry(session, "night_wake");
    } else if (action === "begin-wake") {
      pushUserReply(button.dataset.reply || "该起床了");
      delayNextPartnerBubble = true;
      core.beginWake(session);
    } else if (action === "confirm-wake") {
      pushUserReply(button.dataset.reply || "我真的起来了");
      core.confirmWake(session);
    }

    pendingLocation = null;
    render();
  });

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) render();
  });
  window.addEventListener("pageshow", render);
  window.LiminalSleepApp = Object.freeze({ render: render });
  render();
})();
