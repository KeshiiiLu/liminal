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

updateDesktopDots();