/* =========================
   Liminal · Household Shopping Engine
   管理 Calendar 的轻库存与采购事件，并通过统一 Finance API 安全同步 Wallet。
   ========================= */

(function () {
  "use strict";

  const config = window.LIMINAL_HOUSEHOLD_SHOPPING_DATA;
  const finance = window.LiminalFinance || null;
  const time = window.LiminalTime || null;

  if (!config) {
    console.warn("Household Shopping：未找到 household-shopping-data.js");
    return;
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function dateFromKey(dateKey) {
    const [year, month, day] = String(dateKey).split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function addDays(dateKey, amount) {
    const date = dateFromKey(dateKey);
    date.setDate(date.getDate() + amount);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function timeToMinutes(time) {
    const [hour, minute] = String(time || "00:00").split(":").map(Number);
    return hour * 60 + minute;
  }

  function minutesToTime(minutes) {
    const normalized = ((minutes % 1440) + 1440) % 1440;
    return `${pad(Math.floor(normalized / 60))}:${pad(normalized % 60)}`;
  }

  function hashString(text) {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function createRandom(seedText) {
    let seed = hashString(seedText);
    return function () {
      seed += 0x6D2B79F5;
      let value = seed;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randomInt(random, min, max) {
    return Math.floor(min + random() * (max - min + 1));
  }

  function roundMoney(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  function currentRealityDateKey() {
    if (time && typeof time.todayKey === "function") return time.todayKey();
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }

  function chooseWeighted(random, entries) {
    const valid = entries.filter((entry) => Number(entry.weight) > 0);
    const total = valid.reduce((sum, entry) => sum + Number(entry.weight), 0);
    if (!valid.length || total <= 0) return null;
    let cursor = random() * total;
    for (const entry of valid) {
      cursor -= Number(entry.weight);
      if (cursor <= 0) return entry;
    }
    return valid[valid.length - 1];
  }

  function ensureContainers(calendarData) {
    if (!calendarData.householdShopping || typeof calendarData.householdShopping !== "object" || Array.isArray(calendarData.householdShopping)) {
      calendarData.householdShopping = {};
    }
    const shopping = calendarData.householdShopping;
    if (!shopping.inventory || typeof shopping.inventory !== "object" || Array.isArray(shopping.inventory)) {
      shopping.inventory = { ...config.initialInventory };
    }
    config.stockKeys.forEach((key) => {
      if (!config.stockLevels.includes(shopping.inventory[key])) {
        shopping.inventory[key] = config.initialInventory[key];
      }
    });
    if (!shopping.days || typeof shopping.days !== "object" || Array.isArray(shopping.days)) {
      shopping.days = {};
    }
    if (!calendarData.schedule || typeof calendarData.schedule !== "object" || Array.isArray(calendarData.schedule)) {
      calendarData.schedule = {};
    }
    return shopping;
  }

  function getScheduleEvents(calendarData, dateKey) {
    const rows = Array.isArray(calendarData.schedule?.[dateKey]) ? calendarData.schedule[dateKey] : [];
    const events = [];
    rows.forEach((row, rowIndex) => {
      if (row.eventType && row.startTime && row.title) {
        events.push({
          rowIndex,
          owner: row.owner || "luzhen",
          title: row.title,
          start: row.startTime,
          end: row.endTime || "",
          eventType: row.eventType,
          mealType: row.mealType || "",
          mealSource: row.mealSource || "",
          location: row.location || "",
          tags: Array.isArray(row.tags) ? row.tags : []
        });
        return;
      }
      if (row.keshiTime && row.keshi) {
        events.push({
          rowIndex,
          owner: "keshi",
          title: row.keshi,
          start: row.keshiTime,
          end: row.keshiEndTime || "",
          eventType: row.keshiEventType || "schedule",
          mealType: row.keshiMealType || "",
          mealSource: row.keshiMealSource || "",
          location: row.keshiLocation || "",
          tags: Array.isArray(row.keshiTags) ? row.keshiTags : []
        });
      }
      if (row.luzhenTime && row.luzhen) {
        events.push({
          rowIndex,
          owner: "luzhen",
          title: row.luzhen,
          start: row.luzhenTime,
          end: row.luzhenEndTime || "",
          eventType: row.luzhenEventType || (
            (Array.isArray(row.luzhenTags) && row.luzhenTags.includes("meal")) ||
            /早餐|午饭|午餐|晚饭|晚餐|聚餐|一起做饭|咖啡|饮品|加餐|甜点/.test(row.luzhen)
              ? "meal"
              : "schedule"
          ),
          mealType: row.luzhenMealType || "",
          mealSource: row.luzhenMealSource || "",
          location: row.luzhenLocation || "",
          tags: Array.isArray(row.luzhenTags) ? row.luzhenTags : []
        });
      }
    });
    return events;
  }

  function normalizeLocation(value) {
    const text = typeof value === "string"
      ? value
      : value?.location || value?.currentLocation || value?.city;
    if (!text) return "shanghai";
    const normalized = String(text).trim().toLowerCase();
    if (["shanghai", "loft", "上海", "上海家里"].includes(normalized)) return "shanghai";
    return normalized;
  }

  function isShanghaiLocation(value) {
    return normalizeLocation(value) === "shanghai";
  }

  function getLocationContext(calendarData, dateKey, events = getScheduleEvents(calendarData, dateKey)) {
    const explicit = calendarData.locationState?.[dateKey];
    const cityNames = ["武汉", "杭州", "苏州", "南京", "北京", "广州", "深圳", "成都"];
    let awayLocation = "";
    let shanghaiAvailableFrom = "";

    if (typeof explicit === "string") {
      const normalized = normalizeLocation(explicit);
      if (normalized !== "shanghai") awayLocation = normalized;
    } else if (explicit && typeof explicit === "object") {
      const initial = normalizeLocation(
        explicit.startLocation || explicit.location || explicit.currentLocation || explicit.city
      );
      if (initial !== "shanghai") awayLocation = initial;
      const explicitReturn = explicit.returnToShanghaiAt || explicit.shanghaiFrom || "";
      if (/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(explicitReturn)) {
        shanghaiAvailableFrom = explicitReturn;
      }
      const transitions = Array.isArray(explicit.transitions) ? explicit.transitions : [];
      transitions
        .filter((item) => item && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(item.time || ""))
        .sort((a, b) => a.time.localeCompare(b.time))
        .forEach((item) => {
          const location = normalizeLocation(item.location || item.city);
          if (location !== "shanghai" && !awayLocation) awayLocation = location;
          if (location === "shanghai" && awayLocation && !shanghaiAvailableFrom) {
            shanghaiAvailableFrom = item.time;
          }
        });
    }

    const locatedEvent = events.find((event) => (
      event.location && normalizeLocation(event.location) !== "shanghai"
    ));
    const travelEvent = events.find((event) => (
      event.tags.includes("travel") || cityNames.some((city) => event.title.includes(city))
    ));
    if (!awayLocation && locatedEvent) awayLocation = normalizeLocation(locatedEvent.location);
    if (!awayLocation && travelEvent) {
      awayLocation = cityNames.find((city) => travelEvent.title.includes(city)) || "travel";
    }

    if (awayLocation && !shanghaiAvailableFrom) {
      const awayStart = locatedEvent?.start || travelEvent?.start || "00:00";
      const returnEvent = events
        .filter((event) => (
          timeToMinutes(event.start) >= timeToMinutes(awayStart) &&
          (
            /返沪|回上海|抵达上海/.test(event.title) ||
            (event.location && isShanghaiLocation(event.location) && timeToMinutes(event.start) > 0)
          )
        ))
        .sort((a, b) => a.start.localeCompare(b.start))[0];
      if (returnEvent) shanghaiAvailableFrom = returnEvent.end || returnEvent.start;
    }

    return {
      location: awayLocation && !shanghaiAvailableFrom ? awayLocation : "shanghai",
      awayLocation,
      shanghaiAvailableFrom,
      isShanghai: !awayLocation || Boolean(shanghaiAvailableFrom)
    };
  }

  function getLocationAtTime(calendarData, dateKey, time) {
    const context = getLocationContext(calendarData, dateKey);
    if (!context.awayLocation) return "shanghai";
    if (!context.shanghaiAvailableFrom) return context.awayLocation;
    return timeToMinutes(time) >= timeToMinutes(context.shanghaiAvailableFrom)
      ? "shanghai"
      : context.awayLocation;
  }

  function getCalendarContext(calendarData, dateKey) {
    ensureContainers(calendarData);
    const date = dateFromKey(dateKey);
    const events = getScheduleEvents(calendarData, dateKey);
    const luzhenEvents = events.filter((event) => event.owner === "luzhen" || event.owner === "both");
    const meals = events.filter((event) => event.eventType === "meal");
    const dinner = meals.find((event) => event.mealType === "dinner" || timeToMinutes(event.start) >= 17 * 60);
    const workload = luzhenEvents.reduce((sum, event) => {
      const row = calendarData.schedule?.[dateKey]?.[event.rowIndex] || {};
      const raw = row.luzhenWorkload;
      return sum + (Number.isFinite(Number(raw)) ? Number(raw) : (event.eventType === "schedule" ? 0.8 : 0));
    }, 0);
    const latestEnd = luzhenEvents.reduce((latest, event) => {
      const end = event.end || event.start;
      return end > latest ? end : latest;
    }, "00:00");
    const locationContext = getLocationContext(calendarData, dateKey, events);
    return {
      dateKey,
      weekday: date.getDay(),
      location: locationContext.location,
      awayLocation: locationContext.awayLocation,
      shanghaiAvailableFrom: locationContext.shanghaiAvailableFrom,
      isShanghai: locationContext.isShanghai,
      events,
      meals,
      dinner,
      dinnerAtHome: Boolean(dinner && ["home", "food_calendar"].includes(dinner.mealSource)),
      dinnerOutside: Boolean(dinner && ["restaurant", "work_meal", "project_meal", "travel_meal", "delivery"].includes(dinner.mealSource)),
      highIntensity: workload >= 4 || luzhenEvents.filter((event) => event.eventType === "schedule").length >= 4,
      fridayEarlyFinish: date.getDay() === 5 && timeToMinutes(latestEnd) <= 17 * 60 + 45,
      weekend: date.getDay() === 0 || date.getDay() === 6,
      shoppingFor: "both"
    };
  }

  function getMissionWeights(context, inventory) {
    const weights = Object.fromEntries(
      Object.entries(config.missions).map(([key, mission]) => [key, mission.baseWeight])
    );
    const stockMultiplier = { empty: 4.8, low: 2.7, ok: 1, full: 0.12 };
    Object.entries(config.missions).forEach(([key, mission]) => {
      const levels = mission.stockKeys.map((stockKey) => stockMultiplier[inventory[stockKey]] || 1);
      weights[key] *= levels.length ? Math.max(...levels) : 1;
    });
    if (context.dinnerAtHome) weights.dinner_today *= 2.4;
    if (context.dinnerOutside) weights.dinner_today = 0;
    if (context.fridayEarlyFinish) {
      weights.dinner_today *= 2.1;
      weights.weekly_restock *= 1.7;
    }
    if (context.highIntensity) {
      weights.quick_meal_restock *= 2.2;
      weights.dinner_today *= 0.75;
      weights.big_restock *= 0.45;
    }
    if (context.weekend) {
      weights.weekly_restock *= 1.65;
      weights.big_restock *= 1.8;
    }
    if (!context.isShanghai) {
      Object.keys(weights).forEach((key) => { weights[key] = 0; });
    }
    return weights;
  }

  function hadRecentBigRestock(calendarData, dateKey) {
    const days = calendarData.householdShopping?.days || {};
    for (let offset = 1; offset <= config.bigRestockCooldownDays; offset += 1) {
      if (days[addDays(dateKey, -offset)]?.mission === "big_restock") return true;
    }
    return false;
  }

  function getMerchantWeights(context, mission, recentBigRestock) {
    return Object.entries(config.merchants).map(([id, merchant]) => {
      let weight = merchant.baseWeight * (merchant.missions[mission] ?? 1);
      if (id === "freshmart") {
        if (["luzhen", "both"].includes(context.shoppingFor)) weight *= 1.35;
        if (context.dinnerAtHome) weight *= 1.25;
        if (context.weekend && !context.highIntensity) weight *= 1.18;
      }
      if (id === "sams" && recentBigRestock) weight = 0;
      return { id, weight };
    });
  }

  function overlapsExisting(events, start, duration = 45) {
    const startMinutes = timeToMinutes(start);
    const endMinutes = startMinutes + duration;
    return events.some((event) => {
      const eventStart = timeToMinutes(event.start);
      let eventEnd = event.end ? timeToMinutes(event.end) : eventStart + 45;
      if (eventEnd < eventStart) eventEnd += 1440;
      return startMinutes < eventEnd && endMinutes > eventStart;
    });
  }

  function findAvailableTime(context, mission, random) {
    const ranges = mission === "dinner_today"
      ? [[15 * 60 + 45, 18 * 60]]
      : context.weekend
        ? [[10 * 60 + 30, 12 * 60 + 30], [15 * 60, 18 * 60 + 30]]
        : [[12 * 60 + 30, 13 * 60 + 45], [16 * 60 + 30, 19 * 60]];
    const candidates = [];
    ranges.forEach(([start, end]) => {
      for (let cursor = start; cursor <= end; cursor += 15) candidates.push(cursor);
    });
    const offset = candidates.length ? randomInt(random, 0, candidates.length - 1) : 0;
    for (let index = 0; index < candidates.length; index += 1) {
      const candidate = candidates[(index + offset) % candidates.length];
      const time = minutesToTime(candidate);
      if (
        context.shanghaiAvailableFrom &&
        timeToMinutes(time) < timeToMinutes(context.shanghaiAvailableFrom)
      ) continue;
      if (!overlapsExisting(context.events, time, 40)) return time;
    }
    return "";
  }

  function buildBasket(random, mission, merchantId, inventory) {
    const missionStockKeys = config.missions[mission]?.stockKeys || config.stockKeys;
    const depleted = missionStockKeys.filter((key) => ["empty", "low"].includes(inventory[key]));
    const desiredKeys = depleted.length ? depleted : missionStockKeys;
    const targetCount = mission === "big_restock" ? randomInt(random, 5, 8) : randomInt(random, 3, 5);
    const available = config.products.filter((product) => product.merchants.includes(merchantId));
    const selected = [];
    let attempts = 0;
    while (selected.length < targetCount && attempts < 80) {
      attempts += 1;
      const pool = available.filter((product) => !selected.some((item) => item.id === product.id));
      if (!pool.length) break;
      const candidates = pool.map((product) => {
        let weight = desiredKeys.includes(product.stockKey) ? 3 : 0.55;
        if (merchantId === "freshmart" && ["otherProtein", "noodles", "eggs", "dairy"].includes(product.stockKey)) weight *= 1.35;
        if (product.rare) weight *= 0.06;
        return { product, weight };
      });
      const chosen = chooseWeighted(random, candidates)?.product;
      if (chosen) selected.push(chosen);
    }
    return selected.map((product) => ({
      id: product.id,
      name: product.name,
      stockKey: product.stockKey,
      amount: roundMoney(product.price[0] + random() * (product.price[1] - product.price[0]))
    }));
  }

  function createWalletDraft(input) {
    return {
      draftId: `shopping_${input.date.replaceAll("-", "")}_${input.merchantId}_${input.mission}`,
      type: "expense",
      category: "家庭采购",
      title: input.merchant,
      merchant: input.merchant,
      amount: input.amount,
      currency: "CNY",
      date: input.date,
      time: input.time,
      mission: input.mission,
      missionLabel: input.missionLabel,
      basket: input.basket.map((item) => ({
        id: item.id,
        name: item.name,
        stockKey: item.stockKey,
        amount: item.amount
      })),
      location: "shanghai",
      payer: "luzhen",
      owner: "family",
      scope: "household",
      world: "secondary",
      originWorld: "sub",
      accountHint: "cmb_life",
      resolvedAccountId: "cmb_daily",
      status: "planned",
      source: "calendar_household_shopping",
      sourceType: "household_shopping",
      sourceDate: input.date,
      sourceId: input.id,
      externalRef: `household_shopping:${input.id}`
    };
  }

  function walletStorageIsReadable() {
    if (!finance || typeof finance.STORAGE_KEY !== "string") return false;
    const raw = localStorage.getItem(finance.STORAGE_KEY);
    if (!raw) return true;
    try {
      const parsed = JSON.parse(raw);
      return Boolean(parsed && typeof parsed === "object");
    } catch (error) {
      console.error("Wallet 原始数据无法解析，本次联动已停止，未覆盖原数据。", error);
      return false;
    }
  }

  function financeCanSync() {
    return Boolean(
      finance &&
      typeof finance.upsertTransaction === "function" &&
      typeof finance.deleteTransaction === "function" &&
      typeof finance.getTransaction === "function" &&
      typeof finance.getState === "function" &&
      typeof finance.createId === "function" &&
      walletStorageIsReadable()
    );
  }

  function findSourceTransaction(sourceType, sourceId, transactionId = "", externalRef = "") {
    if (!financeCanSync()) return null;
    const transactions = Array.isArray(finance.getState()?.transactions)
      ? finance.getState().transactions
      : [];
    if (transactionId) {
      const byId = finance.getTransaction(transactionId);
      if (byId) return byId;
    }
    return transactions.find((item) => (
      (externalRef && item.externalRef === externalRef) ||
      (item.sourceType === sourceType && item.sourceId === sourceId)
    )) || null;
  }

  function sourceTransactionMatches(transaction, sourceType, sourceId) {
    return Boolean(
      transaction &&
      transaction.originWorld === "sub" &&
      transaction.sourceType === sourceType &&
      transaction.sourceId === sourceId
    );
  }

  function syncWalletDraft(draft, preferredTransactionId = "", options = {}) {
    if (!draft) return { status: "no_draft", transactionId: null };
    const realizationLimit = options.realizationLimit || currentRealityDateKey();
    if (draft.date > realizationLimit) {
      return { status: "planned", transactionId: preferredTransactionId || null };
    }
    if (!financeCanSync()) return { status: "draft", transactionId: preferredTransactionId || null };

    const existing = findSourceTransaction(
      draft.sourceType,
      draft.sourceId,
      preferredTransactionId,
      draft.externalRef
    );
    if (existing && !sourceTransactionMatches(existing, draft.sourceType, draft.sourceId)) {
      console.error("Wallet 联动引用冲突，未修改现有流水。", draft.sourceId);
      return { status: "reference_conflict", transactionId: preferredTransactionId || null };
    }

    const transactionId = existing?.transactionId || preferredTransactionId || finance.createId("transaction");
    try {
      const saved = finance.upsertTransaction({
        ...(existing || {}),
        transactionId,
        externalRef: draft.externalRef,
        originWorld: "sub",
        world: "secondary",
        type: "expense",
        amount: draft.amount,
        currency: "CNY",
        title: draft.title,
        category: draft.category || "买菜",
        subcategory: draft.missionLabel || "",
        note: draft.note || draft.missionLabel || "",
        fromAccountId: "cmb_daily",
        toAccountId: "",
        ledgerOwner: "family",
        source: draft.source,
        sourceType: draft.sourceType,
        sourceDate: draft.sourceDate,
        sourceId: draft.sourceId,
        merchant: draft.merchant,
        mission: draft.mission,
        missionLabel: draft.missionLabel || "",
        basket: Array.isArray(draft.basket) ? draft.basket.map((item) => (
          item && typeof item === "object" ? { ...item } : String(item)
        )) : [],
        location: draft.location,
        payer: "luzhen",
        owner: "family",
        scope: draft.scope || "household",
        accountHint: "cmb_life",
        resolvedAccountId: "cmb_daily",
        status: "posted",
        realizationStatus: "realized",
        autoGenerated: true,
        generatedBy: "wallet_daily_engine",
        processedDate: draft.date,
        date: draft.date,
        timeOfDay: draft.time || "12:00",
        occurredAt: `${draft.date}T${draft.time || "12:00"}:00`,
        createdAt: existing?.createdAt || new Date().toISOString()
      });
      return { status: "synced", transactionId: saved.transactionId };
    } catch (error) {
      console.error("Wallet 联动失败，Calendar 数据仍保留为草稿。", error);
      return { status: "draft", transactionId: preferredTransactionId || null };
    }
  }

  function removeSourceTransaction(sourceType, sourceId, transactionId = "", externalRef = "") {
    if (!financeCanSync()) return { status: "pending_delete", transactionId: transactionId || null };
    const existing = findSourceTransaction(sourceType, sourceId, transactionId, externalRef);
    if (!existing) return { status: "removed", transactionId: null };
    if (!sourceTransactionMatches(existing, sourceType, sourceId)) {
      console.error("Wallet 删除引用不匹配，未触碰现有流水。", sourceId);
      return { status: "reference_conflict", transactionId: transactionId || null };
    }
    return finance.deleteTransaction(existing.transactionId)
      ? { status: "removed", transactionId: null }
      : { status: "pending_delete", transactionId: existing.transactionId };
  }

  function normalizeMealItems(value) {
    const source = value && typeof value === "object" ? value : {};
    return {
      shared: Array.isArray(source.shared) ? [...source.shared] : [],
      keshi: Array.isArray(source.keshi) ? [...source.keshi] : [],
      luzhen: Array.isArray(source.luzhen) ? [...source.luzhen] : []
    };
  }

  function appendUniqueMealItem(target, value) {
    const text = String(value || "").trim();
    if (text && !target.includes(text)) target.push(text);
  }

  function linkDinnerBasketToMeal(calendarData, result) {
    if (result.mission !== "dinner_today") return;
    const rows = Array.isArray(calendarData.schedule?.[result.date])
      ? calendarData.schedule[result.date]
      : [];
    const dinner = rows.find((row) => (
      (row.eventType === "meal" && row.mealType === "dinner") ||
      (row.luzhenEventType === "meal" && row.luzhenMealType === "dinner")
    ));
    if (!dinner) return;

    const items = normalizeMealItems(dinner.mealItems || dinner.luzhenMealItems);
    const linkBudget = Math.max(1, Math.min(3, result.basket.length - 1));
    let linked = 0;
    const sharedCandidates = result.basket.filter((item) => (
      ["vegetables", "noodles", "fruit", "dairy", "bread"].includes(item.stockKey)
    )).slice(0, Math.min(2, linkBudget));
    sharedCandidates.forEach((item) => {
      appendUniqueMealItem(items.shared, item.name);
      linked += 1;
    });

    const keshiProtein = result.basket.find((item) => ["chicken", "beef"].includes(item.stockKey));
    const luzhenProtein = result.basket.find((item) => item.stockKey === "otherProtein");
    if (keshiProtein && linked < linkBudget) {
      appendUniqueMealItem(items.keshi, keshiProtein.name);
      linked += 1;
    }
    if (luzhenProtein && linked < linkBudget) {
      appendUniqueMealItem(items.luzhen, luzhenProtein.name);
      linked += 1;
    }

    dinner.mealItems = items;
    dinner.luzhenMealItems = normalizeMealItems(items);
    dinner.shoppingLink = {
      shoppingId: result.id,
      mission: result.mission,
      linkedItemCount: linked
    };
  }

  function getMealItemHints(calendarData, dateKey, mealType) {
    const days = calendarData.householdShopping?.days || {};
    const values = [];
    for (let offset = 1; offset <= 3; offset += 1) {
      const result = days[addDays(dateKey, -offset)];
      if (!result?.generated || !Array.isArray(result.basket)) continue;
      const allowed = (
        (mealType === "breakfast" && result.mission === "breakfast_restock") ||
        (["breakfast", "snack"].includes(mealType) && result.mission === "fruit_restock") ||
        (["lunch", "dinner"].includes(mealType) && result.mission === "quick_meal_restock")
      );
      if (!allowed) continue;
      result.basket.slice(0, 2).forEach((item) => {
        const name = typeof item === "string" ? item : item.name;
        if (name && !values.includes(name)) values.push(name);
      });
    }
    return values.slice(0, 2);
  }

  function appendShoppingScheduleEvent(calendarData, result) {
    const rows = calendarData.schedule[result.date] || (calendarData.schedule[result.date] = []);
    rows.push({
      keshiTime: "",
      keshiEndTime: "",
      keshi: "",
      luzhenTime: result.time,
      luzhenEndTime: "",
      luzhen: `${result.merchant} · ${result.missionLabel}`,
      luzhenSource: "generated",
      luzhenEventType: "shopping",
      luzhenLocation: "shanghai",
      world: "secondary",
      originWorld: "sub",
      luzhenWorkload: 0,
      luzhenTags: ["life", "shopping", "household"],
      householdShoppingId: result.id,
      status: "planned"
    });
  }

  function generateForDate(calendarData, dateKey, options = {}) {
    const shopping = ensureContainers(calendarData);
    if (!options.force && Object.prototype.hasOwnProperty.call(shopping.days, dateKey)) {
      const existing = shopping.days[dateKey];
      if (existing?.generated) {
        existing.walletDraft = createWalletDraft(existing);
        existing.status = existing.status === "realized" ? "realized" : "planned";
        linkDinnerBasketToMeal(calendarData, existing);
      }
      if (existing?.generated && existing.walletDraft && options.realize === true) {
        const sync = syncWalletDraft(
          existing.walletDraft,
          existing.walletTransactionId || "",
          { realizationLimit: options.realizationLimit }
        );
        existing.walletSyncStatus = sync.status;
        if (sync.transactionId) existing.walletTransactionId = sync.transactionId;
        if (sync.status === "synced") existing.status = "realized";
      }
      return existing;
    }
    const context = getCalendarContext(calendarData, dateKey);
    const random = createRandom(`${dateKey}|household-shopping|v${config.version}`);
    if (!context.isShanghai) {
      const blocked = { resolved: true, generated: false, blocked: true, reason: "outside_shanghai", location: context.location, walletDraft: null };
      if (options.persist !== false) shopping.days[dateKey] = blocked;
      return blocked;
    }
    const missionWeights = getMissionWeights(context, shopping.inventory);
    if (hadRecentBigRestock(calendarData, dateKey)) missionWeights.big_restock = 0;
    const baseProbability = context.fridayEarlyFinish
      ? config.autoShoppingProbability.friday
      : context.weekend
        ? config.autoShoppingProbability.weekend
        : context.highIntensity
          ? config.autoShoppingProbability.highIntensity
          : config.autoShoppingProbability.weekday;
    const shouldGenerate = Boolean(options.forceMission) || random() < baseProbability;
    if (!shouldGenerate) {
      const empty = { resolved: true, generated: false, blocked: false, reason: "not_needed", walletDraft: null, missionWeights };
      if (options.persist !== false) shopping.days[dateKey] = empty;
      return empty;
    }
    const mission = options.forceMission || chooseWeighted(
      random,
      Object.entries(missionWeights).map(([id, weight]) => ({ id, weight }))
    )?.id;
    if (!mission) {
      const empty = { resolved: true, generated: false, blocked: false, reason: "no_mission", walletDraft: null, missionWeights };
      if (options.persist !== false) shopping.days[dateKey] = empty;
      return empty;
    }
    const recentBig = hadRecentBigRestock(calendarData, dateKey);
    const merchantId = options.forceMerchant || chooseWeighted(random, getMerchantWeights(context, mission, recentBig))?.id;
    const time = findAvailableTime(context, mission, random);
    if (!merchantId || !time) {
      const blocked = { resolved: true, generated: false, blocked: true, reason: "no_schedule_slot", walletDraft: null, mission, missionWeights };
      if (options.persist !== false) shopping.days[dateKey] = blocked;
      return blocked;
    }
    const merchant = config.merchants[merchantId];
    const basket = buildBasket(random, mission, merchantId, shopping.inventory);
    const amount = roundMoney(basket.reduce((sum, item) => sum + item.amount, 0));
    const result = {
      id: `shopping_${dateKey.replaceAll("-", "")}_${merchantId}_${mission}`,
      resolved: true,
      generated: true,
      blocked: false,
      source: "generated",
      world: "secondary",
      originWorld: "sub",
      date: dateKey,
      time,
      location: "shanghai",
      shoppingFor: context.shoppingFor,
      mission,
      missionLabel: config.missions[mission].label,
      merchantId,
      merchant: merchant.label,
      basket,
      amount,
      accountHint: "cmb_daily",
      walletDraft: null,
      status: "planned",
      realizedAt: null,
      missionWeights
    };
    result.walletDraft = createWalletDraft(result);
    if (options.persist !== false) {
      shopping.days[dateKey] = result;
      basket.forEach((item) => {
        shopping.inventory[item.stockKey] = mission === "big_restock" ? "full" : "ok";
      });
      linkDinnerBasketToMeal(calendarData, result);
      appendShoppingScheduleEvent(calendarData, result);
      if (options.realize === true) {
        const sync = syncWalletDraft(
          result.walletDraft,
          "",
          { realizationLimit: options.realizationLimit }
        );
        result.walletSyncStatus = sync.status;
        result.walletTransactionId = sync.transactionId;
        if (sync.status === "synced") result.status = "realized";
      }
    }
    return result;
  }

  function createFoodCalendarDraft(dateKey, record) {
    const amount = record?.price === null || record?.price === ""
      ? null
      : Number(record?.price);
    if (
      !record ||
      record.walletEnabled !== true ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !String(record.text || "").trim()
    ) return null;
    const sourceLabel = record.mealSource === "delivery" ? "外卖" : "今日食签";
    const sourceId = `food_calendar_${dateKey}`;
    return {
      draftId: `food_calendar_${dateKey.replaceAll("-", "")}`,
      type: "expense",
      category: record.mealSource === "delivery" ? "外卖" : "餐饮",
      title: sourceLabel,
      merchant: sourceLabel,
      amount,
      currency: "CNY",
      date: dateKey,
      time: "12:00",
      mission: "food_calendar",
      missionLabel: "今日食签",
      basket: String(record.text).trim().split(/\n+/).map((item, index) => ({
        id: `${sourceId}_${index + 1}`,
        name: item.trim(),
        stockKey: "",
        amount: null
      })).filter((item) => item.name),
      location: "loft",
      payer: "luzhen",
      owner: "family",
      scope: "household",
      subscope: "food",
      world: "secondary",
      originWorld: "sub",
      accountHint: "cmb_life",
      resolvedAccountId: "cmb_daily",
      status: "draft",
      source: "manual_food_calendar",
      sourceType: "food_calendar",
      sourceDate: dateKey,
      sourceId,
      externalRef: `food_calendar:${dateKey}`,
      note: String(record.text).trim()
    };
  }

  function syncFoodCalendarWallet(dateKey, record, previousRecord = null, options = {}) {
    const sourceId = `food_calendar_${dateKey}`;
    const externalRef = `food_calendar:${dateKey}`;
    const previousTransactionId = record?.walletTransactionId || previousRecord?.walletTransactionId || "";
    const draft = createFoodCalendarDraft(dateKey, record);
    if (!draft) {
      const removal = removeSourceTransaction(
        "food_calendar",
        sourceId,
        previousTransactionId,
        externalRef
      );
      record.walletDraft = null;
      record.walletTransactionId = removal.transactionId;
      record.walletSyncStatus = record.walletEnabled && Number(record.price) <= 0
        ? "waiting_for_price"
        : removal.status;
      return record.walletSyncStatus;
    }

    record.walletDraft = draft;
    const realizationLimit = options.realizationLimit || currentRealityDateKey();
    if (dateKey > realizationLimit) {
      const removal = removeSourceTransaction(
        "food_calendar",
        sourceId,
        previousTransactionId,
        externalRef
      );
      record.status = "planned";
      record.walletSyncStatus = "planned";
      record.walletTransactionId = removal.transactionId;
      record.walletDraft.status = "planned";
      record.walletDraft.walletTransactionId = removal.transactionId;
      return record.walletSyncStatus;
    }
    const sync = syncWalletDraft(
      draft,
      previousTransactionId,
      { realizationLimit }
    );
    record.walletSyncStatus = sync.status;
    record.walletTransactionId = sync.transactionId;
    if (sync.status === "synced") record.status = "realized";
    if (record.walletDraft) {
      record.walletDraft.status = sync.status === "synced" ? "synced" : "draft";
      record.walletDraft.walletTransactionId = sync.transactionId;
    }
    return sync.status;
  }

  function removeFoodCalendarWallet(dateKey, record) {
    return removeSourceTransaction(
      "food_calendar",
      `food_calendar_${dateKey}`,
      record?.walletTransactionId || "",
      `food_calendar:${dateKey}`
    );
  }

  function ensureDate(calendarData, dateKey) {
    ensureContainers(calendarData);
    const before = Object.prototype.hasOwnProperty.call(calendarData.householdShopping.days, dateKey);
    const existing = before ? calendarData.householdShopping.days[dateKey] : null;
    const previousTransactionId = existing?.walletTransactionId || "";
    const previousSyncStatus = existing?.walletSyncStatus || "";
    const result = generateForDate(calendarData, dateKey, { realize: false });
    return {
      changed: !before ||
        (result?.walletTransactionId || "") !== previousTransactionId ||
        (result?.walletSyncStatus || "") !== previousSyncStatus,
      result
    };
  }

  function realizeForDate(calendarData, dateKey, realizationLimit = currentRealityDateKey()) {
    ensureContainers(calendarData);
    if (dateKey > realizationLimit) {
      return { changed: false, status: "future_blocked", result: null };
    }
    const previous = calendarData.householdShopping.days[dateKey];
    const previousStatus = previous?.status || "";
    const previousTransactionId = previous?.walletTransactionId || "";
    const result = generateForDate(calendarData, dateKey, {
      realize: true,
      realizationLimit
    });
    if (!result?.generated) {
      return { changed: false, status: result?.reason || "no_purchase", result };
    }
    result.status = result.walletSyncStatus === "synced" ? "realized" : "planned";
    if (result.status === "realized" && !result.realizedAt) {
      result.realizedAt = new Date().toISOString();
    }
    if (result.walletDraft) {
      result.walletDraft.status = result.status === "realized" ? "posted" : "planned";
      result.walletDraft.walletTransactionId = result.walletTransactionId || null;
    }
    const rows = Array.isArray(calendarData.schedule?.[dateKey])
      ? calendarData.schedule[dateKey]
      : [];
    rows.filter((row) => row.householdShoppingId === result.id).forEach((row) => {
      row.status = result.status;
    });
    return {
      changed: previousStatus !== result.status || previousTransactionId !== (result.walletTransactionId || ""),
      status: result.status,
      result
    };
  }

  function realizeFoodCalendarForDate(calendarData, dateKey, realizationLimit = currentRealityDateKey()) {
    if (dateKey > realizationLimit) return { changed: false, status: "future_blocked" };
    const record = calendarData?.foodCalendar?.[dateKey];
    if (!record || typeof record !== "object") return { changed: false, status: "missing" };
    const previousStatus = record.walletSyncStatus || "";
    const previousTransactionId = record.walletTransactionId || "";
    const status = syncFoodCalendarWallet(dateKey, record, record, { realizationLimit });
    if (status === "synced") record.status = "realized";
    return {
      changed: previousStatus !== record.walletSyncStatus || previousTransactionId !== (record.walletTransactionId || ""),
      status
    };
  }

  window.LiminalHouseholdShopping = {
    config,
    ensureContainers,
    getScheduleEvents,
    getCalendarContext,
    getLocationContext,
    getLocationAtTime,
    getMissionWeights,
    getMerchantWeights,
    findAvailableTime,
    generateForDate,
    createFoodCalendarDraft,
    syncWalletDraft,
    syncFoodCalendarWallet,
    removeFoodCalendarWallet,
    getMealItemHints,
    ensureDate,
    realizeForDate,
    realizeFoodCalendarForDate
  };
})();
