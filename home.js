const desktopPages = document.querySelector(".desktop-pages");
const desktopPageList = document.querySelectorAll(".desktop-page");
const desktopDots = document.querySelectorAll(".desktop-dots .dot");


/* 根据当前页面更新下面的小圆点 */
function updateDesktopDots() {
  const pageWidth = desktopPages.clientWidth;

  if (pageWidth === 0) {
    return;
  }

  const currentPage = Math.round(
    desktopPages.scrollLeft / pageWidth
  );

  desktopDots.forEach(function (dot, index) {
    dot.classList.toggle("active", index === currentPage);
  });
}

desktopPages.addEventListener("scroll", updateDesktopDots);


/* 点击下面的小圆点，也可以跳到对应页面 */
desktopDots.forEach(function (dot, index) {
  dot.addEventListener("click", function () {
    desktopPages.scrollTo({
      left: desktopPages.clientWidth * index,
      behavior: "smooth"
    });
  });
});


/* 电脑鼠标左键拖动
   手机和平板仍然使用原生手指滑动 */
let isDesktopDragging = false;
let dragStartX = 0;
let dragStartScrollLeft = 0;

desktopPages.addEventListener("pointerdown", function (event) {
  if (event.pointerType !== "mouse") {
    return;
  }

  isDesktopDragging = true;
  dragStartX = event.clientX;
  dragStartScrollLeft = desktopPages.scrollLeft;

  desktopPages.setPointerCapture(event.pointerId);
});

desktopPages.addEventListener("pointermove", function (event) {
  if (!isDesktopDragging) {
    return;
  }

  const distance = event.clientX - dragStartX;

  desktopPages.scrollLeft =
    dragStartScrollLeft - distance;
});

desktopPages.addEventListener("pointerup", function () {
  isDesktopDragging = false;
});

desktopPages.addEventListener("pointercancel", function () {
  isDesktopDragging = false;
});


updateDesktopDots();