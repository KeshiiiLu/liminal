const testCards = [
  "是",
  "不是",
  "不完全是",
  "我不知道",
  "嗯"
];

const transmissionButton = document.getElementById("transmissionButton");

transmissionButton.addEventListener("click", function () {
  const randomIndex = Math.floor(Math.random() * testCards.length);
  const result = testCards[randomIndex];

  alert(result);
});