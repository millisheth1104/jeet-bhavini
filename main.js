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

  /* -- scrolling is fully free and responsive on the garland page --------- */
  var SCROLL_LOCK = (function () {
    return {
      lock: function () {},
      unlock: function () {},
      isLocked: function () { return false; }
    };
  }());

  /* -- language ------------------------------------------------------------
     The site reads in one language at a time. The visitor's choice is kept in
     localStorage; switching reloads, because re-rendering in place would mean
     tearing down the carousel, the countdown interval and every observer. A
     reload on a static site is cheaper and cannot half-apply.               */

  var LANGS = ["en", "gu"];
  var LANG = (function () {
    try {
      var m = location.search.match(/[?&]lang=([a-z]{2})/i);
      if (m && LANGS.indexOf(m[1].toLowerCase()) !== -1) {
        return m[1].toLowerCase();
      }
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

  var updateLangSwitchUI = null;
  var updateChromeUI = null;
  var updateIntroUI = null;
  var updateHeroUI = null;
  var updateInvitationUI = null;
  var updateEventsUI = null;
  var updateHostsUI = null;
  var updateComplimentsUI = null;
  var updateGalleryUI = null;
  var updateCalendarUI = null;
  var updatePostcardUI = null;
  var updateCountdownUI = null;

  /* Live in-place language switching: updates all visible text and typography
     instantly without jarring reloads, keeping the door animation and audio
     completely uninterrupted. */
  function setLang(next) {
    if (next === LANG) return;
    LANG = next;
    OTHER = LANG === "en" ? "gu" : "en";
    try {
      localStorage.setItem("wedding-lang", LANG);
    } catch (e) {}

    document.documentElement.setAttribute("lang", LANG);
    document.documentElement.setAttribute("data-lang", LANG);

    if (updateLangSwitchUI) updateLangSwitchUI();
    if (updateIntroUI) updateIntroUI();
    if (updateChromeUI) updateChromeUI();
    if (updateHeroUI) updateHeroUI();
    if (updateInvitationUI) updateInvitationUI();
    if (updateEventsUI) updateEventsUI();
    if (updateHostsUI) updateHostsUI();
    if (updateComplimentsUI) updateComplimentsUI();
    if (updateGalleryUI) updateGalleryUI();
    if (updateCalendarUI) updateCalendarUI();
    if (updatePostcardUI) updatePostcardUI();
    if (updateCountdownUI) updateCountdownUI();
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
    // 1. Encoded base64 token (?for=...)
    var m = location.search.match(/[?&]for=([^&]+)/);
    if (m) {
      try {
        var b64 = decodeURIComponent(m[1]).replace(/-/g, "+").replace(/_/g, "/");
        while (b64.length % 4) b64 += "=";
        var json = decodeURIComponent(escape(atob(b64)));
        var data = JSON.parse(json);
        if (data && typeof data === "object") GUEST = data;
      } catch (e) { GUEST = null; }
    }

    // 2. Query param (?name=... or ?guest=... or ?to=...)
    var gParam = location.search.match(/[?&](?:guest|name|to)=([^&]+)/i);
    if (gParam && (!GUEST || !GUEST.n)) {
      try {
        var rawSlug = decodeURIComponent(gParam[1]).replace(/[-_+]+/g, " ").trim();
        var formatted = rawSlug.replace(/\band\b/gi, "&").replace(/\b\w/g, function (l) { return l.toUpperCase(); });
        if (!GUEST) GUEST = { n: formatted, c: [] };
        else GUEST.n = formatted;
      } catch (e) {}
    }

    // 3. Clean pathname slug: e.g. /priya-and-raj-shah or /jeet-bhavini/priya-and-raj-shah
    if (!GUEST || !GUEST.n) {
      var segments = location.pathname.split("/").filter(function (s) {
        return s && s !== "index.html" && s !== "admin.html";
      });
      if (segments.length > 0) {
        var lastSeg = segments[segments.length - 1];
        // Ignore static file extensions and base folder names
        if (lastSeg !== "jeet-bhavini" && lastSeg !== "wedding" && lastSeg.indexOf(".") === -1) {
          var cleanSlug = decodeURIComponent(lastSeg).toLowerCase().trim()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

          // Check if guest exists in window.WEDDING_GUESTS or localStorage
          var matchedGuest = null;
          var localRaw = null;
          try {
            if (localStorage.getItem("wedding-db-initialized")) {
              localRaw = JSON.parse(localStorage.getItem("wedding-guest-links") || "[]");
            }
          } catch (e) {}

          var guestList = (localRaw && Array.isArray(localRaw)) ? localRaw :
            ((window.WEDDING_GUESTS && Array.isArray(window.WEDDING_GUESTS)) ? window.WEDDING_GUESTS : []);
          if (Array.isArray(guestList)) {
            for (var gi = 0; gi < guestList.length; gi++) {
              var candidate = guestList[gi];
              if (candidate && candidate.slug && candidate.slug.toLowerCase() === cleanSlug) {
                matchedGuest = candidate;
                break;
              }
            }
          }

          if (matchedGuest) {
            GUEST = {
              n: matchedGuest.name,
              c: matchedGuest.cards || []
            };
          } else {
            var rawSlug = decodeURIComponent(lastSeg).replace(/[-_+]+/g, " ").trim();
            var formatted = rawSlug.replace(/\band\b/gi, "&").replace(/\b\w/g, function (l) { return l.toUpperCase(); });
            if (!GUEST) GUEST = { n: formatted, c: [] };
            else GUEST.n = formatted;
          }
        }
      }
    }

    // Optional event filtering via query ?c=mameru,sangeet or ?events=...
    var cParam = location.search.match(/[?&](?:c|events)=([^&]+)/i);
    if (cParam) {
      var customCards = decodeURIComponent(cParam[1]).split(",").map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
      if (customCards.length) {
        if (!GUEST) GUEST = { n: "", c: customCards };
        else GUEST.c = customCards;
      }
    }

    if (GUEST && Array.isArray(GUEST.c) && GUEST.c.length && Array.isArray(W.events)) {
      var keep = GUEST.c;
      W.events = W.events.filter(function (ev) { return keep.indexOf(ev.key) !== -1; });
    }
  }());

  (function langToggle() {
    var host = $("langSwitch");
    if (!host) return;
    var short = W.ui.langShort || { en: "EN", gu: "GU" };

    function renderToggle() {
      host.innerHTML = "";
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
    }

    renderToggle();
    updateLangSwitchUI = renderToggle;
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

    function renderChrome() {
      label("scrollCueLabel",  "scrollCue");
      label("eventsEyebrow",   "eventsEyebrow");
      label("eventsTitle",     "eventsTitle");
      label("familiesEyebrow", "familiesEyebrow");
      label("familiesTitle",   "familiesTitle");

      aria("musicBtn",   "aMusic", true);
      aria("topBtn",     "aTop",   true);
    }

    renderChrome();
    updateChromeUI = renderChrome;
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
    ring:     900,  // bell struck -> gate appears
    gate:     750,  // gate held closed before it starts to open
    doors:    850,  // doors fully swing open (matches CSS portalLeafL/R duration)
    zoom:    1600,  // camera zooms through the open doorway (matches CSS portalWalkIn)
    settle:   500   // held while the hero smoothly finishes taking over
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

    // Play music on first user touch/click/scroll gesture
    function onFirstGesture() {
      play();
    }
    window.addEventListener("pointerdown", onFirstGesture, { passive: true, once: true });
    window.addEventListener("keydown", onFirstGesture, { passive: true, once: true });

    return { play: play, pause: pause, toggle: toggle };
  }());

  (function intro() {
    var box = $("intro");
    var stage = $("portalStage");
    if (!box) return;

    function renderIntroText() {
      put("introCueTitle", u("introCueTitle"));
      put("introCueSub",   u("introCueSub"));
      var cue = $("introCue");
      if (cue) cue.classList.toggle("gu", LANG === "gu");
    }
    renderIntroText();
    updateIntroUI = renderIntroText;

    // A language switch comes back mid-page; do not replay any of it.
    var switchY = switchedAt !== null ? (parseInt(switchedAt, 10) || 0) : null;
    if ((switchY !== null && switchY > 100) || reduced) {
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
      var curY = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (curY < 10) {
        window.scrollTo(0, 0);
      }
      if (!stage) {
        if (triggerGuestHandwriting) triggerGuestHandwriting();
        return;
      }
      stage.classList.remove("is-visible");
      stage.classList.add("is-gone");
      setTimeout(function () {
        if (stage && stage.parentNode) stage.remove();
        // The doors are completely gone: start the calligraphy handwriting animation now!
        if (triggerGuestHandwriting) triggerGuestHandwriting();
      }, 120);
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
      // The garland hero page has loaded: start the calligraphy handwriting animation now!
      if (triggerGuestHandwriting) triggerGuestHandwriting();
      if (!hold) at(PORTAL.settle, finish);
    }

    // Phase 2: doors are fully open, camera smoothly glides through the doorway.
    function zoomThrough() {
      if (step > 2) return;
      step = 3;
      stage.classList.add("is-zooming");
      stage.style.pointerEvents = "none";
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

  var calligraphyState = {
    hasAnimated: false,
    isWriting: false,
    animRaf: null,
    timers: []
  };

  function clearCalligraphyTimers() {
    if (calligraphyState.animRaf) {
      cancelAnimationFrame(calligraphyState.animRaf);
      calligraphyState.animRaf = null;
    }
    while (calligraphyState.timers.length) {
      clearTimeout(calligraphyState.timers.pop());
    }
  }

  function renderGuestHandwriting(isLangSwitch) {
    clearCalligraphyTimers();
    var host = $("heroGuest");
    var cue = $("scrollCue");
    if (!host) return;

    // The guest line stays in English on both languages, by client request -
    // "you" or the guest's own name, never "આપને" or a transliteration.
    host.classList.remove("gu");

    var rawText = (!GUEST || !GUEST.n || GUEST.n.trim().toLowerCase() === "you")
      ? "you" : GUEST.n;
    rawText = String(rawText).trim() || "you";

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

      // Reveal below text AFTER the name is written!
      var below = $("heroBelow");
      if (below) below.classList.add("is-revealed");

      var tFinish = setTimeout(function () {
        var cue = $("scrollCue");
        if (cue) cue.classList.add("is-shown");
        calligraphyState.isWriting = false;
        calligraphyState.hasAnimated = true;
      }, 350);
      calligraphyState.timers.push(tFinish);
    }

    function runAnimation(isReplay) {
      clearCalligraphyTimers();
      calligraphyState.isWriting = true;
      calligraphyState.hasAnimated = true;

      var cue = $("scrollCue");
      var below = $("heroBelow");
      if (reduced) {
        wordElements.forEach(function (w) {
          w.classList.add("is-done");
          w.classList.remove("is-active");
          w.style.setProperty("--w-prog", "100%");
        });
        pen.classList.add("is-hidden");
        if (below) below.classList.add("is-revealed");
        if (cue) cue.classList.add("is-shown");
        calligraphyState.isWriting = false;
        return;
      }

      if (!isReplay) {
        if (cue) cue.classList.remove("is-shown");
        if (below) below.classList.remove("is-revealed");
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

        // Pre-compute word geometry once before starting rAF loop (prevents forced layout thrashing)
        var hRect = host.getBoundingClientRect();
        var wRect = currentEl.getBoundingClientRect();
        var penW = pen.offsetWidth || 56;
        var penH = pen.offsetHeight || 80;
        var tipOffX = penW * (10 / 70);
        var tipOffY = penH * (86 / 100);
        var wordStartX = wRect.left - hRect.left;
        var wordWidth = wRect.width;
        var baselineY = (wRect.top - hRect.top) + (wRect.height * 0.72);

        function drawFrame(now) {
          var elapsed = now - startTime;
          var progress = Math.min(1, elapsed / wordDuration);

          currentEl.style.setProperty("--w-prog", (progress * 100).toFixed(1) + "%");

          var targetX = wordStartX + (progress * wordWidth);
          var wobble = Math.sin(progress * Math.PI * 8) * 3.0;
          var targetY = baselineY + wobble;

          pen.style.transform = "translate3d(" + (targetX - tipOffX).toFixed(1) + "px, " + (targetY - tipOffY).toFixed(1) + "px, 0)";

          if (progress < 1) {
            calligraphyState.animRaf = requestAnimationFrame(drawFrame);
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

              var tNext = setTimeout(function () {
                startWritingWord(nextIdx);
              }, 140);
              calligraphyState.timers.push(tNext);
            } else {
              finishSequence();
            }
          }
        }

        calligraphyState.animRaf = requestAnimationFrame(drawFrame);
      }

      // Start immediately
      startWritingWord(0);
    }

    triggerGuestHandwriting = function () {
      if (calligraphyState.isWriting) return;
      runAnimation(false);
    };

    host.addEventListener("click", function () {
      runAnimation(true);
    });

    if (isLangSwitch) {
      if (!document.body.classList.contains("intro-open")) {
        // Language switched while viewing page: immediately animate in the newly chosen language!
        requestAnimationFrame(function () {
          runAnimation(true);
        });
      }
    } else if (reduced) {
      wordElements.forEach(function (w) {
        w.classList.add("is-done");
        w.style.setProperty("--w-prog", "100%");
      });
      pen.classList.add("is-hidden");
      var below = $("heroBelow");
      if (below) below.classList.add("is-revealed");
      var cue = $("scrollCue");
      if (cue) cue.classList.add("is-shown");
      calligraphyState.hasAnimated = true;
    } else if (!document.body.classList.contains("intro-open")) {
      // Direct load without intro: start writing immediately!
      requestAnimationFrame(function () {
        if (triggerGuestHandwriting) triggerGuestHandwriting();
      });
    }
  }

  (function hero() {
    function renderHero() {
      var h = $("heroNames");
      if (h) {
        h.innerHTML = "";
        h.appendChild(document.createTextNode(t(first)));
        h.appendChild(el("span", "hero__amp", "&"));
        h.appendChild(document.createTextNode(t(second)));
      }

      var halt = $("heroGu");
      if (halt) halt.hidden = true;

      put("heroHosts",  u("inviteHosts"));
      put("heroInvite", u("inviteVerb"));
      put("heroTo",     u("inviteOccasion"));
    }

    renderHero();
    renderGuestHandwriting();

    updateHeroUI = function () {
      renderHero();
      renderGuestHandwriting(true);
    };
  }());

  /* -- invitation --------------------------------------------------------- */

  (function invitation() {
    var inv = W.invitation;
    var host = $("invParties");

    function renderInvitation() {
      put("invBlessing", t(inv.blessing));
      put("invLead", t(inv.lead));

      if (!host) return;
      host.innerHTML = "";

      // A string, an array of lines, or a "\n"-broken string -> <br>-joined.
      function linesEl(cls, pair) {
        var val = t(pair);
        if (!val || (Array.isArray(val) && !val.length)) return null;
        var lines = Array.isArray(val) ? val : String(val).split("\n");
        var pEl = el("p", cls);
        lines.forEach(function (line, idx) {
          if (idx > 0) pEl.appendChild(document.createElement("br"));
          pEl.appendChild(document.createTextNode(String(line).trim()));
        });
        return pEl;
      }

      function party(person, parents, above, title) {
        var aboveEl = above && linesEl("invite__parents invite__above", above);
        if (aboveEl) host.appendChild(aboveEl);
        // Current language only - t() would fall back to the Gujarati "ચિ."
        // on the English card, where the title is deliberately blank.
        var ti = title && title[LANG];
        host.appendChild(el("p", "invite__name", (ti ? ti + " " : "") + t(person)));
        var pEl = parents && linesEl("invite__parents", parents);
        if (pEl) host.appendChild(pEl);
      }
      party(groom, inv.groomLine, inv.groomAbove, inv.groomTitle);
      host.appendChild(el("p", "invite__weds", "—   " + t(inv.weds) + "   —"));
      party(bride, inv.brideLine, inv.brideAbove, inv.brideTitle);
    }

    renderInvitation();
    updateInvitationUI = renderInvitation;
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
    /* Text with "\n" line breaks into a block, one <br> per break. */
    function fillLines(div, text, upper) {
      div.innerHTML = "";
      String(text || "").split("\n").forEach(function (line, idx) {
        if (idx > 0) div.appendChild(el("br"));
        div.appendChild(document.createTextNode(upper ? line.toUpperCase() : line));
      });
    }

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
      var times = (ev.times || []).filter(function (tm) { return t(tm.value); });
      if (times.length > 1) {
        var sched = el("div", "scroll-card__schedule inv__schedule");
        times.forEach(function (tm) {
          var row = el("div", "inv__schedule-row");
          var lbl = t(tm.label);
          if (lbl) row.appendChild(el("span", "inv__sched-lbl", lbl));
          row.appendChild(el("span", "inv__sched-val", t(tm.value)));
          sched.appendChild(row);
        });
        meta.appendChild(sched);
      } else if (times.length === 1) {
        meta.appendChild(el("div", "scroll-card__time inv__time", t(times[0].value)));
      }

      // Venue
      if (ev.venue) {
        var venDiv = el("div", "scroll-card__venue inv__venue");
        fillLines(venDiv, t(ev.venue), true);
        meta.appendChild(venDiv);
      }

      // Hosting family (e.g. who brings the mameru)
      if (t(ev.hosts)) {
        var hostsDiv = el("div", "scroll-card__hosts inv__hosts");
        fillLines(hostsDiv, t(ev.hosts), false);
        meta.appendChild(hostsDiv);
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
    var updateCardHeights;
    (function cardRoll() {
      var cards = Array.prototype.slice.call(list.querySelectorAll(".scroll-card"));
      var leadRef = section && section.querySelector(".eyebrow");
      var targets = cards.map(function (c) { 
        return { 
          el: c, 
          track: c.querySelector(".scroll-card__unroll-track"),
          sheet: c.querySelector(".scroll-card__sheet"),
          roll: "--roll" 
        }; 
      });
      if (leadRef) targets.push({ el: leadRef, setEl: section, roll: "--lead-roll" });

      if (reduced) {
        targets.forEach(function (tgt) {
          (tgt.setEl || tgt.el).style.setProperty(tgt.roll, 1);
          if (tgt.track) tgt.track.style.height = "auto";
        });
        return;
      }
      var LERP_RATE = 0.18;
      // Once a card (or the heading) has fully opened, it STAYS open even
      // if you scroll back up past it. locked pins target at 1 for good.
      var state = targets.map(function (tgt) { 
        if (tgt.track) tgt.track.style.height = "0px";
        return { cur: 0, target: 0, locked: false }; 
      });
      var ticking = false;

      // Pre-measure and cache sheet heights to prevent layout thrashing on scroll
      var cachedHeights = [];
      updateCardHeights = function () {
        cachedHeights = targets.map(function (tgt) {
          return (tgt.track && tgt.sheet) ? tgt.sheet.scrollHeight : 0;
        });
      };
      updateCardHeights();

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
          if (tgt.track && tgt.sheet) {
            if (s.locked) {
              tgt.track.style.height = "auto";
            } else {
              var fullH = cachedHeights[i] || tgt.sheet.scrollHeight || 0;
              tgt.track.style.height = Math.round(fullH * s.cur) + "px";
            }
          }
        });
        if (!allLocked()) requestAnimationFrame(tick);
        else ticking = false;
      }

      function kick() {
        if (!ticking) { ticking = true; requestAnimationFrame(tick); }
      }

      window.addEventListener("scroll", kick, { passive: true });
      window.addEventListener("resize", function () {
        updateCardHeights();
        kick();
      }, { passive: true });
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
      fitPending = setTimeout(function () {
        fitTitles();
        if (typeof updateCardHeights === "function") updateCardHeights();
      }, 60);
    }

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleFit);
    window.addEventListener("load", scheduleFit);
    window.addEventListener("resize", scheduleFit);

    Array.prototype.forEach.call(list.querySelectorAll("img"), function (img) {
      if (img.complete) return;
      img.addEventListener("load", scheduleFit);
      img.addEventListener("error", scheduleFit);
    });

    function updateEvents() {
      (W.events || []).forEach(function (ev) {
        var card = $("scroll-card-" + ev.key);
        if (!card) return;
        var isGu = (LANG === "gu");
        card.classList.toggle("scroll-card--gu", isGu);
        var title = card.querySelector(".scroll-card__title");
        if (title) {
          title.textContent = isGu ? ev.gu : ev.en;
          title.className = "scroll-card__title inv__script" + (isGu ? " inv__script--gu" : "");
        }
        var tag = card.querySelector(".scroll-card__tagline");
        if (tag && ev.tagline) tag.textContent = t(ev.tagline);
        var yr = card.querySelector(".scroll-card__year");
        if (yr) yr.textContent = isGu ? "૨૦૨૬" : "2026";

        var evTimes = (ev.times || []).filter(function (tm) { return t(tm.value); });
        var rows = card.querySelectorAll(".inv__schedule-row");
        if (rows.length && rows.length === evTimes.length) {
          rows.forEach(function (row, ri) {
            var lblEl = row.querySelector(".inv__sched-lbl");
            if (lblEl) lblEl.textContent = t(evTimes[ri].label);
            var valEl = row.querySelector(".inv__sched-val");
            if (valEl) valEl.textContent = t(evTimes[ri].value);
          });
        }
        var timeEl = card.querySelector(".inv__time");
        if (timeEl && evTimes.length === 1) timeEl.textContent = t(evTimes[0].value);

        var venEl = card.querySelector(".inv__venue");
        if (venEl && ev.venue) fillLines(venEl, t(ev.venue), true);
        var hostsEl = card.querySelector(".inv__hosts");
        if (hostsEl && ev.hosts) fillLines(hostsEl, t(ev.hosts), false);

        var dayName = "";
        var dayNum = "";
        var monthName = isGu ? "ડિસેમ્બર" : "DECEMBER";
        if (ev.dateShort && ev.dateShort.month) monthName = t(ev.dateShort.month);
        if (ev.key === "mameru" || ev.key === "sangeet") {
          dayName = isGu ? "મંગળવાર" : "TUESDAY";
          dayNum = isGu ? "૧" : "1ST";
        } else {
          dayName = isGu ? "બુધવાર" : "WEDNESDAY";
          dayNum = isGu ? "૨" : "2ND";
        }
        var dl = card.querySelector(".scroll-card__dateline");
        if (dl) {
          dl.innerHTML = "";
          dl.appendChild(el("span", "inv__date-part", dayName));
          dl.appendChild(el("span", "inv__date-sep", "|"));
          dl.appendChild(el("span", "inv__date-part inv__date-part--num", dayNum));
          dl.appendChild(el("span", "inv__date-sep", "|"));
          dl.appendChild(el("span", "inv__date-part", (monthName || "").toUpperCase()));
        }
      });
    }

    // Text length changes between languages - re-measure the cards so a
    // half-unrolled card doesn't clip its new content.
    updateEventsUI = function () { updateEvents(); scheduleFit(); };
  }());

  /* -- families ----------------------------------------------------------- */

  (function families() {
    var p = W.hostsPaired, a = W.hostsAwaiting;
    var boxA = $("hostsPaired");
    var boxB = $("hostsAwaiting");

    /* First call builds with the .reveal scroll-in classes, same as every
       other section - the shared IntersectionObserver (revealer(), below)
       does its one querySelectorAll(".reveal") pass after this IIFE runs
       and picks them up. A language switch calls this again to rebuild the
       text, but that observer only ever watches what existed at that one
       pass - new nodes from a rebuild are never seen, so .reveal's opacity:0
       would never clear and the whole section would vanish. Every later
       call skips straight to the "already in" state instead: correct,
       since the visitor is already looking at this section when they flip
       the toggle - there is nothing left to reveal. */
    var firstRender = true;

    function revealClass(base) {
      if (!firstRender) return base + " is-in";
      return "reveal " + base;
    }

    function renderHosts() {
      if (boxA) {
        boxA.innerHTML = "";
        if (p && p.pairs && p.pairs.length) {
          boxA.hidden = false;
          boxA.appendChild(el("h3", guIf(revealClass("hosts__heading")), t(p.heading)));
          var ul = el("ul", "pairs");
          p.pairs.forEach(function (pair, pi) {
            var li = el("li", revealClass(pi % 2 ? "reveal--right" : "reveal--left"));
            li.style.setProperty("--d", (pi % 6) * 60 + "ms");
            li.appendChild(el("span", guIf("l"), t(pair[0])));
            li.appendChild(el("span", "dot", "◆"));
            li.appendChild(el("span", guIf("r"), t(pair[1])));
            ul.appendChild(li);
          });
          boxA.appendChild(ul);
        } else { boxA.hidden = true; }
      }

      if (boxB) {
        boxB.innerHTML = "";
        if (a && a.names && a.names.length) {
          boxB.hidden = false;
          boxB.appendChild(ornRule());
          boxB.appendChild(el("h3", guIf(revealClass("hosts__heading")), t(a.heading)));
          var ul2 = el("ul", "awaiting");
          a.names.forEach(function (nm, ni) {
            var li = el("li", guIf(revealClass(ni % 2 ? "reveal--right" : "reveal--left")));
            li.style.setProperty("--d", (ni % 6) * 60 + "ms");
            li.textContent = t(nm);
            ul2.appendChild(li);
          });
          boxB.appendChild(ul2);
          if (a.solo)     boxB.appendChild(el("p", guIf(revealClass("awaiting--solo")), t(a.solo)));
          if (a.children) boxB.appendChild(el("p", guIf(revealClass("awaiting--kids")), t(a.children)));
        } else { boxB.hidden = true; }
      }

      firstRender = false;
    }

    renderHosts();
    updateHostsUI = renderHosts;
  }());

  /* -- gallery ------------------------------------------------------------ */

  (function gallery() {
    var section = $("gallery");
    var photos = (W.gallery && W.gallery.photos) || [];
    if (!photos.length) { section.hidden = true; return; }

    function renderGalleryText() {
      put("galleryTitle", t(W.gallery.heading));
      put("gallerySubtitle", t(W.gallery.subheading));
      put("galleryCaption", t(W.gallery.caption));
      if (prevBtn) prevBtn.setAttribute("aria-label", u("aPrevPhoto"));
      if (nextBtn) nextBtn.setAttribute("aria-label", u("aNextPhoto"));
      cards.forEach(function (fig, i) {
        var img = fig.querySelector("img");
        if (img && photos[i]) img.alt = t(photos[i].alt);
      });
    }

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

    prevBtn.innerHTML = "&#8249;";
    nextBtn.innerHTML = "&#8250;";
    if (cards.length < 2) { prevBtn.hidden = nextBtn.hidden = true; }
    renderGalleryText();
    updateGalleryUI = renderGalleryText;

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

    function renderCalendar() {
      // the month's name and year matching reference
      var firstEvent = (W.events || [])[0];
      var mName = firstEvent && firstEvent.dateShort ? t(firstEvent.dateShort.month) : "December";
      put("calMonth", mName + " " + year);

      grid.innerHTML = "";
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

      var venueEl = $("calVenueName");
      if (venueEl) venueEl.textContent = t(W.headline.venue);
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
        familyEl.textContent = t(W.ui.inviteHosts);
      }
    }

    renderCalendar();
    updateCalendarUI = renderCalendar;
  }());

  /* -- postcard location -------------------------------------------------- */

  (function postcard() {
    var pc = W.postcard;
    if (!pc) return;

    function renderPostcard() {
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
    }

    renderPostcard();
    updatePostcardUI = renderPostcard;
  }());

  /* -- countdown ---------------------------------------------------------- */

  (function countdown() {
    var grid = $("cdGrid");
    var unitKeys = [["days", "cdDays"], ["hours", "cdHours"],
                    ["minutes", "cdMinutes"], ["seconds", "cdSeconds"]];
    var nums = {};
    var labelEls = {};
    var arrived = false;

    unitKeys.forEach(function (uk, ui) {
      var wrap = el("div", "locket reveal " + (ui % 2 ? "reveal--right" : "reveal--left"));
      wrap.style.setProperty("--d", ui * 90 + "ms");
      var img = el("img");
      img.src = "assets/generated/countdown_locket.png";
      img.alt = ""; img.loading = "lazy";
      wrap.appendChild(img);

      var box = el("span", "locket__num");
      var b = el("b", null, "—");
      box.appendChild(b);
      var label = el("span", guIf("locket__label"), u(uk[1]));
      box.appendChild(label);
      wrap.appendChild(box);

      grid.appendChild(wrap);
      nums[uk[0]] = b;
      labelEls[uk[0]] = label;
    });

    function renderCountdownText() {
      $("cdTitle").innerHTML = u(arrived ? "countdownArrived" : "countdownTitle");
      unitKeys.forEach(function (uk) {
        var el2 = labelEls[uk[0]];
        el2.textContent = u(uk[1]);
        el2.className = guIf("locket__label") || "";
      });
      $("signoffNames").innerHTML = "";
      $("signoffNames").appendChild(document.createTextNode(t(first) + " "));
      $("signoffNames").appendChild(el("em", null, "&"));
      $("signoffNames").appendChild(document.createTextNode(" " + t(second)));
      put("signoffDate", t(W.headline.datesLabel));
      put("signoffLine", t(W.footer.line));
    }

    function tick() {
      var ms = startDate - Date.now();
      if (ms <= 0) {
        nums.days.textContent = nums.hours.textContent =
        nums.minutes.textContent = nums.seconds.textContent = "0";
        arrived = true;
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

    renderCountdownText();
    updateCountdownUI = renderCountdownText;
  }());

  /* -- compliments + footer ----------------------------------------------- */

  (function compliments() {
    var c = W.compliments, section = $("compliments");
    if (!c || !c.from || !c.from.length) { section.hidden = true; return; }
    var host = $("compList");

    function renderCompliments() {
      put("compHeading", t(c.heading));
      host.innerHTML = "";
      c.from.forEach(function (f) {
        var d = el("div");
        d.appendChild(el("p", "compliments__name", t(f.name)));
        if (f.city) d.appendChild(el("p", guIf("compliments__city"), t(f.city)));
        host.appendChild(d);
      });
    }

    renderCompliments();
    updateComplimentsUI = renderCompliments;
  }());

  (function renderFooter() {
    var footer = $("footer");
    if (!footer) return;
    footer.innerHTML = "";
    var topLine = [W.couple.hashtag, t(W.footer.credit)].filter(Boolean).join("  ·  ");
    if (topLine) footer.appendChild(el("div", "footer__line", topLine));
    var studio = t(W.footer.studio);
    if (studio) {
      var sEl = el("div", "footer__studio");
      var link = W.footer.studioLink;
      var at = link && link.text ? studio.indexOf(link.text) : -1;
      if (at !== -1 && link.url) {
        sEl.appendChild(document.createTextNode(studio.slice(0, at)));
        var a = el("a", "footer__studio-link", link.text);
        a.href = link.url;
        a.target = "_blank";
        a.rel = "noopener";
        sEl.appendChild(a);
        sEl.appendChild(document.createTextNode(studio.slice(at + link.text.length)));
      } else {
        sEl.textContent = studio;
      }
      footer.appendChild(sEl);
    }
  }());

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
    var parLayers = Array.prototype.map.call(
      document.querySelectorAll("[data-par]"),
      function (el) {
        return { el: el, f: parseFloat(el.getAttribute("data-par")) || 0 };
      }
    );
    var closing = $("closing");
    var topBtn = $("topBtn");
    var queued = false;
    var lastTopVisible = null;

    // Zero-overhead intersection observer for floating controls theme flip
    if (closing && "IntersectionObserver" in window) {
      var closeIo = new IntersectionObserver(function (entries) {
        if (entries && entries[0]) {
          document.body.classList.toggle("is-closing", entries[0].isIntersecting);
        }
      }, { rootMargin: "0px 0px -25% 0px", threshold: 0 });
      closeIo.observe(closing);
    }

    function frame() {
      queued = false;
      var y = window.pageYOffset || document.documentElement.scrollTop;
      var vh = window.innerHeight;

      if (!reduced && y < vh * 1.3) {
        for (var i = 0; i < parLayers.length; i++) {
          parLayers[i].el.style.transform = "translate3d(0," + (y * parLayers[i].f).toFixed(1) + "px,0)";
        }
      }

      if (topBtn) {
        var showTop = y > vh * 0.8;
        if (showTop !== lastTopVisible) {
          lastTopVisible = showTop;
          topBtn.style.opacity = showTop ? "1" : "0";
          topBtn.style.pointerEvents = showTop ? "auto" : "none";
        }
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
