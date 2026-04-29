function initReveal() {
  const revealItems = document.querySelectorAll(".reveal");
  if (!revealItems.length) return;

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("visible"));
  }
}

function initTimeline() {
  const yearControls = document.querySelector(".year-controls");
  const yearButtons = document.querySelectorAll(".year-btn");
  const timelineCards = document.querySelectorAll(".timeline-grid .card");
  const playButton = document.getElementById("timeline-play");
  const speedSelect = document.getElementById("timeline-speed");
  const slider = document.getElementById("timeline-slider");
  const timelineStatus = document.getElementById("timeline-status");
  if (!yearControls || !yearButtons.length || !timelineCards.length) return;

  const yearOrder = ["all", "1962", "1965", "1968", "1969", "1971", "1973", "1983", "1990"];
  let activeYear = "all";
  let autoPlayId = null;

  function setActiveYear(targetYear) {
    yearButtons.forEach((btn) => {
      const active = (btn.dataset.year || "all") === targetYear;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
    const sliderIndex = yearOrder.indexOf(targetYear);
    if (slider && sliderIndex >= 0) slider.value = String(sliderIndex);
  }

  function applyYearFilter(year) {
    activeYear = year || "all";
    timelineCards.forEach((card) => {
      const matches = activeYear === "all" || card.dataset.year === activeYear;
      card.classList.toggle("dimmed", !matches);
      card.classList.toggle("filtered-out", !matches);
    });
  }

  function stopAutoPlay(message) {
    if (autoPlayId) {
      clearInterval(autoPlayId);
      autoPlayId = null;
    }
    if (playButton) playButton.textContent = "Auto Play Years";
    if (timelineStatus && message) timelineStatus.textContent = message;
  }

  function startAutoPlay() {
    const speed = Number(speedSelect?.value || 1200);
    let index = yearOrder.indexOf(activeYear);
    stopAutoPlay();
    if (playButton) playButton.textContent = "Stop Auto Play";
    if (timelineStatus) timelineStatus.textContent = "Auto mode running";
    autoPlayId = setInterval(() => {
      index = (index + 1) % yearOrder.length;
      setActiveYear(yearOrder[index]);
      applyYearFilter(yearOrder[index]);
    }, speed);
  }

  yearControls.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest(".year-btn");
    if (!button) return;
    stopAutoPlay("Manual mode");
    const year = button.dataset.year || "all";
    setActiveYear(year);
    applyYearFilter(year);
  });

  playButton?.addEventListener("click", () => {
    if (autoPlayId) stopAutoPlay("Manual mode");
    else startAutoPlay();
  });

  speedSelect?.addEventListener("change", () => {
    if (autoPlayId) startAutoPlay();
  });

  slider?.addEventListener("input", () => {
    stopAutoPlay("Manual mode");
    const index = Number(slider.value);
    const year = yearOrder[index] || "all";
    setActiveYear(year);
    applyYearFilter(year);
    if (timelineStatus) timelineStatus.textContent = `Slider: ${year.toUpperCase()}`;
  });

  setActiveYear("all");
  applyYearFilter("all");
}

function initNodeMapAndSimulator() {
  const nodeButtons = document.querySelectorAll(".node-btn");
  const fromNode = document.getElementById("from-node");
  const toNode = document.getElementById("to-node");
  const sendButton = document.getElementById("send-packet");
  const packetDisplay = document.getElementById("packet-display");
  const packetLog = document.getElementById("packet-log");
  if (!nodeButtons.length || !fromNode || !toNode || !sendButton || !packetDisplay || !packetLog) return;

  const nodeData = {
    ucla: "UCLA: first ARPANET node and home of the first message attempt.",
    sri: "SRI: second node and the Network Information Center site.",
    ucsb: "UC Santa Barbara: third node, key interactive computing partner.",
    utah: "University of Utah: fourth node, known for graphics research.",
  };

  function addLog(text) {
    const line = document.createElement("p");
    line.className = "log-line";
    line.textContent = text;
    packetLog.appendChild(line);
    packetLog.scrollTop = packetLog.scrollHeight;
  }

  nodeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      nodeButtons.forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      const key = button.dataset.node || "ucla";
      packetDisplay.textContent = nodeData[key] || "Node info unavailable.";
    });
  });

  sendButton.addEventListener("click", () => {
    const src = fromNode.value;
    const dst = toNode.value;
    if (src === dst) {
      packetDisplay.textContent = "Source and destination cannot be the same.";
      return;
    }

    const hops = [src, "imp-router", dst];
    packetDisplay.textContent = `Transmitting packet ${src.toUpperCase()} -> ${dst.toUpperCase()}...`;
    addLog(`TX START ${src.toUpperCase()} -> ${dst.toUpperCase()}`);

    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      if (step >= hops.length) {
        addLog("TX COMPLETE: ACK RECEIVED");
        packetDisplay.textContent = `Packet delivered to ${dst.toUpperCase()} successfully.`;
        clearInterval(timer);
        return;
      }
      addLog(`HOP ${step}: ${hops[step]}`);
    }, 450);
  });
}

function initQuiz() {
  const questionElement = document.getElementById("quiz-question");
  const optionsElement = document.getElementById("quiz-options");
  const submitButton = document.getElementById("quiz-submit");
  const nextButton = document.getElementById("quiz-next");
  const feedbackElement = document.getElementById("quiz-feedback");
  if (!questionElement || !optionsElement || !submitButton || !nextButton || !feedbackElement) return;

  const quizData = [
    {
      question: "Which institution sent the first ARPANET message attempt in 1969?",
      options: ["SRI", "UCLA", "MIT", "Utah"],
      correct: 1,
    },
    {
      question: "What letters were successfully delivered before the first crash?",
      options: ["IP", "LO", "AR", "ET"],
      correct: 1,
    },
    {
      question: "Which transition date is known as ARPANET TCP/IP Flag Day?",
      options: ["January 1, 1971", "January 1, 1978", "January 1, 1983", "January 1, 1990"],
      correct: 2,
    },
    {
      question: "Who built the IMP nodes for ARPANET?",
      options: ["BBN", "Bell Labs", "IBM", "Xerox PARC"],
      correct: 0,
    },
  ];

  let index = 0;
  let score = 0;
  let attempts = 0;
  let answered = false;

  function renderQuestion() {
    answered = false;
    const item = quizData[index];
    questionElement.textContent = item.question;
    optionsElement.innerHTML = "";
    item.options.forEach((option, optionIndex) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "quiz";
      input.value = String(optionIndex);
      label.appendChild(input);
      label.append(` ${option}`);
      optionsElement.appendChild(label);
    });
  }

  function feedback(msg) {
    feedbackElement.textContent = `${msg} Score: ${score} / ${attempts}`;
  }

  submitButton.addEventListener("click", () => {
    if (answered) {
      feedback("Already checked.");
      return;
    }
    const selected = optionsElement.querySelector('input[name="quiz"]:checked');
    if (!selected) {
      feedback("Select an option first.");
      return;
    }
    attempts += 1;
    answered = true;
    if (Number(selected.value) === quizData[index].correct) {
      score += 1;
      feedback("Correct.");
    } else {
      feedback("Incorrect.");
    }
  });

  nextButton.addEventListener("click", () => {
    index = (index + 1) % quizData.length;
    renderQuestion();
    feedback("Next question loaded.");
  });

  renderQuestion();
  feedback("Ready.");
}

function initMatcher() {
  const remote = document.getElementById("match-remote");
  const file = document.getElementById("match-file");
  const mail = document.getElementById("match-mail");
  const button = document.getElementById("check-match");
  const result = document.getElementById("match-result");
  if (!remote || !file || !mail || !button || !result) return;

  button.addEventListener("click", () => {
    let points = 0;
    if (remote.value === "telnet") points += 1;
    if (file.value === "ftp") points += 1;
    if (mail.value === "smtp") points += 1;
    result.textContent = `Protocol match score: ${points}/3`;
  });
}

function initConsole() {
  const form = document.getElementById("console-form");
  const input = document.getElementById("console-input");
  const output = document.getElementById("console-output");
  if (!form || !input || !output) return;

  const commands = {
    help: "Commands: help, nodes, first-message, tcpip, clear",
    nodes: "Nodes: UCLA, SRI, UC Santa Barbara, University of Utah",
    "first-message": "October 29, 1969: LOGIN attempted, LO delivered.",
    tcpip: "ARPANET transitioned to TCP/IP on January 1, 1983.",
  };

  function writeLine(text) {
    const line = document.createElement("p");
    line.className = "console-line";
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  writeLine("ARPANET CONSOLE READY");
  writeLine('Type "help" for commands.');

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const raw = input.value.trim();
    if (!raw) return;
    writeLine(`> ${raw}`);
    const cmd = raw.toLowerCase();
    if (cmd === "clear") {
      output.innerHTML = "";
      input.value = "";
      return;
    }
    writeLine(commands[cmd] || "Unknown command.");
    input.value = "";
  });
}

function initFactLab() {
  const button = document.getElementById("fact-spin");
  const output = document.getElementById("fact-output");
  if (!button || !output) return;

  const facts = [
    "ARPANET's first message path crashed after delivering the first two letters.",
    "Packet switching reduced dependence on a single dedicated line.",
    "Email became a dominant ARPANET use surprisingly quickly in the early 1970s.",
    "ARPANET connected international sites by 1973.",
    "ARPANET was decommissioned in 1990, but its influence continued globally.",
  ];

  button.addEventListener("click", () => {
    const i = Math.floor(Math.random() * facts.length);
    output.textContent = facts[i];
  });
}

function initThemeScore() {
  const score = document.getElementById("theme-score");
  const button = document.getElementById("theme-boost");
  if (!score || !button) return;

  let value = 72;
  button.addEventListener("click", () => {
    value = Math.min(100, value + Math.floor(Math.random() * 8 + 3));
    score.textContent = String(value);
    if (value >= 98) score.textContent = "100";
  });
}

function initGlossary() {
  const terms = document.querySelectorAll(".term");
  const definitionBox = document.getElementById("definition-box");
  if (!terms.length || !definitionBox) return;

  const defaultText = "Hover a glossary term to see its definition.";
  terms.forEach((term) => {
    term.addEventListener("mouseenter", () => {
      definitionBox.textContent = term.dataset.definition || "Definition unavailable.";
    });
    term.addEventListener("focus", () => {
      definitionBox.textContent = term.dataset.definition || "Definition unavailable.";
    });
    term.addEventListener("mouseleave", () => {
      definitionBox.textContent = defaultText;
    });
    term.addEventListener("blur", () => {
      definitionBox.textContent = defaultText;
    });
  });
}

function initCounter() {
  const countElement = document.getElementById("visitor-count");
  const plus = document.getElementById("counter-plus");
  const minus = document.getElementById("counter-minus");
  const reset = document.getElementById("counter-reset");
  if (!countElement || !plus || !minus || !reset) return;

  const base = 42;
  let value = base;

  function fmt(num) {
    return String(Math.max(0, num)).padStart(6, "0");
  }

  function save() {
    try {
      localStorage.setItem("arpanet-visitor-count", String(value));
    } catch (_err) {}
  }

  function render() {
    countElement.textContent = fmt(value);
  }

  try {
    const stored = Number(localStorage.getItem("arpanet-visitor-count"));
    if (Number.isFinite(stored) && stored >= 0) value = stored;
  } catch (_err) {
    value = base;
  }

  plus.addEventListener("click", () => {
    value += 1;
    save();
    render();
  });

  minus.addEventListener("click", () => {
    value = Math.max(0, value - 1);
    save();
    render();
  });

  reset.addEventListener("click", () => {
    value = base;
    save();
    render();
  });

  render();
}

function initPoll() {
  const voteButton = document.getElementById("poll-vote");
  const result = document.getElementById("poll-result");
  const options = document.querySelectorAll('input[name="poll"]');
  if (!voteButton || !result || !options.length) return;

  let counts = { "1969": 0, "1971": 0, "1983": 0 };
  try {
    const stored = localStorage.getItem("arpanet-poll");
    if (stored) counts = { ...counts, ...JSON.parse(stored) };
  } catch (_err) {}

  function render() {
    result.textContent = `1969: ${counts["1969"]} | 1971: ${counts["1971"]} | 1983: ${counts["1983"]}`;
  }

  voteButton.addEventListener("click", () => {
    const selected = document.querySelector('input[name="poll"]:checked');
    if (!(selected instanceof HTMLInputElement)) {
      result.textContent = "Select an option before voting.";
      return;
    }
    counts[selected.value] = (counts[selected.value] || 0) + 1;
    try {
      localStorage.setItem("arpanet-poll", JSON.stringify(counts));
    } catch (_err) {}
    render();
  });

  render();
}

function initGuestbook() {
  const form = document.getElementById("guestbook-form");
  const nameInput = document.getElementById("guest-name");
  const messageInput = document.getElementById("guest-message");
  const list = document.getElementById("guestbook-list");
  const clearButton = document.getElementById("guestbook-clear");
  if (!form || !nameInput || !messageInput || !list || !clearButton) return;

  let entries = [];
  try {
    const stored = localStorage.getItem("arpanet-guestbook");
    if (stored) entries = JSON.parse(stored);
  } catch (_err) {
    entries = [];
  }

  function save() {
    try {
      localStorage.setItem("arpanet-guestbook", JSON.stringify(entries));
    } catch (_err) {}
  }

  function render() {
    list.innerHTML = "";
    if (!entries.length) {
      const p = document.createElement("p");
      p.textContent = "No guestbook entries yet.";
      list.appendChild(p);
      return;
    }

    entries.slice().reverse().forEach((entry) => {
      const row = document.createElement("p");
      row.className = "guest-entry";
      row.textContent = `${entry.name}: ${entry.message}`;
      list.appendChild(row);
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    if (!name || !message) return;
    entries.push({ name, message });
    entries = entries.slice(-30);
    save();
    render();
    nameInput.value = "";
    messageInput.value = "";
  });

  clearButton.addEventListener("click", () => {
    entries = [];
    save();
    render();
  });

  render();
}

function initKonami() {
  const status = document.getElementById("secret-status");
  const pattern = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  let buffer = [];

  window.addEventListener("keydown", (event) => {
    buffer.push(event.key);
    buffer = buffer.slice(-pattern.length);
    const matched = pattern.every((key, idx) => (buffer[idx] || "").toLowerCase() === key.toLowerCase());
    if (!matched) return;
    document.body.classList.toggle("party-mode");
    if (status) {
      status.textContent = document.body.classList.contains("party-mode")
        ? "STATUS: PARTY MODE"
        : "STATUS: NORMAL";
    }
  });
}

function initPage() {
  initReveal();
  initTimeline();
  initNodeMapAndSimulator();
  initQuiz();
  initMatcher();
  initConsole();
  initFactLab();
  initThemeScore();
  initGlossary();
  initCounter();
  initPoll();
  initGuestbook();
  initKonami();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage);
} else {
  initPage();
}
