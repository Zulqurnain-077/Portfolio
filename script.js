document.addEventListener("DOMContentLoaded", () => {
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

  // --- 3. Modals (Dynamic Data) ---
  const modalOverlay = document.getElementById("project-modal");
  const closeBtn = document.querySelector(".close-modal");

  if (modalOverlay && closeBtn) {
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
      });
    });

    closeBtn.addEventListener("click", () =>
      modalOverlay.classList.add("hidden"),
    );
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.add("hidden");
    });
  }

  // --- 4. TERMINAL CHATBOT (Autopilot Upgraded) ---
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
      if (!terminalWindow.classList.contains("hidden")) {
        setTimeout(() => terminalInput.focus(), 100);
      }
    });

    if (closeTerminal) {
      closeTerminal.addEventListener("click", () =>
        terminalWindow.classList.add("hidden"),
      );
    }

    let isBotTyping = false;

    terminalForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (isBotTyping) return;

      const query = terminalInput.value.trim().toLowerCase();
      if (!query) return;

      terminalOutput.innerHTML += `<p class="user-msg">> ${terminalInput.value}</p>`;
      terminalInput.value = "";
      terminalOutput.scrollTop = terminalOutput.scrollHeight;

      if (query === "clear") {
        terminalOutput.innerHTML = initialBootSequence;
        return;
      }

      let response;

      // AUTOPILOT HELP MENU: Dynamically reads your data.js file
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
      terminalOutput.innerHTML += `<p id="${parsingId}" class="system-msg">> Scanning Muhammad_Zulqurnain_Cv.pdf...</p>`;
      terminalOutput.scrollTop = terminalOutput.scrollHeight;

      setTimeout(() => {
        const parseElement = document.getElementById(parsingId);
        if (parseElement)
          parseElement.innerText = "> Data extracted successfully.";

        setTimeout(() => {
          terminalOutput.innerHTML += `<p>${response}</p>`;
          terminalOutput.scrollTop = terminalOutput.scrollHeight;
          isBotTyping = false;
        }, 300);
      }, 800);
    });
  }

  // --- 5. SECURE FORM HIJACK (Honeypot + Regex) ---
  const gForm = document.getElementById("gform");
  const emailInput = document.getElementById("email-input");
  const formMsg = document.getElementById("form-msg");
  const submitBtn = document.getElementById("submit-btn");
  const honeypot = document.getElementById("bot-trap"); // The hidden trap
  let isSubmitting = false;

  if (gForm && emailInput && formMsg && submitBtn) {
    gForm.addEventListener("submit", (e) => {
      // 1. SILENT BOT ASSASSINATION
      // If the invisible field has text, a bot filled it out.
      if (honeypot && honeypot.value !== "") {
        e.preventDefault(); // Stop the form from sending
        gForm.reset(); // Clear the form
        // Give a fake success message so the bot thinks it won and moves on
        formMsg.textContent = "TRANSMISSION SUCCESSFUL.";
        formMsg.className = "form-msg msg-success";
        return;
      }

      // 2. STRICT REGEX VALIDATION FOR GMAIL
      // This ensures they didn't just type "a@gmail.com". It forces standard Gmail formatting.
      const emailVal = emailInput.value.trim().toLowerCase();
      const strictGmailRegex = /^[a-z0-9](\.?[a-z0-9]){4,}@gmail\.com$/;

      if (!strictGmailRegex.test(emailVal)) {
        e.preventDefault();
        formMsg.textContent =
          "ACCESS DENIED: Enter a valid, correctly formatted @gmail.com address.";
        formMsg.className = "form-msg msg-error";
        emailInput.style.borderColor = "#e74c3c";
        return;
      }

      // 3. PREVENT DOUBLE SUBMISSIONS
      if (isSubmitting) {
        e.preventDefault();
        return;
      }

      isSubmitting = true;
      submitBtn.textContent = "Transmitting...";
      formMsg.textContent = "";
      emailInput.style.borderColor = "#333";

      // 4. PROCESS THE SUBMISSION
      setTimeout(() => {
        gForm.reset();
        submitBtn.textContent = "Transmit Message";
        formMsg.textContent = "TRANSMISSION SUCCESSFUL. I WILL BE IN TOUCH.";
        formMsg.className = "form-msg msg-success";
        isSubmitting = false;
      }, 1500);
    });
  }
});
