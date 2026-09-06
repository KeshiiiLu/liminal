const CHECKOUT_DRAFT_KEY =
  "liminal_checkout_draft_v1";

const ORDERS_KEY =
  "liminal_mall_orders_v1";

  const CHAT_STORAGE_KEY =
  "liminal_chat_luzhen";

const ADDRESSES_KEY =
  "liminal_mall_addresses_v1";

const SELECTED_ADDRESS_KEY =
  "liminal_checkout_address_id_v1";

let checkoutDraft =
  loadCheckoutDraft();


let selectedPaymentAccount =
  "cmb_daily";

let selectedLedgerOwner =
  "keshi";

let selectedDelivery =
  "standard";

let deliveryFee =
  0;

  let selectedAddress =
  loadSelectedAddress();

let isSubmitting =
  false;


/* =========================
   默认草稿
   ========================= */

function createDefaultDraft() {

  return {

    productId:
      "home-blanket-001",

    productName:
      "柔软家居毯",

    unitPrice:
      269,

    walletCategory:
      "购物",

    productCategory:
      "家居",

    size:
      "130 × 170 cm",

    style:
      "雾灰",

    quantity:
      1,

    purchaseMode:
      "self",

    recipient:
      "Lennon",

    giftMessage:
      "",

    sendGiftToChat:
      true

  };

}


/* =========================
   读取结算草稿
   ========================= */

function loadCheckoutDraft() {

  const saved =
    sessionStorage.getItem(
      CHECKOUT_DRAFT_KEY
    );


  if (!saved) {

    return createDefaultDraft();

  }


  try {

    return {

      ...createDefaultDraft(),

      ...JSON.parse(saved)

    };

  } catch {

    return createDefaultDraft();

  }

}


/* =========================
   页面元素
   ========================= */

   const addressCard =
  document.getElementById(
    "addressCard"
  );

const manageAddressButton =
  document.getElementById(
    "manageAddress"
  );

const addressNameElement =
  document.getElementById(
    "addressName"
  );

const addressPhoneElement =
  document.getElementById(
    "addressPhone"
  );

const addressTextElement =
  document.getElementById(
    "addressText"
  );

const productNameElement =
  document.getElementById(
    "checkoutProductName"
  );

const productOptionsElement =
  document.getElementById(
    "checkoutProductOptions"
  );

const unitPriceElement =
  document.getElementById(
    "checkoutUnitPrice"
  );

const quantityElement =
  document.getElementById(
    "checkoutQuantity"
  );


const giftCard =
  document.getElementById(
    "giftCard"
  );

const recipientElement =
  document.getElementById(
    "checkoutRecipient"
  );

const giftMessageElement =
  document.getElementById(
    "checkoutGiftMessage"
  );

const sendChatElement =
  document.getElementById(
    "checkoutSendChat"
  );


const subtotalPriceElement =
  document.getElementById(
    "subtotalPrice"
  );

const deliveryPriceElement =
  document.getElementById(
    "deliveryPrice"
  );

const totalPriceElement =
  document.getElementById(
    "totalPrice"
  );

const bottomTotalElement =
  document.getElementById(
    "bottomTotal"
  );

const submitOrderButton =
  document.getElementById(
    "submitOrder"
  );


/* =========================
   商品渲染
   ========================= */

function renderCheckoutDraft() {

  productNameElement.textContent =
    checkoutDraft.productName;


  productOptionsElement.textContent =
    `${checkoutDraft.size} · ${checkoutDraft.style}`;


  unitPriceElement.textContent =
    formatMoney(
      checkoutDraft.unitPrice
    );


  quantityElement.textContent =
    `× ${checkoutDraft.quantity}`;


  if (
    checkoutDraft.purchaseMode === "gift"
  ) {

    giftCard.hidden =
      false;


    recipientElement.textContent =
      getRecipientName(
        checkoutDraft.recipient
      );


    giftMessageElement.textContent =
      checkoutDraft.giftMessage
        ? checkoutDraft.giftMessage
        : "未填写";


    sendChatElement.textContent =
      checkoutDraft.sendGiftToChat
        ? "是"
        : "否";

  } else {

    giftCard.hidden =
      true;

  }


  renderPrice();

  renderAddress();

}


/* =========================
   配送方式
   ========================= */

document
  .querySelectorAll(
    ".delivery-option"
  )
  .forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        selectedDelivery =
          button.dataset.delivery;


        deliveryFee =
          selectedDelivery === "fast"
            ? 12
            : 0;


        document
          .querySelectorAll(
            ".delivery-option"
          )
          .forEach((item) => {

            item.classList.toggle(
              "active",
              item === button
            );

          });


        renderPrice();

      }
    );

  });


/* =========================
   付款账户
   ========================= */

document
  .querySelectorAll(
    ".payment-option"
  )
  .forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        selectedPaymentAccount =
          button.dataset.account;


        document
          .querySelectorAll(
            ".payment-option"
          )
          .forEach((item) => {

            item.classList.toggle(
              "active",
              item === button
            );

          });

      }
    );

  });


document
  .querySelectorAll(
    ".ledger-owner-option"
  )
  .forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        selectedLedgerOwner =
          button.dataset.ledgerOwner;


        document
          .querySelectorAll(
            ".ledger-owner-option"
          )
          .forEach((item) => {

            item.classList.toggle(
              "active",
              item === button
            );

          });

      }
    );

  });


/* =========================
   金额计算
   ========================= */

function getSubtotal() {

  return (
    Number(
      checkoutDraft.unitPrice
    ) *
    Number(
      checkoutDraft.quantity
    )
  );

}


function getTotal() {

  return (
    getSubtotal() +
    Number(deliveryFee)
  );

}


function renderPrice() {

  subtotalPriceElement.textContent =
    formatMoney(
      getSubtotal()
    );


  deliveryPriceElement.textContent =
    formatMoney(
      deliveryFee
    );


  totalPriceElement.textContent =
    formatMoney(
      getTotal()
    );


  bottomTotalElement.textContent =
    formatMoney(
      getTotal()
    );

}

/* =========================
   收货地址
   ========================= */

function loadSelectedAddress() {

  const saved =
    localStorage.getItem(
      ADDRESSES_KEY
    );


  if (!saved) {

    return null;

  }


  let addresses =
    [];


  try {

    const parsed =
      JSON.parse(saved);

    addresses =
      Array.isArray(parsed)
        ? parsed
        : [];

  } catch {

    return null;

  }


  const selectedId =
    sessionStorage.getItem(
      SELECTED_ADDRESS_KEY
    );


  if (selectedId) {

    const selected =
      addresses.find(
        (address) =>
          address.id === selectedId
      );


    if (selected) {

      return selected;

    }

  }


  const defaultAddress =
    addresses.find(
      (address) =>
        address.isDefault
    );


  return (
    defaultAddress ||
    addresses[0] ||
    null
  );

}


function renderAddress() {

  if (!selectedAddress) {

    addressNameElement.textContent =
      "请选择收货地址";

    addressPhoneElement.textContent =
      "未设置";

    addressTextElement.textContent =
      "点击这里新增或选择地址";

    return;

  }


  addressNameElement.textContent =
    selectedAddress.recipient;


  addressPhoneElement.textContent =
    selectedAddress.phone ||
    selectedAddress.label ||
    "已选择";


  addressTextElement.textContent =
    [
      selectedAddress.region,
      selectedAddress.detail
    ]
      .filter(Boolean)
      .join(" ");

}


addressCard.addEventListener(
  "click",
  () => {

    window.location.href =
      "addresses.html?mode=select";

  }
);


manageAddressButton.addEventListener(
  "click",
  () => {

    window.location.href =
      "addresses.html?mode=select";

  }
);

/* =========================
   提交订单
   ========================= */

submitOrderButton.addEventListener(
  "click",
  submitOrder
);


function submitOrder() {

  /*
    防止连续点击，
    导致同一个订单保存两次。
  */

  if (isSubmitting) {

    return;

  }
  if (!selectedAddress) {

    alert(
      "先选择一个收货地址吧。"
    );

    return;

  }

  isSubmitting =
    true;

  submitOrderButton.disabled =
    true;

  submitOrderButton.textContent =
    "正在提交…";


  const orderNote =
    document
      .getElementById(
        "orderNote"
      )
      .value
      .trim();


  const activeDelivery =
    document.querySelector(
      ".delivery-option.active"
    );


  const order = {

    id:
      createOrderId(),

    world:
      "liminal",

    status:
      "paid",

    paymentStatus:
      "paid",

    createdAt:
      new Date().toISOString(),


    product: {

      id:
        checkoutDraft.productId,

      name:
        checkoutDraft.productName,

      unitPrice:
        Number(
          checkoutDraft.unitPrice
        ),

      walletCategory:
        checkoutDraft.walletCategory ||
        "购物",

      productCategory:
        checkoutDraft.productCategory ||
        "其他",

      size:
        checkoutDraft.size,

      style:
        checkoutDraft.style,

      quantity:
        Number(
          checkoutDraft.quantity
        )

    },


    purchaseMode:
      checkoutDraft.purchaseMode,


    recipient:
      checkoutDraft.purchaseMode === "gift"
        ? checkoutDraft.recipient
        : null,


    giftMessage:
      checkoutDraft.purchaseMode === "gift"
        ? checkoutDraft.giftMessage
        : "",


    sendGiftToChat:
      checkoutDraft.purchaseMode === "gift"
        ? Boolean(
            checkoutDraft.sendGiftToChat
          )
        : false,


    /*
      地址系统还没有正式做，
      所以这里先保留占位。
    */

    address: {

  id:
    selectedAddress.id,

  recipient:
    selectedAddress.recipient,

  phone:
    selectedAddress.phone || "",

  region:
    selectedAddress.region || "",

  detail:
    selectedAddress.detail || "",

  label:
    selectedAddress.label || "",

  text:
    [
      selectedAddress.region,
      selectedAddress.detail
    ]
      .filter(Boolean)
      .join(" ")

},


    delivery: {

      type:
        selectedDelivery,

      name:
        activeDelivery
          ? activeDelivery.dataset.deliveryName
          : "普通配送",

      fee:
        Number(
          deliveryFee
        )

    },


    paymentAccount:
      selectedPaymentAccount,

    ledgerOwner:
      selectedLedgerOwner,


    subtotal:
      getSubtotal(),

    total:
      getTotal(),

    note:
      orderNote

  };


  /*
    先保存 Mall 订单，
    再写入 Wallet。
  */

  saveOrder(
  order
);

saveOrderToWallet(
  order
);

saveGiftToChat(
  order
);


  /*
    清除本次结算草稿。
  */

  sessionStorage.removeItem(
    CHECKOUT_DRAFT_KEY
  );


  alert(
    `订单已生成并记入副世界 Wallet。\n订单号：${order.id}`
  );


  window.location.href =
    "wallet.html";

}


/* =========================
   保存 Mall 订单
   ========================= */

function saveOrder(order) {

  let orders =
    [];


  const saved =
    localStorage.getItem(
      ORDERS_KEY
    );


  if (saved) {

    try {

      const parsed =
        JSON.parse(saved);


      if (
        Array.isArray(parsed)
      ) {

        orders =
          parsed;

      }

    } catch {

      orders =
        [];

    }

  }


  orders.unshift(
    order
  );


  localStorage.setItem(
    ORDERS_KEY,
    JSON.stringify(
      orders
    )
  );

}


/* =========================
   写入 Wallet
   ========================= */

function saveOrderToWallet(order) {

  if (!window.LiminalFinance) {

    console.error(
      "Wallet 数据层未加载，订单仍保留在 Mall，但没有写入 Wallet。"
    );

    return;

  }


  window.LiminalFinance
    .upsertTransaction({

      transactionId:
        `mall_${order.id}`,

      externalRef:
        `mall:${order.id}`,

      originWorld:
        "sub",

      type:
        "expense",

      amount:
        Number(order.total),

      currency:
        "CNY",

      title:
        `Liminal Mall · ${order.product.name}`,

      category:
        order.product.walletCategory ||
        "购物",

      subcategory:
        order.product.productCategory ||
        "其他",

      note:
        createWalletNote(order),

      fromAccountId:
        order.paymentAccount ||
        "cmb_daily",

      toAccountId:
        "",

      ledgerOwner:
        order.ledgerOwner ||
        (
          order.recipient === "Lennon"
            ? "luzhen"
            : "keshi"
        ),

      source:
        "mall",

      orderId:
        order.id,

      purchaseMode:
        order.purchaseMode,

      recipient:
        order.recipient,

      date:
        order.createdAt.slice(0, 10),

      timeOfDay:
        order.createdAt.slice(11, 16),

      occurredAt:
        order.createdAt,

      createdAt:
        order.createdAt

    });

}


/* =========================
   Wallet 流水备注
   ========================= */

function createWalletNote(order) {

  const parts =
    [];


  /*
    商品规格
  */

  parts.push(
    `${order.product.size} · ${order.product.style}`
  );


  /*
    数量
  */

  parts.push(
    `数量 ${order.product.quantity}`
  );


  /*
    二级分类
  */

  if (
    order.product.productCategory
  ) {

    parts.push(
      order.product.productCategory
    );

  }


  /*
    配送费
  */

  if (
    order.delivery &&
    Number(order.delivery.fee) > 0
  ) {

    parts.push(
      `含配送费 ${formatMoney(
        order.delivery.fee
      )}`
    );

  }


  /*
    礼物订单
  */

  if (
    order.purchaseMode === "gift"
  ) {

    parts.push(
      `礼物 · 送给${getRecipientName(
        order.recipient
      )}`
    );

  }


  return parts.join(
    " · "
  );

}

/* =========================
   礼物发送到聊天
   ========================= */

function saveGiftToChat(
  order
) {

  /*
    不是礼物，或者用户关闭了
    “发送到聊天”，就什么都不做。
  */

  if (
    order.purchaseMode !== "gift" ||
    !order.sendGiftToChat
  ) {

    return;

  }


  let history =
    [];


  const saved =
    localStorage.getItem(
      CHAT_STORAGE_KEY
    );


  if (saved) {

    try {

      const parsed =
        JSON.parse(saved);


      if (
        Array.isArray(parsed)
      ) {

        history =
          parsed;

      }

    } catch {

      history =
        [];

    }

  }


  /*
    防止同一个订单重复插入聊天。
  */

  const alreadyExists =
    history.some(
      function (message) {

        return (
          message.type === "gift" &&
          message.gift &&
          message.gift.orderId ===
            order.id
        );

      }
    );


  if (alreadyExists) {

    return;

  }


  /*
    如果收礼人是 Keshi，
    那么这张卡视为榛榛发来的消息。

    如果收礼人是榛榛，
    则视为 Keshi 发出去的消息。
  */

  const direction =
    order.recipient === "Keshi"
      ? "incoming"
      : "outgoing";


  const giftMessage = {

    type:
      "gift",

    direction:
      direction,

    time:
      order.createdAt,

    gift: {

      orderId:
        order.id,

      productName:
        order.product.name,

      productCategory:
        order.product.productCategory ||
        "礼物",

      size:
        order.product.size,

      style:
        order.product.style,

      quantity:
        order.product.quantity,

      total:
        order.total,

      recipient:
        order.recipient,

      message:
        order.giftMessage || ""

    }

  };


  history.push(
    giftMessage
  );


  localStorage.setItem(
    CHAT_STORAGE_KEY,
    JSON.stringify(
      history
    )
  );

}

/* =========================
   金额格式
   ========================= */

function formatMoney(amount) {

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
   人物名称
   ========================= */

function getRecipientName(
  recipient
) {

  if (
    recipient === "Keshi"
  ) {

    return "Keshi";

  }


  return "榛榛";

}


/* =========================
   创建订单号
   ========================= */

function createOrderId() {

  const date =
    new Date();


  const y =
    date.getFullYear();


  const m =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const d =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  const random =
    Math.floor(
      1000 +
      Math.random() * 9000
    );


  return (
    `LMN${y}${m}${d}${random}`
  );

}


/* =========================
   创建 Wallet 流水 ID
   ========================= */

function createTransactionId() {

  if (
    window.crypto &&
    typeof crypto.randomUUID ===
      "function"
  ) {

    return crypto.randomUUID();

  }


  return (
    "wallet-" +
    Date.now().toString() +
    "-" +
    Math.random()
      .toString(16)
      .slice(2)
  );

}


/* =========================
   初始化
   ========================= */

renderCheckoutDraft();
