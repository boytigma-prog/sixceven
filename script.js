const symbols = [
  "🀇",
  "🀈",
  "🀉",
  "🀊",
  "🀋",
  "🀌",
  "🀍",
  "🀎",
  "🀏",
  "🀐",
  "🀑",
  "🀒",
  "🀓",
  "🀔",
  "🀕",
  "🀖",
  "🀀",
  "🀁",
  "🀂",
  "🀃",
  "🀄",
  "🀅",
  "🀆"
];

const reel1 = document.getElementById("reel1");
const reel2 = document.getElementById("reel2");
const reel3 = document.getElementById("reel3");

const spinBtn = document.getElementById("spinBtn");
const autoBtn = document.getElementById("autoBtn");

const scoreText = document.getElementById("score");
const comboText = document.getElementById("combo");
const spinsText = document.getElementById("spins");
const bestText = document.getElementById("best");
const result = document.getElementById("result");

let score = 1000;
let combo = 0;
let spins = 0;
let best = 0;

let spinning = false;
let autoSpin = false;
let autoTimer = null;

const winMessages = [
  "TRIPLE MAHJONG!",
  "PERFECT MATCH!",
  "JACKPOT!",
  "AMAZING!",
  "MEGA COMBO!"
];

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function updateStats() {
  scoreText.textContent = score;
  comboText.textContent = combo;
  spinsText.textContent = spins;
  bestText.textContent = best;
}

function spinReel(element, finalSymbol, delay) {

  return new Promise(resolve => {

    setTimeout(() => {

      element.classList.add("spinning");

      let counter = 0;

      const animation = setInterval(() => {

        element.textContent = randomSymbol();

        counter++;

        if (counter >= 12) {

          clearInterval(animation);

          element.textContent = finalSymbol;

          setTimeout(() => {
            element.classList.remove("spinning");
            resolve();
          }, 150);

        }

      }, 80);

    }, delay);

  });
}

async function spin() {

  if (spinning) return;

  spinning = true;

  spinBtn.disabled = true;

  result.classList.remove("win");
  result.textContent = "SPINNING...";

  score -= 10;

  if (score < 0) {
    score = 0;
  }

  spins++;

  updateStats();

  const a = randomSymbol();
  const b = randomSymbol();
  const c = randomSymbol();

  await Promise.all([
    spinReel(reel1, a, 0),
    spinReel(reel2, b, 250),
    spinReel(reel3, c, 500)
  ]);

  checkResult(a, b, c);

  spinning = false;

  spinBtn.disabled = false;

  if (autoSpin) {

    autoTimer = setTimeout(() => {
      spin();
    }, 1300);

  }
}

function checkResult(a, b, c) {

  if (a === b && b === c) {

    combo++;

    const reward = 250 + (combo * 100);

    score += reward;

    if (score > best) {
      best = score;
    }

    result.textContent =
      `${winMessages[Math.floor(Math.random() * winMessages.length)]} +${reward}`;

    result.classList.add("win");

  }

  else if (a === b || b === c || a === c) {

    combo++;

    const reward = 50 + (combo * 25);

    score += reward;

    result.textContent =
      `PAIR MATCH +${reward}`;

    result.classList.add("win");

  }

  else {

    combo = 0;

    result.textContent = "NO MATCH";

  }

  updateStats();
}

autoBtn.addEventListener("click", () => {

  autoSpin = !autoSpin;

  autoBtn.classList.toggle("active", autoSpin);

  if (autoSpin && !spinning) {
    spin();
  }

  if (!autoSpin) {
    clearTimeout(autoTimer);
  }
});

spinBtn.addEventListener("click", spin);

updateStats();
