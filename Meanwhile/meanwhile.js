(() => {
  "use strict";


  // ========================================
  // DOM
  // ========================================

  const gameScreen = document.querySelector(".game-screen");

  const focusTimeEl = document.getElementById("focusTime");
  const totalTimeEl = document.getElementById("totalTime");
  const cashValueEl = document.getElementById("cashValue");

  const worldStatusEl = document.getElementById("worldStatus");

  const startButton = document.getElementById("startButton");
  const pauseButton = document.getElementById("pauseButton");
  const finishButton = document.getElementById("finishButton");

  const keshiStatusEl = document.getElementById("keshiStatus");
  const luzhenStatusEl = document.getElementById("luzhenStatus");
  const customerStatusEl = document.getElementById("customerStatus");

  const resultPanel = document.getElementById("resultPanel");
  const resultFocusEl = document.getElementById("resultFocus");
  const resultCustomersEl =
    document.getElementById("resultCustomers");
  const resultRevenueEl =
    document.getElementById("resultRevenue");
  const closeResultButton =
    document.getElementById("closeResultButton");


  // ========================================
  // 状态
  // ========================================

  const STATE = {
    IDLE: "idle",
    FOCUSED: "focused",
    PAUSED: "paused",
    FINISHED: "finished",
  };

  let state = STATE.IDLE;


  // ========================================
  // 本轮数据
  // ========================================

  let focusSeconds = 0;

  // v0.1先不做真正持久存档。
  // 页面刷新后会归零。
  let totalFocusSeconds = 0;

  let cash = 100;

  let sessionRevenue = 0;
  let servedCustomers = 0;


  // ========================================
  // 顾客系统
  // ========================================

  const CUSTOMER_PHASES = [
    {
      name: "进店",
      duration: 4,
    },
    {
      name: "正在看菜单",
      duration: 6,
    },
    {
      name: "等待出餐",
      duration: 8,
    },
    {
      name: "正在用餐",
      duration: 10,
    },
    {
      name: "付款",
      duration: 3,
    },
  ];

  let customerPhaseIndex = 0;
  let customerPhaseSeconds = 0;


  // ========================================
  // 主循环
  // ========================================

  let lastTimestamp = null;
  let accumulatedMilliseconds = 0;

  function gameLoop(timestamp) {
    if (lastTimestamp === null) {
      lastTimestamp = timestamp;
    }

    const delta = timestamp - lastTimestamp;

    lastTimestamp = timestamp;


    if (state === STATE.FOCUSED) {
      accumulatedMilliseconds += delta;

      while (accumulatedMilliseconds >= 1000) {
        accumulatedMilliseconds -= 1000;

        tickOneSecond();
      }
    }

    requestAnimationFrame(gameLoop);
  }


  // ========================================
  // 每秒推进
  // ========================================

  function tickOneSecond() {
    if (state !== STATE.FOCUSED) {
      return;
    }


    // 专注时间
    focusSeconds += 1;
    totalFocusSeconds += 1;


    // 顾客
    customerPhaseSeconds += 1;

    const currentPhase =
      CUSTOMER_PHASES[customerPhaseIndex];

    if (
      customerPhaseSeconds >=
      currentPhase.duration
    ) {
      customerPhaseSeconds = 0;
      customerPhaseIndex += 1;


      // 完成一整轮顾客流程
      if (
        customerPhaseIndex >=
        CUSTOMER_PHASES.length
      ) {
        completeCustomer();

        customerPhaseIndex = 0;
      }
    }


    updateUI();
  }


  // ========================================
  // 顾客完成消费
  // ========================================

  function completeCustomer() {
    const price = 28;

    servedCustomers += 1;

    cash += price;
    sessionRevenue += price;
  }


  // ========================================
  // 格式化时间
  // ========================================

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor(
      (seconds % 3600) / 60
    );

    const secs = seconds % 60;

    return [
      hours,
      minutes,
      secs,
    ]
      .map((value) =>
        String(value).padStart(2, "0")
      )
      .join(":");
  }


  // ========================================
  // UI
  // ========================================

  function updateUI() {
    focusTimeEl.textContent =
      formatTime(focusSeconds);

    totalTimeEl.textContent =
      formatTime(totalFocusSeconds);

    cashValueEl.textContent =
      `₤ ${cash}`;


    const currentPhase =
      CUSTOMER_PHASES[customerPhaseIndex];

    customerStatusEl.textContent =
      state === STATE.FOCUSED
        ? currentPhase.name
        : state === STATE.PAUSED
          ? "暂停中"
          : "等待营业";
  }


  function renderState() {
    gameScreen.classList.remove(
      "world-running",
      "world-paused"
    );


    if (state === STATE.IDLE) {
      startButton.disabled = false;

      pauseButton.disabled = true;
      pauseButton.textContent = "暂停";

      finishButton.disabled = true;

      keshiStatusEl.textContent =
        "Keshi · 等你开始";

      luzhenStatusEl.textContent =
        "陆榛 · 等待营业";

      worldStatusEl.textContent =
        "店铺还没有开始营业。";
    }


    if (state === STATE.FOCUSED) {
      gameScreen.classList.add(
        "world-running"
      );

      startButton.disabled = true;

      pauseButton.disabled = false;
      pauseButton.textContent = "暂停";

      finishButton.disabled = false;

      keshiStatusEl.textContent =
        "Keshi · 专注中";

      luzhenStatusEl.textContent =
        "陆榛 · 店内工作";

      worldStatusEl.textContent =
        "店铺营业中。你去做自己的事情。";
    }


    if (state === STATE.PAUSED) {
      gameScreen.classList.add(
        "world-paused"
      );

      startButton.disabled = true;

      pauseButton.disabled = false;
      pauseButton.textContent = "继续";

      finishButton.disabled = false;

      keshiStatusEl.textContent =
        "Keshi · 暂时离开";

      luzhenStatusEl.textContent =
        "陆榛 · 暂停";

      worldStatusEl.textContent =
        "整个世界已经暂停。";
    }


    if (state === STATE.FINISHED) {
      startButton.disabled = false;

      pauseButton.disabled = true;
      pauseButton.textContent = "暂停";

      finishButton.disabled = true;

      keshiStatusEl.textContent =
        "Keshi · 本轮结束";

      luzhenStatusEl.textContent =
        "陆榛 · 收尾";

      worldStatusEl.textContent =
        "本轮营业已经结束。";
    }


    updateUI();
  }


  // ========================================
  // 开始
  // ========================================

  function startFocus() {
    if (
      state !== STATE.IDLE &&
      state !== STATE.FINISHED
    ) {
      return;
    }


    // 每一轮重新统计
    focusSeconds = 0;
    sessionRevenue = 0;
    servedCustomers = 0;

    customerPhaseIndex = 0;
    customerPhaseSeconds = 0;

    accumulatedMilliseconds = 0;

    state = STATE.FOCUSED;

    renderState();
  }


  // ========================================
  // 暂停 / 继续
  // ========================================

  function togglePause() {
    if (state === STATE.FOCUSED) {
      state = STATE.PAUSED;

      renderState();

      return;
    }


    if (state === STATE.PAUSED) {
      state = STATE.FOCUSED;

      accumulatedMilliseconds = 0;

      renderState();
    }
  }


  // ========================================
  // 结束
  // ========================================

  function finishFocus() {
    if (
      state !== STATE.FOCUSED &&
      state !== STATE.PAUSED
    ) {
      return;
    }


    state = STATE.FINISHED;

    renderState();


    resultFocusEl.textContent =
      formatTime(focusSeconds);

    resultCustomersEl.textContent =
      String(servedCustomers);

    resultRevenueEl.textContent =
      `₤ ${sessionRevenue}`;

    resultPanel.classList.remove("hidden");
  }


  // ========================================
  // 关闭报告
  // ========================================

  function closeResult() {
    resultPanel.classList.add("hidden");
  }


  // ========================================
  // 事件
  // ========================================

  startButton.addEventListener(
    "click",
    startFocus
  );

  pauseButton.addEventListener(
    "click",
    togglePause
  );

  finishButton.addEventListener(
    "click",
    finishFocus
  );

  closeResultButton.addEventListener(
    "click",
    closeResult
  );


  // ========================================
  // 初始化
  // ========================================

  renderState();

  requestAnimationFrame(gameLoop);
})();