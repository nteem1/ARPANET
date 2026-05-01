(() => {
  "use strict";

  const storage = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (_err) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (_err) {
        // ignore storage failures
      }
    },
  };

  const data = {
    stats: [
      { label: "Milestones", value: 8 },
      { label: "Initial Nodes", value: 4 },
      { label: "Core Protocol Eras", value: 3 },
      { label: "Archive Modules", value: 12 },
    ],
    timeline: [
      {
        year: 1962,
        title: "Licklider Network Vision",
        category: "Concept",
        summary: "J.C.R. Licklider advocates globally connected interactive computing.",
        impact: "Introduced networked computing as a strategic research direction.",
      },
      {
        year: 1965,
        title: "First Long-Distance Link Test",
        category: "Experiment",
        summary: "Computers in Massachusetts and California communicate over phone lines.",
        impact: "Validated remote interactive use despite latency constraints.",
      },
      {
        year: 1968,
        title: "IMP Contract to BBN",
        category: "Infrastructure",
        summary: "ARPANET commissions dedicated Interface Message Processors.",
        impact: "Created packet-routing hardware layer for host interconnection.",
      },
      {
        year: 1969,
        title: "First Four Nodes Online",
        category: "Launch",
        summary: "UCLA, SRI, UCSB, and Utah establish the first production node set.",
        impact: "Transition from proposal to operational network.",
      },
      {
        year: 1971,
        title: "Email Usage Accelerates",
        category: "Application",
        summary: "Electronic messaging quickly becomes a top ARPANET workload.",
        impact: "Shifted network value toward collaboration and communication.",
      },
      {
        year: 1973,
        title: "International Network Links",
        category: "Expansion",
        summary: "Links to the UK and Norway demonstrate broader inter-network reach.",
        impact: "Proved packet networking feasibility beyond domestic contexts.",
      },
      {
        year: 1983,
        title: "TCP/IP Flag Day",
        category: "Protocol",
        summary: "ARPANET migrates to TCP/IP on January 1, 1983.",
        impact: "Enabled scalable internetworking across heterogeneous networks.",
      },
      {
        year: 1990,
        title: "ARPANET Decommissioned",
        category: "Transition",
        summary: "Original ARPANET retires after proving architectural viability.",
        impact: "Legacy continues through modern internet design and operations.",
      },
    ],
    nodes: [
      {
        id: "ucla",
        name: "UCLA",
        region: "California",
        role: "Network Measurement Center",
        note: "Origin of first message attempt in 1969.",
      },
      {
        id: "sri",
        name: "SRI",
        region: "California",
        role: "Network Information Center",
        note: "Critical coordination and directory services node.",
      },
      {
        id: "ucsb",
        name: "UC Santa Barbara",
        region: "California",
        role: "Interactive Math Workloads",
        note: "Research computing and shared applications.",
      },
      {
        id: "utah",
        name: "University of Utah",
        region: "Utah",
        role: "Graphics and Visualization",
        note: "Advanced graphics workloads influenced remote computing concepts.",
      },
    ],
    quiz: [
      {
        q: "Which institution sent the first ARPANET message attempt in 1969?",
        options: ["SRI", "UCLA", "MIT", "University of Utah"],
        answer: 1,
      },
      {
        q: "What letters were successfully delivered before the first crash?",
        options: ["IP", "LO", "AR", "ET"],
        answer: 1,
      },
      {
        q: "When did ARPANET transition to TCP/IP?",
        options: ["January 1, 1979", "January 1, 1983", "January 1, 1989", "January 1, 1990"],
        answer: 1,
      },
      {
        q: "Which company built the IMP devices?",
        options: ["IBM", "Bell Labs", "BBN", "DEC"],
        answer: 2,
      },
    ],
    matcher: [
      { prompt: "Remote login", key: "telnet", options: ["Telnet", "FTP", "SMTP"] },
      { prompt: "File transfer", key: "ftp", options: ["SMTP", "FTP", "Telnet"] },
      { prompt: "Electronic mail transport", key: "smtp", options: ["FTP", "SMTP", "Telnet"] },
    ],
    facts: [
      "ARPANET's first host-to-host message attempt happened on October 29, 1969.",
      "Packet switching improved resilience by avoiding fixed single-route dependency.",
      "Email emerged as one of ARPANET's highest-volume applications by the early 1970s.",
      "The 1983 TCP/IP migration established the protocol base for modern internet growth.",
      "ARPANET's decommissioning in 1990 marked a transition, not an end, to network evolution.",
      "Interface Message Processors abstracted host differences and standardized packet routing behavior.",
    ],
    faq: [
      {
        q: "Was ARPANET the internet?",
        a: "No. ARPANET was one foundational network whose architecture influenced the broader internet.",
      },
      {
        q: "Why was packet switching important?",
        a: "It improved efficiency and fault tolerance by routing packet units over available paths.",
      },
      {
        q: "Why does 1983 matter so much?",
        a: "TCP/IP adoption enabled standardized inter-network communication at scale.",
      },
    ],
    poll: [
      { id: "1969", label: "1969 first nodes online" },
      { id: "1971", label: "1971 email acceleration" },
      { id: "1983", label: "1983 TCP/IP migration" },
    ],
  };

  const state = {
    timeline: {
      year: "all",
      category: "all",
      text: "",
      autoplay: false,
      autoplayId: null,
      speed: 1300,
      index: 0,
    },
    quiz: {
      index: 0,
      score: 0,
      attempts: 0,
      answered: false,
    },
    pins: [],
    counter: 42,
    pollCounts: storage.get("arpanet-poll", { "1969": 0, "1971": 0, "1983": 0 }),
    guestbook: storage.get("arpanet-guestbook", []),
    themeMode: storage.get("arpanet-theme", "dark"),
  };

  const dom = {};

  function cacheDom() {
    dom.statsGrid = document.getElementById("stats-grid");
    dom.timelineGrid = document.getElementById("timeline-grid");
    dom.yearControls = document.getElementById("year-controls");
    dom.timelinePlay = document.getElementById("timeline-play");
    dom.timelineSpeed = document.getElementById("timeline-speed");
    dom.timelineSlider = document.getElementById("timeline-slider");
    dom.timelineStatus = document.getElementById("timeline-status");
    dom.categoryFilter = document.getElementById("category-filter");
    dom.textFilter = document.getElementById("text-filter");
    dom.globalSearch = document.getElementById("global-search");
    dom.clearSearch = document.getElementById("clear-search");
    dom.searchCount = document.getElementById("search-count");

    dom.nodeButtons = document.getElementById("node-buttons");
    dom.nodeSummary = document.getElementById("node-summary");
    dom.nodeMeta = document.getElementById("node-meta");

    dom.fromNode = document.getElementById("from-node");
    dom.toNode = document.getElementById("to-node");
    dom.packetSize = document.getElementById("packet-size");
    dom.sendPacket = document.getElementById("send-packet");
    dom.clearLog = document.getElementById("clear-log");
    dom.packetDisplay = document.getElementById("packet-display");
    dom.packetLog = document.getElementById("packet-log");

    dom.quizQuestion = document.getElementById("quiz-question");
    dom.quizOptions = document.getElementById("quiz-options");
    dom.quizSubmit = document.getElementById("quiz-submit");
    dom.quizNext = document.getElementById("quiz-next");
    dom.quizReset = document.getElementById("quiz-reset");
    dom.quizFeedback = document.getElementById("quiz-feedback");

    dom.matcherGrid = document.getElementById("matcher-grid");
    dom.checkMatch = document.getElementById("check-match");
    dom.resetMatch = document.getElementById("reset-match");
    dom.matchResult = document.getElementById("match-result");

    dom.factOutput = document.getElementById("fact-output");
    dom.factSpin = document.getElementById("fact-spin");
    dom.factPin = document.getElementById("fact-pin");
    dom.factPins = document.getElementById("fact-pins");

    dom.definitionBox = document.getElementById("definition-box");
    dom.faqList = document.getElementById("faq-list");

    dom.pollOptions = document.getElementById("poll-options");
    dom.pollVote = document.getElementById("poll-vote");
    dom.pollResult = document.getElementById("poll-result");

    dom.guestbookForm = document.getElementById("guestbook-form");
    dom.guestName = document.getElementById("guest-name");
    dom.guestMessage = document.getElementById("guest-message");
    dom.guestbookClear = document.getElementById("guestbook-clear");
    dom.guestbookList = document.getElementById("guestbook-list");

    dom.themeScore = document.getElementById("theme-score");
    dom.themeBoost = document.getElementById("theme-boost");
    dom.counterPlus = document.getElementById("counter-plus");
    dom.counterMinus = document.getElementById("counter-minus");
    dom.counterReset = document.getElementById("counter-reset");
    dom.counter = document.getElementById("visitor-count");

    dom.audio = document.getElementById("archive-audio");
    dom.audioStatus = document.getElementById("audio-status");
    dom.audioCanvas = document.getElementById("audio-visualizer");
    dom.categoryChart = document.getElementById("category-chart");

    dom.themeToggle = document.getElementById("theme-toggle");
    dom.openCommand = document.getElementById("open-command");
    dom.palette = document.getElementById("command-palette");
    dom.closePalette = document.getElementById("close-palette");
    dom.paletteSearch = document.getElementById("palette-search");
    dom.paletteResults = document.getElementById("palette-results");
  }

  function unique(values) {
    return [...new Set(values)];
  }

  function formatCounter(value) {
    return String(Math.max(0, value)).padStart(6, "0");
  }

  function logLine(text) {
    const line = document.createElement("p");
    line.className = "log-line";
    line.textContent = text;
    return line;
  }

  function setTheme(mode) {
    document.body.dataset.theme = mode;
    if (mode === "light") {
      document.documentElement.style.setProperty("--bg-0", "#e8eefc");
      document.documentElement.style.setProperty("--bg-1", "#f3f7ff");
      document.documentElement.style.setProperty("--bg-2", "#ffffff");
      document.documentElement.style.setProperty("--surface", "rgba(255,255,255,0.84)");
      document.documentElement.style.setProperty("--surface-solid", "#ffffff");
      document.documentElement.style.setProperty("--surface-soft", "rgba(237,245,255,0.86)");
      document.documentElement.style.setProperty("--text", "#18213a");
      document.documentElement.style.setProperty("--muted", "#4f5f7f");
      document.documentElement.style.setProperty("--line", "rgba(105,135,196,0.28)");
    } else {
      document.documentElement.style.removeProperty("--bg-0");
      document.documentElement.style.removeProperty("--bg-1");
      document.documentElement.style.removeProperty("--bg-2");
      document.documentElement.style.removeProperty("--surface");
      document.documentElement.style.removeProperty("--surface-solid");
      document.documentElement.style.removeProperty("--surface-soft");
      document.documentElement.style.removeProperty("--text");
      document.documentElement.style.removeProperty("--muted");
      document.documentElement.style.removeProperty("--line");
    }
  }

  function renderStats() {
    if (!dom.statsGrid) return;
    dom.statsGrid.innerHTML = "";
    data.stats.forEach((item) => {
      const card = document.createElement("article");
      card.className = "stat";
      card.innerHTML = `<span class="stat-value">${item.value}</span><span class="stat-label">${item.label}</span>`;
      dom.statsGrid.appendChild(card);
    });
  }

  function renderTimelineControls() {
    const years = ["all", ...data.timeline.map((m) => String(m.year))];
    dom.yearControls.innerHTML = "";
    years.forEach((year) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `btn btn-ghost${state.timeline.year === year ? " active" : ""}`;
      btn.dataset.year = year;
      btn.textContent = year === "all" ? "All" : year;
      dom.yearControls.appendChild(btn);
    });

    const categories = ["all", ...unique(data.timeline.map((m) => m.category.toLowerCase()))];
    dom.categoryFilter.innerHTML = "";
    categories.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c === "all" ? "All Categories" : c[0].toUpperCase() + c.slice(1);
      dom.categoryFilter.appendChild(opt);
    });

    dom.timelineSlider.max = String(Math.max(0, data.timeline.length - 1));
  }

  function getFilteredTimeline() {
    return data.timeline.filter((item) => {
      const yearPass = state.timeline.year === "all" || String(item.year) === state.timeline.year;
      const catPass =
        state.timeline.category === "all" || item.category.toLowerCase() === state.timeline.category;
      const text = state.timeline.text.trim().toLowerCase();
      const textPass =
        !text ||
        item.title.toLowerCase().includes(text) ||
        item.summary.toLowerCase().includes(text) ||
        item.impact.toLowerCase().includes(text);
      return yearPass && catPass && textPass;
    });
  }

  function renderTimeline() {
    const filtered = getFilteredTimeline();
    dom.timelineGrid.innerHTML = "";
    filtered.forEach((item) => {
      const card = document.createElement("article");
      card.className = "timeline-card reveal visible";
      card.innerHTML = `
        <p class="year">${item.year}</p>
        <h3>${item.title}</h3>
        <p>${item.summary}</p>
        <p class="meta">${item.impact}</p>
        <span class="tag">${item.category}</span>
      `;
      dom.timelineGrid.appendChild(card);
    });

    dom.timelineStatus.textContent = `${filtered.length} milestone(s) visible`;
    dom.searchCount.textContent = `${filtered.length} match(es)`;
  }

  function syncTimelineButtons() {
    dom.yearControls.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.year === state.timeline.year);
      btn.setAttribute("aria-pressed", btn.dataset.year === state.timeline.year ? "true" : "false");
    });
  }

  function stopTimelineAutoplay(status = "Manual mode") {
    if (state.timeline.autoplayId) {
      clearInterval(state.timeline.autoplayId);
      state.timeline.autoplayId = null;
    }
    state.timeline.autoplay = false;
    dom.timelinePlay.textContent = "Start Autoplay";
    dom.timelineStatus.textContent = status;
  }

  function startTimelineAutoplay() {
    const years = data.timeline.map((m) => String(m.year));
    state.timeline.autoplay = true;
    dom.timelinePlay.textContent = "Stop Autoplay";
    dom.timelineStatus.textContent = "Autoplay running";

    state.timeline.autoplayId = setInterval(() => {
      state.timeline.index = (state.timeline.index + 1) % years.length;
      state.timeline.year = years[state.timeline.index];
      dom.timelineSlider.value = String(state.timeline.index);
      syncTimelineButtons();
      renderTimeline();
    }, state.timeline.speed);
  }

  function initTimeline() {
    renderTimelineControls();
    renderTimeline();
    syncTimelineButtons();

    dom.yearControls.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;
      stopTimelineAutoplay();
      state.timeline.year = target.dataset.year || "all";
      syncTimelineButtons();
      renderTimeline();
    });

    dom.timelinePlay.addEventListener("click", () => {
      if (state.timeline.autoplay) stopTimelineAutoplay();
      else startTimelineAutoplay();
    });

    dom.timelineSpeed.addEventListener("change", () => {
      state.timeline.speed = Number(dom.timelineSpeed.value) || 1300;
      if (state.timeline.autoplay) {
        stopTimelineAutoplay("Speed updated");
        startTimelineAutoplay();
      }
    });

    dom.timelineSlider.addEventListener("input", () => {
      stopTimelineAutoplay();
      const index = Number(dom.timelineSlider.value);
      const milestone = data.timeline[index];
      if (!milestone) return;
      state.timeline.year = String(milestone.year);
      state.timeline.index = index;
      syncTimelineButtons();
      renderTimeline();
    });

    dom.categoryFilter.addEventListener("change", () => {
      state.timeline.category = dom.categoryFilter.value;
      renderTimeline();
    });

    dom.textFilter.addEventListener("input", () => {
      state.timeline.text = dom.textFilter.value;
      renderTimeline();
    });

    dom.globalSearch.addEventListener("input", () => {
      state.timeline.text = dom.globalSearch.value;
      dom.textFilter.value = dom.globalSearch.value;
      renderTimeline();
      applyGlobalContentSearch(dom.globalSearch.value);
    });

    dom.clearSearch.addEventListener("click", () => {
      dom.globalSearch.value = "";
      dom.textFilter.value = "";
      state.timeline.text = "";
      renderTimeline();
      applyGlobalContentSearch("");
      dom.globalSearch.focus();
    });
  }

  function initNodeExplorer() {
    dom.nodeButtons.innerHTML = "";
    dom.fromNode.innerHTML = "";
    dom.toNode.innerHTML = "";

    data.nodes.forEach((node) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "btn btn-ghost";
      chip.textContent = node.name;
      chip.dataset.node = node.id;
      dom.nodeButtons.appendChild(chip);

      const optFrom = document.createElement("option");
      optFrom.value = node.id;
      optFrom.textContent = node.name;
      dom.fromNode.appendChild(optFrom);

      const optTo = document.createElement("option");
      optTo.value = node.id;
      optTo.textContent = node.name;
      dom.toNode.appendChild(optTo);
    });

    dom.toNode.selectedIndex = 1;

    function renderNode(id) {
      const node = data.nodes.find((n) => n.id === id);
      if (!node) return;
      dom.nodeSummary.textContent = node.note;
      dom.nodeMeta.innerHTML = "";
      const entries = [
        ["Node", node.name],
        ["Region", node.region],
        ["Role", node.role],
      ];
      entries.forEach(([k, v]) => {
        const dt = document.createElement("dt");
        dt.textContent = k;
        const dd = document.createElement("dd");
        dd.textContent = v;
        dom.nodeMeta.appendChild(dt);
        dom.nodeMeta.appendChild(dd);
      });

      dom.nodeButtons.querySelectorAll("button").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.node === id);
      });
    }

    dom.nodeButtons.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;
      renderNode(target.dataset.node || "ucla");
    });

    renderNode("ucla");
  }

  function initPacketRouter() {
    function appendLog(message) {
      dom.packetLog.appendChild(logLine(message));
      dom.packetLog.scrollTop = dom.packetLog.scrollHeight;
    }

    dom.sendPacket.addEventListener("click", () => {
      const from = dom.fromNode.value;
      const to = dom.toNode.value;
      const size = Number(dom.packetSize.value) || 512;

      if (!from || !to || from === to) {
        dom.packetDisplay.textContent = "Choose two distinct nodes.";
        return;
      }

      const route = [from, "imp-router", to];
      dom.packetDisplay.textContent = `Dispatching ${size}B packet: ${from.toUpperCase()} -> ${to.toUpperCase()}`;
      appendLog(`TX START ${from.toUpperCase()} -> ${to.toUpperCase()} [${size}B]`);

      let index = 0;
      const start = performance.now();
      const timer = setInterval(() => {
        index += 1;
        if (index >= route.length) {
          clearInterval(timer);
          const latency = Math.round(performance.now() - start);
          appendLog(`TX COMPLETE ACK RECEIVED (${latency}ms simulated)`);
          dom.packetDisplay.textContent = `Delivered in ${latency}ms simulated latency.`;
          return;
        }
        appendLog(`HOP ${index}: ${route[index]}`);
      }, 420);
    });

    dom.clearLog.addEventListener("click", () => {
      dom.packetLog.innerHTML = "";
      dom.packetDisplay.textContent = "Log cleared. Awaiting transmission...";
    });
  }

  function renderQuizQuestion() {
    const question = data.quiz[state.quiz.index];
    state.quiz.answered = false;
    dom.quizQuestion.textContent = question.q;
    dom.quizOptions.innerHTML = "";

    question.options.forEach((option, i) => {
      const label = document.createElement("label");
      label.className = "option";
      label.innerHTML = `<input type="radio" name="quiz" value="${i}" /> <span>${option}</span>`;
      dom.quizOptions.appendChild(label);
    });
  }

  function setQuizFeedback(message) {
    dom.quizFeedback.textContent = `${message} Score: ${state.quiz.score}/${state.quiz.attempts}`;
  }

  function initQuiz() {
    renderQuizQuestion();
    setQuizFeedback("Ready.");

    dom.quizSubmit.addEventListener("click", () => {
      if (state.quiz.answered) {
        setQuizFeedback("Already checked.");
        return;
      }

      const selected = dom.quizOptions.querySelector('input[name="quiz"]:checked');
      if (!(selected instanceof HTMLInputElement)) {
        setQuizFeedback("Select an option first.");
        return;
      }

      state.quiz.attempts += 1;
      state.quiz.answered = true;
      const correct = Number(selected.value) === data.quiz[state.quiz.index].answer;
      if (correct) {
        state.quiz.score += 1;
        setQuizFeedback("Correct.");
      } else {
        setQuizFeedback("Incorrect.");
      }
    });

    dom.quizNext.addEventListener("click", () => {
      state.quiz.index = (state.quiz.index + 1) % data.quiz.length;
      renderQuizQuestion();
      setQuizFeedback("Next question loaded.");
    });

    dom.quizReset.addEventListener("click", () => {
      state.quiz.index = 0;
      state.quiz.score = 0;
      state.quiz.attempts = 0;
      state.quiz.answered = false;
      renderQuizQuestion();
      setQuizFeedback("Quiz reset.");
    });
  }

  function initMatcher() {
    dom.matcherGrid.innerHTML = "";
    data.matcher.forEach((item, idx) => {
      const wrapper = document.createElement("div");
      wrapper.className = "stack";
      const label = document.createElement("label");
      label.setAttribute("for", `match-${idx}`);
      label.textContent = item.prompt;

      const select = document.createElement("select");
      select.id = `match-${idx}`;
      select.dataset.key = item.key;
      const empty = document.createElement("option");
      empty.value = "";
      empty.textContent = "Choose...";
      select.appendChild(empty);

      item.options.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt.toLowerCase();
        option.textContent = opt;
        select.appendChild(option);
      });

      wrapper.appendChild(label);
      wrapper.appendChild(select);
      dom.matcherGrid.appendChild(wrapper);
    });

    dom.checkMatch.addEventListener("click", () => {
      const selects = dom.matcherGrid.querySelectorAll("select");
      let score = 0;
      selects.forEach((select) => {
        if (select.value === select.dataset.key) score += 1;
      });
      dom.matchResult.textContent = `Protocol match score: ${score}/${selects.length}`;
    });

    dom.resetMatch.addEventListener("click", () => {
      dom.matcherGrid.querySelectorAll("select").forEach((select) => {
        select.value = "";
      });
      dom.matchResult.textContent = "Waiting for input";
    });
  }

  function initFacts() {
    dom.factSpin.addEventListener("click", () => {
      const fact = data.facts[Math.floor(Math.random() * data.facts.length)];
      dom.factOutput.textContent = fact;
    });

    dom.factPin.addEventListener("click", () => {
      const text = dom.factOutput.textContent.trim();
      if (!text || text.startsWith("Press generate")) return;
      state.pins.push(text);
      state.pins = state.pins.slice(-8);
      renderPins();
    });

    renderPins();
  }

  function renderPins() {
    dom.factPins.innerHTML = "";
    if (!state.pins.length) return;
    state.pins.forEach((fact) => {
      const li = document.createElement("li");
      li.textContent = fact;
      dom.factPins.appendChild(li);
    });
  }

  function initFaqAndGlossary() {
    dom.faqList.innerHTML = "";
    data.faq.forEach((item) => {
      const details = document.createElement("details");
      details.innerHTML = `<summary>${item.q}</summary><p>${item.a}</p>`;
      dom.faqList.appendChild(details);
    });

    const terms = document.querySelectorAll(".term");
    terms.forEach((term) => {
      const set = () => {
        dom.definitionBox.textContent = term.dataset.definition || "Definition unavailable.";
      };
      term.addEventListener("mouseenter", set);
      term.addEventListener("focus", set);
      term.addEventListener("click", set);
    });
  }

  function initPoll() {
    dom.pollOptions.innerHTML = "";
    data.poll.forEach((item) => {
      const label = document.createElement("label");
      label.className = "option";
      label.innerHTML = `<input type="radio" name="poll" value="${item.id}" /> <span>${item.label}</span>`;
      dom.pollOptions.appendChild(label);
    });

    function renderPollResult() {
      dom.pollResult.textContent = data.poll
        .map((p) => `${p.id}: ${state.pollCounts[p.id] || 0}`)
        .join(" | ");
    }

    dom.pollVote.addEventListener("click", () => {
      const selected = dom.pollOptions.querySelector('input[name="poll"]:checked');
      if (!(selected instanceof HTMLInputElement)) {
        dom.pollResult.textContent = "Select an option before voting.";
        return;
      }
      state.pollCounts[selected.value] = (state.pollCounts[selected.value] || 0) + 1;
      storage.set("arpanet-poll", state.pollCounts);
      renderPollResult();
    });

    renderPollResult();
  }

  function initGuestbook() {
    function renderGuestbook() {
      dom.guestbookList.innerHTML = "";
      if (!state.guestbook.length) {
        dom.guestbookList.appendChild(logLine("No entries yet."));
        return;
      }
      state.guestbook
        .slice()
        .reverse()
        .forEach((entry) => {
          dom.guestbookList.appendChild(logLine(`${entry.name}: ${entry.message}`));
        });
    }

    dom.guestbookForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = dom.guestName.value.trim();
      const message = dom.guestMessage.value.trim();
      if (!name || !message) return;
      state.guestbook.push({ name, message, ts: Date.now() });
      state.guestbook = state.guestbook.slice(-40);
      storage.set("arpanet-guestbook", state.guestbook);
      dom.guestName.value = "";
      dom.guestMessage.value = "";
      renderGuestbook();
    });

    dom.guestbookClear.addEventListener("click", () => {
      state.guestbook = [];
      storage.set("arpanet-guestbook", state.guestbook);
      renderGuestbook();
    });

    renderGuestbook();
  }

  function initEngagement() {
    const storedCounter = storage.get("arpanet-counter", 42);
    state.counter = Number.isFinite(storedCounter) ? storedCounter : 42;

    function renderCounter() {
      dom.counter.textContent = formatCounter(state.counter);
      storage.set("arpanet-counter", state.counter);
    }

    dom.counterPlus.addEventListener("click", () => {
      state.counter += 1;
      renderCounter();
    });

    dom.counterMinus.addEventListener("click", () => {
      state.counter = Math.max(0, state.counter - 1);
      renderCounter();
    });

    dom.counterReset.addEventListener("click", () => {
      state.counter = 42;
      renderCounter();
    });

    dom.themeBoost.addEventListener("click", () => {
      const current = Number(dom.themeScore.textContent) || 72;
      const updated = Math.min(100, current + Math.floor(Math.random() * 7 + 4));
      dom.themeScore.textContent = String(updated);
    });

    renderCounter();
  }

  function initCategoryChart() {
    if (!(dom.categoryChart instanceof HTMLCanvasElement)) return;
    const ctx = dom.categoryChart.getContext("2d");
    if (!ctx) return;

    const categories = unique(data.timeline.map((m) => m.category));
    const counts = categories.map((c) => data.timeline.filter((m) => m.category === c).length);
    const colors = ["#5ea1ff", "#3be1c4", "#f7b955", "#ff8ca1", "#9fbcff", "#6ee7b7", "#fca5a5", "#c4b5fd"];

    function draw() {
      const { width, height } = dom.categoryChart;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(8,15,30,0.92)";
      ctx.fillRect(0, 0, width, height);

      const max = Math.max(...counts, 1);
      const pad = 30;
      const chartW = width - pad * 2;
      const chartH = height - pad * 2;
      const barW = chartW / counts.length - 12;

      counts.forEach((value, i) => {
        const h = (value / max) * (chartH - 24);
        const x = pad + i * (barW + 12);
        const y = height - pad - h;
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(x, y, barW, h);

        ctx.fillStyle = "#d9e8ff";
        ctx.font = "12px Manrope";
        ctx.fillText(categories[i], x, height - 10);
        ctx.fillText(String(value), x + barW / 2 - 4, y - 6);
      });
    }

    draw();
  }

  function initAudioVisualizer() {
    if (!(dom.audio instanceof HTMLAudioElement) || !(dom.audioCanvas instanceof HTMLCanvasElement)) return;
    const context = dom.audioCanvas.getContext("2d");
    if (!context) return;

    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;

    const audioCtx = new AC();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    const source = audioCtx.createMediaElementSource(dom.audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    const buffer = new Uint8Array(analyser.frequencyBinCount);

    function ensure() {
      if (audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
      }
    }

    function draw() {
      analyser.getByteFrequencyData(buffer);
      const { width, height } = dom.audioCanvas;
      context.clearRect(0, 0, width, height);
      context.fillStyle = "rgba(7,12,24,0.95)";
      context.fillRect(0, 0, width, height);

      const barWidth = width / buffer.length;
      buffer.forEach((v, i) => {
        const h = (v / 255) * height;
        context.fillStyle = `hsl(${210 + (i / buffer.length) * 70} 95% 66%)`;
        context.fillRect(i * barWidth, height - h, barWidth - 2, h);
      });

      requestAnimationFrame(draw);
    }

    dom.audio.addEventListener("play", () => {
      ensure();
      dom.audioStatus.textContent = "Audio playing";
    });

    dom.audio.addEventListener("pause", () => {
      dom.audioStatus.textContent = "Audio paused";
    });

    dom.audio.addEventListener("error", () => {
      dom.audioStatus.textContent = "Audio load failed";
    });

    document.body.addEventListener("click", ensure, { once: true });
    draw();
  }

  function applyGlobalContentSearch(query) {
    const targets = document.querySelectorAll(
      ".timeline-card, #network-lab .card, #learning-studio .card, #reference .card, #community .card"
    );

    const q = query.trim().toLowerCase();
    let visible = 0;

    targets.forEach((el) => {
      if (!q) {
        el.classList.remove("filtered-out");
        visible += 1;
        return;
      }
      const text = (el.textContent || "").toLowerCase();
      const keep = text.includes(q);
      el.classList.toggle("filtered-out", !keep);
      if (keep) visible += 1;
    });

    dom.searchCount.textContent = `${visible} section card(s)`;
  }

  function initCommandPalette() {
    const commands = [
      { label: "Go to Dashboard", run: () => document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" }) },
      { label: "Go to Timeline", run: () => document.getElementById("timeline")?.scrollIntoView({ behavior: "smooth" }) },
      { label: "Go to Network Lab", run: () => document.getElementById("network-lab")?.scrollIntoView({ behavior: "smooth" }) },
      {
        label: "Toggle Timeline Autoplay",
        run: () => dom.timelinePlay?.dispatchEvent(new Event("click", { bubbles: true })),
      },
      { label: "Generate Random Fact", run: () => dom.factSpin?.dispatchEvent(new Event("click")) },
      { label: "Open Deep Dive", run: () => window.open("deepdive.html", "_self") },
      {
        label: "Switch Theme",
        run: () => dom.themeToggle?.dispatchEvent(new Event("click")),
      },
    ];

    function close() {
      dom.palette.classList.add("hidden");
      dom.palette.setAttribute("aria-hidden", "true");
    }

    function open() {
      dom.palette.classList.remove("hidden");
      dom.palette.setAttribute("aria-hidden", "false");
      render(dom.paletteSearch.value);
      dom.paletteSearch.focus();
    }

    function render(query) {
      dom.paletteResults.innerHTML = "";
      const q = (query || "").toLowerCase().trim();
      const filtered = commands.filter((c) => c.label.toLowerCase().includes(q));
      filtered.forEach((cmd) => {
        const item = document.createElement("button");
        item.className = "palette-item";
        item.type = "button";
        item.textContent = cmd.label;
        item.addEventListener("click", () => {
          cmd.run();
          close();
        });
        dom.paletteResults.appendChild(item);
      });
    }

    dom.openCommand.addEventListener("click", open);
    dom.closePalette.addEventListener("click", close);

    dom.paletteSearch.addEventListener("input", () => render(dom.paletteSearch.value));

    dom.palette.addEventListener("click", (event) => {
      if (event.target === dom.palette) close();
    });

    window.addEventListener("keydown", (event) => {
      const isK = event.key.toLowerCase() === "k";
      if ((event.metaKey || event.ctrlKey) && isK) {
        event.preventDefault();
        if (dom.palette.classList.contains("hidden")) open();
        else close();
      }

      if (event.key === "Escape" && !dom.palette.classList.contains("hidden")) {
        close();
      }
    });
  }

  function initThemeToggle() {
    setTheme(state.themeMode);
    dom.themeToggle.setAttribute("aria-pressed", state.themeMode === "light" ? "true" : "false");

    dom.themeToggle.addEventListener("click", () => {
      state.themeMode = state.themeMode === "dark" ? "light" : "dark";
      storage.set("arpanet-theme", state.themeMode);
      setTheme(state.themeMode);
      dom.themeToggle.setAttribute("aria-pressed", state.themeMode === "light" ? "true" : "false");
    });
  }

  function init() {
    cacheDom();
    renderStats();
    initThemeToggle();
    initTimeline();
    initNodeExplorer();
    initPacketRouter();
    initQuiz();
    initMatcher();
    initFacts();
    initFaqAndGlossary();
    initPoll();
    initGuestbook();
    initEngagement();
    initCategoryChart();
    initAudioVisualizer();
    initCommandPalette();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
