const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");

const titleImage = document.getElementById("titleImage");
const startBtn = document.getElementById("startBtn");
const retryBtn = document.getElementById("retryBtn");
const toTitleBtn = document.getElementById("toTitleBtn");
const homeBtn = document.getElementById("homeBtn");
const shareBtn = document.getElementById("shareBtn");

const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");

const rankText = document.getElementById("rankText");
const resultImage = document.getElementById("resultImage");
const scoreResult = document.getElementById("scoreResult");
const commentText = document.getElementById("commentText");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const bgImg = new Image();
bgImg.src = "back.png";

const ufoImg = new Image();
ufoImg.src = "ufo.png";

const hatImg = new Image();
hatImg.src = "hat.png";

const melonImg = new Image();
melonImg.src = "melon.png";

const bgm = new Audio("bgm.mp3");
bgm.loop = true;
bgm.volume = 0.45;

const seGood = new Audio("se_good.mp3");
seGood.volume = 0.25;

const seBad = new Audio("se_bad.mp3");
seBad.volume = 0.25;

const melonSe = new Audio("melon.mp3");
melonSe.volume = 0.35;

let W;
let H;

let score = 0;
let time = 30;
let running = false;
let objects = [];

let timerId = null;
let spawnId = null;
let animationId = null;

function resize(){
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

resize();
window.addEventListener("resize", resize);

function showScreen(screen){
  titleScreen.classList.remove("active");
  gameScreen.classList.remove("active");
  resultScreen.classList.remove("active");
  screen.classList.add("active");
}

function stopGame(){
  running = false;
  clearInterval(timerId);
  clearInterval(spawnId);
  cancelAnimationFrame(animationId);
  bgm.pause();
}

function startGame(){
  resize();

  score = 0;
  time = 30;
  objects = [];
  running = true;

  scoreEl.textContent = score;
  timeEl.textContent = time;

  showScreen(gameScreen);

  bgm.currentTime = 0;
  bgm.play().catch(()=>{});

  clearInterval(timerId);
  clearInterval(spawnId);
  cancelAnimationFrame(animationId);

  spawnObject();
  spawnObject();

  timerId = setInterval(()=>{
    time--;
    timeEl.textContent = time;

    if(time <= 0){
      endGame();
    }
  },1000);

  spawnId = setInterval(spawnObject, 500);

  gameLoop();
}

function spawnObject(){
  if(!running) return;

  const rand = Math.random();
  let type = "ufo";

  if(rand < 0.20){
    type = "melon";
  }else if(rand < 0.45){
    type = "hat";
  }

  const fromLeft = Math.random() < 0.5;
  const baseY = 90 + Math.random() * (H * 0.56);

  objects.push({
    type,
    x: fromLeft ? -80 : W + 80,
    y: baseY,
    baseY,
    size: 76,
    vx: fromLeft ? 2.2 + Math.random() * 3 : -2.2 - Math.random() * 3,
    wave: 15 + Math.random() * 45,
    angle: Math.random() * 999
  });
}

function gameLoop(){
  if(!running) return;

  ctx.clearRect(0,0,W,H);

  if(bgImg.complete){
    ctx.drawImage(bgImg,0,0,W,H);
  }else{
    ctx.fillStyle = "#1b1038";
    ctx.fillRect(0,0,W,H);
  }

  for(const obj of objects){
    obj.x += obj.vx;
    obj.angle += 0.05;
    obj.y = obj.baseY + Math.sin(obj.angle) * obj.wave;

    let img = ufoImg;
    if(obj.type === "hat") img = hatImg;
    if(obj.type === "melon") img = melonImg;

    if(img.complete){
      ctx.drawImage(
        img,
        obj.x - obj.size / 2,
        obj.y - obj.size / 2,
        obj.size,
        obj.size
      );
    }
  }

  objects = objects.filter(obj => obj.x > -120 && obj.x < W + 120);

  animationId = requestAnimationFrame(gameLoop);
}

canvas.addEventListener("pointerdown", e=>{
  if(!running) return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  for(let i=objects.length-1; i>=0; i--){
    const obj = objects[i];

    const dx = mx - obj.x;
    const dy = my - obj.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if(dist < obj.size * 0.5){
if(obj.type === "ufo"){

  score += 3;

  seGood.currentTime = 0;
  seGood.play().catch(()=>{});

}else if(obj.type === "melon"){

  score -= 1;

  seBad.currentTime = 0;
  seBad.play().catch(()=>{});

  melonSe.currentTime = 0;
  melonSe.play().catch(()=>{});

}else{

  score -= 1;

  seBad.currentTime = 0;
  seBad.play().catch(()=>{});

}

      scoreEl.textContent = score;
      objects.splice(i,1);
      break;
    }
  }
});

function endGame(){
  stopGame();

  let rank;
  let comment;
  let image;

  if(score >= 25){
    rank = "もう隠せない";
    comment = "もう、見間違いでは済まされない。";
    image = "ufo.png";
  }else if(score >= 10){
    rank = "たしかに見た";
    comment = "夕暮れの空に、何かが飛んでいた。";
    image = "hat.png";
  }else{
    rank = "気のせいだった";
    comment = "帽子やメロンパンばかり追っていた。";
    image = "melon.png";
  }

  rankText.textContent = rank;
  scoreResult.textContent = `SCORE ${score}`;
  commentText.textContent = comment;
  resultImage.src = image;

  showScreen(resultScreen);
}

titleImage.addEventListener("click", startGame);
startBtn.addEventListener("click", startGame);

retryBtn.addEventListener("click", ()=>{
  stopGame();
  showScreen(titleScreen);
});

toTitleBtn.addEventListener("click", ()=>{
  stopGame();
  showScreen(titleScreen);
});

homeBtn.addEventListener("click", ()=>{
  location.href = "https://afoolhippo.github.io/home/?skipTitle=1";
});

shareBtn.addEventListener("click", ()=>{
  let icon = "🍈";
  let rank = "気のせいだった";
  let text = "メロンパンばかり見ていた。";

  if(score >= 25){
    icon = "🛸";
    rank = "もう隠せない";
    text = "夕暮れの空を見続けた。";
  }else if(score >= 10){
    icon = "🎩";
    rank = "たしかに見た";
    text = "夕暮れの空に、何かが飛んでいた。";
  }

  const shareText =
`${icon} UFOを見た！

「${rank}」

SCORE ${score}

${text}

無料ブラウザゲーム
「UFOを見た！」
https://afoolhippo.github.io/game21/

#UFOを見た
#カバゲーセン`;

  window.open(
    "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText),
    "_blank"
  );
});