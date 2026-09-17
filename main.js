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
    label("heroEyebrow",     "heroEyebrow");
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

    aria("evdlgClose", "aClose");
    aria("musicBtn",   "aMusic", true);
    aria("topBtn",     "aTop",   true);
    var d = $("evdlg");
    if (d) d.setAttribute("aria-label", u("aEventDetails"));
  }());

  /* A language switch reloads. Put the reader back where they were. */
  (function restoreScroll() {
    if (switchedAt === null) return;
    var y = parseInt(switchedAt, 10) || 0;
    if (!y) return;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
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

  /* -- intro screen --------------------------------------------------------
     The scene holds still until the visitor rings the bell - nothing here is
     on a timer. Ringing adds `.is-ringing`, which is what drives the rear, the
     trunk and the bell in styles.css; the page opens as the legs come down.  */

  (function intro() {
    var box = $("intro");
    if (!box) return;

    put("introCueTitle", u("introCueTitle"));
    put("introCueSub",   u("introCueSub"));
    var cue = $("introCue");
    if (cue && LANG === "gu") cue.classList.add("gu");

    // A language switch comes back mid-page; do not replay the intro.
    if (switchedAt !== null) {
      box.remove();
      return;
    }

    document.body.classList.add("intro-open");

    var closed = false;

    function close() {
      if (closed) return;
      closed = true;
      box.classList.add("is-done");
      setTimeout(function () { box.remove(); }, 800);
      document.body.classList.remove("intro-open");
      window.scrollTo(0, 0);
    }

    var hold = location.search.indexOf("hold") !== -1;
    var rung = false;
    function ring() {
      if (rung || closed) return;
      rung = true;
      box.classList.add("is-ringing");
      if (!hold) setTimeout(close, 1750);
    }

    box.addEventListener("click", ring);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        close();
      } else if (e.key === "Enter" || e.key === " ") {
        if (!closed) { e.preventDefault(); ring(); }
      }
    });

    // Reduced motion: just let them in.
    if (reduced) {
      box.remove();
      document.body.classList.remove("intro-open");
    }
  }());

  (function hero() {
    var h = $("heroNames");
    h.appendChild(document.createTextNode(t(first)));
    h.appendChild(el("span", "hero__amp", "&"));
    h.appendChild(document.createTextNode(t(second)));

    var halt = $("heroGu");
    halt.className = LANG === "gu" ? "hero__gu reveal" : "gu hero__gu reveal";
    halt.style.setProperty("--d", "160ms");
    put("heroGu", first[OTHER] + "  ·  " + second[OTHER]);

    put("heroWelcome", t(W.headline.welcomeLine));

    var meta = $("heroMeta");
    [W.headline.datesLabel, W.headline.venue, W.headline.city]
      .map(t)
      .filter(function (x) { return x; })
      .forEach(function (x) { meta.appendChild(el("span", null, x)); });
  }());

  /* -- invitation --------------------------------------------------------- */

  (function invitation() {
    var inv = W.invitation;
    put("invBlessing", t(inv.blessing));
    put("invLead", t(inv.lead));

    var host = $("invParties");
    function party(person, parents) {
      host.appendChild(el("p", "invite__name", t(person)));
      host.appendChild(el("p", (LANG === "gu" ? "" : "gu ") + "invite__gu",
                             person[OTHER]));
      if (parents) host.appendChild(el("p", "invite__parents", t(parents)));
    }
    party(groom, inv.groomLine);
    host.appendChild(el("p", "invite__weds", t(inv.weds)));
    party(bride, inv.brideLine);

    var when = [t(W.headline.datesLabel), t(W.headline.venue) || t(W.headline.city)]
      .filter(Boolean).join(" · ");
    put("invWhen", when);
  }());

  /* -- events: five individual invitation cards ---------------------------
     Every card is built by the same factory from one entry in W.events, so a
     card is edited in content.js and nowhere else.                         */

  (function events() {
    var list = $("eventsList");
    if (!list) return;

    /* ---- an event card ---- */
    function eventCard(ev, i) {
      // Alternate the entrance side card by card - Mameru and Mandap (even)
      // from the left, Sangeet and Lagna (odd) from the right.
      var card = el("button", "inv reveal " + (i % 2 ? "reveal--right" : "reveal--left"));
      card.type = "button";
      card.setAttribute("data-ink", ev.ink);
      card.setAttribute("data-paper", ev.paper);
      card.setAttribute("data-key", ev.key);
      if (ev.wideIllustration) card.setAttribute("data-wide", "true");
      card.style.setProperty("--d", i * 90 + "ms");
      card.setAttribute("aria-label",
        ev.en + " — " + t(ev.date) + ". " + u("viewDetails") + ".");

      var ornSrc = ev.hangingOrnament || (ev.ornament ? "assets/generated/orn_hanging.png" : null);
      if (ornSrc) {
        var orn = el("img", "inv__orn");
        orn.src = ornSrc;
        orn.alt = ""; orn.loading = "lazy";
        card.appendChild(orn);
      }

      /* Title and English form ONE group sized to the wider of the two, so the
         English anchors to the title's right edge rather than the card's. */
      var title = el("div", "inv__title");
      title.appendChild(el("h3", "inv__gu", ev.gu));
      if (ev.en) title.appendChild(el("p", "inv__en", ev.en));
      if (ev.enShift) title.style.setProperty("--en-shift", ev.enShift);
      card.appendChild(title);

      var times = (ev.times || []).filter(function (t) { return t.value; });

      if (ev.dateShort) {
        var when = el("div", "inv__when");
        when.appendChild(el("span", "inv__day", ev.dateShort.day));
        var md = el("span", "inv__md");
        md.appendChild(el("b", null, t(ev.dateShort.month)));
        /* Only when there's ONE time worth showing compactly next to the
           date. With several (Lagna's baraat/hastamelap schedule), showing
           just the first one here reads as the card's one time and
           contradicts the full list right below it - so it falls back to
           the year instead, same as when there's no time at all. */
        md.appendChild(el("span", null, times.length === 1 ? times[0].value : "2026"));
        when.appendChild(md);
        card.appendChild(when);
      }

      // Multiple schedule timings (e.g. for Lagna)
      if (times.length > 1) {
        var ul = el("ul", "inv__times");
        times.forEach(function (tm) {
          var li = el("li");
          var lbl = t(tm.label);
          if (lbl) li.appendChild(el("span", guIf("inv__times-lbl"), lbl));
          li.appendChild(el("b", null, tm.value));
          ul.appendChild(li);
        });
        card.appendChild(ul);
      }

      if (ev.tagline) card.appendChild(el("p", guIf("inv__tagline"), t(ev.tagline)));
      if (ev.venue) card.appendChild(el("p", guIf("inv__venue"), t(ev.venue)));

      /* Bottom illustration: two corner engravings on Lagna, one centered on others */
      if (ev.cornerIllustrations && ev.cornerIllustrations.length) {
        card.setAttribute("data-ill-corners", "true");
        ev.cornerIllustrations.slice(0, 2).forEach(function (src, n) {
          var ci = el("img", "inv__cornerill inv__cornerill--" + (n ? "r" : "l"));
          ci.src = src; ci.alt = ""; ci.loading = "lazy";
          card.appendChild(ci);
        });
      } else if (ev.illustration) {
        var ill = el("img", "inv__ill");
        ill.src = ev.illustration; ill.alt = ""; ill.loading = "lazy";
        card.appendChild(ill);
      }

      card.addEventListener("click", function () { openDialog(ev); });
      return card;
    }

    W.events.forEach(function (ev, i) { list.appendChild(eventCard(ev, i)); });

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

    /* ---- detail dialog -------------------------------------------------- */

    var dlg = $("evdlg"), sheet = $("evdlgSheet"), lastFocus = null;

    function openDialog(ev) {
      lastFocus = document.activeElement;
      sheet.setAttribute("data-ink", ev.ink);

      var body = $("evdlgBody");
      body.textContent = "";
      body.appendChild(el("h3", "evdlg__gu", ev.gu));
      if (ev.en) body.appendChild(el("p", "evdlg__en", ev.en));
      body.appendChild(el("p", "evdlg__date", t(ev.date)));

      var times = (ev.times || []).filter(function (x) { return x.value; });
      if (times.length) {
        var ul = el("ul", "evdlg__times");
        times.forEach(function (tm) {
          var li = el("li");
          li.appendChild(el("span", guIf(null), t(tm.label) || u("timeBegins")));
          li.appendChild(el("b", null, tm.value));
          ul.appendChild(li);
        });
        body.appendChild(ul);
      }

      if (ev.venue) body.appendChild(el("p", guIf("evdlg__date"), t(ev.venue)));
      if (ev.dress) body.appendChild(el("p", guIf("evdlg__note"), t(ev.dress)));
      if (ev.note)  body.appendChild(el("p", guIf("evdlg__note"), t(ev.note)));

      // venue is still to be confirmed; say so rather than showing a gap
      if (!ev.venue) {
        body.appendChild(el("p", "evdlg__blank", u("venueToFollow")));
      }

      if (ev.illustration) {
        var ill = el("img", "evdlg__ill");
        ill.src = ev.illustration; ill.alt = "";
        body.appendChild(ill);
      }

      dlg.classList.add("is-open");
      dlg.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      $("evdlgClose").focus();
    }

    function closeDialog() {
      dlg.classList.remove("is-open");
      dlg.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }

    $("evdlgClose").addEventListener("click", closeDialog);
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closeDialog(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && dlg.classList.contains("is-open")) closeDialog();
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
      familyEl.textContent = LANG === "gu" ? "જાબુવાણી અને નાકરાણી પરિવાર" : "Jabuvani & Nakrani Family";
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
      var r = closing.getBoundingClientRect();
      document.body.classList.toggle("is-closing", r.top < window.innerHeight * 0.75);

      topBtn.style.opacity = y > window.innerHeight * 0.8 ? "1" : "0";
      topBtn.style.pointerEvents = y > window.innerHeight * 0.8 ? "auto" : "none";
    }

    function onScroll() {
      if (!queued) { queued = true; requestAnimationFrame(frame); }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    frame();

    topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }());

  /* -- music toggle -------------------------------------------------------
     Looks for assets/audio/theme.mp3. If it is absent the button removes
     itself rather than sitting there doing nothing.                        */

  (function music() {
    var btn = $("musicBtn");
    var audio = new Audio("assets/audio/theme.mp3");
    audio.loop = true;
    audio.preload = "none";
    audio.volume = 0;

    var missing = false;
    audio.addEventListener("error", function () {
      missing = true;
      btn.hidden = true;
    });

    btn.addEventListener("click", function () {
      if (missing) return;
      var on = btn.getAttribute("aria-pressed") === "true";
      var icon = $("musicIcon");

      if (on) {
        audio.pause();
        btn.setAttribute("aria-pressed", "false");
        btn.setAttribute("aria-label", "Play music");
        icon.setAttribute("href", "#ic-mute");
      } else {
        audio.play().then(function () {
          btn.setAttribute("aria-pressed", "true");
          btn.setAttribute("aria-label", "Pause music");
          icon.setAttribute("href", "#ic-music");
          // ease the volume up so it does not startle
          var v = 0;
          var fade = setInterval(function () {
            v = Math.min(0.45, v + 0.03);
            audio.volume = v;
            if (v >= 0.45) clearInterval(fade);
          }, 60);
        }).catch(function () { btn.hidden = true; });
      }
    });
  }());

}());
