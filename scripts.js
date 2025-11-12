const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const card = document.querySelector(".container");
const bottomMessage = document.querySelector(".mensaje");
const musica = document.getElementById("musica");
const mensajeOculto = document.getElementById("mensajeOculto");
const btnMensaje = document.getElementById("btnMensaje");

const heartImageFiles = ['heart1.png', 'heart2.png', 'heart3.png'];
const heartImages = [];
let imagesLoaded = 0;
const hearts = [];
const allCanopyHearts = [];

let estado = "CARGANDO";
const startX = canvas.width / 2;
const startY = canvas.height;
let globalOffsetX = 0;
let trunkHeight = 0;
const maxTrunkHeight = 200;
const branches = [];
let branchIndex = 0;
let heartCreationIndex = 0;
let cartaMostrada = false;

function preloadImages() {
  heartImageFiles.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      imagesLoaded++;
      if (imagesLoaded === heartImageFiles.length) {
        estado = "CRECIENDO_TRONCO";
        animate();
      }
    };
    heartImages.push(img);
  });
}

function drawTrunk() {
  const baseWidth = 35;
  const topWidth = 18;
  ctx.fillStyle = "#2e8b57";
  ctx.beginPath();
  ctx.moveTo(startX + globalOffsetX - baseWidth / 2, startY);
  ctx.lineTo(startX + globalOffsetX + baseWidth / 2, startY);
  ctx.lineTo(startX + globalOffsetX + topWidth / 2, startY - trunkHeight);
  ctx.lineTo(startX + globalOffsetX - topWidth / 2, startY - trunkHeight);
  ctx.closePath();
  ctx.fill();
}

function createBranches(x, y, len, angle, depth) {
  const endX = x + len * Math.cos(angle);
  const endY = y + len * Math.sin(angle);
  branches.push({ startX: x, startY: y, endX, endY, width: depth * 1.6, progress: 0 });
  if (depth > 1) {
    createBranches(endX, endY, len * 0.8, angle - 0.4, depth - 1);
    createBranches(endX, endY, len * 0.8, angle + 0.4, depth - 1);
  }
}

function drawImageHeart(img, x, y, size, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const w = img.width * size;
  const h = img.height * size;
  ctx.drawImage(img, x - w / 2 + globalOffsetX, y - h / 2, w, h);
  ctx.restore();
}

function createHeartCanopy() {
  const numHearts = 1200;
  const canopySize = 160;
  const canopyBaseY = startY - maxTrunkHeight - 130;
  const maxRadius = canopySize * 1.5;
  for (let i = 0; i < numHearts; i++) {
    const t = Math.random() * Math.PI;
    const mirror = Math.random() < 0.5 ? -1 : 1;
    const x = mirror * maxRadius * (16 * Math.sin(t) ** 3) / 20;
    const y = -maxRadius * (13 * Math.cos(t) - 5 * Math.cos(2 * t)
      - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 20;
    const fill = Math.random() * 0.9;
    const size = Math.random() * 0.25 + 0.1;
    const img = heartImages[Math.floor(Math.random() * heartImages.length)];
    allCanopyHearts.push({
      img, x: startX + x * fill, y: canopyBaseY + y * fill, size, opacity: 0
    });
  }
  allCanopyHearts.sort(() => Math.random() - 0.5);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (estado === "CRECIENDO_TRONCO") {
    trunkHeight += 3;
    if (trunkHeight >= maxTrunkHeight) {
      estado = "CRECIENDO_RAMAS";
      createBranches(startX, startY - maxTrunkHeight, 80, -Math.PI / 2, 3);
    }
  }

  drawTrunk();

  if (estado === "CRECIENDO_RAMAS") {
    if (branchIndex < branches.length) {
      let b = branches[branchIndex];
      b.progress += 0.5;
      if (b.progress >= 1) branchIndex++;
    } else {
      estado = "LLENANDO_CORAZONES";
      createHeartCanopy();
    }
  }

  ctx.strokeStyle = "#2e8b57";
  ctx.lineCap = "round";
  branches.forEach(b => {
    ctx.beginPath();
    ctx.moveTo(b.startX + globalOffsetX, b.startY);
    const x = b.startX + (b.endX - b.startX) * b.progress + globalOffsetX;
    const y = b.startY + (b.endY - b.startY) * b.progress;
    ctx.lineTo(x, y);
    ctx.lineWidth = b.width;
    ctx.stroke();
  });

  if (estado === "LLENANDO_CORAZONES") {
    for (let i = 0; i < 5; i++) {
      if (heartCreationIndex < allCanopyHearts.length) {
        hearts.push(allCanopyHearts[heartCreationIndex++]);
      }
    }
    hearts.forEach(h => {
      if (h.opacity < 1) h.opacity += 0.02;
      drawImageHeart(h.img, h.x, h.y, h.size, h.opacity);
    });
    if (heartCreationIndex >= allCanopyHearts.length) estado = "LISTO";
  }

  if (estado === "LISTO") {
    if (globalOffsetX > -canvas.width * 0.2) globalOffsetX -= 10;
    hearts.forEach(h => drawImageHeart(h.img, h.x, h.y, h.size, h.opacity));
    if (!cartaMostrada && globalOffsetX <= -canvas.width * 0.2) {
      cartaMostrada = true;
      setTimeout(() => {
        card.style.display = "flex";
        musica.play();
      }, 1000);
    }
  }
  requestAnimationFrame(animate);
}

window.addEventListener("load", preloadImages);

btnMensaje.addEventListener("click", () => {
  card.style.display = "none";
  mensajeOculto.style.display = "flex";
});
