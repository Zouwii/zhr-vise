const amountEl = document.querySelector("#amount");
const buttonEl = document.querySelector("#drawButton");
const packetEl = document.querySelector("#packet");
const hintEl = document.querySelector("#hint");

const randomAmount = () => (Math.random() * 200).toFixed(2);

let timerId = null;

buttonEl.addEventListener("click", () => {
  buttonEl.disabled = true;
  buttonEl.textContent = "抽奖中...";
  hintEl.textContent = "红包正在飞来";
  packetEl.classList.remove("pop");
  packetEl.classList.add("shaking");

  let elapsed = 0;
  const interval = 48;
  const duration = 1400;

  timerId = window.setInterval(() => {
    amountEl.textContent = randomAmount();
    elapsed += interval;

    if (elapsed >= duration) {
      window.clearInterval(timerId);
      timerId = null;

      const finalAmount = randomAmount();
      amountEl.textContent = finalAmount;
      packetEl.classList.remove("shaking");
      packetEl.classList.add("pop");
      buttonEl.disabled = false;
      buttonEl.textContent = "再抽一次";
      hintEl.textContent = `本次抽中节日红包 ${finalAmount} 元`;
    }
  }, interval);
});
