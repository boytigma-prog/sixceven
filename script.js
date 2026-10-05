const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let W, H;

function resize() {
  W = canvas.width = innerWidth * devicePixelRatio;
  H = canvas.height = innerHeight * devicePixelRatio;

  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";

  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  W = innerWidth;
  H = innerHeight;
}

resize();
addEventListener("resize", resize);

// =============================
// TARGET TOUCH / MOUSE
// =============================

let target = {
  x: innerWidth / 2,
  y: innerHeight / 2
};

let mouseDown = false;

function moveTarget(x, y) {
  target.x = x;
  target.y = y;
}

canvas.addEventListener("pointerdown", e => {
  mouseDown = true;
  moveTarget(e.clientX, e.clientY);
});

canvas.addEventListener("pointermove", e => {
  if (mouseDown) {
    moveTarget(e.clientX, e.clientY);
  }
});

canvas.addEventListener("pointerup", () => {
  mouseDown = false;
});

canvas.addEventListener("pointercancel", () => {
  mouseDown = false;
});

// =============================
// KELABANG
// =============================

const segments = [];

const COUNT = 22;

for (let i = 0; i < COUNT; i++) {
  segments.push({
    x: innerWidth / 2 - i * 13,
    y: innerHeight / 2,
    angle: 0
  });
}

let head = {
  x: innerWidth / 2,
  y: innerHeight / 2,
  angle: 0
};

// =============================
// DRAW LEG
// =============================

function drawLeg(x, y, angle, side, index) {

  const wave =
    Math.sin(performance.now() * 0.008 + index * 0.8) * 0.25;

  const a = angle + side * (Math.PI / 2.7 + wave);

  const len1 = 17;
  const len2 = 13;

  const x1 = x + Math.cos(a) * len1;
  const y1 = y + Math.sin(a) * len1;

  const x2 =
    x1 +
    Math.cos(a + side * 0.45) * len2;

  const y2 =
    y1 +
    Math.sin(a + side * 0.45) * len2;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y2);

  ctx.strokeStyle = "#777";
  ctx.lineWidth = 2;
  ctx.stroke();

  // ujung kaki
  ctx.beginPath();
  ctx.arc(x2, y2, 2, 0, Math.PI * 2);
  ctx.fillStyle = "#aaa";
  ctx.fill();
}

// =============================
// DRAW BODY
// =============================

function drawBody(seg, index) {

  const radius =
    index === 0
      ? 17
      : Math.max(7, 13 - index * 0.2);

  // kaki
  if (index > 0) {
    drawLeg(
      seg.x,
      seg.y,
      seg.angle,
      -1,
      index
    );

    drawLeg(
      seg.x,
      seg.y,
      seg.angle,
      1,
      index
    );
  }

  // badan
  ctx.beginPath();
  ctx.ellipse(
    seg.x,
    seg.y,
    radius,
    radius * 0.7,
    seg.angle,
    0,
    Math.PI * 2
  );

  ctx.fillStyle = "#151515";
  ctx.fill();

  ctx.strokeStyle = "#777";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // garis tulang badan
  if (index > 0) {
    ctx.beginPath();
    ctx.moveTo(
      seg.x - Math.cos(seg.angle) * radius,
      seg.y - Math.sin(seg.angle) * radius
    );

    ctx.lineTo(
      seg.x + Math.cos(seg.angle) * radius,
      seg.y + Math.sin(seg.angle) * radius
    );

    ctx.strokeStyle = "#555";
    ctx.stroke();
  }
}

// =============================
// TENGKORAK
// =============================

function drawSkull(x, y, angle) {

  ctx.save();

  ctx.translate(x, y);
  ctx.rotate(angle);

  // kepala
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);

  ctx.fillStyle = "#d0d0c8";
  ctx.fill();

  ctx.strokeStyle = "#777";
  ctx.lineWidth = 2;
  ctx.stroke();

  // rahang
  ctx.beginPath();
  ctx.moveTo(-13, 12);
  ctx.lineTo(13, 12);
  ctx.lineTo(9, 22);
  ctx.lineTo(-9, 22);
  ctx.closePath();

  ctx.fillStyle = "#aaa";
  ctx.fill();

  ctx.stroke();

  // mata
  ctx.fillStyle = "#050505";

  ctx.beginPath();
  ctx.arc(-8, -5, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(8, -5, 5, 0, Math.PI * 2);
  ctx.fill();

  // hidung
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-3, 6);
  ctx.lineTo(3, 6);
  ctx.closePath();
  ctx.fill();

  // gigi
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.rect(i * 4 - 1.5, 13, 3, 6);
    ctx.fillStyle = "#ddd";
    ctx.fill();
  }

  // antena
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(-12, -14);
  ctx.quadraticCurveTo(-25, -28, -31, -18);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(12, -14);
  ctx.quadraticCurveTo(25, -28, 31, -18);
  ctx.stroke();

  ctx.restore();
}

// =============================
// UPDATE
// =============================

function update() {

  // kepala mengejar target
  const dx = target.x - head.x;
  const dy = target.y - head.y;

  const distance = Math.hypot(dx, dy);

  if (distance > 2) {

    const speed = Math.min(5, distance * 0.035);

    head.x += dx / distance * speed;
    head.y += dy / distance * speed;

    head.angle = Math.atan2(dy, dx);
  }

  // kepala menjadi segment pertama
  segments[0].x = head.x;
  segments[0].y = head.y;
  segments[0].angle = head.angle;

  // badan mengikuti bagian sebelumnya
  for (let i = 1; i < segments.length; i++) {

    const current = segments[i];
    const previous = segments[i - 1];

    const dx = previous.x - current.x;
    const dy = previous.y - current.y;

    const dist = Math.hypot(dx, dy);

    const spacing = 14;

    if (dist > spacing) {

      const pull = (dist - spacing) * 0.65;

      current.x += dx / dist * pull;
      current.y += dy / dist * pull;
    }

    current.angle = Math.atan2(dy, dx);
  }
}

// =============================
// DRAW
// =============================

function draw() {

  ctx.clearRect(0, 0, innerWidth, innerHeight);

  // bayangan
  ctx.globalAlpha = 0.25;

  for (let i = 0; i < segments.length; i++) {

    ctx.beginPath();
    ctx.ellipse(
      segments[i].x + 4,
      segments[i].y + 6,
      13,
      7,
      segments[i].angle,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = "#000";
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  // badan dari belakang ke depan
  for (let i = segments.length - 1; i >= 1; i--) {
    drawBody(segments[i], i);
  }

  drawSkull(
    head.x,
    head.y,
    head.angle
  );

  requestAnimationFrame(loop);
}

function loop() {
  update();
  draw();
}

loop();
