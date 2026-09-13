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
    var btn = $("langBtn");
    if (!btn) return;
    // the button names the language you would switch TO
    btn.textContent = (W.ui.langName || {})[OTHER] || OTHER.toUpperCase();
    btn.className = "lang" + (OTHER === "gu" ? " lang--gu" : "");
    btn.setAttribute("aria-label", u("langSwitchTo"));
    btn.title = u("langSwitchTo");
    btn.addEventListener("click", function () { setLang(OTHER); });
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
    label("scrollCue",       "scrollCue");
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

  /* The instant the cards, the calendar and the countdown all work from.
     Declared up here because the event cards read it, and they render long
     before the calendar does - `var` hoists the name but not the value. */
  var startDate = new Date(W.countdownTo);

  /* -- hero --------------------------------------------------------------- */

  var groom = W.couple.groom, bride = W.couple.bride;
  var first  = W.couple.firstInHero === "bride" ? bride : groom;
  var second = first === groom ? bride : groom;

  /* -- intro screen --------------------------------------------------------
     The elephant strikes at 58% of a 3.6s timeline starting at 300ms, so the
     swing has rung out by ~3.9s. Dismiss just after that.                   */

  (function intro() {
    var box = $("intro");
    if (!box) return;

    put("introEyebrow", u("introEyebrow"));
    $("introSkip").textContent = u("introSkip");

    var names = $("introNames");
    names.appendChild(document.createTextNode(t(first) + " "));
    names.appendChild(el("em", null, "&"));
    names.appendChild(document.createTextNode(" " + t(second)));
    /* The couple's names are set twice on purpose, the way a kankotri does -
       large in the reading language, small in the other. */
    var alt = $("introGu");
    alt.className = LANG === "gu" ? "intro__gu" : "gu intro__gu";
    put("introGu", first[OTHER] + "  ·  " + second[OTHER]);

    // A language switch comes back mid-page; do not replay the intro.
    if (switchedAt !== null) { box.remove(); return; }

    document.body.classList.add("intro-open");

    var closed = false;
    function close() {
      if (closed) return;
      closed = true;
      box.classList.add("is-done");
      document.body.classList.remove("intro-open");
      window.scrollTo(0, 0);
      // drop it from the tree once the fade has finished
      setTimeout(function () { box.remove(); }, 1000);
    }

    $("introSkip").addEventListener("click", close);
    box.addEventListener("click", function (e) {
      if (e.target !== $("introSkip")) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" || e.key === "Enter") close();
    });

    if (reduced) { close(); return; }
    // ?hold keeps the intro up so it can be inspected while working on it
    if (location.search.indexOf("hold") !== -1) return;
    setTimeout(close, 4200);
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

    /* Two nested cusped outlines on a 200x300 field - the card's own ratio -
       so the shape holds at any size. `i` is the inset of each line. */
    function framePath(i, cusp) {
      var L = i, R = 200 - i, T = i, B = 300 - i, c = cusp;
      return "M" + L + "," + (T + c) +
             "Q" + L + "," + T + " " + (L + c) + "," + T +
             "L" + (100 - c * 1.4) + "," + T +
             "Q100," + (T - c * 0.9) + " " + (100 + c * 1.4) + "," + T +
             "L" + (R - c) + "," + T +
             "Q" + R + "," + T + " " + R + "," + (T + c) +
             "L" + R + "," + (B - c) +
             "Q" + R + "," + B + " " + (R - c) + "," + B +
             "L" + (L + c) + "," + B +
             "Q" + L + "," + B + " " + L + "," + (B - c) + "Z";
    }
    function frameSVG() {
      return '<svg class="inv__frame" viewBox="0 0 200 300" ' +
             'preserveAspectRatio="none" aria-hidden="true">' +
             '<path class="inv__frame-o" d="' + framePath(6, 13) + '"/>' +
             '<path class="inv__frame-i" d="' + framePath(11, 10) + '"/></svg>';
    }

    /* ---- an event card ----
       Everything a guest needs is on the face now: crest, title in both
       languages, date, times, venue, a line about the evening, and a link to
       the map. Nothing is hidden behind a tap, so there is no dialog.      */
    function eventCard(ev, i) {
      /* The card hangs from a rod with tassels below it and sways, so the
         whole assembly is wrapped: the hanger carries the reveal and the
         sway, the card inside stays still relative to it. */
      var hang = el("div", "hang reveal");
      hang.setAttribute("data-side", i % 2 ? "r" : "l");
      hang.style.setProperty("--d", i * 90 + "ms");
      hang.style.setProperty("--sway-delay", (i * 0.7).toFixed(2) + "s");

      /* Drawn rather than generated: every render of a brass stave came back
         with a finial far too heavy for its height, and the reference's is
         hair-thin. Two gradients hold it at any size. */
      hang.appendChild(el("span", "hang__rod"));

      var card = el("article", "inv");
      card.setAttribute("data-ink", ev.ink);
      card.setAttribute("data-paper", ev.paper);
      card.setAttribute("data-key", ev.key);

      /* The frame is an SVG, not a border: the reference's outline is cusped at
         the corners and peaks at the top centre, which a border-radius cannot
         describe. preserveAspectRatio="none" stretches it to the card and
         non-scaling-stroke keeps both keylines an even weight. */
      card.insertAdjacentHTML("beforeend", frameSVG());
      ["tl", "tr", "br", "bl"].forEach(function (pos) {
        var c = el("img", "inv__corner inv__corner--" + pos);
        c.src = "assets/generated/orn_corner.png";
        c.alt = ""; c.loading = "lazy";
        card.appendChild(c);
      });

      /* The card's own subject at the head - kalash, dhol, mandap, elephant.
         The generic crest is the fallback for a card without one. */
      var crest = el("img", "inv__crest");
      crest.src = ev.illustration ||
        (ev.cornerIllustrations && ev.cornerIllustrations[1]) ||
        "assets/generated/card_crest.png";
      crest.alt = ""; crest.loading = "lazy";
      card.appendChild(crest);

      /* Both languages, centred, one above the other - the heading is the one
         place the site deliberately shows both at once. */
      var title = el("div", "inv__title");
      title.appendChild(el("h3", "inv__gu", ev.gu));
      if (ev.en) title.appendChild(el("p", "inv__en", ev.en));
      card.appendChild(title);

      if (ev.dateShort) {
        card.appendChild(el("p", "inv__date",
          parseInt(ev.dateShort.day, 10) + " " + t(ev.dateShort.month) + " " +
          startDate.getFullYear()));
      }

      var times = (ev.times || []).filter(function (x) { return x.value; });
      if (times.length) {
        var ul = el("ul", "inv__times");
        times.forEach(function (tm) {
          var li = el("li");
          var lbl = t(tm.label);
          if (lbl) li.appendChild(el("span", guIf(null), lbl));
          li.appendChild(el("b", null, tm.value));
          ul.appendChild(li);
        });
        card.appendChild(ul);
      }

      if (ev.venue) card.appendChild(el("p", guIf("inv__venue"), t(ev.venue)));
      var line = t(ev.tagline) || t(ev.note);
      if (line) card.appendChild(el("p", guIf("inv__note"), line));

      /* A map link needs somewhere to point. `mapsUrl` wins; otherwise the
         venue text goes to Maps as a search. With no venue at all the button
         would be claiming to know where to go, so it is left off. */
      var href = ev.mapsUrl || (ev.venue
        ? "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent(
            t(ev.venue).split("\n")
              .map(function (x) { return x.replace(/[,\s]+$/, "").trim(); })
              .filter(Boolean).join(", "))
        : "");
      if (href) {
        var a = el("a", "inv__maps", u("openInMaps"));
        a.href = href; a.target = "_blank"; a.rel = "noopener";
        card.appendChild(a);
      }

      var spray = el("img", "inv__spray");
      spray.src = "assets/generated/card_spray.png";
      spray.alt = ""; spray.loading = "lazy";
      card.appendChild(spray);

      hang.appendChild(card);

      // beaded strings hanging off the foot, three of them, uneven lengths
      var tassels = el("div", "hang__tassels");
      [0, 1, 2].forEach(function (n) {
        var tz = el("img", "hang__tassel");
        tz.src = "assets/generated/orn_hanging.png";
        tz.alt = ""; tz.loading = "lazy";
        tz.style.setProperty("--n", n);
        tassels.appendChild(tz);
      });
      hang.appendChild(tassels);

      return hang;
    }

    W.events.forEach(function (ev, i) { list.appendChild(eventCard(ev, i)); });

    /* Titles run from 2 glyphs (લગ્ન) to 10 (શામ શાનદાર). Left to itself that
       is a 2x spread in width, so the short cards read as half the weight of
       the long ones. Measure each title and scale it to occupy the same share
       of its card, which is what makes the set look like one deck. */
    function fitTitles() {
      Array.prototype.forEach.call(document.querySelectorAll(".inv__title"), function (t) {
        var card = t.closest(".inv");
        var gu = t.querySelector(".inv__gu");
        if (!card || !gu) return;
        t.style.setProperty("--tscale", "1");
        var natural = gu.getBoundingClientRect().width;
        if (!natural) return;

        /* Normalise by SIZE, not by width share. Pinning every title to the
           same share of the card made the short ones enormous - મામેરું came
           out at 101px against શામ શાનદાર's 49px, because the same width
           spread over 4 glyphs instead of 10. So: let every title run at the
           same base size, and only shrink the ones too wide to fit. */
        var scale = Math.min(1.45, card.clientWidth * 0.86 / natural);
        scale = Math.max(0.62, scale);
        t.style.setProperty("--tscale", scale.toFixed(3));

        /* ...then give the width back if the card cannot take the height.

           Measure the COPY, not scrollHeight. The લગ્ન card's two corner
           engravings bleed past the foot on purpose, so its scrollHeight is
           permanently over clientHeight - reading that as overflow shrank its
           title on every single pass until it hit the 0.75 floor. */
        function copyOverflows() {
          var foot = card.getBoundingClientRect().bottom;
          /* Where there are corner engravings the copy has to stop ABOVE
             them, not merely inside the card - otherwise a tall title pushes
             the venue down between Ganesha and the elephant. */
          var corners = card.querySelectorAll(".inv__cornerill");
          for (var k = 0; k < corners.length; k++) {
            foot = Math.min(foot, corners[k].getBoundingClientRect().top);
          }
          var flow = card.querySelectorAll(
            ".inv__title, .inv__when, .inv__times, .inv__venue, .inv__ill");
          for (var i = 0; i < flow.length; i++) {
            if (flow[i].getBoundingClientRect().bottom > foot) return true;
          }
          return false;
        }
        var guard = 0;
        while (copyOverflows() && scale > 0.75 && guard++ < 30) {
          scale *= 0.96;
          t.style.setProperty("--tscale", scale.toFixed(3));
        }
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
      var ul = el("ul", "pairs reveal");
      p.pairs.forEach(function (pair) {
        var li = el("li");
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
      var ul2 = el("ul", "awaiting reveal");
      a.names.forEach(function (nm) { ul2.appendChild(el("li", guIf(null), t(nm))); });
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

    /* Each print gets its own tilt, width and nudge so the set reads as a
       handful of photographs dropped on a table rather than a grid. The
       values are fixed, not random: a random scatter re-rolls on every load
       and one roll in ten looks wrong. */
    var LAY = [
      { rot: -2.4, w: 96,  dx: -3 },
      { rot:  1.9, w: 100, dx:  2 },
      { rot:  2.2, w: 86,  dx:  5 },
      { rot: -1.5, w: 92,  dx: -4 },
      { rot: -2.2, w: 100, dx:  3 },
      { rot:  1.5, w: 88,  dx: -2 },
      { rot:  2.7, w: 94,  dx:  4 }
    ];

    var host = $("gallerySlides");
    photos.forEach(function (p, i) {
      var lay = LAY[i % LAY.length];
      var fig = el("figure", "print reveal");
      fig.style.setProperty("--rot", lay.rot + "deg");
      fig.style.setProperty("--w", lay.w + "%");
      fig.style.setProperty("--dx", lay.dx + "px");
      fig.style.setProperty("--d", (i % 3) * 90 + "ms");

      var img = el("img");
      img.src = p.src;
      img.alt = t(p.alt);
      if (i) img.loading = "lazy";
      fig.appendChild(img);
      host.appendChild(fig);
    });
  }());

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

    // the month's name is already written, bilingually, on the cards
    var firstEvent = (W.events || [])[0];
    put("calMonth", firstEvent && firstEvent.dateShort
          ? t(firstEvent.dateShort.month) : "");

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
  }());

  /* -- countdown ---------------------------------------------------------- */

  (function countdown() {
    var grid = $("cdGrid");
    $("cdTitle").innerHTML = u("countdownTitle");
    var units = [["days", u("cdDays")], ["hours", u("cdHours")],
                 ["minutes", u("cdMinutes")], ["seconds", u("cdSeconds")]];
    var nums = {};

    units.forEach(function (u) {
      var wrap = el("div", "locket");
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
