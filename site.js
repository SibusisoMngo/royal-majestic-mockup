/* =============================================================
   ROYAL MAJESTIC - site behaviour
   Lenis for scroll weight, GSAP ScrollTrigger for the pinned pan,
   IntersectionObserver for reveals. No scroll listeners anywhere.
   ============================================================= */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     PRELOADER
     A counter tied to real image decodes. A blank screen for two
     seconds reads as broken, a counter reads as deliberate.
     ============================================================ */
  var pre = document.getElementById("pre");
  var preNum = document.getElementById("preNum");
  var preBar = document.getElementById("preBar");

  (function preload() {
    // ?nopre skips the intro, for screenshots and quick review
    if (location.search.indexOf("nopre") !== -1) {
      pre.remove();
      document.body.classList.add("is-ready");
      return;
    }
    var srcs = Array.prototype.map.call(
      document.querySelectorAll("img[src]"), function (i) { return i.src; }
    );
    var total = srcs.length + 1, done = 0, shown = 0, finished = false;

    function bump() {
      done++;
      if (done >= total) settle();
    }
    srcs.forEach(function (s) {
      var i = new Image();
      i.onload = i.onerror = bump;
      i.src = s;
    });
    document.addEventListener("rmroom:ready", bump, { once: true });
    // never hang on a missing WebGL context or a slow CDN
    setTimeout(function () { if (!finished) settle(); }, 6500);

    var tick = setInterval(function () {
      var target = Math.round((done / total) * 100);
      shown += Math.max(1, (target - shown) * 0.18);
      if (shown > target) shown = target;
      preNum.textContent = String(Math.min(99, Math.floor(shown))).padStart(2, "0");
      preBar.style.transform = "scaleX(" + (Math.min(99, shown) / 100) + ")";
    }, 40);

    function settle() {
      if (finished) return;
      finished = true;
      clearInterval(tick);
      preNum.textContent = "100";
      preBar.style.transform = "scaleX(1)";
      setTimeout(function () {
        pre.classList.add("is-out");
        document.body.classList.add("is-ready");
        setTimeout(function () { pre.remove(); }, 900);
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      }, reduce ? 60 : 420);
    }
  })();

  /* ============================================================
     SMOOTH SCROLL
     Motivation: the weight of the scroll is most of what reads as
     expensive on a photography led page. Off under reduced motion.
     ============================================================ */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }
    });
    (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var go = function () {
        if (lenis) lenis.scrollTo(el, { offset: -64 });
        else el.scrollIntoView({ block: "start" });
      };
      // if this link is inside the menu, let the panel close first
      if (a.closest(".menu")) setTimeout(go, 380); else go();
    });
  });

  /* ============================================================
     NAV STATE
     Motivation: state transition. The bar earns a background only
     once the hero image is no longer behind it.
     ============================================================ */
  var nav = document.getElementById("nav");
  new IntersectionObserver(function (en) {
    nav.classList.toggle("is-stuck", !en[0].isIntersecting);
  }, { rootMargin: "-40px 0px 0px 0px" }).observe(document.getElementById("top-sentinel"));

  /* ============================================================
     MOBILE MENU
     Motivation: feedback and state. Under 1024px the links do not
     fit on one line, so they move behind a button.
     ============================================================ */
  var menu = document.getElementById("menu");
  var navToggle = document.getElementById("navToggle");
  var menuClose = document.getElementById("menuClose");

  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close the menu" : "Open the menu");
    document.body.style.overflow = open ? "hidden" : "";
    if (lenis) { open ? lenis.stop() : lenis.start(); }
    if (open) { var f = menu.querySelector(".menu__link"); if (f) f.focus({ preventScroll: true }); }
    else { navToggle.focus({ preventScroll: true }); }
  }
  if (navToggle && menu) {
    navToggle.addEventListener("click", function () { setMenu(!menu.classList.contains("is-open")); });
    menuClose.addEventListener("click", function () { setMenu(false); });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) setMenu(false);
    });
  }

  /* ============================================================
     REVEALS
     Motivation: hierarchy. Content settles in reading order.
     ============================================================ */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });

  /* ============================================================
     GSAP SCENES
     ============================================================ */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    if (!reduce) {
      /* every panel image eases out of a slight push in as it passes.
         Motivation: storytelling. It is the one move that makes a run of
         full bleed photographs read as a sequence rather than a slideshow. */
      gsap.utils.toArray(".stagey__bg img").forEach(function (img) {
        var panel = img.closest(".stagey");
        gsap.fromTo(img,
          { scale: 1.18 },
          { scale: 1, ease: "none",
            scrollTrigger: { trigger: panel, start: "top bottom", end: "bottom top", scrub: true } });
      });

      /* the copy drifts up a little slower than the panel it sits on.
         Motivation: depth. */
      gsap.utils.toArray(".stagey:not(.suite) .stagey__copy").forEach(function (copy) {
        gsap.to(copy, {
          yPercent: -14, ease: "none",
          scrollTrigger: { trigger: copy.closest(".stagey"), start: "top bottom", end: "bottom top", scrub: true }
        });
      });

      /* the hero holds while the next panel arrives over it */
      gsap.to("#hero .stagey__copy", {
        opacity: 0, yPercent: -22, ease: "none",
        scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true }
      });
    }
  }

  /* ============================================================
     3D TOUR VIEWPOINTS
     ============================================================ */
  var viewTabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var sceneNote = document.getElementById("sceneNote");
  var notes = {
    doorway: "Executive suite, from the entrance",
    bed:     "The bed wall, fluted oak and brass",
    desk:    "The work console and the screen",
    window:  "Full height glass, city side"
  };
  viewTabs.forEach(function (t) {
    t.addEventListener("click", function () {
      var v = t.dataset.view;
      viewTabs.forEach(function (o) { o.setAttribute("aria-selected", String(o === t)); });
      if (sceneNote) sceneNote.textContent = notes[v] || "";
      if (window.RMRoom) window.RMRoom.go(v);
    });
  });

  var glFail = document.getElementById("glFail");
  var glWhy = document.getElementById("glWhy");
  function whyNo3D() {
    if (window.__rmFail) return window.__rmFail;
    if (!window.THREE) return "three.js did not load. Check the connection, or an ad blocker blocking cdn.jsdelivr.net.";
    try {
      var c = document.createElement("canvas");
      if (!(c.getContext("webgl2") || c.getContext("webgl"))) return "This browser has no WebGL context available.";
    } catch (e) { return "WebGL threw: " + e.message; }
    if (window.__rmErrors && window.__rmErrors.length) return window.__rmErrors.join(" | ");
    return "The room script did not finish. Try a hard reload (Cmd+Shift+R).";
  }
  setTimeout(function () {
    if (!window.RMRoom && glFail) {
      glFail.hidden = false;
      if (glWhy) glWhy.textContent = whyNo3D();
    }
  }, 6000);

  /* ============================================================
     CONCIERGE
     Scripted intent match over the group's real facts. Every reply
     resolves to rooms, meeting space, a service note, an events
     pack, or a handover to a real phone number.
     ============================================================ */
  var log = document.getElementById("log");
  var res = document.getElementById("res");
  var resEmpty = document.getElementById("resEmpty");
  var resCount = document.getElementById("resCount");
  var form = document.getElementById("form");
  var ask = document.getElementById("ask");
  var busy = false;

  function ZAR(n) { return "R" + n.toLocaleString("en-ZA"); }

  var intents = [
    { keys: ["rosebank", "gautrain", "hyde park", "melrose", "zone", "firs", "joburg", "johannesburg", "jozi", "mall"],
      reply: "Rosebank then. You are a short walk from the Gautrain station, Rosebank Mall and The Zone, and about 25km from OR Tambo. Two nights are open on both of these.",
      rates: [
        { name: "Deluxe King", where: "Rosebank", price: 2450, tags: ["Two nights", "Breakfast included", "Free cancellation"] },
        { name: "Executive Suite", where: "Rosebank", price: 3980, tags: ["Two nights", "High floor", "Late checkout"] }
      ] },
    { keys: ["board", "meeting", "conference", "conferencing", "boardroom", "delegates", "workshop", "training", "agm", "team", "14", "venue"],
      reply: "Durban carries eleven meeting venues. For fourteen people I would set one boardroom style and put the breaks in the business lounge next door.",
      rates: [
        { name: "Boardroom, seats 14", where: "Durban", price: 6200, tags: ["Full day", "AV and screen", "Coordinator on site"] },
        { name: "Half day rate", where: "Durban", price: 3600, tags: ["Four hours", "Tea and lunch", "Business lounge"] }
      ] },
    { keys: ["late", "quiet", "high floor", "red eye", "night", "arrive", "arriving", "check in", "noise", "flight"],
      reply: "Noted. High floor, away from the lift core, and I will leave a late arrival note with the night manager so reception is expecting you.",
      rates: [
        { name: "Executive King, high floor", where: "Rosebank", price: 2680, tags: ["Late check in held", "Away from lifts", "Blackout drapes"] }
      ] },
    { keys: ["wedding", "engagement", "banquet", "gala", "function", "celebration", "birthday", "church", "year end", "matric", "party"],
      reply: "Rosebank handles weddings, engagements and banqueting, and Durban takes the larger sittings. I can hold a provisional date while the packages go across.",
      rates: [
        { name: "Wedding package", where: "Rosebank", price: 0, tags: ["Provisional date", "Menu tasting", "Coordinator"] },
        { name: "Banqueting, larger sitting", where: "Durban", price: 0, tags: ["Plated or buffet", "Stage and AV", "On site team"] }
      ] },
    { keys: ["dinner", "restaurant", "eat", "food", "breakfast", "lunch", "drink", "bar", "cocktail", "citrus", "coral", "table"],
      reply: "Citrus does local and international plates to order, and the Coral Lounge in Durban is the easier room for a drink or a working coffee. I can book a table alongside the room.",
      rates: [
        { name: "Table for two, Citrus", where: "Rosebank", price: 0, tags: ["19:00", "Window table", "Kitchen notified"] }
      ] },
    { keys: ["durban", "beach", "beachfront", "coast", "kzn", "spa", "pool", "gym", "fitness", "sea"],
      reply: "Durban then. Close to the beachfront, with two spas, an outdoor pool and a fitness centre that stays open around the clock.",
      rates: [
        { name: "Sea facing King", where: "Durban", price: 2190, tags: ["Breakfast included", "Pool and spa", "Free cancellation"] },
        { name: "Terrace Suite", where: "Durban", price: 3450, tags: ["Private terrace", "Sea facing", "Late checkout"] }
      ] },
    { keys: ["sandton", "business district", "office", "corporate", "work trip", "client"],
      reply: "Sandton sits in the middle of the business district, so most of the offices are a walk rather than a drive.",
      rates: [
        { name: "Contemporary King", where: "Sandton", price: 2290, tags: ["Workspace", "Breakfast included", "Walk to the offices"] }
      ] }
  ];

  var fallback = {
    reply: "I have not got a clean answer for that one, so let me hand you to a person. Rosebank is 010 019 0000 and Durban is 031 880 8100, both answered around the clock.",
    rates: []
  };

  function bubble(cls, text) {
    var d = document.createElement("div");
    d.className = "msg " + cls;
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  function thinking() {
    var d = document.createElement("div");
    d.className = "msg msg--rm";
    d.innerHTML = '<span class="dots"><span></span><span></span><span></span></span>';
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  function stream(el, text, done) {
    if (reduce) { el.textContent = text; log.scrollTop = log.scrollHeight; done && done(); return; }
    el.textContent = "";
    var i = 0;
    (function step() {
      i += 2;
      el.textContent = text.slice(0, i);
      log.scrollTop = log.scrollHeight;
      if (i < text.length) setTimeout(step, 11);
      else done && done();
    })();
  }

  function skeletons(n) {
    res.querySelectorAll(".rate, .skl").forEach(function (x) { x.remove(); });
    resEmpty.style.display = "none";
    resCount.textContent = "";
    for (var i = 0; i < n; i++) {
      var s = document.createElement("div");
      s.className = "skl";
      s.innerHTML = "<div></div><div></div><div></div>";
      res.appendChild(s);
    }
  }

  function paintRates(rates) {
    res.querySelectorAll(".skl").forEach(function (x) { x.remove(); });
    if (!rates.length) {
      resEmpty.style.display = "";
      resEmpty.querySelector("p").textContent = "Nothing to price on this one. The team will come back with options.";
      resCount.textContent = "";
      return;
    }
    resEmpty.style.display = "none";
    resCount.textContent = rates.length + (rates.length === 1 ? " option" : " options");

    rates.forEach(function (r) {
      var card = document.createElement("div");
      card.className = "rate";
      var price = r.price
        ? "<b>" + ZAR(r.price) + "</b><span>per night, sample</span>"
        : "<b>On request</b><span>packages sent</span>";

      card.innerHTML =
        '<div class="rate__top">' +
          '<div><div class="rate__name">' + r.name + "</div>" +
          '<div class="rate__where">' + r.where + "</div></div>" +
          '<div class="rate__price">' + price + "</div>" +
        "</div>" +
        '<div class="rate__meta">' + r.tags.map(function (t) { return '<span class="tag">' + t + "</span>"; }).join("") + "</div>" +
        '<div class="rate__act"><button class="hold" type="button">Hold this rate</button></div>';

      var act = card.querySelector(".rate__act");
      var btn = card.querySelector(".hold");
      btn.addEventListener("click", function () {
        if (card.classList.contains("is-held")) return;
        card.classList.add("is-held");
        btn.textContent = "Held for 30 minutes";
        var rel = document.createElement("button");
        rel.className = "release"; rel.type = "button"; rel.textContent = "Release";
        rel.addEventListener("click", function () {
          card.classList.remove("is-held");
          btn.textContent = "Hold this rate";
          rel.remove();
        });
        act.appendChild(rel);
      });
      res.appendChild(card);
    });
  }

  function match(text) {
    var q = text.toLowerCase(), best = null, score = 0;
    intents.forEach(function (it) {
      var s = 0;
      it.keys.forEach(function (k) { if (q.indexOf(k) !== -1) s++; });
      if (s > score) { score = s; best = it; }
    });
    return score ? best : fallback;
  }

  function respond(text) {
    if (busy) return;
    busy = true;
    bubble("msg--me", text);
    var hit = match(text);
    var think = thinking();
    skeletons(Math.max(1, hit.rates.length));
    setTimeout(function () {
      think.innerHTML = "";
      stream(think, hit.reply, function () {
        paintRates(hit.rates);
        busy = false;
      });
    }, 600);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = ask.value.trim();
    if (!v) return;
    ask.value = "";
    respond(v);
  });

  document.getElementById("chips").addEventListener("click", function (e) {
    var c = e.target.closest(".chip");
    if (c) respond(c.textContent.trim());
  });

  window.addEventListener("load", function () {
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
})();
