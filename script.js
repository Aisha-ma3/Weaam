/* ===== BACKGROUND MUSIC: starts automatically, loops forever, continues across pages ===== */
const musicToggle = document.getElementById("musicToggle");
const music = new Audio("assets/music.mp3");
music.loop = true;
music.preload = "auto";
let userPaused = sessionStorage.getItem("weaamMusicPaused") === "1";
let autoPausedByVideo = false;

const setUI = (txt) => { if (musicToggle) musicToggle.innerHTML = "♫ <span>" + txt + "</span>"; };
const saveTime = () => sessionStorage.setItem("weaamMusicTime", String(music.currentTime || 0));

music.addEventListener("loadedmetadata", () => {
  const t = parseFloat(sessionStorage.getItem("weaamMusicTime") || "0");
  if (t && t < music.duration) music.currentTime = t;
});
music.addEventListener("timeupdate", saveTime);
music.addEventListener("play", () => setUI("Music on"));
music.addEventListener("pause", () => { if (!autoPausedByVideo) setUI("Music off"); });
music.addEventListener("error", () => setUI("Add music.mp3"));
window.addEventListener("pagehide", saveTime);

async function startMusic() {
  if (userPaused) return false;
  try { await music.play(); return true; } catch { return false; }
}
if (userPaused) setUI("Music off");
startMusic().then((ok) => {
  if (ok || userPaused) return;
  // browsers block autoplay until the first tap/click/key – start on the very first interaction
  const kick = async () => { if (await startMusic()) off(); };
  const evs = ["pointerdown", "keydown", "touchstart", "wheel", "scroll"];
  const off = () => evs.forEach((e) => window.removeEventListener(e, kick, true));
  evs.forEach((e) => window.addEventListener(e, kick, true));
});

musicToggle?.addEventListener("click", async (e) => {
  e.stopPropagation();
  if (music.paused) { userPaused = false; sessionStorage.removeItem("weaamMusicPaused"); await startMusic(); }
  else { userPaused = true; sessionStorage.setItem("weaamMusicPaused", "1"); music.pause(); }
});

/* ===== PHOTOS: try jpg / jpeg / png / webp, show placeholder if none ===== */
const exts = ["jpg", "jpeg", "png", "webp", "JPG", "PNG"];
document.querySelectorAll("img[data-base]").forEach((img) => {
  let i = 0;
  img.addEventListener("load", () => img.classList.add("ok"));
  img.addEventListener("error", () => { i++; if (i < exts.length) img.src = img.dataset.base + "." + exts[i]; });
  img.src = img.dataset.base + "." + exts[0];
});

/* ===== LIGHTBOX ===== */
const lb = document.getElementById("lightbox");
if (lb) {
  const lbImg = lb.querySelector("img");
  document.addEventListener("click", (e) => {
    const img = e.target.closest(".photo img.ok");
    if (img) { lbImg.src = img.src; lb.classList.add("open"); }
    else if (e.target.closest("#lightbox")) lb.classList.remove("open");
  });
  document.addEventListener("keydown", (e) => e.key === "Escape" && lb.classList.remove("open"));
}

/* ===== VIDEO: pause the music while the video plays ===== */
const vid = document.getElementById("weaamVideo");
if (vid) {
  const ph = document.querySelector(".video-ph");
  vid.addEventListener("loadedmetadata", () => { vid.classList.add("ok"); if (ph) ph.style.display = "none"; });
  vid.addEventListener("play", () => { if (!music.paused) { autoPausedByVideo = true; music.pause(); } });
  const back = () => { if (autoPausedByVideo) { autoPausedByVideo = false; startMusic(); } };
  vid.addEventListener("pause", back); vid.addEventListener("ended", back);
}

/* ===== SCROLL REVEAL ===== */
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.08 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* ===== BIRTHDAY WISH ===== */
const cake = document.getElementById("cake");
if (cake) {
  cake.addEventListener("click", () => {
    document.getElementById("flame").classList.add("out");
    document.getElementById("cakeHint").textContent = "happy birthday, Weaam ♡ your wish is on its way";
    const sym = ["✦", "✧", "♡", "🪐", "✨"], col = ["#f2ccdc", "#d6b2d8", "#f5e3dc", "#e6b7ca"];
    for (let i = 0; i < 70; i++) {
      const s = document.createElement("span");
      s.className = "confetti"; s.textContent = sym[i % sym.length];
      s.style.left = Math.random() * 100 + "vw"; s.style.color = col[i % col.length];
      s.style.fontSize = 14 + Math.random() * 20 + "px";
      s.style.animationDuration = 3 + Math.random() * 3 + "s"; s.style.animationDelay = Math.random() * 1.2 + "s";
      document.body.appendChild(s); setTimeout(() => s.remove(), 8000);
    }
    const w = document.getElementById("wishes");
    w.hidden = false;
    w.querySelectorAll(".reveal").forEach((x) => x.classList.add("in"));
    setTimeout(() => w.scrollIntoView({ behavior: "smooth", block: "start" }), 900);
  }, { once: true });
}

/* ===== GALLERY: staggered pop-in for every photo ===== */
if (document.querySelector(".gallery-page")) {
  const photos = document.querySelectorAll(".gallery-page .photo");
  const pio = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); pio.unobserve(e.target); }
  }), { threshold: 0.12 });
  photos.forEach((p, i) => {
    p.style.setProperty("--i", i);
    p.style.setProperty("--d", (i % 4) * 0.14 + "s");
    pio.observe(p);
  });
}
