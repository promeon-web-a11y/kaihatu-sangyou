/* =============================================================
   開発産業株式会社 — 共通スクリプト
   - ヘッダーのスクロール挙動 / モバイルナビ
   - スクロールイン表示 (IntersectionObserver)
   - 数字のカウントアップ
   - ヒーローのシーン・クロスフェード
   - 施工実績フィルタ (works ページ)
   - フッター年号
   動きは控えめ。prefers-reduced-motion 時は CSS 側で無効化。
   ============================================================= */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- header ---------- */
  var header = document.querySelector(".site-header");
  var isSub = header && header.classList.contains("is-sub");
  function onScroll() {
    if (!header || isSub) return;
    header.classList.toggle("is-solid", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var scrim = document.querySelector(".nav-scrim");
  function closeNav() { document.body.classList.remove("nav-open"); if (toggle) toggle.setAttribute("aria-expanded", "false"); }
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  if (scrim) scrim.addEventListener("click", closeNav);
  document.querySelectorAll(".gnav a").forEach(function (a) { a.addEventListener("click", closeNav); });
  window.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- count up ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dur = 900, start = null;
    var plain = el.textContent.trim();
    if (reduce) { el.textContent = plain; return; }
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = val.toLocaleString("ja-JP");
      if (p < 1) requestAnimationFrame(step); else el.textContent = plain;
    }
    requestAnimationFrame(step);
  }
  var nums = document.querySelectorAll("[data-count]");
  if (nums.length) {
    if (!("IntersectionObserver" in window)) {
      nums.forEach(countUp);
    } else {
      var nio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); nio.unobserve(en.target); } });
      }, { threshold: 0.6 });
      nums.forEach(function (el) { nio.observe(el); });
    }
  }

  /* ---------- hero scene crossfade ---------- */
  var scenes = document.querySelectorAll(".hero__scene");
  if (scenes.length > 1 && !reduce) {
    var i = 0;
    setInterval(function () {
      scenes[i].classList.remove("is-active");
      i = (i + 1) % scenes.length;
      scenes[i].classList.add("is-active");
    }, 5600);
  }

  /* ---------- works filter ---------- */
  var fb = document.querySelector(".filterbar");
  if (fb) {
    var cards = document.querySelectorAll(".works-grid .work-card, .year-block .work-card");
    fb.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      fb.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      var f = btn.getAttribute("data-filter");
      cards.forEach(function (c) {
        var show = f === "all" || (c.getAttribute("data-cat") || "").split(" ").indexOf(f) > -1;
        c.style.display = show ? "" : "none";
      });
      document.querySelectorAll(".year-block").forEach(function (yb) {
        var any = Array.prototype.some.call(yb.querySelectorAll(".work-card"), function (c) { return c.style.display !== "none"; });
        yb.style.display = any ? "" : "none";
      });
    });
  }

  /* ---------- footer year ---------- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
