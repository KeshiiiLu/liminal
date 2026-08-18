const desktopPages =
  document.querySelector(".desktop-pages");

const desktopDots =
  document.querySelectorAll(".desktop-dots .dot");


/* =========================
   Home 无限循环桌面
   ========================= */

const realDesktopPages =
  Array.from(desktopPages.children)
    .filter(function (page) {
      return page.classList.contains("desktop-page");
    });


const realPageCount =
  realDesktopPages.length;


/*
  复制：
  最后一页 → 放到最前面
  第一页 → 放到最后面

  实际结构会变成：

  [第三页复制]
  [第一页]
  [第二页]
  [第三页]
  [第一页复制]
*/

const firstPageClone =
  realDesktopPages[0].cloneNode(true);

const lastPageClone =
  realDesktopPages[
    realPageCount - 1
  ].cloneNode(true);


/*
  克隆页面不能保留 id，
  否则第一屏里的 Widget 会出现重复 id。
*/

function removeIds(element) {

  element.removeAttribute("id");

  element
    .querySelectorAll("[id]")
    .forEach(function (child) {
      child.removeAttribute("id");
    });

}


removeIds(firstPageClone);
removeIds(lastPageClone);


firstPageClone.classList.add(
  "desktop-page-clone"
);

lastPageClone.classList.add(
  "desktop-page-clone"
);


desktopPages.prepend(
  lastPageClone
);

desktopPages.append(
  firstPageClone
);


/* =========================
   工具函数
   ========================= */

function getPageWidth() {
  return desktopPages.clientWidth;
}


function jumpToRawPage(rawIndex) {

  const pageWidth =
    getPageWidth();

  if (!pageWidth) {
    return;
  }


  const oldBehavior =
    desktopPages.style.scrollBehavior;

  desktopPages.style.scrollBehavior =
    "auto";


  desktopPages.scrollLeft =
    pageWidth * rawIndex;


  requestAnimationFrame(
    function () {

      desktopPages.style.scrollBehavior =
        oldBehavior;

    }
  );

}


/*
  rawIndex：

  0 = 第三页复制
  1 = 第一页
  2 = 第二页
  3 = 第三页
  4 = 第一页复制
*/

function getRawPageIndex() {

  const pageWidth =
    getPageWidth();

  if (!pageWidth) {
    return 1;
  }


  return Math.round(
    desktopPages.scrollLeft /
    pageWidth
  );

}


/*
  转换成真正页码：

  第一页 = 0
  第二页 = 1
  第三页 = 2
*/

function getRealPageIndex() {

  const rawIndex =
    getRawPageIndex();


  if (rawIndex === 0) {
    return realPageCount - 1;
  }


  if (
    rawIndex ===
    realPageCount + 1
  ) {
    return 0;
  }


  return rawIndex - 1;

}


/* =========================
   更新桌面圆点
   ========================= */

function updateDesktopDots() {

  const currentPage =
    getRealPageIndex();


  desktopDots.forEach(
    function (dot, index) {

      dot.classList.toggle(
        "active",
        index === currentPage
      );

    }
  );

}


/* =========================
   循环修正
   ========================= */

let desktopScrollTimer = null;


desktopPages.addEventListener(
  "scroll",
  function () {

    updateDesktopDots();


    clearTimeout(
      desktopScrollTimer
    );


    desktopScrollTimer =
      setTimeout(
        function () {

          const rawIndex =
            getRawPageIndex();


          /*
            滑到了最前面的
            “第三页复制”

            偷偷瞬移到真正第三页
          */

          if (rawIndex === 0) {

            jumpToRawPage(
              realPageCount
            );

            return;

          }


          /*
            滑到了最后面的
            “第一页复制”

            偷偷瞬移到真正第一页
          */

          if (
            rawIndex ===
            realPageCount + 1
          ) {

            jumpToRawPage(1);

          }

        },
        100
      );

  }
);


/* =========================
   点击桌面圆点
   ========================= */

desktopDots.forEach(
  function (dot, index) {

    dot.addEventListener(
      "click",
      function () {

        desktopPages.scrollTo({

          left:
            getPageWidth() *
            (index + 1),

          behavior: "smooth"

        });

      }
    );

  }
);


/* =========================
   从 App 返回指定桌面页
   ========================= */

function restoreDesktopPage() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const requestedPage =
    Number(
      params.get("page")
    );


  /*
    有指定页：
    Wallet 返回 page=2
    就直接落到第二页。

    没有指定：
    默认第一页。
  */

  let page = 1;


  if (
    Number.isInteger(
      requestedPage
    ) &&
    requestedPage >= 1 &&
    requestedPage <=
      realPageCount
  ) {

    page =
      requestedPage;

  }


  requestAnimationFrame(
    function () {

      requestAnimationFrame(
        function () {

          /*
            因为最前面多了一个复制页，
            所以真实第一页位于 rawIndex 1。
          */

          jumpToRawPage(page);

          updateDesktopDots();

        }
      );

    }
  );

}


restoreDesktopPage();


/* =========================
   窗口尺寸变化
   ========================= */

window.addEventListener(
  "resize",
  function () {

    const currentPage =
      getRealPageIndex();


    requestAnimationFrame(
      function () {

        jumpToRawPage(
          currentPage + 1
        );

      }
    );

  }
);

/* =========================
   Home Widget Carousel
   日历 / 经期 / 睡眠 / 身体 / 亲密
   ========================= */

const homeWidgetTrack =
  document.getElementById(
    "homeWidgetTrack"
  );

const homeWidgetDots =
  document.querySelectorAll(
    "#homeWidgetDots button"
  );


if (
  homeWidgetTrack &&
  homeWidgetDots.length > 0
) {

  /* -------------------------
     根据当前位置更新小圆点
     ------------------------- */

  function updateHomeWidgetDots() {

    const widgetWidth =
      homeWidgetTrack.clientWidth;


    if (!widgetWidth) {
      return;
    }


    let currentWidget =
      Math.round(
        homeWidgetTrack.scrollLeft /
        widgetWidth
      );


    /*
      防止极端情况下超过范围
    */

    currentWidget =
      Math.max(
        0,
        Math.min(
          currentWidget,
          homeWidgetDots.length - 1
        )
      );


    homeWidgetDots.forEach(
      function (dot, index) {

        dot.classList.toggle(
          "active",
          index === currentWidget
        );

      }
    );

  }


  /* -------------------------
     手动左右滑 Widget
     圆点跟着变化
     ------------------------- */

  homeWidgetTrack.addEventListener(
    "scroll",
    updateHomeWidgetDots
  );


  /* -------------------------
     点击小圆点
     跳到对应 Widget
     ------------------------- */

  homeWidgetDots.forEach(
    function (dot, index) {

      dot.addEventListener(
        "click",
        function () {

          homeWidgetTrack.scrollTo({

            left:
              homeWidgetTrack.clientWidth *
              index,

            behavior: "smooth"

          });

        }
      );

    }
  );


  updateHomeWidgetDots();

}