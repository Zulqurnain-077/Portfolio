if (history.scrollRestoration) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

document.addEventListener("DOMContentLoaded", () => {
  // --- AUDIO SYNTHESIZER ENGINE (Pure Code SFX) ---
  let audioEnabled = false;
  const audioToggleBtn = document.getElementById("audio-toggle");

  const playMechanicalClick = (isEnterKey = false) => {
    if (!audioEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(
        isEnterKey ? 600 : 1200,
        ctx.currentTime,
      );
      noiseFilter.Q.setValueAtTime(3, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(isEnterKey ? 0.15 : 0.08, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + 0.03,
      );

      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(isEnterKey ? 150 : 280, ctx.currentTime);

      oscGain.gain.setValueAtTime(isEnterKey ? 0.1 : 0.04, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      noise.start();
      osc.start();
      noise.stop(ctx.currentTime + 0.04);
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {
      console.log("Audio synthesis blocked.");
    }
  };

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener("click", () => {
      audioEnabled = !audioEnabled;
      if (audioEnabled) {
        audioToggleBtn.textContent = "AUDIO: ON";
        audioToggleBtn.style.color = "var(--accent-color)";
        playMechanicalClick(true);
      } else {
        audioToggleBtn.textContent = "AUDIO: OFF";
        audioToggleBtn.style.color = "#888";
      }
    });
  }

  // --- Theme Switcher Core Logic ---
  const activeColor = localStorage.getItem("portfolio-accent") || "#e74c3c";
  document.documentElement.style.setProperty("--accent-color", activeColor);

  const themeDots = document.querySelectorAll(".theme-dot");
  themeDots.forEach((dot) => {
    if (dot.dataset.color === activeColor) {
      themeDots.forEach((d) => d.classList.remove("active"));
      dot.classList.add("active");
    }

    dot.addEventListener("click", () => {
      const selectedColor = dot.dataset.color;
      document.documentElement.style.setProperty(
        "--accent-color",
        selectedColor,
      );
      localStorage.setItem("portfolio-accent", selectedColor);
      themeDots.forEach((d) => d.classList.remove("active"));
      dot.classList.add("active");
      playMechanicalClick(false);
    });
  });

  // --- COMMAND PALETTE CORE LOGIC (Ctrl + K) ---
  const palette = document.getElementById("command-palette");
  const paletteSearch = document.getElementById("palette-search");
  const paletteResults = document.getElementById("palette-results");
  let selectedItemIndex = 0;
  let filteredCommands = [];

  // Master command registry
  const commandsList = [
    {
      text: "Go to: Top / Intro",
      category: "navigation",
      action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
      shortcut: "home",
    },
    {
      text: "Go to: Core Strengths",
      category: "navigation",
      action: () =>
        document
          .getElementById("skills")
          .scrollIntoView({ behavior: "smooth" }),
      shortcut: "goto strengths",
    },
    {
      text: "Go to: Projects Portfolio",
      category: "navigation",
      action: () =>
        document.getElementById("work").scrollIntoView({ behavior: "smooth" }),
      shortcut: "goto projects",
    },
    {
      text: "Go to: Education",
      category: "navigation",
      action: () =>
        document
          .getElementById("education")
          .scrollIntoView({ behavior: "smooth" }),
      shortcut: "goto education",
    },
    {
      text: "Go to: Initiate Contact Form",
      category: "navigation",
      action: () =>
        document
          .getElementById("contact")
          .scrollIntoView({ behavior: "smooth" }),
      shortcut: "goto contact",
    },
    {
      text: "Open System Chatbot AI",
      category: "utility",
      action: () => document.getElementById("chatbot-toggle").click(),
      shortcut: "chat",
    },
    {
      text: "Theme: Matrix Red",
      category: "theme",
      action: () => document.querySelector('[data-color="#e74c3c"]').click(),
      shortcut: "theme red",
    },
    {
      text: "Theme: Terminal Green",
      category: "theme",
      action: () => document.querySelector('[data-color="#00ff00"]').click(),
      shortcut: "theme green",
    },
    {
      text: "Theme: Cyberpunk Cyan",
      category: "theme",
      action: () => document.querySelector('[data-color="#00f0ff"]').click(),
      shortcut: "theme cyan",
    },
    {
      text: "Theme: Classic White",
      category: "theme",
      action: () => document.querySelector('[data-color="#ffffff"]').click(),
      shortcut: "theme white",
    },
  ];

  const openPalette = () => {
    palette.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    paletteSearch.value = "";
    selectedItemIndex = 0;
    renderResults(commandsList);
    setTimeout(() => paletteSearch.focus(), 50);
    playMechanicalClick(true);
  };

  const closePalette = () => {
    palette.classList.add("hidden");
    if (!document.getElementById("project-modal").classList.contains("hidden"))
      return;
    document.body.style.overflow = "";
  };

  const renderResults = (items) => {
    filteredCommands = items;
    if (items.length === 0) {
      paletteResults.innerHTML = `<div class="palette-item" style="cursor:default;color:#555;">No commands match query...</div>`;
      return;
    }

    paletteResults.innerHTML = items
      .map(
        (item, idx) => `
            <div class="palette-item ${idx === selectedItemIndex ? "selected" : ""}" data-idx="${idx}">
                <span>${item.text}</span>
                <span class="palette-shortcut">${item.shortcut}</span>
            </div>
        `,
      )
      .join("");

    // Wire immediate item clicking
    document
      .querySelectorAll(".palette-results .palette-item")
      .forEach((el) => {
        el.addEventListener("click", () => {
          selectedItemIndex = parseInt(el.dataset.idx);
          executeSelectedAction();
        });
      });
  };

  const executeSelectedAction = () => {
    if (filteredCommands[selectedItemIndex]) {
      filteredCommands[selectedItemIndex].action();
      closePalette();
      playMechanicalClick(true);
    }
  };

  // Global Key Listening Interceptor
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (palette.classList.contains("hidden")) openPalette();
      else closePalette();
    }
    if (e.key === "Escape" && !palette.classList.contains("hidden")) {
      closePalette();
    }
  });

  paletteSearch.addEventListener("keydown", (e) => {
    if (filteredCommands.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedItemIndex = (selectedItemIndex + 1) % filteredCommands.length;
      renderResults(filteredCommands);
      playMechanicalClick(false);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedItemIndex =
        (selectedItemIndex - 1 + filteredCommands.length) %
        filteredCommands.length;
      renderResults(filteredCommands);
      playMechanicalClick(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      executeSelectedAction();
    }
  });

  paletteSearch.addEventListener("input", () => {
    playMechanicalClick(false);
    const query = paletteSearch.value.toLowerCase().trim();
    selectedItemIndex = 0;

    if (!query) {
      renderResults(commandsList);
      return;
    }

    const filtered = commandsList.filter(
      (item) =>
        item.text.toLowerCase().includes(query) ||
        item.shortcut.toLowerCase().includes(query),
    );
    renderResults(filtered);
  });

  palette.addEventListener("click", (e) => {
    if (e.target === palette) closePalette();
  });

  // --- 1. Scroll Reveal ---
  const observerOptions = { root: null, rootMargin: "0px", threshold: 0.15 };
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));

  // --- 2. 3D Portrait ---
  const wrapper = document.querySelector(".portrait-wrapper");
  const portrait = document.querySelector(".interactive-portrait");

  if (wrapper && portrait && window.innerWidth > 992) {
    wrapper.addEventListener("mousemove", (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -15;
      const rotateY = ((x - centerX) / centerX) * 15;
      portrait.style.transform = `scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      portrait.style.filter = "grayscale(0%) contrast(100%)";
    });
    wrapper.addEventListener("mouseleave", () => {
      portrait.style.transform = `scale(1) rotateX(0deg) rotateY(0deg)`;
      portrait.style.filter = "grayscale(100%) contrast(110%)";
    });
  }

  // --- 3. Modals ---
  const modalOverlay = document.getElementById("project-modal");
  const closeBtn = document.querySelector(".close-modal");

  if (modalOverlay && closeBtn) {
    const closeModal = () => {
      modalOverlay.classList.add("hidden");
      document.body.style.overflow = "";
      playMechanicalClick(false);
    };

    document.querySelectorAll(".modal-trigger").forEach((btn) => {
      btn.addEventListener("click", () => {
        const data = PORTFOLIO_DATA.modals[btn.dataset.project];
        if (!data) return;

        document.getElementById("modal-title").innerText = data.title;
        document.getElementById("modal-desc").innerText = data.desc;
        const tagsHtml = data.tags.map((tag) => `<span>${tag}</span>`).join("");
        document.getElementById("modal-tags").innerHTML = tagsHtml;
        const listHtml = data.features.map((f) => `<li>${f}</li>`).join("");
        document.getElementById("modal-features").innerHTML = listHtml;

        modalOverlay.classList.remove("hidden");
        document.body.style.overflow = "hidden";
        playMechanicalClick(true);
      });
    });

    closeBtn.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // --- 4. TERMINAL CHATBOT ---
  const terminalWindow = document.getElementById("terminal-window");
  const chatbotToggle = document.getElementById("chatbot-toggle");
  const closeTerminal = document.getElementById("close-terminal");
  const terminalForm = document.getElementById("terminal-form");
  const terminalInput = document.getElementById("terminal-input");
  const terminalOutput = document.getElementById("terminal-output");

  if (terminalWindow && chatbotToggle && terminalForm) {
    const initialBootSequence = `
            <p>> ZULQURNAIN_AI v2.2 ONLINE.</p>
            <p>> System ready. Type 'help' to initialize.</p>
        `;

    terminalOutput.innerHTML = initialBootSequence;

    chatbotToggle.addEventListener("click", () => {
      terminalWindow.classList.toggle("hidden");
      playMechanicalClick(true);
      if (!terminalWindow.classList.contains("hidden")) {
        setTimeout(() => terminalInput.focus(), 100);
      }
    });

    if (closeTerminal) {
      closeTerminal.addEventListener("click", () => {
        terminalWindow.classList.add("hidden");
        playMechanicalClick(false);
      });
    }

    terminalInput.addEventListener("input", () => {
      playMechanicalClick(false);
    });

    let isBotTyping = false;

    terminalForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (isBotTyping) return;

      const query = terminalInput.value.trim().toLowerCase();
      if (!query) return;

      playMechanicalClick(true);

      terminalOutput.innerHTML += `<p class="user-msg">> ${terminalInput.value}</p>`;
      terminalInput.value = "";
      terminalOutput.scrollTop = terminalOutput.scrollHeight;

      if (query === "clear") {
        terminalOutput.innerHTML = initialBootSequence;
        return;
      }

      let response;

      if (query === "help") {
        const availableCommands = Object.keys(PORTFOLIO_DATA.chatbot);
        response =
          "> AVAILABLE COMMANDS:<br>> " +
          availableCommands.join("<br>> ") +
          "<br>> clear";
      } else {
        response =
          PORTFOLIO_DATA.chatbot[query] ||
          "> Command not recognized. Type 'help' for options.";
      }

      isBotTyping = true;

      const parsingId = "parse-" + Date.now();
      terminalOutput.innerHTML += `<p id="${parsingId}" class="system-msg">> Scanning dataset...</p>`;
      terminalOutput.scrollTop = terminalOutput.scrollHeight;

      let audioInterval = setInterval(() => {
        if (isBotTyping && audioEnabled) playMechanicalClick(false);
      }, 120);

      setTimeout(() => {
        clearInterval(audioInterval);
        const parseElement = document.getElementById(parsingId);
        if (parseElement)
          parseElement.innerText = "> Data extracted successfully.";
        if (audioEnabled) playMechanicalClick(true);

        setTimeout(() => {
          terminalOutput.innerHTML += `<p>${response}</p>`;
          terminalOutput.scrollTop = terminalOutput.scrollHeight;
          isBotTyping = false;
        }, 300);
      }, 800);
    });
  }

  // --- 5. SECURE FORM HIJACK ---
  const gForm = document.getElementById("gform");
  const emailInput = document.getElementById("email-input");
  const formMsg = document.getElementById("form-msg");
  const submitBtn = document.getElementById("submit-btn");
  const honeypot = document.getElementById("bot-trap");
  let isSubmitting = false;

  if (gForm && emailInput && formMsg && submitBtn) {
    gForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (honeypot && honeypot.value !== "") {
        gForm.reset();
        formMsg.textContent = "TRANSMISSION SUCCESSFUL.";
        formMsg.className = "form-msg msg-success";
        return;
      }

      const emailVal = emailInput.value.trim().toLowerCase();
      const universalEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!universalEmailRegex.test(emailVal)) {
        formMsg.textContent =
          "ACCESS DENIED: Enter a valid working email address.";
        formMsg.className = "form-msg msg-error";
        emailInput.style.borderColor = "#e74c3c";
        return;
      }

      if (isSubmitting) return;

      isSubmitting = true;
      submitBtn.textContent = "Transmitting...";
      formMsg.textContent = "";
      emailInput.style.borderColor = "#333";
      playMechanicalClick(true);

      const formData = new FormData(gForm);

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      })
        .then(async (response) => {
          let json = await response.json();
          if (response.status == 200) {
            gForm.reset();
            submitBtn.textContent = "Transmit Message";
            formMsg.textContent =
              "TRANSMISSION SUCCESSFUL. I WILL BE IN TOUCH.";
            formMsg.className = "form-msg msg-success";
            playMechanicalClick(true);
          } else {
            submitBtn.textContent = "Transmit Message";
            formMsg.textContent = "SYSTEM ERROR. TRY AGAIN.";
            formMsg.className = "form-msg msg-error";
          }
        })
        .catch((error) => {
          submitBtn.textContent = "Transmit Message";
          formMsg.textContent = "NETWORK FAILURE. TRY AGAIN.";
          formMsg.className = "form-msg msg-error";
        })
        .finally(() => {
          isSubmitting = false;
        });
    });
  }
});
