const ADDRESSES_KEY =
  "liminal_mall_addresses_v1";

const SELECTED_ADDRESS_KEY =
  "liminal_checkout_address_id_v1";


const params =
  new URLSearchParams(
    window.location.search
  );

const selectMode =
  params.get("mode") === "select";


let addresses =
  loadAddresses();

let editingAddressId =
  null;


/* =========================
   元素
   ========================= */

const addressList =
  document.getElementById(
    "addressList"
  );

const addressCount =
  document.getElementById(
    "addressCount"
  );

const overlay =
  document.getElementById(
    "addressOverlay"
  );

const sheetTitle =
  document.getElementById(
    "sheetTitle"
  );


const recipientInput =
  document.getElementById(
    "recipientInput"
  );

const phoneInput =
  document.getElementById(
    "phoneInput"
  );

const regionInput =
  document.getElementById(
    "regionInput"
  );

const detailInput =
  document.getElementById(
    "detailInput"
  );

const labelInput =
  document.getElementById(
    "labelInput"
  );

const defaultInput =
  document.getElementById(
    "defaultInput"
  );


/* =========================
   读取 / 保存
   ========================= */

function loadAddresses() {

  const saved =
    localStorage.getItem(
      ADDRESSES_KEY
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


function saveAddresses() {

  localStorage.setItem(
    ADDRESSES_KEY,
    JSON.stringify(
      addresses
    )
  );

}


/* =========================
   打开新增
   ========================= */

document
  .getElementById(
    "addAddressTop"
  )
  .addEventListener(
    "click",
    openNewAddress
  );


document
  .getElementById(
    "addAddressBottom"
  )
  .addEventListener(
    "click",
    openNewAddress
  );


function openNewAddress() {

  editingAddressId =
    null;


  sheetTitle.textContent =
    "新增地址";


  recipientInput.value =
    "";

  phoneInput.value =
    "";

  regionInput.value =
    "";

  detailInput.value =
    "";

  labelInput.value =
    "家";


  /*
    第一个地址默认自动成为默认地址。
  */

  defaultInput.checked =
    addresses.length === 0;


  overlay.hidden =
    false;


  setTimeout(
    () => {
      recipientInput.focus();
    },
    100
  );

}


/* =========================
   编辑
   ========================= */

function openEditAddress(
  address
) {

  editingAddressId =
    address.id;


  sheetTitle.textContent =
    "编辑地址";


  recipientInput.value =
    address.recipient || "";

  phoneInput.value =
    address.phone || "";

  regionInput.value =
    address.region || "";

  detailInput.value =
    address.detail || "";

  labelInput.value =
    address.label || "其他";

  defaultInput.checked =
    Boolean(address.isDefault);


  overlay.hidden =
    false;

}


/* =========================
   关闭
   ========================= */

document
  .getElementById(
    "closeAddressSheet"
  )
  .addEventListener(
    "click",
    closeSheet
  );


overlay.addEventListener(
  "click",
  (event) => {

    if (
      event.target === overlay
    ) {

      closeSheet();

    }

  }
);


function closeSheet() {

  overlay.hidden =
    true;

}


/* =========================
   保存地址
   ========================= */

document
  .getElementById(
    "saveAddress"
  )
  .addEventListener(
    "click",
    saveAddress
  );


function saveAddress() {

  const recipient =
    recipientInput.value.trim();

  const phone =
    phoneInput.value.trim();

  const region =
    regionInput.value.trim();

  const detail =
    detailInput.value.trim();

  const label =
    labelInput.value;

  const isDefault =
    defaultInput.checked;


  if (!recipient) {

    alert(
      "先填写收货人吧。"
    );

    return;

  }


  if (!detail) {

    alert(
      "先填写详细地址吧。"
    );

    return;

  }


  if (isDefault) {

    addresses.forEach(
      (address) => {

        address.isDefault =
          false;

      }
    );

  }


  if (editingAddressId) {

    const address =
      addresses.find(
        (item) =>
          item.id ===
          editingAddressId
      );


    if (!address) {

      return;

    }


    address.recipient =
      recipient;

    address.phone =
      phone;

    address.region =
      region;

    address.detail =
      detail;

    address.label =
      label;

    address.isDefault =
      isDefault;

  } else {

    addresses.unshift({

      id:
        createId(),

      recipient:
        recipient,

      phone:
        phone,

      region:
        region,

      detail:
        detail,

      label:
        label,

      isDefault:
        addresses.length === 0
          ? true
          : isDefault,

      createdAt:
        new Date().toISOString()

    });

  }


  /*
    保证永远至少有一个默认地址。
  */

  if (
    addresses.length > 0 &&
    !addresses.some(
      (address) =>
        address.isDefault
    )
  ) {

    addresses[0].isDefault =
      true;

  }


  saveAddresses();

  closeSheet();

  renderAddresses();

}


/* =========================
   删除
   ========================= */

function deleteAddress(
  addressId
) {

  const target =
    addresses.find(
      (item) =>
        item.id === addressId
    );


  if (!target) {

    return;

  }


  const confirmed =
    confirm(
      `确定删除「${target.recipient} · ${target.label}」这个地址吗？`
    );


  if (!confirmed) {

    return;

  }


  addresses =
    addresses.filter(
      (item) =>
        item.id !== addressId
    );


  if (
    sessionStorage.getItem(
      SELECTED_ADDRESS_KEY
    ) === addressId
  ) {

    sessionStorage.removeItem(
      SELECTED_ADDRESS_KEY
    );

  }


  if (
    addresses.length > 0 &&
    !addresses.some(
      (address) =>
        address.isDefault
    )
  ) {

    addresses[0].isDefault =
      true;

  }


  saveAddresses();

  renderAddresses();

}


/* =========================
   设为默认
   ========================= */

function setDefaultAddress(
  addressId
) {

  addresses.forEach(
    (address) => {

      address.isDefault =
        address.id === addressId;

    }
  );


  saveAddresses();

  renderAddresses();

}


/* =========================
   选择地址
   ========================= */

function selectAddress(
  addressId
) {

  sessionStorage.setItem(
    SELECTED_ADDRESS_KEY,
    addressId
  );


  window.location.href =
    "checkout.html";

}


/* =========================
   渲染
   ========================= */

function renderAddresses() {

  addressList.innerHTML =
    "";


  addressCount.textContent =
    addresses.length;


  if (
    addresses.length === 0
  ) {

    const empty =
      document.createElement(
        "div"
      );


    empty.className =
      "empty-addresses";


    empty.innerHTML = `

      <span>地</span>

      <strong>
        还没有收货地址
      </strong>

      <p>
        添加以后，结算时就可以直接选择。
      </p>

    `;


    addressList.appendChild(
      empty
    );


    return;

  }


  /*
    默认地址始终排在最前面。
  */

  const sorted =
    [...addresses]
      .sort(
        (a, b) =>
          Number(b.isDefault) -
          Number(a.isDefault)
      );


  sorted.forEach(
    (address) => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "address-card";


      card.innerHTML = `

        <div class="address-card-top">

          <div class="address-person">

            <strong>
              ${escapeHtml(
                address.recipient
              )}
            </strong>

            <span class="address-label">
              ${escapeHtml(
                address.label
              )}
            </span>

          </div>

          ${
            address.isDefault
              ? `
                <span class="default-tag">
                  默认
                </span>
              `
              : ""
          }

        </div>


        <p class="address-main">
          ${escapeHtml(
            [
              address.region,
              address.detail
            ]
              .filter(Boolean)
              .join(" ")
          )}
        </p>


        <span class="address-phone">
          ${
            address.phone
              ? escapeHtml(address.phone)
              : "未填写联系电话"
          }
        </span>


        <div class="address-actions">

          ${
            !address.isDefault
              ? `
                <button
                  class="address-action"
                  data-action="default"
                >
                  设为默认
                </button>
              `
              : ""
          }

          <button
            class="address-action"
            data-action="edit"
          >
            编辑
          </button>

          <button
            class="address-action"
            data-action="delete"
          >
            删除
          </button>

          ${
            selectMode
              ? `
                <button
                  class="address-action primary"
                  data-action="select"
                >
                  选择
                </button>
              `
              : ""
          }

        </div>

      `;


      const editButton =
        card.querySelector(
          '[data-action="edit"]'
        );


      editButton.addEventListener(
        "click",
        () => {

          openEditAddress(
            address
          );

        }
      );


      const deleteButton =
        card.querySelector(
          '[data-action="delete"]'
        );


      deleteButton.addEventListener(
        "click",
        () => {

          deleteAddress(
            address.id
          );

        }
      );


      const defaultButton =
        card.querySelector(
          '[data-action="default"]'
        );


      if (defaultButton) {

        defaultButton.addEventListener(
          "click",
          () => {

            setDefaultAddress(
              address.id
            );

          }
        );

      }


      const selectButton =
        card.querySelector(
          '[data-action="select"]'
        );


      if (selectButton) {

        selectButton.addEventListener(
          "click",
          () => {

            selectAddress(
              address.id
            );

          }
        );

      }


      addressList.appendChild(
        card
      );

    }
  );

}


/* =========================
   工具
   ========================= */

function createId() {

  if (
    window.crypto &&
    typeof crypto.randomUUID ===
      "function"
  ) {

    return crypto.randomUUID();

  }


  return (
    "address-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(16)
      .slice(2)
  );

}


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


/* 初始化 */

renderAddresses();