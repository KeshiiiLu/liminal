const ORDERS_KEY =
  "liminal_mall_orders_v1";


let currentStatus =
  "all";

let orders =
  loadOrders();


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
   状态筛选
   ========================= */

document
  .querySelectorAll(
    ".status-button"
  )
  .forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        currentStatus =
          button.dataset.status;


        document
          .querySelectorAll(
            ".status-button"
          )
          .forEach((item) => {

            item.classList.toggle(
              "active",
              item === button
            );

          });


        renderOrders();

      }
    );

  });


/* =========================
   渲染订单
   ========================= */

function renderOrders() {

  const orderList =
    document.getElementById(
      "orderList"
    );


  const orderCount =
    document.getElementById(
      "orderCount"
    );


  orderCount.textContent =
    orders.length;


  orderList.innerHTML =
    "";


  const filteredOrders =
    orders.filter((order) => {

      if (
        currentStatus === "all"
      ) {

        return true;

      }


      return (
        normalizeStatus(
          order.status
        ) ===
        currentStatus
      );

    });


  if (
    filteredOrders.length === 0
  ) {

    renderEmptyState(
      orderList
    );

    return;

  }


  filteredOrders.forEach(
    (order) => {

      const card =
        createOrderCard(
          order
        );


      orderList.appendChild(
        card
      );

    }
  );

}


/* =========================
   创建订单卡片
   ========================= */

function createOrderCard(order) {

  const card =
    document.createElement(
      "article"
    );

  card.className =
    "order-card";


  const normalizedStatus =
    normalizeStatus(
      order.status
    );


  const statusText =
    getStatusText(
      normalizedStatus
    );


  const product =
    order.product || {};


  const quantity =
    Number(
      product.quantity || 1
    );


  const total =
    Number(
      order.total || 0
    );


  const giftHtml =
    order.purchaseMode === "gift"
      ? `
        <div class="order-gift">

          <span>GIFT</span>

          <strong>
            送给 ${escapeHtml(
              getRecipientName(
                order.recipient
              )
            )}
          </strong>

        </div>
      `
      : "";


  card.innerHTML = `

    <div class="order-card-top">

      <div class="order-shop">

        <div class="order-shop-icon">
          LM
        </div>

        <div>
          <strong>
            Liminal Mall
          </strong>

          <span>
            ${escapeHtml(
              order.id || "暂无订单号"
            )}
          </span>
        </div>

      </div>


      <span
        class="order-status ${normalizedStatus}"
      >
        ${statusText}
      </span>

    </div>


    <div class="order-product">

      <div class="order-product-image">
        <span>
          ${escapeHtml(
            getProductCategory(
              product
            )
          )}
        </span>
      </div>


      <div class="order-product-info">

        <strong>
          ${escapeHtml(
            product.name ||
            "未命名商品"
          )}
        </strong>

        <span>
          ${escapeHtml(
            createOptionText(
              product
            )
          )}
        </span>


        <div class="order-product-bottom">

          <div>

            <small>
              实付
            </small>

            <strong>
              ${formatMoney(
                total
              )}
            </strong>

          </div>

          <span>
            × ${quantity}
          </span>

        </div>

      </div>

    </div>


    ${giftHtml}


    <div class="order-footer">

      <div class="order-meta">

        <span>
          ${formatDateTime(
            order.createdAt
          )}
        </span>

        <strong>
          ${escapeHtml(
            getPaymentName(
              order.paymentAccount
            )
          )} · ${escapeHtml(
            getDeliveryName(
              order
            )
          )}
        </strong>

      </div>


      <div class="order-actions">

        <button
          class="order-action-button"
          data-action="wallet"
        >
          付款记录
        </button>

        <button
          class="order-action-button primary"
          data-action="detail"
        >
          查看详情
        </button>

      </div>

    </div>

  `;


  /*
    暂时先给两个按钮反馈。
    下一步做订单详情时，
    “查看详情”就会真正跳转。
  */

  const detailButton =
    card.querySelector(
      '[data-action="detail"]'
    );


  detailButton.addEventListener(
  "click",
  () => {

    window.location.href =
      `order-detail.html?id=${encodeURIComponent(
        order.id
      )}`;

  }
);


  const walletButton =
    card.querySelector(
      '[data-action="wallet"]'
    );


  walletButton.addEventListener(
    "click",
    () => {

      window.location.href =
        "wallet.html";

    }
  );


  return card;

}


/* =========================
   空状态
   ========================= */

function renderEmptyState(
  container
) {

  const empty =
    document.createElement(
      "div"
    );


  empty.className =
    "empty-orders";


  if (
    orders.length === 0
  ) {

    empty.innerHTML = `

      <span>袋</span>

      <strong>
        还没有订单
      </strong>

      <p>
        去 Mall 逛逛，
        第一笔订单会出现在这里。
      </p>

    `;

  } else {

    empty.innerHTML = `

      <span>✓</span>

      <strong>
        这里暂时是空的
      </strong>

      <p>
        没有符合当前状态的订单。
      </p>

    `;

  }


  container.appendChild(
    empty
  );

}


/* =========================
   订单状态
   ========================= */

function normalizeStatus(
  status
) {

  /*
    我们当前新生成的订单
    status = paid

    它在用户界面上显示成
    “待发货”。
  */

  if (
    status === "shipping"
  ) {

    return "shipping";

  }


  if (
    status === "completed"
  ) {

    return "completed";

  }


  if (
    status === "refunded"
  ) {

    return "refunded";

  }


  return "paid";

}


function getStatusText(
  status
) {

  if (
    status === "shipping"
  ) {

    return "配送中";

  }


  if (
    status === "completed"
  ) {

    return "已完成";

  }


  if (
    status === "refunded"
  ) {

    return "已退款";

  }


  return "待发货";

}


/* =========================
   商品信息
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


  return parts.length > 0
    ? parts.join(" · ")
    : "默认规格";

}


function getProductCategory(
  product
) {

  if (
    product.productCategory
  ) {

    return product.productCategory
      .toUpperCase();

  }


  return "MALL";

}


/* =========================
   账户
   ========================= */

function getPaymentName(
  account
) {

  const financeNames = {
    cmb_daily:
      "陆榛 · 招商银行生活账户",
    boc_main:
      "陆榛 · 中国银行主资金账户",
    keshi_main:
      "Keshi · 主世界账户"
  };


  if (financeNames[account]) {

    return financeNames[account];

  }

  if (
    account === "Lennon"
  ) {

    return "榛榛付款";

  }


  if (
    account === "Family"
  ) {

    return "家庭账户付款";

  }


  return "Keshi付款";

}


/* =========================
   配送
   ========================= */

function getDeliveryName(
  order
) {

  if (
    order.delivery &&
    order.delivery.name
  ) {

    return order.delivery.name;

  }


  return "普通配送";

}


/* =========================
   收礼人
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


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "时间未知";

  }


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

      hour12:
        false
    }
  );

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
   HTML 安全处理
   ========================= */

function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================
   初始化
   ========================= */

renderOrders();
