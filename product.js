let purchaseMode = "self";
let quantity = 1;

const CHECKOUT_DRAFT_KEY =
  "liminal_checkout_draft_v1";

/* =========================
   自己买 / 送给Ta
   ========================= */

const purchaseModeButtons =
  document.querySelectorAll(
    ".purchase-mode-button"
  );

const giftSettings =
  document.getElementById(
    "giftSettings"
  );

const buyNowButton =
  document.getElementById(
    "buyNow"
  );


purchaseModeButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        purchaseMode =
          button.dataset.mode;


        purchaseModeButtons
          .forEach((item) => {

            item.classList.toggle(
              "active",
              item === button
            );

          });


        giftSettings.hidden =
          purchaseMode !== "gift";


        buyNowButton.textContent =
          purchaseMode === "gift"
            ? "送给 Ta"
            : "立即购买";

      }
    );

  }
);


/* =========================
   规格选择
   ========================= */

document
  .querySelectorAll(
    ".option-button"
  )
  .forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        const group =
          button.dataset.optionGroup;


        document
          .querySelectorAll(
            `.option-button[data-option-group="${group}"]`
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
   数量
   ========================= */

const quantityValue =
  document.getElementById(
    "quantityValue"
  );

const minusQuantity =
  document.getElementById(
    "minusQuantity"
  );

const plusQuantity =
  document.getElementById(
    "plusQuantity"
  );


minusQuantity.addEventListener(
  "click",
  () => {

    if (quantity > 1) {

      quantity -= 1;

      renderQuantity();

    }

  }
);


plusQuantity.addEventListener(
  "click",
  () => {

    if (quantity < 9) {

      quantity += 1;

      renderQuantity();

    }

  }
);


function renderQuantity() {

  quantityValue.textContent =
    quantity;

}


/* =========================
   暂时的按钮反馈
   ========================= */

document
  .getElementById("addToCart")
  .addEventListener(
    "click",
    () => {

      alert(
        `已选择 ${quantity} 件。\n购物袋功能下一步再接。`
      );

    }
  );


buyNowButton.addEventListener(
  "click",
  () => {

    const selectedSize =
      document.querySelector(
        '.option-button[data-option-group="size"].active'
      ).textContent.trim();


    const selectedStyle =
      document.querySelector(
        '.option-button[data-option-group="style"].active'
      ).textContent.trim();


    const recipient =
      document.getElementById(
        "giftRecipient"
      ).value;


    const giftMessage =
      document.getElementById(
        "giftMessage"
      ).value.trim();


    const sendGiftToChat =
      document.getElementById(
        "sendGiftToChat"
      ).checked;


    const checkoutDraft = {

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
        selectedSize,

      style:
        selectedStyle,

      quantity:
        quantity,

      purchaseMode:
        purchaseMode,

      recipient:
        recipient,

      giftMessage:
        giftMessage,

      sendGiftToChat:
        sendGiftToChat

    };


    sessionStorage.setItem(
      CHECKOUT_DRAFT_KEY,
      JSON.stringify(
        checkoutDraft
      )
    );


    window.location.href =
      "checkout.html";

  }
);