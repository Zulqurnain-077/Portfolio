if (history.scrollRestoration) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

document.addEventListener("DOMContentLoaded", () => {
  // --- AUDIO SYNTHESIZER ENGINE (Pure Code SFX) ---
  let audioEnabled = false;
  const audioToggleBtn = document.getElementById("audio-toggle");

  // Synthesize a mechanical keyboard "clack" using low/high frequency noise bursts
  const playMechanicalClick = (isEnterKey = false) => {
    if (!audioEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Generate raw noise buffer for key impact texture
      const bufferSize = ctx.sampleRate * 0.04; // Very short burst (40ms)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      // Enter key has a deeper resonance cavity than regular letters
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

      // Synthesize the metallic switch pin vibration
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(isEnterKey ? 150 : 280, ctx.currentTime);

      oscGain.gain.setValueAtTime(isEnterKey ? 0.1 : 0.04, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

      // Connect nodes to audio destination
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
      console.log("Audio synthesis blocked by browser security policy.");
    }
  };

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener("click", () => {
      audioEnabled = !audioEnabled;
      if (audioEnabled) {
        audioToggleBtn.textContent = "AUDIO: ON";
        audioToggleBtn.style.color = "var(--accent-color)";
        playMechanicalClick(true); // Play alert confirmation sound
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

  // --- 4. TERMINAL CHATBOT + TYPEWRITER AUDIO MATRIX ---
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

    // Play sound effects when the user types directly into the terminal
    terminalInput.addEventListener("input", () => {
      playMechanicalClick(false);
    });

    let isBotTyping = false;

    terminalForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (isBotTyping) return;

      const query = terminalInput.value.trim().toLowerCase();
      if (!query) return;

      playMechanicalClick(true); // Return execution clack

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

      // Audio generation cycle loop simulating server activity clicks
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
