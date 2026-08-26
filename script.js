/* ==========================================================================
   ZULQURNAIN — RUNTIME  v5.0
   Vanilla. No dependencies. Organised as isolated init() modules so any one
   of them can fail without taking the page down.

   01 Utils            02 Scroll lock       03 Audio engine
   04 Theme            05 Boot sequence     06 Scroll progress
   07 Nav + mobile     08 Smooth scroll     09 Reveal + count-up
   10 Portrait tilt    11 Spotlight         12 Cursor glow
   13 Magnetic buttons 14 Marquee           15 Case-study modal
   16 Terminal CLI     17 Command palette   18 Contact form
   19 Profile links
   ========================================================================== */

(() => {
  "use strict";

  /* ============================================================= 01 UTILS */
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
  /* data.js may expose this as a window property or as a bare lexical global
     depending on how it's declared — accept either, and degrade to {} if the
     file failed to load at all. */
  const D =
    (typeof window.PORTFOLIO_DATA !== "undefined" && window.PORTFOLIO_DATA) ||
    (typeof PORTFOLIO_DATA !== "undefined" && PORTFOLIO_DATA) ||
    {};
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const IS_TOUCH = window.matchMedia("(hover: none)").matches;

  /** Escape anything that will touch innerHTML. */
  const esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ======================================================= 02 SCROLL LOCK */
  /* Counter-based so the modal, palette and mobile menu can't fight each
     other over document.body.style.overflow (the old bug). */
  const ScrollLock = (() => {
    let depth = 0;
    return {
      on() {
        depth += 1;
        document.documentElement.classList.add("is-locked");
      },
      off() {
        depth = Math.max(0, depth - 1);
        if (!depth) document.documentElement.classList.remove("is-locked");
      },
    };
  })();

  /* ====================================================== 03 AUDIO ENGINE */
  /* One shared AudioContext, created lazily on first gesture. The previous
     version built a new context per keystroke, which browsers hard-cap. */
  const Audio = (() => {
    let ctx = null;
    let on = false;

    const context = () => {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        try {
          ctx = new AC();
        } catch (e) {
          return null;
        }
      }
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      return ctx;
    };

    const click = (heavy = false) => {
      if (!on) return;
      const c = context();
      if (!c) return;
      const t = c.currentTime;

      // Filtered noise burst = the mechanical "clack".
      const len = Math.floor(c.sampleRate * 0.04);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const chan = buf.getChannelData(0);
      for (let i = 0; i < len; i++) chan[i] = Math.random() * 2 - 1;

      const noise = c.createBufferSource();
      noise.buffer = buf;
      const bp = c.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(heavy ? 620 : 1250, t);
      bp.Q.setValueAtTime(3, t);
      const ng = c.createGain();
      ng.gain.setValueAtTime(heavy ? 0.13 : 0.06, t);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);

      // Low sine thump = the body of the keypress.
      const osc = c.createOscillator();
      const og = c.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(heavy ? 150 : 285, t);
      og.gain.setValueAtTime(heavy ? 0.085 : 0.03, t);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);

      noise.connect(bp).connect(ng).connect(c.destination);
      osc.connect(og).connect(c.destination);
      noise.start(t);
      osc.start(t);
      noise.stop(t + 0.045);
      osc.stop(t + 0.045);
    };

    return {
      click,
      get enabled() {
        return on;
      },
      toggle() {
        on = !on;
        if (on) click(true);
        return on;
      },
    };
  })();

  /* ============================================================= 04 THEME */
  const Theme = (() => {
    const KEY = "zq-accent";
    const KEY_INK = "zq-accent-ink";
    const list =
      Array.isArray(D.themes) && D.themes.length
        ? D.themes
        : [
            {
              key: "red",
              name: "Signal Red",
              color: "#e74c3c",
              ink: "#ffffff",
            },
          ];

    const read = () => {
      try {
        return localStorage.getItem(KEY);
      } catch (e) {
        return null;
      }
    };

    const apply = (theme, persist = true) => {
      const root = document.documentElement;
      root.style.setProperty("--accent", theme.color);
      root.style.setProperty("--accent-ink", theme.ink);
      qs('meta[name="theme-color"]')?.setAttribute("content", "#060608");
      if (persist) {
        try {
          localStorage.setItem(KEY, theme.color);
          localStorage.setItem(KEY_INK, theme.ink);
        } catch (e) {}
      }
      qsa(".theme-dot").forEach((d) =>
        d.classList.toggle("active", d.dataset.color === theme.color),
      );
    };

    const current = () => {
      const saved = read();
      return list.find((t) => t.color === saved) || list[0];
    };

    /* Dots are generated from data.js so the palette lives in exactly one place. */
    const mount = (container) => {
      if (!container) return;
      container.innerHTML = list
        .map(
          (t) =>
            `<button class="theme-dot" data-color="${esc(t.color)}" data-key="${esc(t.key)}"` +
            ` style="background:${esc(t.color)}" title="${esc(t.name)}"` +
            ` aria-label="Accent: ${esc(t.name)}"></button>`,
        )
        .join("");
      qsa(".theme-dot", container).forEach((dot) => {
        dot.addEventListener("click", () => {
          const t = list.find((x) => x.color === dot.dataset.color);
          if (t) {
            apply(t);
            Audio.click(false);
          }
        });
      });
    };

    const init = () => {
      mount(qs("#theme-dots"));
      mount(qs("#theme-dots-mobile"));
      apply(current(), false);

      qs("#theme-cycle")?.addEventListener("click", () => {
        const i = list.findIndex((t) => t.color === current().color);
        apply(list[(i + 1) % list.length]);
        Audio.click(false);
      });
    };

    return {
      init,
      apply,
      list,
      current,
      byKey: (k) => list.find((t) => t.key === k),
    };
  })();

  /* ==================================================== 05 BOOT SEQUENCE */
  const initPreloader = () => {
    const root = document.documentElement;
    const pre = qs("#preloader");
    if (!pre || !root.classList.contains("is-booting")) {
      root.classList.remove("is-booting");
      return;
    }

    const bar = qs("#preloader-bar");
    const pct = qs("#preloader-pct");
    const msg = qs("#preloader-msg");
    const steps = [
      [0, "initialising systems"],
      [28, "loading vision modules"],
      [55, "mounting data layer"],
      [78, "compiling interface"],
      [96, "ready"],
    ];

    let p = 0;
    let stepIdx = 0;

    const finish = () => {
      clearInterval(timer);
      try {
        sessionStorage.setItem("zq-booted", "1");
      } catch (e) {}
      pre.classList.add("done");
      root.classList.remove("is-booting");
      setTimeout(() => pre.remove(), 700);
      document.dispatchEvent(new CustomEvent("zq:booted"));
    };

    const timer = setInterval(() => {
      p = Math.min(100, p + Math.random() * 9 + 4);
      if (bar) bar.style.width = p + "%";
      if (pct) pct.textContent = String(Math.floor(p)).padStart(3, "0");
      while (stepIdx < steps.length && p >= steps[stepIdx][0]) {
        if (msg) msg.textContent = steps[stepIdx][1];
        stepIdx++;
      }
      if (p >= 100) setTimeout(finish, 260);
    }, 90);

    // Hard safety net — the user never gets trapped behind a splash screen.
    setTimeout(finish, 3200);
  };

  /* ================================================== 06 SCROLL PROGRESS */
  const initProgress = () => {
    const bar = qs("#progress-bar");
    if (!bar) return;
    let raf = null;
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
      raf = null;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!raf) raf = requestAnimationFrame(update);
      },
      { passive: true },
    );
    update();
  };

  /* ==================================================== 07 NAV + MOBILE  */
  const initNav = () => {
    const nav = qs("#site-nav");
    const toggle = qs("#nav-toggle");
    const menu = qs("#mobile-menu");

    if (nav) {
      let raf = null;
      const onScroll = () => {
        nav.classList.toggle("is-scrolled", window.scrollY > 12);
        raf = null;
      };
      window.addEventListener(
        "scroll",
        () => {
          if (!raf) raf = requestAnimationFrame(onScroll);
        },
        { passive: true },
      );
      onScroll();
    }

    /* Active section highlighting */
    const links = qsa("[data-nav]");
    const sections = links
      .map((l) => qs(l.getAttribute("href")))
      .filter(Boolean);
    if (sections.length && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            links.forEach((l) =>
              l.classList.toggle(
                "active",
                l.getAttribute("href") === "#" + e.target.id,
              ),
            );
          });
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
      );
      sections.forEach((s) => io.observe(s));
    }

    /* Mobile drawer */
    if (!toggle || !menu) return;

    qsa(".mm-links a", menu).forEach((a, i) => a.style.setProperty("--mi", i));

    const setMenu = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(() => menu.classList.add("open"));
        ScrollLock.on();
      } else {
        menu.classList.remove("open");
        ScrollLock.off();
        setTimeout(() => {
          if (!menu.classList.contains("open")) menu.hidden = true;
        }, 340);
      }
      Audio.click(true);
    };

    toggle.addEventListener("click", () =>
      setMenu(toggle.getAttribute("aria-expanded") !== "true"),
    );
    qsa("a", menu).forEach((a) =>
      a.addEventListener("click", () => setMenu(false)),
    );
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true")
        setMenu(false);
    });
    // Drawer is mobile-only; a resize past the breakpoint should dismiss it.
    window.addEventListener("resize", () => {
      if (
        window.innerWidth > 900 &&
        toggle.getAttribute("aria-expanded") === "true"
      )
        setMenu(false);
    });

    window.__zqCloseMenu = () => {
      if (toggle.getAttribute("aria-expanded") === "true") setMenu(false);
    };
  };

  /* ==================================================== 08 SMOOTH SCROLL */
  const initSmoothScroll = () => {
    const navH = () => (qs("#site-nav")?.offsetHeight || 70) + 12;

    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = id === "#top" ? document.body : qs(id);
      if (!target) return;

      e.preventDefault();
      window.__zqCloseMenu?.();
      const y =
        id === "#top"
          ? 0
          : target.getBoundingClientRect().top + window.scrollY - navH();
      window.scrollTo({
        top: Math.max(0, y),
        behavior: REDUCED ? "auto" : "smooth",
      });
      if (history.replaceState)
        history.replaceState(null, "", id === "#top" ? " " : id);
    });
  };

  const scrollToId = (id) => {
    const el = id === "#top" ? document.body : qs(id);
    if (!el) return;
    const navH = (qs("#site-nav")?.offsetHeight || 70) + 12;
    const y =
      id === "#top"
        ? 0
        : el.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({
      top: Math.max(0, y),
      behavior: REDUCED ? "auto" : "smooth",
    });
  };

  /* ================================================ 09 REVEAL + COUNT-UP */
  const initReveal = () => {
    /* Auto-stagger any container marked data-stagger */
    qsa("[data-stagger]").forEach((wrap) => {
      qsa(".reveal", wrap).forEach((el, i) => {
        if (!el.style.getPropertyValue("--i")) el.style.setProperty("--i", i);
      });
    });

    const items = qsa(".reveal");
    if (!("IntersectionObserver" in window) || REDUCED) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          obs.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    items.forEach((el) => io.observe(el));

    /* Hero reveals fire immediately — they're above the fold either way, and
       waiting on the boot sequence would leave a blank first frame. */
    const runHero = () =>
      qsa("#hero .reveal, #hero .line-mask").forEach((el) =>
        el.classList.add("in"),
      );
    if (document.documentElement.classList.contains("is-booting")) {
      document.addEventListener("zq:booted", runHero, { once: true });
    } else {
      // rAF is suspended in background tabs, so a visitor who middle-clicks
      // this link would land on a hero stuck at opacity 0. The timer is a
      // guarantee; runHero is idempotent, so running twice costs nothing.
      requestAnimationFrame(runHero);
      setTimeout(runHero, 300);
    }
  };

  const initCountUp = () => {
    const nums = qsa("[data-count]");
    if (!nums.length) return;

    const fmt = (v, dec) => (dec ? v.toFixed(dec) : Math.round(v).toString());

    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || "0", 10);
      const suffix = el.dataset.suffix || "";
      if (Number.isNaN(target)) return;
      if (REDUCED) {
        el.textContent = fmt(target, dec) + suffix;
        return;
      }

      const dur = 1500;
      let start = null;
      const tick = (ts) => {
        if (start === null) start = ts;
        const p = clamp((ts - start) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = fmt(lerp(0, target, eased), dec) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      nums.forEach(run);
      return;
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          run(e.target);
          obs.unobserve(e.target);
        });
      },
      { threshold: 0.55 },
    );
    nums.forEach((n) => io.observe(n));
  };

  /* =================================================== 10 PORTRAIT TILT  */
  const initTilt = () => {
    const wrap = qs("#portrait-wrapper");
    const img = qs(".interactive-portrait", wrap || document);
    if (!wrap || !img || IS_TOUCH || REDUCED) return;

    let raf = null;
    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0;

    const loop = () => {
      cx = lerp(cx, tx, 0.14);
      cy = lerp(cy, ty, 0.14);
      img.style.transform = `scale(1.06) rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg)`;
      raf =
        Math.abs(cx - tx) > 0.02 || Math.abs(cy - ty) > 0.02
          ? requestAnimationFrame(loop)
          : null;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    wrap.addEventListener("mousemove", (e) => {
      const r = wrap.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 22;
      ty = ((e.clientY - r.top) / r.height - 0.5) * -16;
      img.style.filter = "grayscale(0%) contrast(100%) brightness(1)";
      kick();
    });
    wrap.addEventListener("mouseleave", () => {
      tx = 0;
      ty = 0;
      img.style.filter = "grayscale(100%) contrast(112%) brightness(0.95)";
      kick();
    });
  };

  /* ======================================================= 11 SPOTLIGHT */
  const initSpotlight = () => {
    if (IS_TOUCH || REDUCED) return;
    qsa(".spot").forEach((el) => {
      el.addEventListener(
        "mousemove",
        (e) => {
          const r = el.getBoundingClientRect();
          el.style.setProperty("--mx", `${e.clientX - r.left}px`);
          el.style.setProperty("--my", `${e.clientY - r.top}px`);
        },
        { passive: true },
      );
    });
  };

  /* ===================================================== 12 CURSOR GLOW */
  const initCursorGlow = () => {
    const glow = qs("#cursor-glow");
    if (!glow || IS_TOUCH || REDUCED) return;

    let tx = window.innerWidth / 2,
      ty = window.innerHeight / 2;
    let cx = tx,
      cy = ty,
      raf = null;

    const loop = () => {
      cx = lerp(cx, tx, 0.09);
      cy = lerp(cy, ty, 0.09);
      glow.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener(
      "mousemove",
      (e) => {
        tx = e.clientX;
        ty = e.clientY;
        if (!document.body.classList.contains("cursor-live")) {
          document.body.classList.add("cursor-live");
        }
        if (!raf) raf = requestAnimationFrame(loop);
      },
      { passive: true },
    );
  };

  /* ================================================ 13 MAGNETIC BUTTONS */
  const initMagnetic = () => {
    if (IS_TOUCH || REDUCED) return;
    qsa("[data-magnetic]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.16;
        const y = (e.clientY - r.top - r.height / 2) * 0.28;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  };

  /* ========================================================= 14 MARQUEE */
  const initMarquee = () => {
    const track = qs("#marquee-track");
    if (!track || REDUCED) return;
    // Duplicate the content so translateX(-50%) loops seamlessly.
    track.innerHTML += track.innerHTML;
  };

  /* ==================================================== 15 PROJECT MODAL */
  const initModal = () => {
    const overlay = qs("#project-modal");
    const dialog = qs("#modal-dialog");
    const closeBtn = qs("#modal-close");
    if (!overlay || !dialog) return;

    const FOCUSABLE =
      'a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])';
    let lastFocus = null;

    const fill = (p) => {
      const set = (sel, val) => {
        const n = qs(sel);
        if (n) n.textContent = val ?? "";
      };
      set("#modal-index", p.index || "");
      set("#modal-meta", [p.period, p.role].filter(Boolean).join(" · "));
      set("#modal-title", p.title || "");
      set("#modal-summary", p.summary || "");
      set("#modal-problem", p.problem || "");
      set("#modal-outcome", p.outcome || "");

      const stack = qs("#modal-stack");
      if (stack) {
        stack.innerHTML = (p.stack || [])
          .map((t) => `<span>${esc(t)}</span>`)
          .join("");
      }
      const metrics = qs("#modal-metrics");
      if (metrics) {
        metrics.innerHTML = (p.metrics || [])
          .map((m) => `<div><b>${esc(m.v)}</b><span>${esc(m.l)}</span></div>`)
          .join("");
        metrics.style.display = (p.metrics || []).length ? "" : "none";
      }
      const list = (sel, arr) => {
        const n = qs(sel);
        if (!n) return;
        n.innerHTML = (arr || []).map((i) => `<li>${esc(i)}</li>`).join("");
        n.closest(".modal-block")?.style.setProperty(
          "display",
          (arr || []).length ? "" : "none",
        );
      };
      list("#modal-approach", p.approach);
      list("#modal-highlights", p.highlights);
    };

    const open = (key) => {
      const p = (D.projects || D.modals || {})[key];
      if (!p) return;
      fill(p);
      lastFocus = document.activeElement;
      overlay.classList.remove("hidden");
      ScrollLock.on();
      Audio.click(true);
      setTimeout(() => closeBtn?.focus(), 60);
    };

    const close = () => {
      if (overlay.classList.contains("hidden")) return;
      overlay.classList.add("hidden");
      ScrollLock.off();
      Audio.click(false);
      lastFocus?.focus?.();
    };

    qsa(".modal-trigger").forEach((el) => {
      const go = () => open(el.dataset.project);
      el.addEventListener("click", go);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          go();
        }
      });
    });

    closeBtn?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });

    /* Focus trap + escape */
    document.addEventListener("keydown", (e) => {
      if (overlay.classList.contains("hidden")) return;
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab") return;

      const nodes = qsa(FOCUSABLE, dialog).filter(
        (n) => n.offsetParent !== null,
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    window.__zqOpenProject = open;
  };

  /* ===================================================== 16 TERMINAL CLI */
  const initTerminal = () => {
    const win = qs("#terminal-window");
    const toggle = qs("#chatbot-toggle");
    const closeBtn = qs("#close-terminal");
    const form = qs("#terminal-form");
    const input = qs("#terminal-input");
    const out = qs("#terminal-output");
    const audioBtn = qs("#audio-toggle");
    const sugWrap = qs("#terminal-suggestions");
    if (!win || !toggle || !form || !input || !out) return;

    const CMDS = D.chatbot || {};
    const ALIASES = D.aliases || {};
    const BUILTIN = ["help", "clear", "ls", "theme", "open", "exit"];
    const history = [];
    let hIdx = -1;
    let busy = false;

    /* ---- rendering -------------------------------------------------- */
    const el = (cls, text) => {
      const n = document.createElement("p");
      n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    };

    const push = (node) => {
      out.appendChild(node);
      out.scrollTop = out.scrollHeight;
      return node;
    };

    const renderLine = (line) => {
      switch (line.t) {
        case "rule": {
          const n = document.createElement("div");
          n.className = "t-rule";
          return n;
        }
        case "head":
          return el("t-head", `── ${line.v} ──`);
        case "kv": {
          const n = document.createElement("p");
          n.className = "t-kv";
          const b = document.createElement("b");
          b.textContent = line.k;
          const s = document.createElement("span");
          s.textContent = line.v;
          n.append(b, s);
          return n;
        }
        case "li":
          return el("t-li", line.v);
        case "ok":
          return el("t-ok", line.v);
        case "warn":
          return el("t-warn", line.v);
        case "err":
          return el("t-err", line.v);
        case "dim":
          return el("t-dim", line.v);
        case "ascii": {
          const n = document.createElement("pre");
          n.className = "t-ascii";
          n.textContent = line.v;
          return n;
        }
        case "link": {
          const a = document.createElement("a");
          a.className = "t-link";
          a.href = line.href;
          a.textContent = line.v;
          if (line.blank) {
            a.target = "_blank";
            a.rel = "noopener";
          }
          return a;
        }
        default:
          return el("t-txt", line.v);
      }
    };

    /* Print lines one at a time so it reads like a real terminal. */
    const printLines = (lines, done) => {
      let i = 0;
      const step = () => {
        if (i >= lines.length) {
          done?.();
          return;
        }
        push(renderLine(lines[i]));
        if (Audio.enabled && i % 2 === 0) Audio.click(false);
        i++;
        setTimeout(step, REDUCED ? 0 : 55);
      };
      step();
    };

    const boot = () => {
      out.innerHTML = "";
      printLines([
        { t: "head", v: "ZQ-CLI v5.0" },
        {
          t: "txt",
          v: "Interactive résumé shell. Everything here is real data.",
        },
        {
          t: "ok",
          v: "Type 'help' for commands, or tap a chip below. Tab autocompletes.",
        },
      ]);
    };

    /* ---- suggestion chips ------------------------------------------- */
    if (sugWrap) {
      const sugs = D.suggestions || ["help", "whoami", "projects", "contact"];
      sugWrap.innerHTML = sugs
        .map(
          (s) =>
            `<button class="sug" type="button" data-cmd="${esc(s)}">${esc(s)}</button>`,
        )
        .join("");
      sugWrap.addEventListener("click", (e) => {
        const b = e.target.closest(".sug");
        if (b) submit(b.dataset.cmd);
      });
    }

    /* ---- command resolution ----------------------------------------- */
    const resolve = (name) => ALIASES[name] || name;

    const allCommands = () => [...Object.keys(CMDS), ...BUILTIN].sort();

    const nearest = (name) => {
      const pool = allCommands().concat(Object.keys(ALIASES));
      return pool.find((c) => c.startsWith(name) || c.includes(name)) || null;
    };

    const helpLines = () => {
      const rows = Object.keys(CMDS)
        .filter((k) => k !== "sudo")
        .map((k) => ({ t: "kv", k, v: CMDS[k].hint || "" }));
      return [
        { t: "head", v: "COMMANDS" },
        ...rows,
        { t: "rule" },
        { t: "kv", k: "theme", v: "switch accent — e.g. 'theme cyan'" },
        { t: "kv", k: "open", v: "jump to a section — e.g. 'open work'" },
        { t: "kv", k: "ls", v: "list everything available" },
        { t: "kv", k: "clear", v: "wipe the buffer" },
        { t: "kv", k: "exit", v: "close this window" },
        { t: "dim", v: "Aliases work too: about, cv, tech, hire, links…" },
      ];
    };

    const SECTIONS = {
      top: "#top",
      home: "#top",
      intro: "#top",
      strengths: "#strengths",
      skills: "#strengths",
      work: "#work",
      projects: "#work",
      experience: "#experience",
      education: "#education",
      stack: "#stack",
      tech: "#stack",
      contact: "#contact",
    };

    /* ---- the shell -------------------------------------------------- */
    const run = (raw) => {
      const parts = raw.trim().split(/\s+/);
      const cmd = resolve((parts[0] || "").toLowerCase());
      const arg = (parts[1] || "").toLowerCase();

      if (cmd === "clear") {
        boot();
        return null;
      }

      if (cmd === "exit") {
        setTimeout(() => setOpen(false), 220);
        return [{ t: "dim", v: "Closing session…" }];
      }

      if (cmd === "help") return helpLines();

      if (cmd === "ls") {
        return [
          { t: "head", v: "AVAILABLE" },
          { t: "txt", v: allCommands().join("  ") },
        ];
      }

      if (cmd === "theme") {
        const t =
          Theme.byKey(arg) ||
          Theme.list.find((x) => x.name.toLowerCase().includes(arg));
        if (!arg) {
          return [
            { t: "head", v: "THEMES" },
            ...Theme.list.map((x) => ({ t: "kv", k: x.key, v: x.name })),
            { t: "dim", v: "Usage: theme cyan" },
          ];
        }
        if (!t)
          return [
            {
              t: "err",
              v: `No theme '${arg}'. Try: ${Theme.list.map((x) => x.key).join(", ")}`,
            },
          ];
        Theme.apply(t);
        return [{ t: "ok", v: `Accent set → ${t.name}` }];
      }

      if (cmd === "open" || cmd === "goto") {
        const id = SECTIONS[arg];
        if (!id) {
          return [
            { t: "err", v: `Unknown section '${arg || "?"}'.` },
            { t: "dim", v: "Options: " + Object.keys(SECTIONS).join(", ") },
          ];
        }
        setTimeout(() => scrollToId(id), 260);
        return [{ t: "ok", v: `Navigating → ${arg}` }];
      }

      const entry = CMDS[cmd];
      if (entry) return entry.lines;

      const guess = nearest(cmd);
      return [
        { t: "err", v: `command not found: ${raw.trim()}` },
        guess
          ? { t: "dim", v: `Did you mean '${guess}'?` }
          : { t: "dim", v: "Type 'help' to see what I respond to." },
      ];
    };

    const submit = (value) => {
      if (busy) return;
      const raw = String(value ?? "").trim();
      if (!raw) return;

      history.push(raw);
      hIdx = history.length;
      input.value = "";
      Audio.click(true);

      const line = document.createElement("p");
      line.className = "t-user";
      const b = document.createElement("b");
      b.textContent = "❯ ";
      line.append(b, document.createTextNode(raw));
      push(line);

      const result = run(raw);
      if (!result) return;

      busy = true;
      const scan = push(el("t-sys t-caret", "resolving"));
      setTimeout(
        () => {
          scan.remove();
          printLines(result, () => {
            busy = false;
          });
        },
        REDUCED ? 40 : 340,
      );
    };

    /* ---- window state ---------------------------------------------- */
    const setOpen = (open) => {
      win.classList.toggle("hidden", !open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute(
        "aria-label",
        open ? "Close interactive CLI" : "Open interactive CLI",
      );
      if (open) {
        if (!out.childElementCount) boot();
        setTimeout(() => input.focus(), 120);
      }
      Audio.click(true);
    };

    toggle.addEventListener("click", () =>
      setOpen(win.classList.contains("hidden")),
    );
    closeBtn?.addEventListener("click", () => setOpen(false));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submit(input.value);
    });

    input.addEventListener("input", () => Audio.click(false));

    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!history.length) return;
        hIdx = Math.max(0, hIdx - 1);
        input.value = history[hIdx] || "";
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        hIdx = Math.min(history.length, hIdx + 1);
        input.value = history[hIdx] || "";
      } else if (e.key === "Tab") {
        e.preventDefault();
        const q = input.value.trim().toLowerCase();
        if (!q) return;
        const hit = allCommands().find((c) => c.startsWith(q));
        if (hit) input.value = hit;
      } else if (e.key === "Escape") {
        setOpen(false);
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        boot();
      }
    });

    audioBtn?.addEventListener("click", () => {
      const on = Audio.toggle();
      audioBtn.textContent = on ? "AUDIO: ON" : "AUDIO: OFF";
      audioBtn.setAttribute("aria-pressed", String(on));
    });

    window.__zqOpenTerminal = () => setOpen(true);
  };

  /* ================================================= 17 COMMAND PALETTE */
  /* Self-contained toast — inline styles so it needs no extra CSS, but reads
     from the design tokens so it always matches the active accent. */
  const toast = (() => {
    let node = null;
    let timer = 0;
    return (msg) => {
      if (!node) {
        node = document.createElement("div");
        node.setAttribute("role", "status");
        node.setAttribute("aria-live", "polite");
        node.style.cssText =
          "position:fixed;left:50%;bottom:2rem;translate:-50% 0;z-index:6000;" +
          "padding:.7rem 1.1rem;border-radius:99px;pointer-events:none;" +
          "background:var(--s3,#15151b);border:1px solid var(--line-2,#25252d);" +
          "color:var(--ink,#f5f5f7);font-family:var(--f-mono,monospace);" +
          "font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;" +
          "box-shadow:0 18px 40px rgba(0,0,0,.55);opacity:0;" +
          "transition:opacity .22s ease,translate .22s ease";
        document.body.appendChild(node);
      }
      node.textContent = msg;
      node.style.opacity = "1";
      node.style.translate = "-50% -6px";
      clearTimeout(timer);
      timer = setTimeout(() => {
        node.style.opacity = "0";
        node.style.translate = "-50% 0";
      }, 1900);
    };
  })();

  /** Clipboard with a document.execCommand fallback for non-secure contexts. */
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied — " + text);
      return;
    } catch (e) {
      /* fall through */
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {}
    ta.remove();
    toast(ok ? "Copied — " + text : "Copy blocked — " + text);
  };

  const initPalette = () => {
    const overlay = qs("#command-palette");
    const search = qs("#palette-search");
    const results = qs("#palette-results");
    if (!overlay || !search || !results) return;

    const P = D.profile || {};

    /* Built once, from data.js — so adding a theme or a project automatically
       adds a palette command. No second list to keep in sync. */
    const build = () => {
      const list = [
        {
          g: "Navigation",
          label: "Top — intro",
          hint: "home",
          act: () => scrollToId("#top"),
        },
        {
          g: "Navigation",
          label: "Core strengths",
          hint: "strengths",
          act: () => scrollToId("#strengths"),
        },
        {
          g: "Navigation",
          label: "Selected work",
          hint: "work",
          act: () => scrollToId("#work"),
        },
        {
          g: "Navigation",
          label: "Experience",
          hint: "experience",
          act: () => scrollToId("#experience"),
        },
        {
          g: "Navigation",
          label: "Education",
          hint: "education",
          act: () => scrollToId("#education"),
        },
        {
          g: "Navigation",
          label: "Stack & tooling",
          hint: "stack",
          act: () => scrollToId("#stack"),
        },
        {
          g: "Navigation",
          label: "Contact",
          hint: "contact",
          act: () => scrollToId("#contact"),
        },
      ];

      Object.keys(D.projects || {}).forEach((key) => {
        const p = D.projects[key];
        list.push({
          g: "Case studies",
          label: p.title,
          hint: "case " + key,
          act: () => window.__zqOpenProject?.(key),
        });
      });

      Theme.list.forEach((t) => {
        list.push({
          g: "Accent",
          label: t.name,
          hint: "theme " + t.key,
          swatch: t.color,
          act: () => Theme.apply(t),
        });
      });

      list.push(
        {
          g: "Utility",
          label: "Open the terminal",
          hint: "cli",
          act: () => window.__zqOpenTerminal?.(),
        },
        {
          g: "Utility",
          label: "Download résumé (PDF)",
          hint: "resume",
          act: () => window.open(P.cv || "#", "_blank", "noopener"),
        },
        {
          g: "Utility",
          label: "Copy email address",
          hint: "copy email",
          act: () => copyText(P.email || ""),
        },
        {
          g: "Utility",
          label: "Email me directly",
          hint: "mailto",
          act: () => {
            window.location.href = "mailto:" + (P.email || "");
          },
        },
      );

      if (P.phone) {
        list.push({
          g: "Utility",
          label: "Call " + P.phone,
          hint: "tel",
          act: () => {
            window.location.href = "tel:" + (P.phoneHref || P.phone);
          },
        });
      }

      list.push(
        {
          g: "Utility",
          label: "Toggle keyboard audio",
          hint: "audio",
          act: () => toast(Audio.toggle() ? "Audio on" : "Audio off"),
        },
        {
          g: "Utility",
          label: "Print / save this page",
          hint: "print",
          act: () => window.print(),
        },
      );

      (P.socials || []).forEach((s) => {
        list.push({
          g: "Elsewhere",
          label: s.label,
          hint: s.handle || "open",
          act: () =>
            s.url && s.url.startsWith("mailto:")
              ? (window.location.href = s.url)
              : window.open(s.url || "#", "_blank", "noopener"),
        });
      });

      return list;
    };

    const COMMANDS = build();
    let filtered = COMMANDS.slice();
    let sel = 0;
    let lastFocus = null;

    /* Substring first, then subsequence — so "tg" still finds "Terminal Green"
       but exact matches always sort above loose ones. */
    const rank = (cmd, q) => {
      const hay = (cmd.label + " " + cmd.hint + " " + cmd.g).toLowerCase();
      if (hay.startsWith(q)) return 0;
      if (hay.includes(q)) return 1;
      let i = 0;
      for (const ch of q) {
        i = hay.indexOf(ch, i);
        if (i === -1) return -1;
        i += 1;
      }
      return 2;
    };

    const filter = (raw) => {
      const q = raw.trim().toLowerCase();
      sel = 0;
      if (!q) {
        filtered = COMMANDS.slice();
        return;
      }
      filtered = COMMANDS.map((c) => ({ c, r: rank(c, q) }))
        .filter((x) => x.r > -1)
        .sort((a, b) => a.r - b.r)
        .map((x) => x.c);
    };

    const render = () => {
      results.textContent = "";

      if (!filtered.length) {
        const empty = document.createElement("p");
        empty.className = "palette-empty";
        empty.textContent =
          "Nothing matches that. Try “work”, “theme”, or “resume”.";
        results.appendChild(empty);
        return;
      }

      const frag = document.createDocumentFragment();
      let group = null;

      filtered.forEach((cmd, idx) => {
        if (cmd.g !== group) {
          group = cmd.g;
          const h = document.createElement("p");
          h.className = "palette-group";
          h.textContent = group;
          frag.appendChild(h);
        }

        const item = document.createElement("button");
        item.type = "button";
        item.className = "palette-item" + (idx === sel ? " selected" : "");
        item.dataset.idx = String(idx);
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", idx === sel ? "true" : "false");

        if (cmd.swatch) {
          const sw = document.createElement("span");
          sw.className = "pi-swatch";
          sw.style.background = cmd.swatch;
          item.appendChild(sw);
        }

        const label = document.createElement("span");
        label.className = "pi-text";
        label.textContent = cmd.label;
        item.appendChild(label);

        const kbd = document.createElement("span");
        kbd.className = "palette-shortcut";
        kbd.textContent = cmd.hint;
        item.appendChild(kbd);

        frag.appendChild(item);
      });

      results.appendChild(frag);
      results
        .querySelector(".palette-item.selected")
        ?.scrollIntoView({ block: "nearest" });
    };

    const move = (delta) => {
      if (!filtered.length) return;
      sel = (sel + delta + filtered.length) % filtered.length;
      render();
      Audio.click(false);
    };

    const isOpen = () => !overlay.classList.contains("hidden");

    const open = () => {
      if (isOpen()) return;
      lastFocus = document.activeElement;
      overlay.classList.remove("hidden");
      ScrollLock.on();
      search.value = "";
      filter("");
      render();
      setTimeout(() => search.focus(), 40);
      Audio.click(true);
    };

    const close = () => {
      if (!isOpen()) return;
      overlay.classList.add("hidden");
      ScrollLock.off();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      lastFocus = null;
    };

    const execute = () => {
      const cmd = filtered[sel];
      if (!cmd) return;
      close();
      Audio.click(true);
      // Let the overlay finish unlocking before we scroll or open another layer.
      setTimeout(() => cmd.act(), REDUCED ? 0 : 120);
    };

    /* ---- wiring ------------------------------------------------------ */
    qs("#palette-open")?.addEventListener("click", open);
    qs("#palette-open-2")?.addEventListener("click", open);

    search.addEventListener("input", () => {
      filter(search.value);
      render();
      Audio.click(false);
    });

    search.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        move(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        move(-1);
      } else if (e.key === "Home") {
        e.preventDefault();
        sel = 0;
        render();
      } else if (e.key === "End") {
        e.preventDefault();
        sel = filtered.length - 1;
        render();
      } else if (e.key === "Enter") {
        e.preventDefault();
        execute();
      } else if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "Tab") {
        // Nothing else in the box is focusable — keep focus in the input.
        e.preventDefault();
      }
    });

    results.addEventListener("mousemove", (e) => {
      const item = e.target.closest(".palette-item");
      if (!item) return;
      const idx = Number(item.dataset.idx);
      if (idx === sel) return;
      sel = idx;
      render();
    });

    results.addEventListener("click", (e) => {
      const item = e.target.closest(".palette-item");
      if (!item) return;
      sel = Number(item.dataset.idx);
      execute();
    });

    overlay.addEventListener("mousedown", (e) => {
      if (e.target === overlay) close();
    });

    window.addEventListener("keydown", (e) => {
      const k = (e.key || "").toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === "k") {
        e.preventDefault();
        isOpen() ? close() : open();
        return;
      }
      // "/" is a nice shortcut, but never steal it from a text field.
      if (
        k === "/" &&
        !isOpen() &&
        !/^(input|textarea|select)$/i.test(
          document.activeElement?.tagName || "",
        )
      ) {
        e.preventDefault();
        open();
      }
    });

    window.__zqOpenPalette = open;
  };

  /* ================================================== 18 CONTACT FORM */
  const initForm = () => {
    const form = qs("#gform");
    if (!form) return;

    const nameEl = qs("#name-input");
    const mailEl = qs("#email-input");
    const msgEl = qs("#msg-input");
    const status = qs("#form-msg");
    const btn = qs("#submit-btn");
    const btnLabel = btn ? qs(".btn-label", btn) : null;
    const counter = qs("#char-count");
    const MAX = Number(msgEl?.getAttribute("maxlength")) || 1200;
    let sending = false;

    const setLabel = (t) => {
      if (btnLabel) btnLabel.textContent = t;
      else if (btn) btn.textContent = t;
    };

    const say = (text, kind) => {
      if (!status) return;
      status.textContent = text;
      status.className = "form-msg" + (kind ? " msg-" + kind : "");
    };

    /* ---- per-field validation --------------------------------------- */
    const fieldOf = (el) => el?.closest(".field") || null;

    const clearError = (el) => {
      const f = fieldOf(el);
      if (!f) return;
      f.classList.remove("invalid");
      f.querySelector(".field-error")?.remove();
      el.removeAttribute("aria-invalid");
    };

    const setError = (el, message) => {
      const f = fieldOf(el);
      if (!f) return;
      f.classList.add("invalid");
      el.setAttribute("aria-invalid", "true");
      let e = f.querySelector(".field-error");
      if (!e) {
        e = document.createElement("span");
        e.className = "field-error";
        f.appendChild(e);
      }
      e.textContent = message;
    };

    // Deliberately permissive: any real domain, not just gmail.
    const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const validate = (el, quiet = false) => {
      if (!el) return true;
      const v = el.value.trim();
      let err = "";

      if (el === nameEl) {
        if (!v) err = "Your name, please.";
        else if (v.length < 2) err = "That looks too short.";
      } else if (el === mailEl) {
        if (!v) err = "I need an address to reply to.";
        else if (!EMAIL.test(v)) err = "That email doesn't look valid.";
      } else if (el === msgEl) {
        if (!v) err = "Tell me what you're building.";
        else if (v.length < 12) err = "A little more detail would help.";
      }

      if (err) {
        if (!quiet) setError(el, err);
        return false;
      }
      clearError(el);
      return true;
    };

    [nameEl, mailEl, msgEl].forEach((el) => {
      if (!el) return;
      el.addEventListener("blur", () => {
        if (el.value.trim()) validate(el);
      });
      el.addEventListener("input", () => {
        if (fieldOf(el)?.classList.contains("invalid")) validate(el, false);
      });
    });

    /* ---- character counter ------------------------------------------ */
    const syncCount = () => {
      if (!counter || !msgEl) return;
      const n = msgEl.value.length;
      counter.textContent = n + " / " + MAX;
      counter.classList.toggle("near", n > MAX * 0.9);
    };
    msgEl?.addEventListener("input", syncCount);
    syncCount();

    /* ---- submit ------------------------------------------------------ */
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (sending) return;

      /* No client-side honeypot check. `botcheck` is filtered by Web3forms
         server-side, which costs a bot nothing to trip and costs a real
         visitor nothing when it misfires. Deciding here to discard a message
         — and then claiming it sent — is how real mail gets lost. */
      const ok = [nameEl, mailEl, msgEl]
        .map((el) => validate(el))
        .every(Boolean);
      if (!ok) {
        say("Check the highlighted fields and try again.", "error");
        form
          .querySelector(".field.invalid input, .field.invalid textarea")
          ?.focus();
        return;
      }

      sending = true;
      if (btn) {
        btn.disabled = true;
        btn.setAttribute("aria-busy", "true");
      }
      setLabel("Sending…");
      say("Transmitting…", "");
      Audio.click(true);

      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });
        const json = await res.json().catch(() => ({}));

        if (res.ok && json.success !== false) {
          form.reset();
          syncCount();
          [nameEl, mailEl, msgEl].forEach(clearError);
          setLabel("Message sent ✓");
          say("Got it. I usually reply within a day.", "success");
          Audio.click(true);
          setTimeout(() => setLabel("Send message"), 4000);
        } else {
          setLabel("Send message");
          // Surface the real reason: quota, unverified key, bad payload.
          console.error("[form] web3forms rejected:", res.status, json);
          say(
            (json.message ||
              "The mail service rejected that (HTTP " + res.status + ").") +
              " Email me directly at " +
              ((D.profile || {}).email || "") +
              ".",
            "error",
          );
        }
      } catch (err) {
        setLabel("Send message");
        say(
          "Network error. Email me directly at " +
            ((D.profile || {}).email || "") +
            ".",
          "error",
        );
      } finally {
        sending = false;
        if (btn) {
          btn.disabled = false;
          btn.removeAttribute("aria-busy");
        }
      }
    });
  };

  /* ==================================================== 19 PROFILE LINKS */
  /* The footer ships GitHub/LinkedIn anchors with no destination. Rather than
     hard-code URLs in two files, we fill them from data.js (ZQ_LINKS) and
     delete any whose url is still empty. A missing link beats a dead one. */
  const initSocials = () => {
    const links = (D.profile || {}).socials || [];
    // If the data layer is missing entirely, leave the authored markup alone
    // rather than stripping links that were hard-coded and valid.
    if (!links.length) return;
    qsa("[data-social]").forEach((a) => {
      const match = links.find((l) => l.label === a.dataset.social);
      if (!match || !match.url) {
        a.remove();
        return;
      }
      a.href = match.url;
      a.hidden = false;
      if (!match.url.startsWith("mailto:")) {
        a.target = "_blank";
        a.rel = "noopener";
      }
      if (match.handle) a.title = match.handle;
    });
  };

  /* ======================================================== 20 BOOTSTRAP */
  const boot = () => {
    // Order matters only here: theme before paint-sensitive modules, preloader
    // first so it owns the zq:booted event that hero reveals wait on.
    initPreloader();
    Theme.init();
    initProgress();
    initNav();
    initSmoothScroll();
    initReveal();
    initCountUp();
    initTilt();
    initSpotlight();
    initCursorGlow();
    initMagnetic();
    initMarquee();
    initModal();
    initTerminal();
    initPalette();
    initForm();
    initSocials();

    const year = qs("#year");
    if (year) year.textContent = String(new Date().getFullYear());

    // Deep links: honour #work etc. once layout has settled.
    if (window.location.hash.length > 1) {
      const target = window.location.hash;
      setTimeout(() => scrollToId(target), 450);
    }

    document.documentElement.classList.add("is-ready");
  };

  if (history.scrollRestoration) history.scrollRestoration = "manual";

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
