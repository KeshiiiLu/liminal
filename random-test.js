const probabilityInput =
  document.getElementById(
    "giftProbability"
  );

const ruleSummary =
  document.getElementById(
    "ruleSummary"
  );

const testOnceButton =
  document.getElementById(
    "testOnceButton"
  );

const testThirtyButton =
  document.getElementById(
    "testThirtyButton"
  );

const resultTitle =
  document.getElementById(
    "resultTitle"
  );

const resultText =
  document.getElementById(
    "resultText"
  );


const STORAGE_KEY =
  "liminal_random_test_gift_probability";


/* =========================
   读取概率
   ========================= */

function getProbability() {

  let value =
    Number(
      probabilityInput.value
    );


  if (!Number.isFinite(value)) {
    value = 0;
  }


  value =
    Math.max(
      0,
      Math.min(
        100,
        value
      )
    );


  /*
    强制保留小数点后一位
  */

  value =
    Math.round(
      value * 10
    ) / 10;


  return value;

}


/* =========================
   更新页面
   ========================= */

function updateProbabilityDisplay() {

  const probability =
    getProbability();


  probabilityInput.value =
    probability.toFixed(1);


  ruleSummary.textContent =
    `每天一次 · ${probability.toFixed(1)}%`;


  localStorage.setItem(
    STORAGE_KEY,
    probability.toFixed(1)
  );

}


/* =========================
   随机判断
   ========================= */

function rollProbability(
  probability
) {

  /*
    Math.random()
    会产生 0 ～ 1 之间的随机数。

    例如：

    10% → 0.10
    25.5% → 0.255
  */

  return (
    Math.random() <
    probability / 100
  );

}


/* =========================
   测试一天
   ========================= */

testOnceButton.addEventListener(
  "click",
  function () {

    const probability =
      getProbability();


    const triggered =
      rollProbability(
        probability
      );


    if (triggered) {

      resultTitle.textContent =
        "触发了 🎁";

      resultText.textContent =
        `今天命中了 ${probability.toFixed(1)}% 的主动送礼概率。`;

    } else {

      resultTitle.textContent =
        "今天没有触发";

      resultText.textContent =
        `这次没有命中 ${probability.toFixed(1)}% 的发生率。`;

    }

  }
);


/* =========================
   模拟 30 天
   ========================= */

testThirtyButton.addEventListener(
  "click",
  function () {

    const probability =
      getProbability();


    let triggeredCount = 0;


    for (
      let day = 1;
      day <= 30;
      day++
    ) {

      if (
        rollProbability(
          probability
        )
      ) {

        triggeredCount++;

      }

    }


    resultTitle.textContent =
      `30 天触发 ${triggeredCount} 次`;


    resultText.textContent =
      `设定发生率为 ${probability.toFixed(1)}%。每一天都独立随机，因此每次模拟得到的结果可能不同。`;

  }
);


/* =========================
   修改概率
   ========================= */

probabilityInput.addEventListener(
  "change",
  updateProbabilityDisplay
);


/* =========================
   恢复上次设置
   ========================= */

const savedProbability =
  localStorage.getItem(
    STORAGE_KEY
  );


if (savedProbability !== null) {

  probabilityInput.value =
    savedProbability;

}


updateProbabilityDisplay();