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
     The elephant strikes at 58% of a 3.6s timeline starting at 300ms, so the
     swing has rung out by ~3.9s. Dismiss just after that.                   */

  (function intro() {
    var box = $("intro");
    if (!box) return;

    var names = $("introNames");
    names.appendChild(document.createTextNode(first.en + " "));
    names.appendChild(el("em", null, "&"));
    names.appendChild(document.createTextNode(" " + second.en));
    put("introGu", first.gu + "  ·  " + second.gu);

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
    h.appendChild(document.createTextNode(first.en));
    h.appendChild(el("span", "hero__amp", "&"));
    h.appendChild(document.createTextNode(second.en));

    put("heroGu", first.gu + "  ·  " + second.gu);

    var meta = $("heroMeta");
    [W.headline.datesLabel, W.headline.venue, W.headline.city]
      .filter(function (t) { return t; })
      .forEach(function (t) { meta.appendChild(el("span", null, t)); });
  }());

  /* -- invitation --------------------------------------------------------- */

  (function invitation() {
    var inv = W.invitation;
    put("invBlessing", inv.blessing);
    put("invLead", inv.lead);

    var host = $("invParties");
    function party(person, parents) {
      var name = el("p", "invite__name", person.en);
      var gu   = el("p", "gu invite__gu", person.gu);
      host.appendChild(name);
      host.appendChild(gu);
      if (parents) host.appendChild(el("p", "invite__parents", parents));
    }
    party(groom, inv.groomLine);
    host.appendChild(el("p", "invite__weds", "weds"));
    party(bride, inv.brideLine);

    var when = [W.headline.datesLabel, W.headline.venue || W.headline.city]
      .filter(Boolean).join(" · ");
    put("invWhen", when);
  }());

  /* -- events: five individual invitation cards ---------------------------
     Every card is built by the same factory from one entry in W.events, so a
     card is edited in content.js and nowhere else. The fifth, the central
     invitation, is its own entry (W.invitationCard) rather than a special
     case bolted onto the others.                                           */

  (function events() {
    var list = $("eventsList");
    if (!list) return;

    /* ---- an event card ---- */
    function eventCard(ev, i) {
      var card = el("button", "inv reveal");
      card.type = "button";
      card.setAttribute("data-ink", ev.ink);
      card.setAttribute("data-paper", ev.paper);
      card.setAttribute("data-key", ev.key);
      if (ev.wideIllustration) card.setAttribute("data-wide", "true");
      card.style.setProperty("--d", i * 90 + "ms");
      card.setAttribute("aria-label", ev.en + " — " + ev.date + ". Open details.");

      if (ev.ornament) {
        var orn = el("img", "inv__orn");
        orn.src = "assets/generated/orn_hanging.png";
        orn.alt = ""; orn.loading = "lazy";
        card.appendChild(orn);
      }

      card.appendChild(el("h3", "inv__gu", ev.gu));
      if (ev.en) card.appendChild(el("p", "inv__en", ev.en));

      var times = (ev.times || []).filter(function (t) { return t.value; });

      if (ev.dateShort) {
        var when = el("div", "inv__when");
        when.appendChild(el("span", "inv__day", ev.dateShort.day));
        var md = el("span", "inv__md");
        md.appendChild(el("b", null, ev.dateShort.month));
        md.appendChild(el("span", null, times.length ? times[0].value : "2026"));
        when.appendChild(md);
        card.appendChild(when);
      }

      // one unlabelled time already reads beside the date
      if (times.length > 1) {
        var ul = el("ul", "inv__times");
        times.forEach(function (t) {
          var li = el("li");
          if (t.label) li.appendChild(document.createTextNode(t.label + "  "));
          li.appendChild(el("b", null, t.value));
          ul.appendChild(li);
        });
        card.appendChild(ul);
      }

      if (ev.venue) card.appendChild(el("p", "inv__venue", ev.venue));

      if (ev.illustration) {
        var ill = el("img", "inv__ill");
        ill.src = ev.illustration; ill.alt = ""; ill.loading = "lazy";
        card.appendChild(ill);
      }

      card.appendChild(el("span", "inv__more", "View details"));
      card.addEventListener("click", function () { openDialog(ev); });
      return card;
    }

    /* ---- the central invitation card ---- */
    function mainCard(cfg, i) {
      var card = el("article", "inv inv--main reveal");
      card.setAttribute("data-ink", cfg.ink);
      card.setAttribute("data-paper", cfg.paper);
      card.style.setProperty("--d", i * 90 + "ms");

      if (cfg.motif) {
        var m = el("img", "inv__motif");
        m.src = cfg.motif; m.alt = ""; m.loading = "lazy";
        card.appendChild(m);
      }
      card.appendChild(el("p", "inv__eyebrow", cfg.eyebrow));

      card.appendChild(el("p", "inv__name", groom.en));
      if (W.invitation.groomLine)
        card.appendChild(el("p", "inv__parents", W.invitation.groomLine));
      card.appendChild(el("p", "inv__weds", cfg.weds));
      card.appendChild(el("p", "inv__name", bride.en));
      if (W.invitation.brideLine)
        card.appendChild(el("p", "inv__parents", W.invitation.brideLine));

      card.appendChild(el("p", "inv__dates", W.headline.datesLabel));
      var place = W.headline.venue || W.headline.city;
      if (place) card.appendChild(el("p", "inv__city", place));
      return card;
    }

    W.events.forEach(function (ev, i) { list.appendChild(eventCard(ev, i)); });
    if (W.invitationCard) list.appendChild(mainCard(W.invitationCard, W.events.length));

    /* ---- detail dialog -------------------------------------------------- */

    var dlg = $("evdlg"), sheet = $("evdlgSheet"), lastFocus = null;

    function openDialog(ev) {
      lastFocus = document.activeElement;
      sheet.setAttribute("data-ink", ev.ink);

      var body = $("evdlgBody");
      body.textContent = "";
      body.appendChild(el("h3", "evdlg__gu", ev.gu));
      if (ev.en) body.appendChild(el("p", "evdlg__en", ev.en));
      body.appendChild(el("p", "evdlg__date", ev.date));

      var times = (ev.times || []).filter(function (t) { return t.value; });
      if (times.length) {
        var ul = el("ul", "evdlg__times");
        times.forEach(function (t) {
          var li = el("li");
          li.appendChild(el("span", null, t.label || "Begins"));
          li.appendChild(el("b", null, t.value));
          ul.appendChild(li);
        });
        body.appendChild(ul);
      }

      if (ev.venue) body.appendChild(el("p", "evdlg__date", ev.venue));
      if (ev.dress) body.appendChild(el("p", "evdlg__note", ev.dress));
      if (ev.note)  body.appendChild(el("p", "evdlg__note", ev.note));

      // venue is still to be confirmed; say so rather than showing a gap
      if (!ev.venue) {
        body.appendChild(el("p", "evdlg__blank", "Venue details to follow."));
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
      boxA.appendChild(el("h3", "gu hosts__heading reveal", p.heading));
      if (p.headingEn) boxA.appendChild(el("p", "hosts__sub reveal", p.headingEn));
      var ul = el("ul", "pairs reveal");
      p.pairs.forEach(function (pair) {
        var li = el("li");
        li.appendChild(el("span", "l", pair[0]));
        li.appendChild(el("span", "dot", "◆"));
        li.appendChild(el("span", "r", pair[1]));
        ul.appendChild(li);
      });
      boxA.appendChild(ul);
    } else { boxA.hidden = true; }

    var boxB = $("hostsAwaiting");
    if (a && a.names && a.names.length) {
      boxB.appendChild(ornRule());
      boxB.appendChild(el("h3", "gu hosts__heading reveal", a.heading));
      if (a.headingEn) boxB.appendChild(el("p", "hosts__sub reveal", a.headingEn));
      var ul2 = el("ul", "awaiting reveal");
      a.names.forEach(function (n) { ul2.appendChild(el("li", "gu", n)); });
      boxB.appendChild(ul2);
      if (a.solo)     boxB.appendChild(el("p", "gu awaiting--solo reveal", a.solo));
      if (a.children) boxB.appendChild(el("p", "gu awaiting--kids reveal", a.children));
    } else { boxB.hidden = true; }
  }());

  /* -- gallery ------------------------------------------------------------ */

  (function gallery() {
    var section = $("gallery");
    var photos = (W.gallery && W.gallery.photos) || [];
    if (!photos.length) { section.hidden = true; return; }

    var slides = $("gallerySlides"), dots = $("galleryDots");
    var idx = 0;

    photos.forEach(function (p, i) {
      var img = el("img");
      img.src = p.src;
      img.alt = p.alt || "";
      if (i) img.loading = "lazy";
      if (!i) img.classList.add("is-active");
      slides.appendChild(img);

      var b = el("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Photo " + (i + 1));
      if (!i) b.classList.add("is-active");
      b.addEventListener("click", function () { show(i); });
      dots.appendChild(b);
    });

    function show(n) {
      idx = (n + photos.length) % photos.length;
      var imgs = slides.children, btns = dots.children, i;
      for (i = 0; i < imgs.length; i++) imgs[i].classList.toggle("is-active", i === idx);
      for (i = 0; i < btns.length; i++) {
        btns[i].classList.toggle("is-active", i === idx);
        btns[i].setAttribute("aria-selected", i === idx ? "true" : "false");
      }
    }

    $("galPrev").addEventListener("click", function () { show(idx - 1); });
    $("galNext").addEventListener("click", function () { show(idx + 1); });

    // one photo needs no controls
    if (photos.length < 2) {
      $("galPrev").hidden = true; $("galNext").hidden = true; dots.hidden = true;
    }

    // swipe
    var x0 = null;
    slides.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    slides.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    }, { passive: true });

    // arrow keys while the gallery is on screen
    document.addEventListener("keydown", function (e) {
      var r = section.getBoundingClientRect();
      if (r.top > window.innerHeight || r.bottom < 0) return;
      if (e.key === "ArrowLeft")  show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });

    put("galleryCaption", W.gallery.caption);
    var t = $("galleryTitle");
    if (W.gallery.heading) t.textContent = W.gallery.heading;
  }());

  /* -- rsvp + calendar ---------------------------------------------------- */

  var startDate = new Date(W.countdownTo);

  (function rsvp() {
    var r = W.rsvp;
    put("rsvpEyebrow", r.eyebrow);
    put("rsvpHeading", r.heading);
    put("rsvpBody", r.body);
    put("rsvpNote", r.note);
    put("saveLabel", r.saveLabel);

    var cta = $("rsvpCta");
    cta.textContent = r.cta;
    if (r.whatsapp) {
      var msg = "Hi! I'd love to attend " + first.en + " & " + second.en +
                "'s wedding. Please count me in.";
      cta.href = "https://wa.me/" + r.whatsapp + "?text=" + encodeURIComponent(msg);
    } else {
      cta.removeAttribute("href");
      cta.setAttribute("aria-disabled", "true");
    }

    // ---- calendar links ----
    var title = first.en + " & " + second.en + " — Wedding";
    var where = [W.headline.venue, W.headline.city].filter(Boolean).join(", ");
    var end   = new Date(startDate.getTime() + 4 * 3600 * 1000);

    // Google wants UTC basic-format stamps.
    function utc(d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }

    $("calGoogle").href = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent(title) +
      "&dates=" + utc(startDate) + "/" + utc(end) +
      "&details=" + encodeURIComponent(W.couple.hashtag || "") +
      (where ? "&location=" + encodeURIComponent(where) : "");

    /* Apple/Outlook get a real .ics served over HTTP with a text/calendar
       MIME type. A data: URL works on desktop but iOS Safari — which is how
       most guests will open a WhatsApp link — refuses to hand it to Calendar.
       assets/wedding.ics carries all four events, not just the muhurat. */
    $("calIcs").href = "assets/wedding.ics";
  }());

  /* -- countdown ---------------------------------------------------------- */

  (function countdown() {
    var grid = $("cdGrid");
    var units = [["days", "Days"], ["hours", "Hours"], ["minutes", "Minutes"], ["seconds", "Seconds"]];
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
      box.appendChild(el("span", null, u[1]));
      wrap.appendChild(box);

      grid.appendChild(wrap);
      nums[u[0]] = b;
    });

    function tick() {
      var ms = startDate - Date.now();
      if (ms <= 0) {
        nums.days.textContent = nums.hours.textContent =
        nums.minutes.textContent = nums.seconds.textContent = "0";
        $("cdTitle").innerHTML = "Today is <em>Forever</em>";
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
    $("signoffNames").appendChild(document.createTextNode(first.en + " "));
    $("signoffNames").appendChild(el("em", null, "&"));
    $("signoffNames").appendChild(document.createTextNode(" " + second.en));
    put("signoffDate", W.headline.datesLabel);
    put("signoffLine", W.footer.line);
  }());

  /* -- compliments + footer ----------------------------------------------- */

  (function compliments() {
    var c = W.compliments, section = $("compliments");
    if (!c || !c.from || !c.from.length) { section.hidden = true; return; }
    put("compHeading", c.heading);
    var host = $("compList");
    c.from.forEach(function (f) {
      var d = el("div");
      d.appendChild(el("p", "compliments__name", f.name));
      if (f.city) d.appendChild(el("p", "compliments__city", f.city));
      host.appendChild(d);
    });
  }());

  $("footer").textContent = [W.couple.hashtag, W.footer.credit].filter(Boolean).join("  ·  ");

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

  /* -- hero parallax + night-aware controls ------------------------------- */

  (function scrollFx() {
    var layers = Array.prototype.slice.call(document.querySelectorAll("[data-par]"));
    var night = $("night");
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

      // flip the floating controls once the night half is behind them
      var r = night.getBoundingClientRect();
      document.body.classList.toggle("is-night", r.top < window.innerHeight * 0.75);

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
