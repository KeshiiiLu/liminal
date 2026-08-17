const ORDERS_KEY =
  "liminal_mall_orders_v1";


let orders =
  loadOrders();


const params =
  new URLSearchParams(
    window.location.search
  );


const currentOrderId =
  params.get("id");


let currentOrder =
  orders.find(
    (order) =>
      order.id === currentOrderId
  );


/* =========================
   物流节点
   ========================= */

const logisticsStages = [

  {
    id:
      "paid",

    title:
      "订单已付款",

    description:
      "订单已经提交并完成付款。"
  },

  {
    id:
      "shipped",

    title:
      "商品已发货",

    description:
      "商品已经离开商家，等待承运。"
  },

  {
    id:
      "transit",

    title:
      "运输中",

    description:
      "包裹正在前往收货地址。"
  },

  {
    id:
      "outForDelivery",

    title:
      "派送中",

    description:
      "配送人员正在进行最后一段派送。"
  },

  {
    id:
      "delivered",

    title:
      "已签收",

    description:
      "商品已经送达并完成签收。"
  }

];


/* =========================
   读取订单
   ========================= */

function loadOrders() {

  const saved =
    localStorage.getItem(
      ORDERS_KEY
    );


  if (!saved) {

    return [];

  }


  try {

    const parsed =
      JSON.parse(saved);


    return Array.isArray(parsed)
      ? parsed
      : [];

  } catch {

    return [];

  }

}


/* =========================
   保存订单
   ========================= */

function saveOrders() {

  localStorage.setItem(
    ORDERS_KEY,
    JSON.stringify(
      orders
    )
  );

}


/* =========================
   页面初始化
   ========================= */

function initializePage() {

  if (!currentOrder) {

    document.getElementById(
      "detailContent"
    ).hidden = true;


    document.getElementById(
      "notFound"
    ).hidden = false;


    return;

  }


  /*
    旧订单没有 logisticsStage
    时，默认从已付款开始。
  */

  if (
    !currentOrder.logisticsStage
  ) {

    currentOrder.logisticsStage =
      getDefaultLogisticsStage(
        currentOrder.status
      );


    saveOrders();

  }


  renderOrder();

}


/* =========================
   整体渲染
   ========================= */

function renderOrder() {

  renderStatus();

  renderLogistics();

  renderAddress();

  renderProduct();

  renderGift();

  renderPayment();

  renderOrderInfo();

}


/* =========================
   顶部状态
   ========================= */

function renderStatus() {

  const stage =
    currentOrder.logisticsStage;


  const heroStatus =
    document.getElementById(
      "heroStatus"
    );


  const heroDescription =
    document.getElementById(
      "heroStatusDescription"
    );


  const heroSymbol =
    document.getElementById(
      "heroSymbol"
    );


  const logisticsTag =
    document.getElementById(
      "logisticsTag"
    );


  if (stage === "delivered") {

    heroStatus.textContent =
      "已完成";

    heroDescription.textContent =
      "商品已经签收，这笔订单完成啦。";

    heroSymbol.textContent =
      "✓";

    logisticsTag.textContent =
      "已签收";


  } else if (
    stage === "outForDelivery"
  ) {

    heroStatus.textContent =
      "派送中";

    heroDescription.textContent =
      "包裹已经进入最后一段配送。";

    heroSymbol.textContent =
      "→";

    logisticsTag.textContent =
      "派送中";


  } else if (
    stage === "transit"
  ) {

    heroStatus.textContent =
      "运输中";

    heroDescription.textContent =
      "包裹正在前往收货地址。";

    heroSymbol.textContent =
      "→";

    logisticsTag.textContent =
      "运输中";


  } else if (
    stage === "shipped"
  ) {

    heroStatus.textContent =
      "已发货";

    heroDescription.textContent =
      "商品已经发出，物流开始更新。";

    heroSymbol.textContent =
      "→";

    logisticsTag.textContent =
      "已发货";


  } else {

    heroStatus.textContent =
      "待发货";

    heroDescription.textContent =
      "商家正在准备你的商品。";

    heroSymbol.textContent =
      "·";

    logisticsTag.textContent =
      "待发货";

  }

}


/* =========================
   物流时间轴
   ========================= */

function renderLogistics() {

  const container =
    document.getElementById(
      "logisticsTimeline"
    );


  const currentIndex =
    logisticsStages.findIndex(
      (stage) =>
        stage.id ===
        currentOrder.logisticsStage
    );


  container.innerHTML =
    "";


  logisticsStages.forEach(
    (stage, index) => {

      const step =
        document.createElement(
          "div"
        );


      step.className =
        "logistics-step";


      if (
        index < currentIndex
      ) {

        step.classList.add(
          "completed"
        );

      } else if (
        index === currentIndex
      ) {

        step.classList.add(
          "current"
        );

      } else {

        step.classList.add(
          "pending"
        );

      }


      const marker =
        document.createElement(
          "div"
        );

      marker.className =
        "timeline-marker";


      const dot =
        document.createElement(
          "div"
        );

      dot.className =
        "timeline-dot";


      const line =
        document.createElement(
          "div"
        );

      line.className =
        "timeline-line";


      marker.appendChild(
        dot
      );

      marker.appendChild(
        line
      );


      const content =
        document.createElement(
          "div"
        );

      content.className =
        "timeline-content";


      const title =
        document.createElement(
          "strong"
        );

      title.textContent =
        stage.title;


      const description =
        document.createElement(
          "span"
        );


      if (
        index <= currentIndex
      ) {

        description.textContent =
          stage.description;

      } else {

        description.textContent =
          "等待更新";

      }


      content.appendChild(
        title
      );

      content.appendChild(
        description
      );


      step.appendChild(
        marker
      );

      step.appendChild(
        content
      );


      container.appendChild(
        step
      );

    }
  );


  const advanceButton =
    document.getElementById(
      "advanceLogistics"
    );


  if (
    currentOrder.logisticsStage ===
    "delivered"
  ) {

    advanceButton.disabled =
      true;

    advanceButton.textContent =
      "订单已完成";

  } else {

    advanceButton.disabled =
      false;

    advanceButton.textContent =
      "更新物流状态";

  }

}


/* =========================
   推进物流
   ========================= */

document
  .getElementById(
    "advanceLogistics"
  )
  .addEventListener(
    "click",
    advanceLogistics
  );


function advanceLogistics() {

  const currentIndex =
    logisticsStages.findIndex(
      (stage) =>
        stage.id ===
        currentOrder.logisticsStage
    );


  if (
    currentIndex < 0 ||
    currentIndex >=
      logisticsStages.length - 1
  ) {

    return;

  }


  const nextStage =
    logisticsStages[
      currentIndex + 1
    ];


  currentOrder.logisticsStage =
    nextStage.id;


  /*
    同时更新订单列表使用的
    粗粒度 status。
  */

  if (
    nextStage.id ===
    "delivered"
  ) {

    currentOrder.status =
      "completed";

  } else if (
    nextStage.id ===
      "shipped" ||
    nextStage.id ===
      "transit" ||
    nextStage.id ===
      "outForDelivery"
  ) {

    currentOrder.status =
      "shipping";

  } else {

    currentOrder.status =
      "paid";

  }


  /*
    记录物流更新时间。
  */

  if (
    !Array.isArray(
      currentOrder.logisticsHistory
    )
  ) {

    currentOrder.logisticsHistory =
      [];

  }


  currentOrder.logisticsHistory.push({

    stage:
      nextStage.id,

    time:
      new Date().toISOString()

  });


  saveOrders();

  renderOrder();

}


/* =========================
   地址
   ========================= */

function renderAddress() {

  const address =
    currentOrder.address || {};


  document.getElementById(
    "addressRecipient"
  ).textContent =
    address.recipient ||
    "未填写";


  const addressParts =
    [];


  if (address.phone) {

    addressParts.push(
      address.phone
    );

  }


  if (address.region) {

    addressParts.push(
      address.region
    );

  }


  if (address.detail) {

    addressParts.push(
      address.detail
    );

  }


  /*
    兼容之前已经生成的旧订单。
  */

  if (
    addressParts.length === 0 &&
    address.text
  ) {

    addressParts.push(
      address.text
    );

  }


  document.getElementById(
    "addressText"
  ).textContent =
    addressParts.length
      ? addressParts.join(" · ")
      : "未填写收货地址";

}


/* =========================
   商品
   ========================= */

function renderProduct() {

  const product =
    currentOrder.product || {};


  document.getElementById(
    "productName"
  ).textContent =
    product.name ||
    "未命名商品";


  document.getElementById(
    "productOptions"
  ).textContent =
    createOptionText(
      product
    );


  document.getElementById(
    "unitPrice"
  ).textContent =
    formatMoney(
      product.unitPrice || 0
    );


  document.getElementById(
    "quantity"
  ).textContent =
    `× ${product.quantity || 1}`;


  document.getElementById(
    "productCategory"
  ).textContent =
    product.productCategory ||
    "MALL";

}


/* =========================
   礼物
   ========================= */

function renderGift() {

  const giftSection =
    document.getElementById(
      "giftSection"
    );


  if (
    currentOrder.purchaseMode !==
    "gift"
  ) {

    giftSection.hidden =
      true;

    return;

  }


  giftSection.hidden =
    false;


  document.getElementById(
    "giftRecipient"
  ).textContent =
    getRecipientName(
      currentOrder.recipient
    );


  document.getElementById(
    "giftMessage"
  ).textContent =
    currentOrder.giftMessage
      ? currentOrder.giftMessage
      : "未填写";


  document.getElementById(
    "giftChat"
  ).textContent =
    currentOrder.sendGiftToChat
      ? "是"
      : "否";

}


/* =========================
   支付与配送
   ========================= */

function renderPayment() {

  document.getElementById(
    "paymentAccount"
  ).textContent =
    getPaymentName(
      currentOrder.paymentAccount
    );


  document.getElementById(
    "deliveryName"
  ).textContent =
    currentOrder.delivery?.name ||
    "普通配送";


  document.getElementById(
    "subtotal"
  ).textContent =
    formatMoney(
      currentOrder.subtotal || 0
    );


  document.getElementById(
    "deliveryFee"
  ).textContent =
    formatMoney(
      currentOrder.delivery?.fee || 0
    );


  document.getElementById(
    "total"
  ).textContent =
    formatMoney(
      currentOrder.total || 0
    );

}


/* =========================
   订单信息
   ========================= */

function renderOrderInfo() {

  document.getElementById(
    "orderId"
  ).textContent =
    currentOrder.id ||
    "—";


  document.getElementById(
    "createdAt"
  ).textContent =
    formatDateTime(
      currentOrder.createdAt
    );


  document.getElementById(
    "purchaseMode"
  ).textContent =
    currentOrder.purchaseMode ===
    "gift"
      ? "礼物订单"
      : "自用订单";


  document.getElementById(
    "orderNote"
  ).textContent =
    currentOrder.note
      ? currentOrder.note
      : "无";

}


/* =========================
   默认物流状态
   ========================= */

function getDefaultLogisticsStage(
  status
) {

  if (
    status === "completed"
  ) {

    return "delivered";

  }


  if (
    status === "shipping"
  ) {

    return "shipped";

  }


  return "paid";

}


/* =========================
   文本工具
   ========================= */

function createOptionText(
  product
) {

  const parts =
    [];


  if (product.size) {

    parts.push(
      product.size
    );

  }


  if (product.style) {

    parts.push(
      product.style
    );

  }


  return parts.length
    ? parts.join(" · ")
    : "默认规格";

}


function getRecipientName(
  recipient
) {

  return recipient === "Keshi"
    ? "Keshi"
    : "榛榛";

}


function getPaymentName(
  account
) {

  if (
    account === "Lennon"
  ) {

    return "榛榛个人账户";

  }


  if (
    account === "Family"
  ) {

    return "家庭账户";

  }


  return "Keshi个人账户";

}


/* =========================
   金额
   ========================= */

function formatMoney(
  amount
) {

  return new Intl.NumberFormat(
    "zh-CN",
    {
      style:
        "currency",

      currency:
        "CNY",

      minimumFractionDigits:
        2
    }
  ).format(
    Number(amount)
  );

}


/* =========================
   时间
   ========================= */

function formatDateTime(
  isoTime
) {

  if (!isoTime) {

    return "时间未知";

  }


  const date =
    new Date(
      isoTime
    );


  return date.toLocaleString(
    "zh-CN",
    {
      year:
        "numeric",

      month:
        "numeric",

      day:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",

      second:
        "2-digit",

      hour12:
        false
    }
  );

}


/* =========================
   启动
   ========================= */

initializePage();