/* ==========================================================================
   ZULQURNAIN — HEADLESS DATA LAYER   v5.0
   Single source of truth for: profile meta, accent themes, the CLI bot, and
   the case-study modals. Deliberately DOM-free so it stays portable.

   Chatbot line types consumed by the renderer in script.js:
     head | kv | txt | li | ok | warn | err | dim | link | ascii | rule
   ========================================================================== */

/* --------------------------------------------------------------- 00. LINKS
   ⚠️ THE ONLY PLACE YOU EDIT YOUR PROFILE URLS.
   Leave `url` as "" and that link disappears everywhere — footer, command
   palette, and the CLI's `socials` command. Paste a real URL and it appears
   in all three. No dead links, no list to keep in sync.
   -------------------------------------------------------------------------- */
const ZQ_LINKS = [
  { label: "GitHub", handle: "github.com/…", url: "" },
  { label: "LinkedIn", handle: "linkedin.com/in/…", url: "" },
  {
    label: "Email",
    handle: "zulqurnainyousaf2001@gmail.com",
    url: "mailto:zulqurnainyousaf2001@gmail.com",
  },
];

/** Links that actually have a destination. */
const ZQ_LIVE_LINKS = ZQ_LINKS.filter((l) => l.url);

const PORTFOLIO_DATA = {
  /* ------------------------------------------------------------- 01. PROFILE */
  profile: {
    name: "Muhammad Zulqurnain",
    handle: "zulqurnain",
    role: "Software Engineer — AI & Computer Vision",
    availability: "Open to 2026 graduate & internship roles",
    location: "Lahore, Pakistan",
    timezone: "UTC+05:00",
    email: "zulqurnainyousaf2001@gmail.com",
    phone: "+92 314 424 7656",
    phoneHref: "+923144247656",
    cv: "Muhammad_Zulqurnain_Cv.pdf",

    // Only the links with a real URL. Edit ZQ_LINKS at the top of this file.
    socials: ZQ_LIVE_LINKS,
  },

  /* -------------------------------------------------------------- 02. THEMES */
  /* Accent dots (nav + mobile menu) and palette theme commands are both
     generated from this array — add a colour here and it appears everywhere. */
  themes: [
    { key: "red", name: "Signal Red", color: "#e74c3c", ink: "#ffffff" },
    { key: "green", name: "Terminal Green", color: "#2bea7e", ink: "#04140b" },
    { key: "cyan", name: "Cyber Cyan", color: "#22d3ee", ink: "#04141a" },
    {
      key: "violet",
      name: "Electric Violet",
      color: "#8b5cf6",
      ink: "#ffffff",
    },
    { key: "amber", name: "Solar Amber", color: "#f5b544", ink: "#191004" },
    { key: "white", name: "Pure White", color: "#f5f5f5", ink: "#08080a" },
  ],

  /* ------------------------------------------------------------- 03. CLI BOT */
  aliases: {
    about: "whoami",
    me: "whoami",
    bio: "whoami",
    work: "projects",
    portfolio: "projects",
    proj: "projects",
    tech: "stack",
    tools: "stack",
    stacks: "stack",
    edu: "education",
    school: "education",
    uni: "education",
    job: "experience",
    jobs: "experience",
    exp: "experience",
    cv: "resume",
    download: "resume",
    email: "contact",
    hire: "availability",
    hiring: "availability",
    social: "socials",
    links: "socials",
    github: "socials",
    metrics: "stats",
    numbers: "stats",
    quit: "exit",
    close: "exit",
    q: "exit",
    "?": "help",
    man: "help",
    commands: "help",
  },

  suggestions: [
    "whoami",
    "projects",
    "stack",
    "experience",
    "stats",
    "contact",
    "neofetch",
  ],

  chatbot: {
    whoami: {
      hint: "Who I am, in one screen",
      lines: [
        { t: "head", v: "IDENTITY" },
        { t: "kv", k: "name", v: "Muhammad Zulqurnain" },
        { t: "kv", k: "role", v: "Software Engineer — AI & Computer Vision" },
        {
          t: "kv",
          k: "study",
          v: "BS Computer Science, Minhaj University Lahore (2022–2026)",
        },
        { t: "kv", k: "based", v: "Lahore, Pakistan · UTC+05:00" },
        { t: "rule" },
        {
          t: "txt",
          v: "Final-year CS student who ships. I build computer-vision systems that hold real-time frame budgets, and I have two years of professional audit work behind me — which is where the discipline for precision came from.",
        },
        {
          t: "ok",
          v: "Type 'projects' for proof, or 'stats' for the numbers.",
        },
      ],
    },

    skills: {
      hint: "Core engineering strengths",
      lines: [
        { t: "head", v: "CORE STRENGTHS" },
        {
          t: "li",
          v: "Problem solving — translating vague technical requirements into structured, deliverable workflows.",
        },
        {
          t: "li",
          v: "Applied AI — CNN architecture design, transfer learning, and real-time inference optimisation.",
        },
        {
          t: "li",
          v: "Computer vision — pose estimation, image preprocessing pipelines, feature engineering.",
        },
        {
          t: "li",
          v: "Systems thinking — OOP design, data structures, persistence layers, system analysis.",
        },
        {
          t: "li",
          v: "Collaboration — cross-functional delivery under deadline, from conception to handover.",
        },
        { t: "dim", v: "See 'stack' for the concrete toolchain." },
      ],
    },

    stack: {
      hint: "Languages, frameworks, tooling",
      lines: [
        { t: "head", v: "TOOLCHAIN" },
        {
          t: "kv",
          k: "languages",
          v: "C++ · Python · JavaScript · HTML5 · CSS3",
        },
        {
          t: "kv",
          k: "ai / cv",
          v: "OpenPose · MobileNet · EfficientNetV2L · OpenCV · TensorFlow / Keras",
        },
        {
          t: "kv",
          k: "techniques",
          v: "Transfer learning · Attention mechanisms · GLCM · Colour histograms",
        },
        {
          t: "kv",
          k: "data",
          v: "MongoDB · File-based persistence · Feature engineering",
        },
        {
          t: "kv",
          k: "delivery",
          v: "Git · GitHub · Vercel · CI/CD · VS Code",
        },
        {
          t: "kv",
          k: "foundations",
          v: "OOP · Data structures · System analysis · Agile",
        },
      ],
    },

    projects: {
      hint: "Four shipped systems",
      lines: [
        { t: "head", v: "SHIPPED SYSTEMS" },
        {
          t: "kv",
          k: "01",
          v: "MotionEye — real-time AI workout trainer. OpenPose + MobileNet. 95% form accuracy, 12 FPS.",
        },
        {
          t: "kv",
          k: "02",
          v: "Crop Detection System — hybrid EfficientNetV2L CNN with custom attention for precision agriculture.",
        },
        {
          t: "kv",
          k: "03",
          v: "Hotel Management System — console C++ platform built on deep OOP and file persistence.",
        },
        {
          t: "kv",
          k: "04",
          v: "This portfolio — zero-dependency SPA, custom CLI, CI/CD to Vercel.",
        },
        {
          t: "ok",
          v: "Full case studies are on the page — hit 'Selected Work' or press Ctrl+K → 'goto work'.",
        },
      ],
    },

    experience: {
      hint: "Professional track record",
      lines: [
        { t: "head", v: "EXPERIENCE" },
        { t: "kv", k: "role", v: "Senior Auditor" },
        { t: "kv", k: "company", v: "Check-In Auditors — Lahore, Pakistan" },
        { t: "kv", k: "period", v: "June 2024 → Present" },
        { t: "rule" },
        {
          t: "li",
          v: "Conduct financial and compliance audits against internal and external policy.",
        },
        {
          t: "li",
          v: "Identify data-entry discrepancies and author process-improvement recommendations.",
        },
        {
          t: "li",
          v: "Produce audit reports covering findings, risk exposure and actionable next steps.",
        },
        {
          t: "li",
          v: "Partner with cross-functional teams to lift operational accuracy and efficiency.",
        },
      ],
    },

    education: {
      hint: "Academic record",
      lines: [
        { t: "head", v: "EDUCATION" },
        {
          t: "kv",
          k: "2022–2026",
          v: "BS Computer Science — Minhaj University Lahore",
        },
        {
          t: "kv",
          k: "2019–2021",
          v: "FSc Pre-Medical — Govt. Graduate College for Boys, Model Town",
        },
        {
          t: "kv",
          k: "2017–2019",
          v: "Matriculation — Ch. Rehmat Ali Memorial Trust Boys Secondary School",
        },
        { t: "kv", k: "languages", v: "English — Proficient" },
      ],
    },

    achievements: {
      hint: "What the work actually moved",
      lines: [
        { t: "head", v: "KEY ACHIEVEMENTS" },
        {
          t: "li",
          v: "Lifted exercise-form accuracy from 70% → 95% in MotionEye through low-latency corrective feedback.",
        },
        {
          t: "li",
          v: "Cut inference cost 2.4× by swapping VGG-19 for MobileNet — 5 FPS → 12 FPS with accuracy intact.",
        },
        {
          t: "li",
          v: "Delivered dual-impact systems: a full hotel administration platform and a production AI fitness trainer.",
        },
        {
          t: "li",
          v: "Architected an end-to-end CI/CD pipeline for zero-downtime production deploys.",
        },
      ],
    },

    stats: {
      hint: "Numbers, not adjectives",
      lines: [
        { t: "head", v: "MEASURED OUTCOMES" },
        {
          t: "kv",
          k: "95%",
          v: "Exercise-form accuracy after correction loop (baseline 70%)",
        },
        {
          t: "kv",
          k: "2.4×",
          v: "Frame-rate gain from backbone replacement (5 → 12 FPS)",
        },
        { t: "kv", k: "0.662", v: "F1 score, MotionEye posture classifier" },
        {
          t: "kv",
          k: "4",
          v: "Systems designed, built and shipped end-to-end",
        },
        {
          t: "kv",
          k: "2 yrs",
          v: "Professional audit & compliance experience",
        },
      ],
    },

    contact: {
      hint: "Reach me directly",
      lines: [
        { t: "head", v: "DIRECT CHANNELS" },
        {
          t: "link",
          v: "zulqurnainyousaf2001@gmail.com",
          href: "mailto:zulqurnainyousaf2001@gmail.com",
        },
        { t: "link", v: "+92 314 424 7656", href: "tel:+923144247656" },
        {
          t: "kv",
          k: "location",
          v: "Lahore, Pakistan — remote-friendly, UTC+05:00",
        },
        { t: "rule" },
        {
          t: "ok",
          v: "Or use the form at the bottom of the page. Any valid address works — it reaches me the same day.",
        },
      ],
    },

    resume: {
      hint: "Download the PDF",
      lines: [
        { t: "head", v: "CURRICULUM VITAE" },
        {
          t: "link",
          v: "Open Muhammad_Zulqurnain_Cv.pdf ↗",
          href: "Muhammad_Zulqurnain_Cv.pdf",
          blank: true,
        },
        { t: "dim", v: "One page. Updated 2026." },
      ],
    },

    socials: {
      hint: "Profiles and links",
      // Generated from ZQ_LINKS, so this can never list a URL you haven't set.
      lines: [
        { t: "head", v: "NETWORK" },
        ...ZQ_LIVE_LINKS.map((l) => ({
          t: "link",
          v: `${l.label} — ${l.handle}`,
          href: l.url,
          blank: !l.url.startsWith("mailto:"),
        })),
        ...(ZQ_LIVE_LINKS.length < ZQ_LINKS.length
          ? [
              {
                t: "dim",
                v: "Other profiles aren't published yet — email is the fastest route.",
              },
            ]
          : []),
      ],
    },

    availability: {
      hint: "Current status",
      lines: [
        { t: "head", v: "AVAILABILITY" },
        {
          t: "ok",
          v: "STATUS: OPEN — accepting 2026 graduate roles, internships and freelance CV/AI work.",
        },
        { t: "kv", k: "graduating", v: "June 2026" },
        {
          t: "kv",
          k: "interests",
          v: "Computer vision · Applied ML · Backend systems",
        },
        { t: "kv", k: "mode", v: "On-site (Lahore) or remote" },
        { t: "dim", v: "Type 'contact' to start a conversation." },
      ],
    },

    neofetch: {
      hint: "System readout",
      lines: [
        { t: "ascii", v: "  ███████\n  ██     ZQ\n  ███████" },
        { t: "kv", k: "user", v: "zulqurnain@portfolio" },
        { t: "kv", k: "os", v: "ZulqurnainOS 5.0 (vanilla)" },
        { t: "kv", k: "shell", v: "zq-cli 5.0" },
        {
          t: "kv",
          k: "runtime",
          v: "HTML5 · CSS3 · Vanilla JS — zero dependencies",
        },
        { t: "kv", k: "uptime", v: "since 2022" },
        { t: "kv", k: "packages", v: "0 (intentionally)" },
        { t: "ok", v: "No framework. No build step. No bundle tax." },
      ],
    },

    sudo: {
      hint: "Try it",
      lines: [
        {
          t: "err",
          v: "zulqurnain is not in the sudoers file. This incident has been reported.",
        },
        { t: "dim", v: "…to nobody. It's a static site. Type 'help' instead." },
      ],
    },
  },

  /* ------------------------------------------------------- 04. CASE STUDIES */
  projects: {
    motioneye: {
      index: "01",
      title: "MotionEye — AI Real-Time Workout Trainer",
      period: "Jan 2025",
      role: "Solo — architecture, model, feedback loop",
      stack: ["Python", "OpenPose", "MobileNet", "OpenCV", "Computer Vision"],
      summary:
        "A real-time personal training system that watches you exercise, detects incorrect posture, and corrects it before the rep is wasted.",
      problem:
        "Pose-estimation models accurate enough to judge exercise form were far too slow to give feedback while the movement was still happening. At 5 FPS the correction arrives after the mistake — which makes it useless as coaching.",
      approach: [
        "Built the posture-detection pipeline on OpenPose keypoint extraction.",
        "Profiled the bottleneck to the VGG-19 backbone and replaced it with MobileNet — a depthwise-separable architecture with a fraction of the multiply-accumulates.",
        "Wrote a low-latency comparison algorithm that scores live keypoints against reference form and emits an instant corrective cue.",
        "Tuned the classifier to balance false corrections against missed errors.",
      ],
      metrics: [
        { v: "95%", l: "Form accuracy" },
        { v: "12", l: "FPS sustained" },
        { v: "0.662", l: "F1 score" },
        { v: "2.4×", l: "Throughput gain" },
      ],
      highlights: [
        "Frame processing rate raised from 5 FPS to 12 FPS — crossing the threshold where feedback becomes actionable mid-rep.",
        "User exercise-form accuracy improved from 70% to 95%.",
        "Achieved an F1 score of 0.662 on posture classification.",
        "Instant-feedback loop built for perceptual latency, not batch accuracy.",
      ],
      outcome:
        "The backbone swap was the whole project. It turned a technically-correct model that couldn't coach anyone into a system that measurably changes how someone lifts.",
    },

    cropdetection: {
      index: "02",
      title: "Crop Detection System",
      period: "Jan 2024",
      role: "Solo — model design, preprocessing, feature engineering",
      stack: ["Python", "EfficientNetV2L", "CNN", "GLCM", "Image Processing"],
      summary:
        "Automated real-time crop classification for precision agriculture, built on a hybrid CNN with custom attention.",
      problem:
        "Field imagery is hostile input: inconsistent lighting, near-identical leaf geometry between species, and texture as the only reliable discriminator. Off-the-shelf classifiers collapse on it.",
      approach: [
        "Engineered a hybrid CNN on an EfficientNetV2L backbone with custom attention mechanisms to force focus onto discriminative leaf regions.",
        "Built an image-preprocessing pipeline that amplifies texture and contrast before the network ever sees the frame.",
        "Added GLCM and colour-histogram feature extraction to give the model a non-learned signal for texture separation.",
        "Integrated real-time inference so it runs inside a monitoring loop rather than as offline batch analysis.",
      ],
      metrics: [
        { v: "V2L", l: "EfficientNet backbone" },
        { v: "GLCM", l: "Texture features" },
        { v: "Real-time", l: "Inference mode" },
        { v: "Hybrid", l: "Architecture" },
      ],
      highlights: [
        "Custom attention mechanisms layered onto EfficientNetV2L for robust crop differentiation.",
        "Preprocessing pipeline purpose-built to improve texture and contrast features.",
        "GLCM plus colour-histogram extraction combining learned and hand-engineered signals.",
        "Real-time inference path for automated crop-monitoring deployment.",
      ],
      outcome:
        "Pairing hand-engineered texture descriptors with a deep backbone beat either approach alone — the classical features carried exactly the signal the CNN was weakest on.",
    },

    hotelmanagement: {
      index: "03",
      title: "Hotel Management System",
      period: "Jan 2023",
      role: "Solo — full system design and implementation",
      stack: ["C++", "OOP", "File Handling", "Data Structures"],
      summary:
        "A console-based hotel administration platform covering booking, customer records and billing, written in pure C++.",
      problem:
        "Hotel operations are a set of tightly-coupled entities — rooms, guests, reservations, invoices — where one bad write corrupts the ledger. It needed a real domain model, not scripts.",
      approach: [
        "Modelled the domain with classes, inheritance and polymorphism so each entity owned its own invariants.",
        "Implemented room booking, customer management and billing as coordinated subsystems.",
        "Built file-handling routines for durable storage with fast retrieval and integrity on write.",
        "Designed the console flow so an untrained operator can move through it without a manual.",
      ],
      metrics: [
        { v: "C++", l: "Zero dependencies" },
        { v: "3", l: "Core subsystems" },
        { v: "OOP", l: "Design model" },
        { v: "File I/O", l: "Persistence" },
      ],
      highlights: [
        "Complete booking, customer-management and billing workflows.",
        "Core OOP throughout — classes, inheritance, polymorphism.",
        "Enhanced file-handling for secure storage and rapid retrieval.",
        "Console UX built for operators, not developers.",
      ],
      outcome:
        "This is where the fundamentals landed. Designing persistence and object lifetime by hand, with no framework catching mistakes, is why the later Python work was structured properly.",
    },

    portfoliobot: {
      index: "04",
      title: "This Portfolio & Interactive CLI",
      period: "2026",
      role: "Solo — design, build, deployment pipeline",
      stack: ["HTML5", "CSS3", "Vanilla JS", "Vercel", "CI/CD"],
      summary:
        "A zero-dependency single-page application with a working command-line interface, command palette, and automated deployment.",
      problem:
        "Every portfolio looks like the same template because it is the same template. And a site that claims performance engineering while shipping 300 KB of framework is arguing against itself.",
      approach: [
        "Built the entire SPA in pure HTML, CSS and vanilla JavaScript — no framework, no build step, no bundle tax.",
        "Wrote a CLI simulation that parses a headless data layer (data.js) to return context-aware answers about my work.",
        "Added a Ctrl+K command palette with fuzzy matching over navigation, theme and utility actions.",
        "Architected a CI/CD pipeline across VS Code → GitHub → Vercel for zero-downtime production deploys.",
        "Implemented a runtime accent-theming system, 3D tilt interactions, and a contact path hardened with strict validation plus an invisible honeypot.",
      ],
      metrics: [
        { v: "0", l: "Dependencies" },
        { v: "0", l: "Build steps" },
        { v: "Ctrl+K", l: "Command palette" },
        { v: "CI/CD", l: "Auto deploy" },
      ],
      highlights: [
        "Fully responsive SPA hand-written from scratch for near-zero load latency.",
        "Custom CLI that dynamically parses a headless configuration file.",
        "CI/CD pipeline delivering automated, zero-downtime production updates.",
        "3D tilt UI, dynamic DOM case studies, Regex validation and honeypot anti-bot protection.",
      ],
      outcome:
        "The site is the argument. If I claim I optimise for real-time constraints, the thing you're reading it on had better load instantly.",
    },
  },
};

/* `const` at the top level of a classic script creates a lexical global, NOT a
   property on `window`. Export it explicitly so script.js — and anything else
   you add later — can read it off `window` without surprises. */
window.PORTFOLIO_DATA = PORTFOLIO_DATA;
window.ZQ_LINKS = ZQ_LINKS;
