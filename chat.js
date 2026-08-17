const moreButton = document.getElementById("moreButton");
const morePanel = document.getElementById("morePanel");
const morePages = document.getElementById("morePages");
const pageDots = document.querySelectorAll(".page-dot");

const chatInput = document.querySelector(".chat-input");

function openMorePanel() {
  chatInput.blur();

  morePanel.classList.add("open");
  document.body.classList.add("more-panel-open");
}

function closeMorePanel() {
  morePanel.classList.remove("open");
  document.body.classList.remove("more-panel-open");
}

moreButton.addEventListener("click", function (event) {
  event.stopPropagation();

  if (morePanel.classList.contains("open")) {
    closeMorePanel();

    setTimeout(function () {
      chatInput.focus();
    }, 50);
  } else {
    openMorePanel();
  }
});

chatInput.addEventListener("focus", function () {
  closeMorePanel();
});

document.addEventListener("pointerdown", function (event) {
  if (!morePanel.classList.contains("open")) {
    return;
  }

  const clickedInsidePanel = morePanel.contains(event.target);
  const clickedMoreButton = moreButton.contains(event.target);

  if (!clickedInsidePanel && !clickedMoreButton) {
    closeMorePanel();
  }
});

morePages.addEventListener("scroll", function () {
  const pageWidth = morePages.clientWidth;
  const currentPage = Math.round(morePages.scrollLeft / pageWidth);

  pageDots.forEach(function (dot, index) {
    dot.classList.toggle("active", index === currentPage);
  });
});

let isDragging = false;
let startX = 0;
let startScrollLeft = 0;

morePages.addEventListener("pointerdown", function (event) {
  isDragging = true;
  startX = event.clientX;
  startScrollLeft = morePages.scrollLeft;
  morePages.setPointerCapture(event.pointerId);
});

morePages.addEventListener("pointermove", function (event) {
  if (!isDragging) return;

  const distance = event.clientX - startX;
  morePages.scrollLeft = startScrollLeft - distance;
});

morePages.addEventListener("pointerup", function () {
  isDragging = false;
});

morePages.addEventListener("pointercancel", function () {
  isDragging = false;
});