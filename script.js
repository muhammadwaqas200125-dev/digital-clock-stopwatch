function pad(num) {
  return num.toString().padStart(2, "0");
}

const clockEl = document.getElementById("clock");
const dateEl = document.getElementById("date");
const greetingEl = document.getElementById("greeting");
const hourHand = document.getElementById("hourHand");
const minuteHand = document.getElementById("minuteHand");
const secondHand = document.getElementById("secondHand");

function updateClock() {
  const now = new Date();
  const h24 = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;

  clockEl.innerHTML = `${pad(h12)}:${pad(m)}<span class="sec">:${pad(s)}</span> <small>${ampm}</small>`;
  dateEl.textContent = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  secondHand.style.transform = `rotate(${s * 6}deg)`;
  minuteHand.style.transform = `rotate(${m * 6 + s * 0.1}deg)`;
  hourHand.style.transform = `rotate(${(h24 % 12) * 30 + m * 0.5}deg)`;

  let greet = "Good night 🌙";
  if (h24 >= 5 && h24 < 12) greet = "Good morning ☀️";
  else if (h24 >= 12 && h24 < 17) greet = "Good afternoon 🌤️";
  else if (h24 >= 17 && h24 < 21) greet = "Good evening 🌆";
  greetingEl.textContent = greet;
}

updateClock();
setInterval(updateClock, 1000);

const swCard = document.getElementById("stopwatch").closest(".card");
const swEl = document.getElementById("stopwatch");
const msEl = document.getElementById("ms");
const ring = document.getElementById("ring");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const lapsEl = document.getElementById("laps");

const RING_LENGTH = 2 * Math.PI * 90;
let timerId = null;
let startTime = 0;
let elapsedTime = 0;
let laps = [];
let lastLapTotal = 0;

function currentTime() {
  return timerId === null ? elapsedTime : elapsedTime + (Date.now() - startTime);
}

function formatMain(ms) {
  const total = Math.floor(ms / 1000);
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}

function formatFull(ms) {
  return `${formatMain(ms)}.${pad(Math.floor((ms % 1000) / 10))}`;
}

function render() {
  const ms = currentTime();
  swEl.textContent = formatMain(ms);
  msEl.textContent = "." + pad(Math.floor((ms % 1000) / 10));
  const progress = (ms % 60000) / 60000;
  ring.style.strokeDashoffset = RING_LENGTH * (1 - progress);
}

function startStopwatch() {
  if (timerId !== null) return;
  startTime = Date.now();
  timerId = setInterval(render, 10);
  swCard.classList.add("running");
  startBtn.disabled = true;
  stopBtn.disabled = false;
  lapBtn.disabled = false;
  resetBtn.disabled = false;
  statusEl.textContent = "Running... 🏃";
}

function stopStopwatch() {
  if (timerId === null) return;
  elapsedTime += Date.now() - startTime;
  clearInterval(timerId);
  timerId = null;
  render();
  swCard.classList.remove("running");
  startBtn.disabled = false;
  startBtn.textContent = "▶ Resume";
  stopBtn.disabled = true;
  lapBtn.disabled = true;
  statusEl.textContent = "Paused ⏸";
}

function addLap() {
  if (timerId === null) return;
  const now = currentTime();
  laps.push(now - lastLapTotal);
  lastLapTotal = now;
  renderLaps();
}

function renderLaps() {
  lapsEl.innerHTML = "";
  const best = Math.min(...laps);
  const worst = Math.max(...laps);
  for (let i = laps.length - 1; i >= 0; i--) {
    const li = document.createElement("li");
    if (laps.length > 1 && laps[i] === best) li.classList.add("best");
    if (laps.length > 1 && laps[i] === worst) li.classList.add("worst");
    li.innerHTML = `<span>Lap ${i + 1}</span><span>${formatFull(laps[i])}</span>`;
    lapsEl.appendChild(li);
  }
}

function resetStopwatch() {
  clearInterval(timerId);
  timerId = null;
  startTime = 0;
  elapsedTime = 0;
  laps = [];
  lastLapTotal = 0;
  lapsEl.innerHTML = "";
  render();
  swCard.classList.remove("running");
  startBtn.disabled = false;
  startBtn.textContent = "▶ Start";
  stopBtn.disabled = true;
  lapBtn.disabled = true;
  resetBtn.disabled = true;
  statusEl.textContent = "Ready";
}

startBtn.addEventListener("click", startStopwatch);
stopBtn.addEventListener("click", stopStopwatch);
lapBtn.addEventListener("click", addLap);
resetBtn.addEventListener("click", resetStopwatch);

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    timerId === null ? startStopwatch() : stopStopwatch();
  } else if (e.key.toLowerCase() === "l") {
    addLap();
  } else if (e.key.toLowerCase() === "r" && !resetBtn.disabled) {
    resetStopwatch();
  }
});

render();
