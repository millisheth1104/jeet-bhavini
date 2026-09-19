/* ---------------------------------------------------------------------------
   Jeet × Bhavini — rendering and motion.
   All copy comes from window.WEDDING (content.js). Nothing is hard-coded here.
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  var W = window.WEDDING;
  if (!W) { console.error("content.js did not load"); return; }

  var $  = function (id) { return document.getElementById(id); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -- scroll locking: locked while hero handwriting animates ------------ */
  var SCROLL_LOCK = (function () {
    var locked = false;

    function preventDefault(e) {
      if (!locked) return;
      if (e.type === "keydown") {
        var blockedKeys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Space", "Home", "End"];
        if (blockedKeys.indexOf(e.key) !== -1 || e.keyCode === 32) {
          e.preventDefault();
        }
      } else {
        e.preventDefault();
      }
    }

    function lock() {
      if (locked) return;
      locked = true;
      document.documentElement.classList.add("is-scroll-locked");
      document.body.classList.add("is-scroll-locked");
      window.addEventListener("wheel", preventDefault, { passive: false });
      window.addEventListener("touchmove", preventDefault, { passive: false });
      window.addEventListener("keydown", preventDefault, { passive: false });
    }

    function unlock() {
      if (!locked) return;
      locked = false;
      document.documentElement.classList.remove("is-scroll-locked");
      document.body.classList.remove("is-scroll-locked");
      window.removeEventListener("wheel", preventDefault);
      window.removeEventListener("touchmove", preventDefault);
      window.removeEventListener("keydown", preventDefault);
    }

    return { lock: lock, unlock: unlock, isLocked: function () { return locked; } };
  }());

  if (!reduced) SCROLL_LOCK.lock();

  /* -- language ------------------------------------------------------------
     The site reads in one language at a time. The visitor's choice is kept in
     localStorage; switching reloads, because re-rendering in place would mean
     tearing down the carousel, the countdown interval and every observer. A
     reload on a static site is cheaper and cannot half-apply.               */

  var LANGS = ["en", "gu"];
  var LANG = (function () {
    try {
      var saved = localStorage.getItem("wedding-lang");
      if (LANGS.indexOf(saved) !== -1) return saved;
    } catch (e) {}
    return W.defaultLang === "gu" ? "gu" : "en";
  }());
  var OTHER = LANG === "en" ? "gu" : "en";

  /* Copy in content.js is either a plain string - the same in both languages,
     like a time or a brand name - or an { en, gu } pair. Resolve either. */
  function t(v) {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object" && ("en" in v || "gu" in v)) {
      return v[LANG] || v.en || v.gu || "";
    }
    return v;
  }
  function u(key) { return t((W.ui || {})[key]); }

  /* `.gu` sets the Gujarati face. Latin text must not wear it. */
  function guIf(cls) {
    return LANG === "gu" ? ("gu " + (cls || "")).trim() : (cls || null);
  }

  document.documentElement.setAttribute("lang", LANG);
  document.documentElement.setAttribute("data-lang", LANG);

  /* Switching carries the scroll position across the reload, and the presence
     of that key is also what tells the intro to stay out of the way. */
  function setLang(next) {
    if (next === LANG) return;
    try {
      localStorage.setItem("wedding-lang", next);
      sessionStorage.setItem("wedding-langswitch", String(window.scrollY || 0));
    } catch (e) {}
    location.reload();
  }
  var switchedAt = null;
  try {
    switchedAt = sessionStorage.getItem("wedding-langswitch");
    sessionStorage.removeItem("wedding-langswitch");
  } catch (e) {}

  /* -- guest links -----------------------------------------------------
     admin.html builds personal links of the form ?for=<token>, where the
     token is base64url(JSON {n: name, c: [event keys]}). There is no server
     and no guest list on disk anywhere - the link itself IS the data, which
     is what a static, no-build site can do without adding a backend. The
     encode/decode here MUST match admin.html's, since they never share code.

     Filtering W.events here, before events() below ever reads it, means the
     rest of the site does not need to know a filtered visit is happening. */
  var GUEST = null;
  (function guestLink() {
    var m = location.search.match(/[?&]for=([^&]+)/);
    if (!m) return;
    try {
      var b64 = decodeURIComponent(m[1]).replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4) b64 += "=";
      var json = decodeURIComponent(escape(atob(b64)));
      var data = JSON.parse(json);
      if (data && typeof data === "object") GUEST = data;
    } catch (e) { GUEST = null; }        // a malformed or tampered link just shows everything

    if (GUEST && Array.isArray(GUEST.c) && GUEST.c.length && Array.isArray(W.events)) {
      var keep = GUEST.c;
      W.events = W.events.filter(function (ev) { return keep.indexOf(ev.key) !== -1; });
    }
  }());

  (function langToggle() {
    var host = $("langSwitch");
    if (!host) return;
    var short = W.ui.langShort || { en: "EN", gu: "GU" };
    // Both languages sit in the toggle at once - the active one filled, the
    // other plain - rather than one button that only ever names where a tap
    // would take you.
    LANGS.forEach(function (code) {
      var isActive = code === LANG;
      var seg = el("button", "langswitch__opt" +
        (isActive ? " is-active" : "") + (code === "gu" ? " langswitch__opt--gu" : ""));
      seg.type = "button";
      seg.textContent = short[code] || code.toUpperCase();
      seg.setAttribute("aria-pressed", isActive ? "true" : "false");
      if (!isActive) {
        seg.setAttribute("aria-label", u("langSwitchTo"));
        seg.title = u("langSwitchTo");
        seg.addEventListener("click", function () { setLang(code); });
      }
      host.appendChild(seg);
    });
  }());

  /* Static labels that live in index.html rather than in a render function:
     section headings, the scroll cue, and every aria-label. */
  (function chrome() {
    function label(id, key) { var e = $(id); if (e) e.textContent = u(key); }
    function aria(id, key, alsoTitle) {
      var e = $(id); if (!e) return;
      e.setAttribute("aria-label", u(key));
      if (alsoTitle) e.title = u(key);
    }
    label("scrollCueLabel",  "scrollCue");
    label("eventsEyebrow",   "eventsEyebrow");
    label("eventsTitle",     "eventsTitle");
    label("familiesEyebrow", "familiesEyebrow");
    label("familiesTitle",   "familiesTitle");

    /* The line under "Our Events" carries the heading in the OTHER language -
       a pairing, the way a kankotri sets both, not a mixed-language page. */
    var alt = $("eventsAlt");
    if (alt) {
      alt.textContent = (W.ui.eventsTitle || {})[OTHER] || "";
      if (OTHER === "gu") alt.classList.add("gu");
    }

    aria("musicBtn",   "aMusic", true);
    aria("topBtn",     "aTop",   true);
  }());

  /* A language switch reloads. Put the reader back where they were. */
  (function restoreScroll() {
    // "manual" unconditionally, not just on a language switch: browsers
    // default history.scrollRestoration to "auto" and restore the last
    // scroll offset on every same-document reload on their own, with no JS
    // involved - that's what kept putting a plain refresh back wherever the
    // visitor had scrolled to instead of the top. Turning it off here always
    // is what actually stops that; the branch below only decides where THIS
    // script then puts the scroll position - the language switch's saved
    // spot, or the top for every other load.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    if (switchedAt === null) {
      window.scrollTo(0, 0);
      return;
    }
    var y = parseInt(switchedAt, 10) || 0;
    if (!y) return;
    function go() { window.scrollTo(0, y); }
    window.addEventListener("load", function () { go(); setTimeout(go, 120); });
  }());

  /* -- small helpers ------------------------------------------------------ */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // Set text, and hide the node entirely when there is nothing to say.
  function put(id, text) {
    var n = $(id);
    if (!n) return null;
    if (text == null || text === "") { n.hidden = true; return n; }
    n.textContent = text;
    n.hidden = false;
    return n;
  }

  function ornRule() {
    var span = el("span", "rule");
    span.setAttribute("aria-hidden", "true");
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 320 24");
    var u = document.createElementNS("http://www.w3.org/2000/svg", "use");
    u.setAttribute("href", "#orn-rule");
    s.appendChild(u);
    span.appendChild(s);
    return span;
  }

  /* -- hero --------------------------------------------------------------- */

  var groom = W.couple.groom, bride = W.couple.bride;
  var first  = W.couple.firstInHero === "bride" ? bride : groom;
  var second = first === groom ? bride : groom;

  var triggerGuestHandwriting = null;

  /* -- intro screen, palace portal, invitation ---------------------------
     Three beats, and each one waits for the last to land:

       1. the elephant scene holds still until the bell is rung
       2. the closed palace gate crossfades in over it
       3. the two leaves swing inward, the camera walks through the opening,
          and what the doorway opens onto is the hero itself - which carries
          the invitation, naming the guest the ?for= link was made for

     A tap or Escape at any point jumps to the next beat rather than skipping
     the whole thing, so an impatient visitor still sees their own name. */

  var PORTAL = {
    ring:    1150,  // bell struck -> gate appears
    gate:    1200,  // gate held closed before it starts to open (let it be seen)
    doors:    950,  // doors fully swing open (matches CSS portalLeafL/R duration)
    zoom:    2400,  // camera zooms through the open doorway (matches CSS portalWalkIn)
    settle:   700   // held while the hero smoothly finishes taking over
  };

  /* -- audio controller ---------------------------------------------------
     Plays assets/audio/theme.mp3 ("Dhin Dhin").
     Starts automatically when the visitor rings the temple bell,
     or when the floating music button is tapped.                           */

  var MUSIC = (function () {
    var btn = $("musicBtn");
    var audio = new Audio("assets/audio/theme.mp3");
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.25;

    var missing = false;
    var fadeTimer = null;

    audio.addEventListener("error", function () {
      missing = true;
      if (btn) btn.hidden = true;
    });

    function play() {
      if (missing) return;
      if (!audio.paused && audio.volume >= 0.35) return;
      var icon = $("musicIcon");
      if (audio.volume < 0.2) audio.volume = 0.2;

      var p = audio.play();
      if (p && p.then) {
        p.then(function () {
          if (btn) {
            btn.setAttribute("aria-pressed", "true");
            btn.setAttribute("aria-label", "Pause music");
          }
          if (icon) icon.setAttribute("href", "#ic-music");

          // smooth fade-in volume up to 0.50
          clearInterval(fadeTimer);
          var v = audio.volume;
          fadeTimer = setInterval(function () {
            v = Math.min(0.50, v + 0.04);
            audio.volume = v;
            if (v >= 0.50) clearInterval(fadeTimer);
          }, 60);
        }).catch(function (err) {
          console.warn("Audio playback gesture note:", err);
        });
      }
    }

    function pause() {
      clearInterval(fadeTimer);
      audio.pause();
      if (btn) {
        btn.setAttribute("aria-pressed", "false");
        btn.setAttribute("aria-label", "Play music");
      }
      var icon = $("musicIcon");
      if (icon) icon.setAttribute("href", "#ic-mute");
    }

    function toggle() {
      if (missing) return;
      var on = btn && btn.getAttribute("aria-pressed") === "true";
      if (on) pause();
      else play();
    }

    if (btn) btn.addEventListener("click", toggle);

    return { play: play, pause: pause, toggle: toggle };
  }());

  (function intro() {
    var box = $("intro");
    var stage = $("portalStage");
    if (!box) return;

    put("introCueTitle", u("introCueTitle"));
    put("introCueSub",   u("introCueSub"));
    var cue = $("introCue");
    if (cue && LANG === "gu") cue.classList.add("gu");

    // A language switch comes back mid-page; do not replay any of it.
    if (switchedAt !== null || reduced) {
      box.remove();
      if (stage) stage.remove();
      document.body.classList.remove("intro-open");
      return;
    }

    document.body.classList.add("intro-open");

    // The elephant is hidden by default (.intro__ele { opacity: 0 } in CSS)
    // until every piece of it has actually finished loading, then revealed
    // as one unit. Preloading (see index.html <head>) starts the fetches
    // early, but the body still needs BOTH its JPEG and its mask PNG to
    // arrive before it composites into anything, while each leg only needs
    // its own single image - "needs 2" reliably loses that race to "needs
    // 1" regardless of fetch priority, which is what let the legs render
    // before the body. Racing arrival order was never going to fix that;
    // gating the reveal on all four does. The setTimeout is a safety net -
    // if some request errors, the elephant still appears rather than
    // staying invisible forever.
    (function revealElephantWhenReady() {
      var ele = box.querySelector(".intro__ele");
      if (!ele) return;
      var urls = [
        "assets/generated/intro3_ele_body.jpg?v=11",
        "assets/generated/intro3_ele_mask.png?v=11",
        "assets/generated/intro3_leg_far.png?v=11",
        "assets/generated/intro3_leg_near.png?v=11"
      ];
      var remaining = urls.length;
      var revealed = false;
      function reveal() {
        if (revealed) return;
        revealed = true;
        ele.classList.add("is-ready");
      }
      function done() {
        remaining -= 1;
        if (remaining <= 0) reveal();
      }
      urls.forEach(function (src) {
        var img = new Image();
        img.onload = done;
        img.onerror = done;
        img.src = src;
      });
      setTimeout(reveal, 2000);
    }());

    var hold = location.search.indexOf("hold") !== -1;
    var step = 0;              // 0 unrung, 1 gate closed, 2 opening, 3 zooming, 4 invitation
    var timer = null;
    var timer2 = null;

    function at(ms, fn) {
      clearTimeout(timer);
      timer = setTimeout(fn, ms);
    }

    function finish() {
      if (step > 4) return;
      step = 5;
      clearTimeout(timer);
      clearTimeout(timer2);
      document.body.classList.remove("intro-open");
      document.body.classList.remove("page-proper");
      window.scrollTo(0, 0);
      if (triggerGuestHandwriting) triggerGuestHandwriting();
      if (!stage) return;
      stage.classList.remove("is-visible");
      stage.classList.add("is-gone");
      setTimeout(function () {
        if (stage && stage.parentNode) stage.remove();
      }, 100);
    }

    // The camera is through the doorway: the plate has flown past, so hand
    // the page over and let the light fade off the hero rather than cutting.
    function reveal() {
      if (step > 3) return;
      step = 4;
      stage.classList.add("is-through");
      stage.style.pointerEvents = "none";
      document.body.classList.remove("intro-open");
      document.body.classList.remove("page-proper");
      window.scrollTo(0, 0);
      // Immediately start writing in sync as the garland hero starts
      if (triggerGuestHandwriting) triggerGuestHandwriting();
      if (!hold) at(PORTAL.settle, finish);
    }

    // Phase 2: doors are fully open, camera smoothly glides through the doorway.
    function zoomThrough() {
      if (step > 2) return;
      step = 3;
      stage.classList.add("is-zooming");
      stage.style.pointerEvents = "none";
      // As camera zooms through, transition page behind to proper clarity
      setTimeout(function () {
        document.body.classList.add("page-proper");
      }, 150);
      if (!hold) at(PORTAL.zoom, reveal);
    }

    // Phase 1: doors swing open
    function openGate() {
      if (step > 1) return;
      step = 2;
      if (!stage) return finish();
      stage.classList.add("is-opening");
      // After doors fully open, start the zoom-through
      if (!hold) timer2 = setTimeout(zoomThrough, PORTAL.doors);
    }

    // The gate arrives closed and holds a beat, so it is seen shut before it
    // moves — without the pause the opening reads as a transition, not as a
    // door being opened for you.
    function showGate() {
      if (step > 0) return;
      step = 1;
      if (!stage) return finish();

      stage.hidden = false;
      requestAnimationFrame(function () { stage.classList.add("is-visible"); });

      setTimeout(function () {
        box.classList.add("is-done");
        setTimeout(function () { box.remove(); }, 900);
      }, 220);

      if (!hold) at(PORTAL.gate, openGate);
    }

    var rung = false;
    function ring() {
      if (rung) return;
      rung = true;
      MUSIC.play();
      box.classList.add("is-ringing");   // elephant rears, trunk strikes at ~560ms
      if (!hold) at(PORTAL.ring, showGate);
    }

    // One handler for every beat: whatever is on screen, advance it.
    function advance() {
      MUSIC.play();
      if (!rung) ring();
      else if (step === 0) showGate();
      else if (step === 1) openGate();
      else if (step === 2) zoomThrough();
      else if (step === 3) reveal();
      else finish();
    }

    box.addEventListener("click", advance);
    var bell = $("introBell");
    if (bell) {
      bell.addEventListener("click", function (e) {
        e.stopPropagation();
        advance();
      });
    }
    if (stage) stage.addEventListener("click", advance);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        box.remove();
        if (stage) stage.remove();
        step = 5;
        clearTimeout(timer);
        clearTimeout(timer2);
        document.body.classList.remove("intro-open");
        window.scrollTo(0, 0);
        if (triggerGuestHandwriting) triggerGuestHandwriting();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        advance();
      }
    });
  }());
  /* -- authentic calligraphy cursive handwriting animation -------------- */

  function renderGuestHandwriting() {
    var host = $("heroGuest");
    var cue = $("scrollCue");
    if (!host) return;

    var rawText = (GUEST && GUEST.n) || u("inviteYou") || "you";
    rawText = String(rawText).trim();
    if (!rawText) rawText = "you";

    host.hidden = false;
    host.setAttribute("aria-label", rawText);
    host.title = "Click to replay calligraphy";
    host.style.cursor = "pointer";

    var words = rawText.split(/\s+/);
    var wordElements = [];
    host.innerHTML = "";

    words.forEach(function (w, wIdx) {
      if (wIdx > 0) {
        var sp = el("span", "calligraphy-space", " ");
        sp.setAttribute("aria-hidden", "true");
        host.appendChild(sp);
      }
      var wSpan = el("span", "calligraphy-word", w);
      wSpan.setAttribute("aria-hidden", "true");
      wSpan.style.setProperty("--w-prog", "0%");
      host.appendChild(wSpan);
      wordElements.push(wSpan);
    });

    // Artisan luxury 24K gold & royal rosewood calligraphy fountain pen
    var pen = el("div", "calligraphy-pen is-hidden");
    pen.id = "calligraphyPen";
    pen.setAttribute("aria-hidden", "true");
    pen.innerHTML =
      '<svg viewBox="0 0 70 100" class="calligraphy-pen__svg">' +
        '<defs>' +
          '<linearGradient id="nibGold" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="#FFFDE8"/>' +
            '<stop offset="18%" stop-color="#FCE082"/>' +
            '<stop offset="42%" stop-color="#E1B33B"/>' +
            '<stop offset="72%" stop-color="#966A17"/>' +
            '<stop offset="100%" stop-color="#523607"/>' +
          '</linearGradient>' +
          '<linearGradient id="nibRhodium" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="#FFFFFF"/>' +
            '<stop offset="50%" stop-color="#E2E2E2"/>' +
            '<stop offset="100%" stop-color="#9E9E9E"/>' +
          '</linearGradient>' +
          '<linearGradient id="barrelGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="#7D2648"/>' +
            '<stop offset="28%" stop-color="#581630"/>' +
            '<stop offset="65%" stop-color="#360B1C"/>' +
            '<stop offset="100%" stop-color="#18030B"/>' +
          '</linearGradient>' +
          '<linearGradient id="barrelShine" x1="0%" y1="100%" x2="100%" y2="0%">' +
            '<stop offset="0%" stop-color="transparent"/>' +
            '<stop offset="42%" stop-color="rgba(255,255,255,0.55)"/>' +
            '<stop offset="54%" stop-color="rgba(255,255,255,0.15)"/>' +
            '<stop offset="100%" stop-color="transparent"/>' +
          '</linearGradient>' +
          '<linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="60%">' +
            '<stop offset="0%" stop-color="#FFF8D0"/>' +
            '<stop offset="35%" stop-color="#E5BF55"/>' +
            '<stop offset="70%" stop-color="#A37318"/>' +
            '<stop offset="100%" stop-color="#634208"/>' +
          '</linearGradient>' +
          '<linearGradient id="gripGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="#3D3D3D"/>' +
            '<stop offset="40%" stop-color="#222222"/>' +
            '<stop offset="80%" stop-color="#141414"/>' +
            '<stop offset="100%" stop-color="#080808"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<g>' +
          '<!-- Barrel body (lacquered deep royal rosewood) -->' +
          '<path d="M56 8 C60 12, 63 17, 60 21 L38 50 L28 38 L50 9 C52 7, 54 7, 56 8 Z" fill="url(#barrelGrad)"/>' +
          '<path d="M56 8 C60 12, 63 17, 60 21 L38 50 L28 38 L50 9 C52 7, 54 7, 56 8 Z" fill="url(#barrelShine)"/>' +
          '<!-- Gold Barrel Center Band -->' +
          '<path d="M38 49 L41 53 L35 58 L32 54 Z" fill="url(#goldTrim)" stroke="#5E3E08" stroke-width="0.4"/>' +
          '<line x1="39" y1="51" x2="33" y2="56" stroke="#4A2E04" stroke-width="0.6" stroke-dasharray="1,1"/>' +
          '<!-- Contoured Grip Section (Obsidian Resin) -->' +
          '<path d="M32 54 L35 58 C33 63, 29 69, 25 72 L22 67 C26 64, 30 59, 32 54 Z" fill="url(#gripGrad)"/>' +
          '<path d="M32 54 L35 58 C33 63, 29 69, 25 72 L22 67 C26 64, 30 59, 32 54 Z" fill="url(#barrelShine)"/>' +
          '<!-- Gold Grip Collar / Nib Mount Ring -->' +
          '<path d="M25 71 L27 74 L22 78 L20 75 Z" fill="url(#goldTrim)" stroke="#5E3E08" stroke-width="0.4"/>' +
          '<!-- 24K Gold Nib Base -->' +
          '<path d="M22 76 C25 75, 29 74, 27 79 C25 82, 17 89, 10 86 C13 81, 16 75, 20 75 Z" fill="url(#nibGold)" stroke="#6E4909" stroke-width="0.55"/>' +
          '<!-- Two-tone Rhodium Inlay on Nib -->' +
          '<path d="M21 77 C23 76, 25 76, 24 79 C22 81, 17 85, 12 85 C14 82, 17 78, 19 77 Z" fill="url(#nibRhodium)" opacity="0.75"/>' +
          '<!-- Baroque Filigree Engraving on Nib Wings -->' +
          '<path d="M23 78 Q22 80, 20 81 Q21 82, 23 80" fill="none" stroke="#7E540C" stroke-width="0.4"/>' +
          '<path d="M17 82 Q18 80, 19 82" fill="none" stroke="#7E540C" stroke-width="0.4"/>' +
          '<!-- Heart-shaped Breather Hole -->' +
          '<path d="M17.5 81 C18.2 80.2, 19 80.5, 18.5 81.3 L17.5 82.2 L16.5 81.3 C16 80.5, 16.8 80.2, 17.5 81 Z" fill="#401222"/>' +
          '<!-- Nib Ink Slit from Breather Hole to Writing Tip -->' +
          '<line x1="10" y1="86" x2="17.5" y2="82.2" stroke="#3D0E1F" stroke-width="0.6"/>' +
          '<!-- Iridium Writing Tip (Point of Contact) -->' +
          '<circle cx="10.2" cy="85.8" r="1.1" fill="#E5E5E5" stroke="#4A4A4A" stroke-width="0.3"/>' +
          '<!-- Fresh Wet Ink Bead at Tip -->' +
          '<circle cx="10" cy="86" r="1.6" fill="#8E3A5D" opacity="0.95"/>' +
          '<circle cx="9.5" cy="85.4" r="0.55" fill="#FFFFFF" opacity="0.9"/>' +
        '</g>' +
      '</svg>';
    host.appendChild(pen);

    var hasAnimated = false;
    var animRaf = null;

    function finishSequence() {
      // Pen lifts up gracefully along its writing angle and fades out
      pen.style.transition = "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease";
      var curTransform = pen.style.transform || "";
      var m = curTransform.match(/translate3d\(([^,]+)px,\s*([^,]+)px/);
      if (m) {
        var px = parseFloat(m[1]), py = parseFloat(m[2]);
        pen.style.transform = "translate3d(" + (px + 22) + "px, " + (py - 32) + "px, 0)";
      }
      pen.classList.add("is-hidden");

      setTimeout(function () {
        var cue = $("scrollCue");
        if (cue) cue.classList.add("is-shown");
        SCROLL_LOCK.unlock();
      }, 350);
    }

    function runAnimation(isReplay) {
      if (animRaf) cancelAnimationFrame(animRaf);

      var cue = $("scrollCue");
      if (reduced) {
        wordElements.forEach(function (w) {
          w.classList.add("is-done");
          w.classList.remove("is-active");
          w.style.setProperty("--w-prog", "100%");
        });
        pen.classList.add("is-hidden");
        if (cue) cue.classList.add("is-shown");
        SCROLL_LOCK.unlock();
        return;
      }

      if (!isReplay) {
        SCROLL_LOCK.lock();
        if (cue) cue.classList.remove("is-shown");
      }

      // Reset all words
      wordElements.forEach(function (w) {
        w.classList.remove("is-done", "is-active");
        w.style.setProperty("--w-prog", "0%");
      });
      pen.classList.remove("is-hidden");
      pen.style.transition = "none";

      if (wordElements.length === 0) {
        finishSequence();
        return;
      }

      var hostRect = host.getBoundingClientRect();
      var firstWordRect = wordElements[0].getBoundingClientRect();
      var initX = firstWordRect.left - hostRect.left;
      var initY = (firstWordRect.top - hostRect.top) + (firstWordRect.height * 0.72);
      // Writing tip of the pen is anchored at (10, 76)
      pen.style.transform = "translate3d(" + (initX - 10).toFixed(1) + "px, " + (initY - 76).toFixed(1) + "px, 0)";
      pen.classList.add("is-writing");

      var currentWordIdx = 0;

      function startWritingWord(wIdx) {
        if (wIdx >= wordElements.length) {
          finishSequence();
          return;
        }

        currentWordIdx = wIdx;
        var currentEl = wordElements[wIdx];
        currentEl.classList.add("is-active");

        var textContent = currentEl.textContent || "";
        // Duration tuned for cursive flow: ~85ms per character, minimum 280ms
        var wordDuration = Math.max(280, Math.min(850, textContent.length * 85));
        var startTime = performance.now();

        function drawFrame(now) {
          var elapsed = now - startTime;
          var progress = Math.min(1, elapsed / wordDuration);

          currentEl.style.setProperty("--w-prog", (progress * 100).toFixed(1) + "%");

          // Track nib tip (10, 86) proportionally to current pen dimensions
          var hRect = host.getBoundingClientRect();
          var wRect = currentEl.getBoundingClientRect();
          var targetX = (wRect.left - hRect.left) + (progress * wRect.width);
          var baselineY = (wRect.top - hRect.top) + (wRect.height * 0.72);
          var wobble = Math.sin(progress * Math.PI * 8) * 3.0;
          var targetY = baselineY + wobble;

          var penW = pen.offsetWidth || 56;
          var penH = pen.offsetHeight || 80;
          var tipOffX = penW * (10 / 70);
          var tipOffY = penH * (86 / 100);

          pen.style.transition = "none";
          pen.style.transform = "translate3d(" + (targetX - tipOffX).toFixed(1) + "px, " + (targetY - tipOffY).toFixed(1) + "px, 0)";

          if (progress < 1) {
            animRaf = requestAnimationFrame(drawFrame);
          } else {
            currentEl.classList.add("is-done");
            currentEl.classList.remove("is-active");

            // Travel pen to start of next word (or finish)
            var nextIdx = wIdx + 1;
            if (nextIdx < wordElements.length) {
              var nextEl = wordElements[nextIdx];
              var nwRect = nextEl.getBoundingClientRect();
              var nextX = nwRect.left - hRect.left;
              var nextY = (nwRect.top - hRect.top) + (nwRect.height * 0.72);

              pen.style.transition = "transform 0.14s ease-out";
              pen.style.transform = "translate3d(" + (nextX - tipOffX).toFixed(1) + "px, " + (nextY - tipOffY).toFixed(1) + "px, 0)";

              setTimeout(function () {
                startWritingWord(nextIdx);
              }, 140);
            } else {
              finishSequence();
            }
          }
        }

        animRaf = requestAnimationFrame(drawFrame);
      }

      // Start immediately in sync with the garland page start
      startWritingWord(0);
    }

    triggerGuestHandwriting = function () {
      if (hasAnimated) return;
      hasAnimated = true;
      runAnimation(false);
    };

    host.addEventListener("click", function () {
      runAnimation(true);
    });

    if (reduced) {
      wordElements.forEach(function (w) {
        w.classList.add("is-done");
        w.style.setProperty("--w-prog", "100%");
      });
      pen.classList.add("is-hidden");
      var cue = $("scrollCue");
      if (cue) cue.classList.add("is-shown");
      SCROLL_LOCK.unlock();
      hasAnimated = true;
    } else if (!document.body.classList.contains("intro-open")) {
      setTimeout(function () {
        if (triggerGuestHandwriting) triggerGuestHandwriting();
      }, 500);
    }
  }

  (function hero() {
    var h = $("heroNames");
    h.appendChild(document.createTextNode(t(first)));
    h.appendChild(el("span", "hero__amp", "&"));
    h.appendChild(document.createTextNode(t(second)));

    var halt = $("heroGu");
    if (halt) halt.hidden = true;

    /* The hero is the invitation itself, and it is one sentence laid out over
       four lines around the names:

         Jabuani & Nakrani Family / cordially invite / Mr Dhrumil Shah /
         to the wedding of / Jeet & Bhavini

       A ?for= link supplies the third line. Without one there is no name to
       place, so it falls back to "you" and the sentence still reads. */
    put("heroHosts",  u("inviteHosts"));
    put("heroInvite", u("inviteVerb"));
    renderGuestHandwriting();
    put("heroTo",     u("inviteOccasion"));
  }());

  /* -- invitation --------------------------------------------------------- */

  (function invitation() {
    var inv = W.invitation;
    put("invBlessing", t(inv.blessing));
    put("invLead", t(inv.lead));

    var host = $("invParties");
    if (!host) return;
    function party(person, parents) {
      host.appendChild(el("p", "invite__name", t(person)));
      if (parents) {
        var pEl = el("p", "invite__parents");
        var val = t(parents);
        if (Array.isArray(val)) {
          val.forEach(function (line, idx) {
            if (idx > 0) pEl.appendChild(document.createElement("br"));
            pEl.appendChild(document.createTextNode(line));
          });
        } else if (typeof val === "string" && val.indexOf("\n") !== -1) {
          val.split("\n").forEach(function (line, idx) {
            if (idx > 0) pEl.appendChild(document.createElement("br"));
            pEl.appendChild(document.createTextNode(line.trim()));
          });
        } else {
          pEl.textContent = val;
        }
        host.appendChild(pEl);
      }
    }
    party(groom, inv.groomLine);
    host.appendChild(el("p", "invite__weds", "—   " + t(inv.weds) + "   —"));
    party(bride, inv.brideLine);
  }());

  /* -- events: five individual invitation cards ---------------------------
     Every card is built by the same factory from one entry in W.events, so a
     card is edited in content.js and nowhere else.                         */

  (function events() {
    var list = $("eventsList");
    if (!list) return;
    var section = list.closest(".events");

    /* ---- royal unrolling wedding scroll card (farman style) ----
       Cards render rolled shut (--roll: 0) and unroll open in step with
       scroll position - see cardRoll() below, which sets --roll every
       frame - replacing the old lateral slide-in entirely. */
    function eventCard(ev, i) {
      var card = el("article", "scroll-card");
      card.style.setProperty("--roll", 0);
      card.style.setProperty("--roll-fr", "0fr");
      card.setAttribute("data-ink", ev.ink);
      card.setAttribute("data-paper", ev.paper);
      card.setAttribute("data-key", ev.key);
      card.id = "scroll-card-" + ev.key;
      if (LANG === "gu") card.classList.add("scroll-card--gu");

      // 1. Top Roller Unit: Ornate rod with carved lotus finials & painted lotus cylinder
      var topRoller = el("div", "scroll-card__roller scroll-card__roller--top");
      topRoller.setAttribute("aria-hidden", "true");
      var topImg = el("img", "scroll-card__roller-img");
      topImg.src = "assets/generated/scroll_user_roller_top.png";
      topImg.alt = "";
      topRoller.appendChild(topImg);
      card.appendChild(topRoller);

      // 2. Unrolling Parchment Body Container. Not interactive - it used to
      // open a detail dialog on tap, but that dialog only ever repeated
      // what's already printed on the card face, so it was removed along
      // with the tap handler rather than kept as a redundant popup.
      var unrollTrack = el("div", "scroll-card__unroll-track");
      var paper = el("div", "scroll-card__sheet");

      // Top paper curl shadow
      var curlTop = el("div", "scroll-card__curl-shadow scroll-card__curl-shadow--top");
      curlTop.setAttribute("aria-hidden", "true");
      paper.appendChild(curlTop);

      // Card Content Body (in normal document flow so parchment expands to full height)
      var body = el("div", "scroll-card__body");

      // Header: strictly show active language
      var header = el("div", "scroll-card__header inv__header");
      if (LANG === "gu") {
        header.appendChild(el("h3", "scroll-card__title inv__script inv__script--gu", ev.gu));
      } else {
        header.appendChild(el("h3", "scroll-card__title inv__script", ev.en));
      }
      if (ev.tagline) {
        header.appendChild(el("p", "scroll-card__tagline", t(ev.tagline)));
      }
      body.appendChild(header);

      // Center Ceremony Artwork
      var illWrap = el("div", "scroll-card__ill-wrap inv__ill-wrap");
      if (ev.illustration) {
        var ill = el("img", "scroll-card__ill inv__ill");
        ill.src = ev.illustration;
        ill.alt = "";
        ill.loading = "lazy";
        illWrap.appendChild(ill);
      }
      body.appendChild(illWrap);

      // Ceremony Details (Bottom)
      var meta = el("div", "scroll-card__meta inv__meta");
      var isGu = (LANG === "gu");
      var dayName = "";
      var dayNum = "";
      var monthName = isGu ? "ડિસેમ્બર" : "DECEMBER";

      if (ev.dateShort && ev.dateShort.month) {
        monthName = t(ev.dateShort.month);
      }

      if (ev.key === "mameru" || ev.key === "sangeet") {
        dayName = isGu ? "મંગળવાર" : "TUESDAY";
        dayNum = isGu ? "૧" : "1ST";
      } else {
        dayName = isGu ? "બુધવાર" : "WEDNESDAY";
        dayNum = isGu ? "૨" : "2ND";
      }

      var dateLine = el("div", "scroll-card__dateline inv__dateline");
      dateLine.appendChild(el("span", "inv__date-part", dayName));
      dateLine.appendChild(el("span", "inv__date-sep", "|"));
      dateLine.appendChild(el("span", "inv__date-part inv__date-part--num", dayNum));
      dateLine.appendChild(el("span", "inv__date-sep", "|"));
      dateLine.appendChild(el("span", "inv__date-part", (monthName || "").toUpperCase()));
      meta.appendChild(dateLine);

      // Year Line: 2026
      meta.appendChild(el("div", "scroll-card__year inv__year", isGu ? "૨૦૨૬" : "2026"));

      // Schedule / Timings
      var times = (ev.times || []).filter(function (tm) { return tm.value; });
      if (times.length > 1) {
        var sched = el("div", "scroll-card__schedule inv__schedule");
        times.forEach(function (tm) {
          var row = el("div", "inv__schedule-row");
          var lbl = t(tm.label);
          if (lbl) row.appendChild(el("span", "inv__sched-lbl", lbl));
          row.appendChild(el("span", "inv__sched-val", tm.value));
          sched.appendChild(row);
        });
        meta.appendChild(sched);
      } else if (times.length === 1) {
        meta.appendChild(el("div", "scroll-card__time inv__time", times[0].value));
      }

      // Venue
      if (ev.venue) {
        var venLines = t(ev.venue).split("\n");
        var venDiv = el("div", "scroll-card__venue inv__venue");
        venLines.forEach(function (line, idx) {
          if (idx > 0) venDiv.appendChild(el("br"));
          venDiv.appendChild(document.createTextNode(line.toUpperCase()));
        });
        meta.appendChild(venDiv);
      }

      body.appendChild(meta);
      paper.appendChild(body);

      // Bottom paper curl shadow
      var curlBot = el("div", "scroll-card__curl-shadow scroll-card__curl-shadow--bottom");
      curlBot.setAttribute("aria-hidden", "true");
      paper.appendChild(curlBot);

      unrollTrack.appendChild(paper);
      card.appendChild(unrollTrack);

      // 3. Bottom Roller Unit: Matching rod with carved finials
      var botRoller = el("div", "scroll-card__roller scroll-card__roller--bottom");
      botRoller.setAttribute("aria-hidden", "true");
      var botImg = el("img", "scroll-card__roller-img");
      botImg.src = "assets/generated/scroll_user_roller_bottom.png";
      botImg.alt = "";
      botRoller.appendChild(botImg);
      card.appendChild(botRoller);

      return card;
    }

    W.events.forEach(function (ev, i) { list.appendChild(eventCard(ev, i)); });

    /* Roll each card open IN STEP WITH SCROLL, not on a canned transition.
       --roll goes 0 (rolled shut) -> 1 (fully open) as the card's top
       travels from 88% down the viewport to 38% down it, and runs back in
       reverse if you scroll back up.

       The target is recomputed from the real scroll position on every
       scroll/resize, but --roll itself EASES toward that target a little
       each frame (LERP_RATE below) rather than snapping straight to it.
       A raw 1:1 tie to scroll felt like a slider being dragged - every
       stutter in the input scroll (a trackpad tick, a janky frame) showed
       up directly in the roll. Easing toward the target is what "smooth"
       actually means for a scroll-linked animation: it keeps ticking via
       rAF for a few frames after each scroll event to settle, instead of
       only updating exactly when a scroll event fires. */
    (function cardRoll() {
      var cards = Array.prototype.slice.call(list.querySelectorAll(".scroll-card"));
      // The eyebrow/title/caption/rule above the cards (.events__lead) used
      // to fade in on the generic one-shot .reveal observer, which fired as
      // soon as the section's edge crossed into view - well before card 1
      // had scrolled anywhere near open. Folding it into this SAME
      // targets/state loop, using the same top-based progress formula, is
      // what actually makes it arrive in step with card 1 instead of early.
      // --lead-roll is set on the section itself so every .events__lead
      // descendant picks it up (custom properties inherit).
      var leadRef = section && section.querySelector(".eyebrow");
      var targets = cards.map(function (c) { return { el: c, roll: "--roll", rollFr: "--roll-fr" }; });
      if (leadRef) targets.push({ el: leadRef, setEl: section, roll: "--lead-roll" });

      if (reduced) {
        targets.forEach(function (tgt) {
          (tgt.setEl || tgt.el).style.setProperty(tgt.roll, 1);
          if (tgt.rollFr) (tgt.setEl || tgt.el).style.setProperty(tgt.rollFr, "1fr");
        });
        return;
      }
      // Measured with a scripted scroll + rAF frame-timing capture: this
      // loop itself was never dropping frames (avg ~9ms, zero frames over
      // 33ms) - the roughness people feel here is the easing curve, not
      // jank. 0.22 catches up to a new scroll target in ~14 frames (~0.2s),
      // closer to a snap than a glide; 0.14 takes ~26 frames (~0.4s) and
      // reads as a genuine ease rather than the roll chasing the scrollbar.
      var LERP_RATE = 0.14;
      // Once a card (or the heading) has fully opened, it STAYS open even
      // if you scroll back up past it - a card that unrolls and re-rolls
      // shut every time you pass it read as glitchy, not "synced". locked
      // pins target at 1 for good the first time p reaches 1; until then,
      // position keeps driving it normally (including closing back down if
      // you scroll away before it ever finished opening).
      var state = targets.map(function () { return { cur: 0, target: 0, locked: false }; });
      var ticking = false;

      function computeTargets() {
        var vh = window.innerHeight;
        var startY = vh * 0.90, endY = vh * 0.52;
        targets.forEach(function (tgt, i) {
          if (state[i].locked) { state[i].target = 1; return; }
          var top = tgt.el.getBoundingClientRect().top;
          var p = (startY - top) / (startY - endY);
          if (p < 0) p = 0; else if (p > 1) p = 1;
          state[i].target = p;
          if (p >= 1) state[i].locked = true;
        });
      }

      // Mobile browsers throttle/batch 'scroll' events hard during momentum
      // flicks - they can go a third of a second between events while the
      // page is visibly still moving. A loop that only advances when a
      // scroll event fires (and stops once cur reaches target) goes stale
      // in those gaps: position keeps changing, target doesn't, and the
      // catch-up on the next event reads as a stutter/snap rather than
      // smooth tracking. Running continuously off rAF - sampling position
      // every single rendered frame regardless of whether a scroll event
      // happened to fire - is what actually keeps this glued to the
      // scrollbar. It only stops for good once every target is locked, so
      // there is nothing left it could ever need to notice.
      function allLocked() {
        return state.every(function (s) { return s.locked; });
      }

      function tick() {
        computeTargets();
        state.forEach(function (s, i) {
          var d = s.target - s.cur;
          if (Math.abs(d) > 0.001) s.cur += d * LERP_RATE;
          else s.cur = s.target;
          var tgt = targets[i];
          var host = tgt.setEl || tgt.el;
          host.style.setProperty(tgt.roll, s.cur.toFixed(3));
          if (tgt.rollFr) host.style.setProperty(tgt.rollFr, s.cur.toFixed(3) + "fr");
        });
        if (!allLocked()) requestAnimationFrame(tick);
        else ticking = false;
      }

      function kick() {
        if (!ticking) { ticking = true; requestAnimationFrame(tick); }
      }

      window.addEventListener("scroll", kick, { passive: true });
      window.addEventListener("resize", kick, { passive: true });
      kick();
    }());

    /* Ensure titles are balanced and prominent across cards */
    function fitTitles() {
      Array.prototype.forEach.call(document.querySelectorAll(".inv__title"), function (t) {
        var card = t.closest(".inv");
        var gu = t.querySelector(".inv__gu");
        if (!card || !gu) return;
        t.style.setProperty("--tscale", "1");
        var natural = gu.getBoundingClientRect().width;
        if (!natural) return;

        var scale = Math.min(1.25, (card.clientWidth * 0.76) / natural);
        scale = Math.max(0.95, scale);
        t.style.setProperty("--tscale", scale.toFixed(3));
      });
    }

    /* Fitting has to happen after BOTH the webfont and the illustrations have
       landed. Measuring against the fallback font gives the wrong width, and
       measuring before a lazy image has loaded gives the wrong height - the
       card looks like it fits, then the picture arrives and pushes the content
       out of the bottom. So re-fit on every one of those events. */
    var fitPending;
    function scheduleFit() {
      clearTimeout(fitPending);
      fitPending = setTimeout(fitTitles, 60);
    }

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleFit);
    window.addEventListener("load", scheduleFit);
    window.addEventListener("resize", scheduleFit);

    Array.prototype.forEach.call(list.querySelectorAll("img"), function (img) {
      if (img.complete) return;
      img.addEventListener("load", scheduleFit);
      img.addEventListener("error", scheduleFit);
    });

  }());

  /* -- families ----------------------------------------------------------- */

  (function families() {
    var p = W.hostsPaired, a = W.hostsAwaiting;

    var boxA = $("hostsPaired");
    if (p && p.pairs && p.pairs.length) {
      boxA.appendChild(el("h3", guIf("hosts__heading reveal"), t(p.heading)));
      var ul = el("ul", "pairs");
      p.pairs.forEach(function (pair, pi) {
        var li = el("li", "reveal " + (pi % 2 ? "reveal--right" : "reveal--left"));
        li.style.setProperty("--d", (pi % 6) * 60 + "ms");
        li.appendChild(el("span", guIf("l"), t(pair[0])));
        li.appendChild(el("span", "dot", "◆"));
        li.appendChild(el("span", guIf("r"), t(pair[1])));
        ul.appendChild(li);
      });
      boxA.appendChild(ul);
    } else { boxA.hidden = true; }

    var boxB = $("hostsAwaiting");
    if (a && a.names && a.names.length) {
      boxB.appendChild(ornRule());
      boxB.appendChild(el("h3", guIf("hosts__heading reveal"), t(a.heading)));
      var ul2 = el("ul", "awaiting");
      a.names.forEach(function (nm, ni) {
        var li = el("li", guIf("reveal " + (ni % 2 ? "reveal--right" : "reveal--left")));
        li.style.setProperty("--d", (ni % 6) * 60 + "ms");
        li.textContent = t(nm);
        ul2.appendChild(li);
      });
      boxB.appendChild(ul2);
      if (a.solo)     boxB.appendChild(el("p", guIf("awaiting--solo reveal"), t(a.solo)));
      if (a.children) boxB.appendChild(el("p", guIf("awaiting--kids reveal"), t(a.children)));
    } else { boxB.hidden = true; }
  }());

  /* -- gallery ------------------------------------------------------------ */

  (function gallery() {
    var section = $("gallery");
    var photos = (W.gallery && W.gallery.photos) || [];
    if (!photos.length) { section.hidden = true; return; }

    put("galleryTitle", t(W.gallery.heading));
    put("gallerySubtitle", t(W.gallery.subheading));
    put("galleryCaption", t(W.gallery.caption));

    /* ---- a depth carousel ---------------------------------------------
       One focused centre card, the rest scaled down and stacked toward the
       edges by distance. `current` is a continuous number, not an integer -
       mid-drag it sits between two cards, which is what makes the drag feel
       like it is actually moving the deck rather than jumping card to card.
       On release it snaps to the nearest whole index. */
    var stage = $("galleryStage");
    var track = $("galleryTrack");
    var prevBtn = $("galPrev");
    var nextBtn = $("galNext");

    var cards = photos.map(function (p, i) {
      var fig = el("figure", "depthcar__card");
      fig.setAttribute("role", "listitem");
      var img = el("img");
      img.src = p.src;
      img.alt = t(p.alt);
      if (i) img.loading = "lazy";
      fig.appendChild(img);
      track.appendChild(fig);
      return fig;
    });

    prevBtn.setAttribute("aria-label", u("aPrevPhoto"));
    nextBtn.setAttribute("aria-label", u("aNextPhoto"));
    prevBtn.innerHTML = "&#8249;";
    nextBtn.innerHTML = "&#8250;";
    if (cards.length < 2) { prevBtn.hidden = nextBtn.hidden = true; }

    var current = 0;             // continuous focus position, 0..cards.length-1
    var gap = 190;               // px between card centres, recalculated below
    var falloff = 0.16;          // scale lost per card-step away from centre
    var minScale = 0.55;

    function measure() {
      // The gap and falloff both track the stage width, so the deck reads
      // the same share of the screen on a phone as on a desktop rather than
      // spilling past the edges or shrinking to a strip.
      var w = stage.clientWidth;
      gap = Math.max(96, Math.min(250, w * 0.34));
      falloff = w < 480 ? 0.22 : 0.16;
      minScale = w < 480 ? 0.5 : 0.55;
      layout();
    }

    function layout() {
      cards.forEach(function (card, i) {
        var d = i - current;
        var abs = Math.abs(d);
        var scale = Math.max(minScale, 1 - abs * falloff);
        var x = d * gap;
        card.style.transform =
          "translate(-50%, -50%) translateX(" + x.toFixed(1) + "px) scale(" + scale.toFixed(3) + ")";
        card.style.zIndex = String(1000 - Math.round(abs * 10));
        card.style.opacity = String(Math.max(0.45, 1 - abs * 0.16));
        card.setAttribute("aria-hidden", abs < 0.5 ? "false" : "true");
      });
    }

    function clamp(n) { return Math.max(0, Math.min(cards.length - 1, n)); }

    var snapping = false;
    function snapTo(index, instant) {
      current = clamp(index);
      snapping = !instant;
      track.classList.toggle("is-settling", snapping);
      layout();
    }
    track.addEventListener("transitionend", function () {
      track.classList.remove("is-settling");
    });

    /* ---- drag (mouse + touch, one Pointer Events path for both) -------- */
    var dragging = false, startX = 0, startCurrent = 0, lastX = 0, lastT = 0, vel = 0;

    stage.addEventListener("pointerdown", function (e) {
      if (cards.length < 2) return;
      dragging = true;
      track.classList.remove("is-settling");
      startX = lastX = e.clientX;
      lastT = performance.now();
      startCurrent = current;
      vel = 0;
      stage.setPointerCapture(e.pointerId);
      stage.classList.add("is-dragging");
    });
    stage.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var now = performance.now();
      var dt = Math.max(1, now - lastT);
      vel = (e.clientX - lastX) / dt;
      lastX = e.clientX; lastT = now;
      var dx = e.clientX - startX;
      current = clamp(startCurrent - dx / gap);
      layout();
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove("is-dragging");
      // a flick keeps going a little, weighted by how fast the release was
      var glide = -vel * 90 / gap;
      snapTo(Math.round(current + glide));
    }
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);

    // a plain click/tap on an off-centre card brings it to focus
    cards.forEach(function (card, i) {
      card.addEventListener("click", function () {
        if (Math.abs(i - current) > 0.05) snapTo(i);
      });
    });

    /* ---- wheel: trackpad horizontal swipe, or a vertical wheel --------- */
    var wheelTimer;
    stage.addEventListener("wheel", function (e) {
      if (cards.length < 2) return;
      e.preventDefault();
      track.classList.remove("is-settling");
      var delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      current = clamp(current + delta / gap);
      layout();
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(function () { snapTo(Math.round(current)); }, 140);
    }, { passive: false });

    /* ---- buttons + keyboard --------------------------------------------- */
    prevBtn.addEventListener("click", function () { snapTo(Math.round(current) - 1); });
    nextBtn.addEventListener("click", function () { snapTo(Math.round(current) + 1); });
    stage.setAttribute("tabindex", "0");
    stage.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft")  { snapTo(Math.round(current) - 1); }
      if (e.key === "ArrowRight") { snapTo(Math.round(current) + 1); }
    });

    /* ---- autoplay: steps on its own at a medium-high pace, and gets out
       of the way the instant a person actually touches the deck ---------
       Off while prefers-reduced-motion is set, while the tab is in the
       background, and while the carousel has scrolled out of view - no
       point ticking a deck nobody can see, and it avoids the deck landing
       several cards further along than where the visitor left it. */
    var AUTO_MS = 1100;           // fast: barely a beat between photos
    var RESUME_MS = 3200;        // how long a touch/drag/click buys before it resumes
    var autoTimer = null, resumeTimer = null;
    var pausedByUser = false, inView = false;

    function autoStep() {
      snapTo((Math.round(current) + 1) % cards.length);
    }
    function scheduleAuto() {
      clearTimeout(autoTimer);
      if (reduced || pausedByUser || document.hidden || !inView || cards.length < 2) return;
      autoTimer = setTimeout(function () { autoStep(); scheduleAuto(); }, AUTO_MS);
    }
    function pauseAuto(temporary) {
      pausedByUser = true;
      clearTimeout(autoTimer);
      clearTimeout(resumeTimer);
      if (temporary !== false) {
        resumeTimer = setTimeout(function () { pausedByUser = false; scheduleAuto(); }, RESUME_MS);
      }
    }

    stage.addEventListener("pointerdown", function () { pauseAuto(); });
    stage.addEventListener("wheel", function () { pauseAuto(); }, { passive: true });
    /* pointerType check: touch fires a synthetic mouseenter on tap with no
       matching mouseleave on some browsers, which would pause autoplay for
       good after a single tap. Real mice only. */
    stage.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") pauseAuto(false); });
    stage.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "mouse") { pausedByUser = false; scheduleAuto(); }
    });
    prevBtn.addEventListener("click", function () { pauseAuto(); });
    nextBtn.addEventListener("click", function () { pauseAuto(); });
    stage.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") pauseAuto();
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) clearTimeout(autoTimer); else scheduleAuto();
    });
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView) scheduleAuto(); else clearTimeout(autoTimer);
    }, { threshold: 0.3 }).observe(stage);

    window.addEventListener("resize", measure);
    measure();
    snapTo(0, true);
  }());

  /* The instant the calendar and the countdown both work from. */
  var startDate = new Date(W.countdownTo);

  /* -- save the date: the wedding month, with its days marked --------------
     Month, length and first weekday are all derived from countdownTo, and the
     marked days from the event cards, so the calendar cannot drift from the
     dates printed elsewhere on the page. */

  (function calendar() {
    var grid = $("calGrid");
    if (!grid) return;

    var year  = startDate.getFullYear();
    var month = startDate.getMonth();

    // day 0 of the NEXT month is the last day of this one
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var firstWeekday = new Date(year, month, 1).getDay();   // 0 = Sunday

    var marked = {};
    (W.events || []).forEach(function (ev) {
      var d = ev.dateShort && parseInt(ev.dateShort.day, 10);
      if (d) marked[d] = true;
    });

    // the month's name and year matching reference
    var firstEvent = (W.events || [])[0];
    var mName = firstEvent && firstEvent.dateShort ? t(firstEvent.dateShort.month) : "December";
    put("calMonth", mName + " " + year);

    var heads = t(W.ui.calWeekdays) || [];
    heads.forEach(function (h) {
      grid.appendChild(el("span", "cal__head", h));
    });

    var i;
    for (i = 0; i < firstWeekday; i++) grid.appendChild(el("span", "cal__pad"));
    for (i = 1; i <= daysInMonth; i++) {
      var cell = el("span", marked[i] ? "cal__day cal__day--on" : "cal__day", String(i));
      if (marked[i]) {
        cell.setAttribute("aria-current", "date");
        cell.title = t(W.headline.datesLabel);
      }
      grid.appendChild(cell);
    }

    var cityEl = $("calCityLine");
    if (cityEl) {
      var city = t(W.headline.city);
      if (city) cityEl.textContent = city;
    }
    var regardsEl = $("calRegardsTitle");
    if (regardsEl) {
      regardsEl.textContent = LANG === "gu" ? "સ્નેહાધીન" : "Warm Regards";
    }
    var familyEl = $("calFamily");
    if (familyEl) {
      familyEl.textContent = LANG === "gu" ? "જબુઆણી અને નાકરાણી પરિવાર" : "Jabuani & Nakrani Family";
    }
  }());

  /* -- postcard location -------------------------------------------------- */

  (function postcard() {
    var pc = W.postcard;
    if (!pc) return;

    var coupleEl = $("pcCouple");
    if (coupleEl) coupleEl.textContent = t(pc.couple);

    var datesEl = $("pcDates");
    if (datesEl) datesEl.textContent = t(pc.dates);

    var venueEl = $("pcVenue");
    if (venueEl) venueEl.textContent = t(pc.venueName);

    var addressEl = $("pcAddress");
    if (addressEl) {
      var addr = t(pc.address);
      addressEl.innerHTML = addr.replace(/\n/g, "<br>");
    }

    var noteEl = $("pcNote");
    if (noteEl) noteEl.textContent = t(pc.note);

    var mapBtn = $("pcMapBtn");
    var btnLabel = $("pcBtnLabel");
    if (mapBtn && pc.mapsUrl) mapBtn.href = pc.mapsUrl;
    if (btnLabel) btnLabel.textContent = t(pc.buttonText);

    var postmarkText = $("postmarkPathText");
    if (postmarkText && pc.postmarkText) {
      postmarkText.textContent = t(pc.postmarkText);
    }
  }());

  /* -- countdown ---------------------------------------------------------- */

  (function countdown() {
    var grid = $("cdGrid");
    $("cdTitle").innerHTML = u("countdownTitle");
    var units = [["days", u("cdDays")], ["hours", u("cdHours")],
                 ["minutes", u("cdMinutes")], ["seconds", u("cdSeconds")]];
    var nums = {};

    units.forEach(function (u, ui) {
      var wrap = el("div", "locket reveal " + (ui % 2 ? "reveal--right" : "reveal--left"));
      wrap.style.setProperty("--d", ui * 90 + "ms");
      var img = el("img");
      img.src = "assets/generated/countdown_locket.png";
      img.alt = ""; img.loading = "lazy";
      wrap.appendChild(img);

      var box = el("span", "locket__num");
      var b = el("b", null, "—");
      box.appendChild(b);
      box.appendChild(el("span", guIf(null), u[1]));
      wrap.appendChild(box);

      grid.appendChild(wrap);
      nums[u[0]] = b;
    });

    function tick() {
      var ms = startDate - Date.now();
      if (ms <= 0) {
        nums.days.textContent = nums.hours.textContent =
        nums.minutes.textContent = nums.seconds.textContent = "0";
        $("cdTitle").innerHTML = u("countdownArrived");
        return false;
      }
      var s = Math.floor(ms / 1000);
      nums.days.textContent    = Math.floor(s / 86400);
      nums.hours.textContent   = Math.floor(s % 86400 / 3600);
      nums.minutes.textContent = Math.floor(s % 3600 / 60);
      nums.seconds.textContent = s % 60;
      return true;
    }

    if (tick()) {
      var id = setInterval(function () { if (!tick()) clearInterval(id); }, 1000);
    }

    // sign-off
    $("signoffNames").innerHTML = "";
    $("signoffNames").appendChild(document.createTextNode(t(first) + " "));
    $("signoffNames").appendChild(el("em", null, "&"));
    $("signoffNames").appendChild(document.createTextNode(" " + t(second)));
    put("signoffDate", t(W.headline.datesLabel));
    put("signoffLine", t(W.footer.line));
  }());

  /* -- compliments + footer ----------------------------------------------- */

  (function compliments() {
    var c = W.compliments, section = $("compliments");
    if (!c || !c.from || !c.from.length) { section.hidden = true; return; }
    put("compHeading", t(c.heading));
    var host = $("compList");
    c.from.forEach(function (f) {
      var d = el("div");
      d.appendChild(el("p", "compliments__name", f.name));
      if (f.city) d.appendChild(el("p", guIf("compliments__city"), t(f.city)));
      host.appendChild(d);
    });
  }());

  $("footer").textContent =
    [W.couple.hashtag, t(W.footer.credit)].filter(Boolean).join("  ·  ");

  /* -- scroll reveal ------------------------------------------------------ */

  (function revealer() {
    var nodes = document.querySelectorAll(".reveal");
    if (reduced || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(nodes, function (n) { n.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);   // reveal once, then stop watching
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

    Array.prototype.forEach.call(nodes, function (n) { io.observe(n); });
  }());

  /* -- hero parallax + controls that follow the ground ------------------------------- */

  (function scrollFx() {
    var layers = Array.prototype.slice.call(document.querySelectorAll("[data-par]"));
    var closing = $("closing");
    var topBtn = $("topBtn");
    var queued = false;

    function frame() {
      queued = false;
      var y = window.pageYOffset || document.documentElement.scrollTop;

      if (!reduced) {
        for (var i = 0; i < layers.length; i++) {
          var f = parseFloat(layers[i].getAttribute("data-par")) || 0;
          // only worth moving while the hero is still in view
          if (y < window.innerHeight * 1.2) {
            layers[i].style.transform = "translate3d(0," + (y * f).toFixed(1) + "px,0)";
          }
        }
      }

      // flip the floating controls once the closing half is behind them
      if (closing) {
        var r = closing.getBoundingClientRect();
        document.body.classList.toggle("is-closing", r.top < window.innerHeight * 0.75);
      }

      if (topBtn) {
        topBtn.style.opacity = y > window.innerHeight * 0.8 ? "1" : "0";
        topBtn.style.pointerEvents = y > window.innerHeight * 0.8 ? "auto" : "none";
      }
    }

    function onScroll() {
      if (!queued) { queued = true; requestAnimationFrame(frame); }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    frame();

    if (topBtn) {
      topBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      });
    }
  }());

}());
