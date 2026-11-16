const missions = [
  {
    title: "Acordar no horário",
    description: "Respeitar o horário planejado para começar o dia."
  },
  {
    title: "Dormir bem",
    description: "Buscar entre 8 e 10 horas de sono."
  },
  {
    title: "Alimentação",
    description: "Manter uma alimentação variada e equilibrada."
  },
  {
    title: "Hidratação",
    description: "Beber água regularmente durante o dia."
  },
  {
    title: "Ar livre",
    description: "Passar algum tempo ao ar livre."
  },
  {
    title: "Academia",
    description: "Respeitar o planejamento de treino e descanso."
  },
  {
    title: "Mobilidade",
    description: "Fazer movimentos leves e cuidar da mobilidade."
  },
  {
    title: "Estudos",
    description: "Estudar por pelo menos 30 minutos."
  },
  {
    title: "Leitura",
    description: "Ler durante pelo menos 10 minutos."
  },
  {
    title: "Organização",
    description: "Manter o quarto e o ambiente organizados."
  },
  {
    title: "Menos celular",
    description: "Evitar distrações excessivas no celular."
  },
  {
    title: "Rotina matinal",
    description: "Começar o dia com organização."
  },
  {
    title: "Aprender algo novo",
    description: "Dedicar um tempo a um novo aprendizado."
  },
  {
    title: "Autocuidado",
    description: "Cuidar da higiene e do bem-estar."
  },
  {
    title: "Preparar o amanhã",
    description: "Organizar as tarefas do próximo dia."
  }
];

// CONFIGURAÇÃO DO PROJETO
const startDate = new Date(2026, 10, 15);
const endDate = new Date(2027, 0, 15);

const TOTAL_DAYS =
  Math.round((endDate - startDate) / 86400000) + 1;

const STORAGE_KEY = "evolucao-historico";

const STATES = {
  DONE: "done",
  FAILED: "failed",
  PENDING: "pending"
};

// ELEMENTOS DO SITE
const missionList = document.getElementById("mission-list");
const historyList = document.getElementById("history-list");
const transitionScreen = document.getElementById("day-transition");

// DATA LOCAL DO DISPOSITIVO
function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMidnightDate(date = new Date()) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function getProjectDay(date = new Date()) {
  const current = getMidnightDate(date);
  const start = getMidnightDate(startDate);

  const difference = Math.floor(
    (current - start) / 86400000
  );

  return Math.max(1, Math.min(TOTAL_DAYS, difference + 1));
}

function isProjectDate(date = new Date()) {
  const current = getMidnightDate(date);

  return current >= getMidnightDate(startDate) &&
         current <= getMidnightDate(endDate);
}

// HISTÓRICO E SALVAMENTO
function getHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return {};

    const history = JSON.parse(saved);

    return history && typeof history === "object"
      ? history
      : {};

  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    return {};
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(history)
    );
  } catch (error) {
    console.error("Erro ao salvar histórico:", error);
    alert("Não foi possível salvar. Verifique o armazenamento do navegador.");
  }
}

// CONVERSÃO DOS DADOS ANTIGOS
// true vira concluída; false vira pendente.
function normalizeStates(savedStates) {
  if (!Array.isArray(savedStates)) {
    return missions.map(() => STATES.PENDING);
  }

  return missions.map((mission, index) => {
    const value = savedStates[index];

    if (value === true || value === STATES.DONE) {
      return STATES.DONE;
    }

    if (value === STATES.FAILED) {
      return STATES.FAILED;
    }

    return STATES.PENDING;
  });
}

function loadTasks(dateKey = getLocalDateKey()) {
  const history = getHistory();

  return normalizeStates(history[dateKey]);
}

function saveTasks(states, dateKey = getLocalDateKey()) {
  const history = getHistory();

  history[dateKey] = states;

  saveHistory(history);
}

// MISSÕES
let activeDateKey = getLocalDateKey();
let tasks = loadTasks(activeDateKey);

function createMission(index, state) {
  const mission = missions[index];

  const card = document.createElement("article");
  card.className = "mission";

  if (state === STATES.DONE) {
    card.classList.add("is-done");
  }

  if (state === STATES.FAILED) {
    card.classList.add("is-failed");
  }

  const info = document.createElement("div");
  info.className = "mission-info";

  const number = document.createElement("div");
  number.className = "mission-number";
  number.textContent = String(index + 1).padStart(2, "0");

  const text = document.createElement("div");
  text.className = "mission-text";

  const title = document.createElement("h3");
  title.textContent = mission.title;

  const description = document.createElement("p");
  description.textContent = mission.description;

  text.append(title, description);
  info.append(number, text);

  const actions = document.createElement("div");
  actions.className = "mission-actions";

  const options = [
    {
      state: STATES.DONE,
      label: "Feita",
      symbol: "✓",
      className: "done"
    },
    {
      state: STATES.FAILED,
      label: "Não feita",
      symbol: "✕",
      className: "failed"
    },
    {
      state: STATES.PENDING,
      label: "Pendente",
      symbol: "○",
      className: "pending"
    }
  ];

  options.forEach(option => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "state-button";
    button.dataset.index = index;
    button.dataset.state = option.state;
    button.textContent = option.label;
    button.title = option.label;
    button.setAttribute(
      "aria-pressed",
      String(state === option.state)
    );

    if (state === option.state) {
      button.classList.add("active", option.className);
    }

    actions.appendChild(button);
  });

  card.append(info, actions);

  return card;
}

function renderMissions() {
  missionList.innerHTML = "";

  missions.forEach((mission, index) => {
    const card = createMission(index, tasks[index]);
    missionList.appendChild(card);
  });
}

missionList.addEventListener("click", event => {
  const button = event.target.closest(".state-button");

  if (!button) return;

  const index = Number(button.dataset.index);
  const newState = button.dataset.state;

  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= missions.length
  ) {
    return;
  }

  // Confere se a data não mudou antes de salvar.
  syncDay();

  tasks[index] = newState;

  saveTasks(tasks, activeDateKey);

  render();
});

// CONTAGEM DO PROGRESSO
function getCounts(states) {
  return {
    done: states.filter(state => state === STATES.DONE).length,
    failed: states.filter(state => state === STATES.FAILED).length,
    pending: states.filter(state => state === STATES.PENDING).length
  };
}

function updateDailyProgress() {
  const counts = getCounts(tasks);

  const percentage = Math.round(
    (counts.done / missions.length) * 100
  );

  document.getElementById("daily-done").textContent = counts.done;
  document.getElementById("daily-failed").textContent = counts.failed;
  document.getElementById("daily-pending").textContent = counts.pending;

  document.getElementById("daily-count").textContent =
    `${counts.done}/${missions.length} concluídas`;

  document.getElementById("daily-percentage").textContent =
    `${percentage}%`;

  document.getElementById("progress").style.width =
    `${percentage}%`;

  const message = document.getElementById("message");

  if (counts.done === missions.length) {
    message.textContent = "Todas as missões concluídas!";
  } else if (counts.failed > 0) {
    message.textContent = "Continue avançando no seu ritmo.";
  } else if (counts.done > 0) {
    message.textContent = "Bom trabalho. Continue!";
  } else {
    message.textContent = "O primeiro passo começa agora.";
  }
}

// DATA E DIA ATUAL
function updateDate() {
  const now = new Date();

  document.getElementById("today").textContent =
    now.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

  document.getElementById("day-number").textContent =
    String(getProjectDay(now)).padStart(2, "0");
}

// RELÓGIO DO DISPOSITIVO
function updateClock() {
  document.getElementById("device-time").textContent =
    new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
}

// HISTÓRICO
function formatHistoryDate(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  );
}

function renderHistory() {
  const history = getHistory();

  const dates = Object.keys(history)
    .filter(key => /^\d{4}-\d{2}-\d{2}$/.test(key))
    .sort()
    .reverse();

  historyList.innerHTML = "";

  if (dates.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-history";
    empty.textContent = "Seu histórico aparecerá aqui.";
    historyList.appendChild(empty);
    return;
  }

  dates.forEach(dateKey => {
    const states = normalizeStates(history[dateKey]);
    const counts = getCounts(states);

    const item = document.createElement("div");
    item.className = "history-item";

    const info = document.createElement("div");

    const date = document.createElement("p");
    date.className = "history-date";
    date.textContent = formatHistoryDate(dateKey);

    const description = document.createElement("p");
    description.className = "history-description";
    description.textContent =
      `${counts.done} feitas • ${counts.failed} não feitas • ${counts.pending} pendentes`;

    info.append(date, description);

    const result = document.createElement("div");
    result.className = "history-result";

    const total = document.createElement("strong");
    total.textContent = `${counts.done}/${missions.length}`;

    const label = document.createElement("span");
    label.textContent = "concluídas";

    result.append(total, label);
    item.append(info, result);

    historyList.appendChild(item);
  });
}

// PROGRESSO GERAL DO PROJETO
function updateProject() {
  const history = getHistory();

  let totalDone = 0;

  Object.keys(history).forEach(dateKey => {
    const states = normalizeStates(history[dateKey]);

    totalDone += states.filter(
      state => state === STATES.DONE
    ).length;
  });

  const totalPossible = TOTAL_DAYS * missions.length;

  const percentage = Math.round(
    (totalDone / totalPossible) * 100
  );

  const today = getMidnightDate();
  const finalDate = getMidnightDate(endDate);

  const remaining = Math.max(
    0,
    Math.ceil((finalDate - today) / 86400000)
  );

  document.getElementById("done").textContent = totalDone;
  document.getElementById("remaining").textContent = remaining;
  document.getElementById("project-percentage").textContent =
    `${percentage}%`;

  document.getElementById("project-progress").style.width =
    `${Math.min(100, percentage)}%`;
}

// ANIMAÇÃO DA VIRADA DO DIA
function showDayTransition() {
  const nextDay = getProjectDay();

  document.getElementById("transition-day").textContent =
    `DIA ${String(nextDay).padStart(2, "0")}`;

  transitionScreen.classList.add("show");
  transitionScreen.setAttribute("aria-hidden", "false");

  setTimeout(() => {
    transitionScreen.classList.remove("show");
    transitionScreen.setAttribute("aria-hidden", "true");
  }, 3500);
}

// VERIFICAÇÃO DA VIRADA DO DIA
function syncDay() {
  const currentDateKey = getLocalDateKey();

  if (currentDateKey === activeDateKey) {
    return;
  }

  activeDateKey = currentDateKey;

  // Carrega o checklist da nova data.
  // O dia anterior permanece guardado no histórico.
  tasks = loadTasks(activeDateKey);

  render();

  if (isProjectDate()) {
    showDayTransition();
  }
}

// AGENDAMENTO DA PRÓXIMA MEIA-NOITE
let midnightTimer;

function scheduleMidnightCheck() {
  clearTimeout(midnightTimer);

  const now = new Date();

  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 1
  );

  const delay = Math.max(
    1000,
    nextMidnight.getTime() - now.getTime()
  );

  midnightTimer = setTimeout(() => {
    syncDay();
    scheduleMidnightCheck();
  }, delay);
}

// ATUALIZAÇÃO GERAL
function render() {
  renderMissions();
  updateDailyProgress();
  updateDate();
  updateProject();
  renderHistory();
}

// INICIALIZAÇÃO
render();
updateClock();

setInterval(updateClock, 1000);
scheduleMidnightCheck();

// Se o usuário voltar ao site depois da meia-noite,
// a data será conferida novamente.
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    syncDay();
    updateClock();
    scheduleMidnightCheck();
  }
});

window.addEventListener("focus", () => {
  syncDay();
  updateClock();
  scheduleMidnightCheck();
});

window.addEventListener("pageshow", () => {
  syncDay();
  updateClock();
  scheduleMidnightCheck();
});
