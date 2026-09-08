/* Liminal Chat · person state and Calendar activity resolver. */

(function (global) {
  "use strict";

  const CALENDAR_STORAGE_KEY = "liminal_calendar_preview_v1";
  const HOME_LIFE_STORAGE_KEY = "liminal_home_life_state_v1";
  const HOME_LIFE_MAX_AGE_MS = 2 * 60 * 60 * 1000;

  const STATUS_DEFINITIONS = Object.freeze({
    online: { layer: "presence", displayText: "在线" },
    offline: { layer: "presence", displayText: "离线" },
    typing: { layer: "transient", displayText: "正在输入…" },
    calling: { layer: "transient", displayText: "正在通话" },
    busy: { layer: "activity", displayText: "忙碌" },
    thinking: { layer: "activity", displayText: "思考" },
    reading: { layer: "activity", displayText: "阅读" },
    eating: { layer: "activity", displayText: "吃饭" },
    working: { layer: "activity", displayText: "工作" },
    consulting: { layer: "activity", displayText: "咨询中" },
    meeting: { layer: "activity", displayText: "开会" },
    training: { layer: "activity", displayText: "训练中" },
    commuting: { layer: "activity", displayText: "在路上" },
    flying: { layer: "activity", displayText: "在飞机上" },
    shopping: { layer: "activity", displayText: "采购中" },
    shopping_sams: { layer: "activity", displayText: "在山姆" },
    showering: { layer: "activity", displayText: "洗澡" },
    sleeping: { layer: "activity", displayText: "睡觉" },
    calm: { layer: "mood", displayText: "平和" },
    tired: { layer: "mood", displayText: "疲倦" },
    insomnia: { layer: "mood", displayText: "失眠", special: true },
    irritable: { layer: "mood", displayText: "烦躁" },
    jealous: { layer: "mood", displayText: "吃醋", special: true },
    missing: { layer: "mood", displayText: "想你", special: true },
    distracted: { layer: "mood", displayText: "心不在焉" }
  });

  const CALENDAR_ACTIVITY_RULES = Object.freeze([
    Object.freeze({ code: "shopping_sams", displayText: "在山姆", priority: 98, durationMinutes: 90, keywords: /山姆/ }),
    Object.freeze({ code: "flying", displayText: "在飞机上", priority: 96, durationMinutes: 180, tags: ["flight", "flying"], keywords: /航班|飞行|飞机/ }),
    Object.freeze({ code: "consulting", displayText: "咨询中", priority: 94, durationMinutes: 60, tags: ["consulting", "clinical"], keywords: /咨询|接诊|个案|门诊/ }),
    Object.freeze({ code: "meeting", displayText: "开会", priority: 92, durationMinutes: 90, tags: ["meeting", "supervision"], keywords: /会议|开会|督导|讨论/ }),
    Object.freeze({ code: "training", displayText: "训练中", priority: 90, durationMinutes: 75, tags: ["exercise", "training", "run"], keywords: /健身|训练|晨跑|跑步|拉伸/ }),
    Object.freeze({ code: "shopping", displayText: "采购中", priority: 88, durationMinutes: 90, tags: ["shopping", "grocery"], keywords: /采购|超市|买东西|补给/ }),
    Object.freeze({ code: "eating", displayText: "吃饭", priority: 84, durationMinutes: 60, eventTypes: ["meal"], tags: ["meal"], keywords: /早餐|午饭|午餐|晚饭|晚餐|聚餐|吃饭/ }),
    Object.freeze({ code: "showering", displayText: "洗澡", priority: 82, durationMinutes: 35, tags: ["shower"], keywords: /洗澡|淋浴/ }),
    Object.freeze({ code: "reading", displayText: "阅读", priority: 78, durationMinutes: 60, tags: ["reading", "study"], keywords: /阅读|文献|看书/ }),
    Object.freeze({ code: "commuting", displayText: "在路上", priority: 76, durationMinutes: 60, tags: ["commute", "travel", "transport"], keywords: /在路上|通勤|赶路|出发|机场|车站/ }),
    Object.freeze({ code: "working", displayText: "工作", priority: 70, durationMinutes: 90, tags: ["work", "desk", "lecture"], keywords: /工作|备课|病例整理|讲座|培训|大学活动/ })
  ]);

  const READ_DELAY_RANGES_SECONDS = Object.freeze({
    default: Object.freeze([5, 20]),
    consulting: Object.freeze([120, 420]),
    meeting: Object.freeze([60, 240]),
    training: Object.freeze([45, 150]),
    shopping: Object.freeze([20, 90]),
    shopping_sams: Object.freeze([20, 90]),
    reading: Object.freeze([8, 35]),
    working: Object.freeze([25, 120]),
    commuting: Object.freeze([20, 90]),
    flying: Object.freeze([300, 1200]),
    sleeping: Object.freeze([900, 3600]),
    offline: Object.freeze([120, 600])
  });

  function safeReadJSON(key) {
    try {
      const parsed = JSON.parse(global.localStorage.getItem(key));
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (error) {
      console.warn(`Chat 状态读取失败：${key}`, error);
      return null;
    }
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function dateKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function addDays(key, amount) {
    const [year, month, day] = key.split("-").map(Number);
    const date = new Date(year, month - 1, day + amount);
    return dateKey(date);
  }

  function atTime(key, time) {
    if (!/^\d{2}:\d{2}$/.test(String(time || ""))) return null;
    const [year, month, day] = key.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    const date = new Date(year, month - 1, day, hour, minute, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function normalizeTags(value) {
    return Array.isArray(value)
      ? value.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean)
      : [];
  }

  function uniqueTags(...values) {
    return [...new Set(values.flatMap(normalizeTags))];
  }

  function findActivityRule(event) {
    const title = String(event.title || "");
    const type = String(event.eventType || event.category || "").trim().toLowerCase();
    const tags = normalizeTags(event.tags);
    return CALENDAR_ACTIVITY_RULES.find((rule) => (
      (rule.eventTypes || []).includes(type) ||
      (rule.tags || []).some((tag) => tags.includes(tag)) ||
      rule.keywords.test(title)
    )) || null;
  }

  function extractCalendarEvents(calendar, personId, key) {
    const rows = Array.isArray(calendar?.schedule?.[key]) ? calendar.schedule[key] : [];
    const events = [];
    const seen = new Set();

    function append(event) {
      if (!event.startTime || !event.title) return;
      const signature = [event.startTime, event.endTime, event.title, personId].join("|");
      if (seen.has(signature)) return;
      seen.add(signature);
      events.push(event);
    }

    rows.forEach((row, rowIndex) => {
      if (!row || typeof row !== "object") return;
      const owner = row.owner || "";
      const canonicalBelongsToPerson = owner === personId || owner === "both" || (
        !owner && personId === "luzhen" && row.eventType === "meal"
      );

      if (row.startTime && row.title && canonicalBelongsToPerson) {
        append({
          id: row.id || row.simulationId || `${key}-canonical-${rowIndex}`,
          title: row.title,
          startTime: row.startTime,
          endTime: row.endTime || "",
          eventType: row.eventType || row.category || "schedule",
          category: row.category || "",
          tags: uniqueTags(row.tags, personId === "luzhen" ? row.luzhenTags : row.keshiTags),
          location: row.location || "",
          dateKey: key
        });
      }

      const prefix = personId === "luzhen" ? "luzhen" : "keshi";
      const title = row[prefix];
      const startTime = row[`${prefix}Time`];
      if (!title || !startTime) return;
      append({
        id: row[`${prefix}SimulationId`] || row.id || row.simulationId || `${key}-${prefix}-${rowIndex}`,
        title,
        startTime,
        endTime: row[`${prefix}EndTime`] || "",
        eventType: row[`${prefix}EventType`] || row.eventType || "schedule",
        category: row[`${prefix}Category`] || row.category || "",
        tags: uniqueTags(row[`${prefix}Tags`], row.tags),
        location: row[`${prefix}Location`] || row.location || "",
        dateKey: key
      });
    });

    return events;
  }

  function eventWindow(event, rule) {
    const start = atTime(event.dateKey, event.startTime);
    if (!start) return null;
    let end = atTime(event.dateKey, event.endTime);
    if (end && end <= start) end.setDate(end.getDate() + 1);
    if (!end) end = new Date(start.getTime() + (rule?.durationMinutes || 60) * 60000);
    return { start, end };
  }

  function getCurrentSleepActivity(calendar, personId, now) {
    if (personId !== "luzhen") return null;
    const today = dateKey(now);
    const records = [addDays(today, -1), today];

    for (const key of records) {
      const record = calendar?.sleepLuzhen?.[key];
      if (!record || typeof record !== "object") continue;
      const liminalSleep = record.liminalSleep;
      let start = liminalSleep?.estimatedSleepAt ? new Date(liminalSleep.estimatedSleepAt) : atTime(key, record.start);
      let end = liminalSleep?.wakeAt ? new Date(liminalSleep.wakeAt) : atTime(key, record.end);
      if (!start || Number.isNaN(start.getTime()) || !end || Number.isNaN(end.getTime())) continue;
      if (end <= start) end.setDate(end.getDate() + 1);
      if (now >= start && now < end) {
        return {
          code: "sleeping",
          layer: "activity",
          displayText: "睡觉",
          source: "calendar",
          eventId: liminalSleep?.sessionId || `${key}-sleep-luzhen`,
          title: "睡眠",
          startedAt: start.toISOString(),
          endsAt: end.toISOString(),
          priority: 60
        };
      }
    }
    return null;
  }

  function getCurrentCalendarActivity(personId, now = new Date(), calendar = safeReadJSON(CALENDAR_STORAGE_KEY)) {
    if (!calendar || typeof calendar !== "object") return null;
    const today = dateKey(now);
    const active = [addDays(today, -1), today]
      .flatMap((key) => extractCalendarEvents(calendar, personId, key))
      .map((event) => {
        const rule = findActivityRule(event);
        const window = eventWindow(event, rule);
        if (!window || now < window.start || now >= window.end) return null;
        return {
          code: rule?.code || "busy",
          layer: "activity",
          displayText: rule?.displayText || "忙碌",
          source: "calendar",
          eventId: event.id,
          title: event.title,
          category: event.category,
          eventType: event.eventType,
          tags: event.tags,
          location: event.location,
          startedAt: window.start.toISOString(),
          endsAt: window.end.toISOString(),
          priority: rule?.priority || 65
        };
      })
      .filter(Boolean)
      .sort((left, right) => right.priority - left.priority || right.startedAt.localeCompare(left.startedAt));

    return active[0] || getCurrentSleepActivity(calendar, personId, now);
  }

  function getCurrentHomeActivity(personId, now = new Date(), snapshot = safeReadJSON(HOME_LIFE_STORAGE_KEY)) {
    if (personId !== "luzhen" || !snapshot?.luzhen || !snapshot.updatedAt) return null;
    const updatedAt = new Date(snapshot.updatedAt);
    if (Number.isNaN(updatedAt.getTime()) || now - updatedAt > HOME_LIFE_MAX_AGE_MS || now < updatedAt) return null;
    const source = {
      title: snapshot.luzhen.activity || "在家里",
      eventType: "home_life",
      tags: [],
      location: snapshot.luzhen.roomName || ""
    };
    const rule = findActivityRule(source);
    return {
      code: rule?.code || "busy",
      layer: "activity",
      displayText: rule?.displayText || source.title,
      source: "home-life",
      title: source.title,
      location: source.location,
      startedAt: updatedAt.toISOString(),
      endsAt: new Date(updatedAt.getTime() + HOME_LIFE_MAX_AGE_MS).toISOString(),
      priority: rule?.priority || 50
    };
  }

  function normalizeLayerValue(value, layer, source = "runtime") {
    if (!value) return null;
    const detail = typeof value === "string" ? { code: value } : value;
    if (!detail || typeof detail !== "object" || !detail.code) return null;
    const definition = STATUS_DEFINITIONS[detail.code] || {};
    if (detail.expiresAt && Date.now() >= new Date(detail.expiresAt).getTime()) return null;
    return {
      ...detail,
      layer,
      source: detail.source || source,
      displayText: detail.displayText || definition.displayText || detail.code,
      special: detail.special ?? definition.special ?? false
    };
  }

  function getCurrentPersonState(personId, options = {}) {
    const now = options.now instanceof Date ? options.now : new Date(options.now || Date.now());
    const runtime = options.runtime && typeof options.runtime === "object" ? options.runtime : {};
    const calendarActivity = getCurrentCalendarActivity(personId, now, options.calendar);
    const homeActivity = calendarActivity ? null : getCurrentHomeActivity(personId, now, options.homeLife);
    return {
      personId,
      calculatedAt: now.toISOString(),
      presence: normalizeLayerValue(runtime.presence || "online", "presence", "default"),
      activity: normalizeLayerValue(runtime.activity, "activity") || calendarActivity || homeActivity,
      mood: normalizeLayerValue(runtime.mood, "mood"),
      transient: normalizeLayerValue(runtime.transient, "transient")
    };
  }

  function resolveDisplayedStatus(state) {
    const candidates = [];
    if (state?.transient) candidates.push({ ...state.transient, rank: 400 });
    if (state?.mood?.special) candidates.push({ ...state.mood, rank: 350 });
    if (state?.activity?.source === "calendar") candidates.push({ ...state.activity, rank: 300 + (state.activity.priority || 0) / 100 });
    else if (state?.activity) candidates.push({ ...state.activity, rank: 220 + (state.activity.priority || 0) / 100 });
    if (state?.mood && !state.mood.special) candidates.push({ ...state.mood, rank: 180 });
    if (state?.presence) candidates.push({ ...state.presence, rank: 100 });
    candidates.sort((left, right) => right.rank - left.rank);
    return candidates[0] || { code: "offline", layer: "presence", source: "fallback", displayText: "离线", rank: 0 };
  }

  function getReadDelayMilliseconds(state, random = Math.random) {
    const activityCode = state?.activity?.code;
    const presenceCode = state?.presence?.code;
    const key = presenceCode === "offline" ? "offline" : activityCode;
    const range = READ_DELAY_RANGES_SECONDS[key] || READ_DELAY_RANGES_SECONDS.default;
    const ratio = Math.min(0.999999, Math.max(0, Number(random()) || 0));
    const seconds = Math.round(range[0] + ratio * (range[1] - range[0]));
    return seconds * 1000;
  }

  global.LiminalChatPersonState = Object.freeze({
    CALENDAR_STORAGE_KEY,
    HOME_LIFE_STORAGE_KEY,
    STATUS_DEFINITIONS,
    CALENDAR_ACTIVITY_RULES,
    READ_DELAY_RANGES_SECONDS,
    extractCalendarEvents,
    getCurrentCalendarActivity,
    getCurrentHomeActivity,
    getCurrentPersonState,
    resolveDisplayedStatus,
    getReadDelayMilliseconds
  });
})(window);
