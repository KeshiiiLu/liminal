/* Liminal Chat · Wallet-linked red packets and transfers */

(function () {
  "use strict";

  const finance = window.LiminalFinance;
  const redPacketButton = document.getElementById("chatRedPacketButton");
  const transferButton = document.getElementById("chatTransferButton");
  const backdrop = document.getElementById("chatFinanceBackdrop");

  if (!finance || !redPacketButton || !transferButton || !backdrop) return;

  let action = "transfer";
  let direction = "outgoing";

  const title = document.getElementById("chatFinanceTitle");
  const amountInput = document.getElementById("chatFinanceAmount");
  const noteInput = document.getElementById("chatFinanceNote");
  const directionOptions = document.getElementById("chatFinanceDirectionOptions");

  function formatAmount(value) {
    return new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", minimumFractionDigits: 2 }).format(value);
  }

  function close() {
    backdrop.hidden = true;
  }

  function open(nextAction) {
    if (currentPerson.id !== "luzhen") {
      if (typeof showTransientNotice === "function") showTransientNotice("当前财务账户只接入陆榛");
      return;
    }
    action = nextAction;
    direction = "outgoing";
    title.textContent = action === "red_packet" ? "红包" : "转账";
    amountInput.value = "";
    noteInput.value = "";
    directionOptions.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button.dataset.financeDirection === direction));
    backdrop.hidden = false;
    closeMorePanel();
    setTimeout(() => amountInput.focus(), 80);
  }

  directionOptions.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
    direction = button.dataset.financeDirection;
    directionOptions.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
  }));

  document.getElementById("chatFinanceClose").addEventListener("click", close);
  backdrop.addEventListener("click", (event) => { if (event.target === backdrop) close(); });
  redPacketButton.addEventListener("click", () => open("red_packet"));
  transferButton.addEventListener("click", () => open("transfer"));

  document.getElementById("chatFinanceSubmit").addEventListener("click", () => {
    const amount = Number(amountInput.value);
    if (!Number.isFinite(amount) || amount <= 0) {
      window.alert("请输入有效金额。");
      return;
    }
    const now = new Date();
    const id = finance.createId("chat");
    const outgoing = direction === "outgoing";
    const label = action === "red_packet" ? "红包" : "转账";
    const note = noteInput.value.trim();
    const transaction = finance.upsertTransaction({
      transactionId: id,
      externalRef: `chat:${id}`,
      originWorld: "sub",
      type: "transfer",
      amount,
      currency: "CNY",
      title: `${outgoing ? "Keshi → 陆榛" : "陆榛 → Keshi"} · ${label}`,
      category: label,
      note,
      fromAccountId: outgoing ? "keshi_main" : "cmb_daily",
      toAccountId: outgoing ? "cmb_daily" : "keshi_main",
      ledgerOwner: outgoing ? "luzhen" : "keshi",
      source: "chat",
      chatPersonId: currentPerson.id,
      payer: outgoing ? "keshi" : "luzhen",
      payee: outgoing ? "luzhen" : "keshi",
      date: [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-"),
      timeOfDay: [String(now.getHours()).padStart(2, "0"), String(now.getMinutes()).padStart(2, "0")].join(":"),
      occurredAt: now.toISOString(),
      createdAt: now.toISOString()
    });

    chatHistory.push({
      id: finance.createId("message"),
      type: "text",
      direction: outgoing ? "outgoing" : "incoming",
      text: `${label} ${formatAmount(amount)}${note ? ` · ${note}` : ""}`,
      time: now.toISOString(),
      finance: { transactionId: transaction.transactionId, action, amount }
    });
    saveChatHistory();
    loadChatHistory();
    close();
    requestAnimationFrame(scrollToBottom);
  });
})();
