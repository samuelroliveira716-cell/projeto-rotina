// =====================================
// PROJETO EVOLUÇÃO
// Sistema de missões e histórico diário
// =====================================

const missions = [
    ["Acordar no horário", "Respeitar o horário planejado."],
    ["Dormir bem", "Buscar entre 8 e 10 horas de sono."],
    ["Alimentação", "Manter uma alimentação variada."],
    ["Hidratação", "Beber água regularmente."],
    ["Ar livre", "Passar um tempo ao ar livre."],
    ["Academia", "Treinar nos dias programados."],
    ["Mobilidade", "Fazer movimentos leves."],
    ["Estudos", "Estudar por pelo menos 30 minutos."],
    ["Leitura", "Ler por 10 minutos."],
    ["Organização", "Manter o quarto organizado."],
    ["Menos celular", "Evitar distrações excessivas."],
    ["Rotina matinal", "Começar o dia com organização."],
    ["Aprender algo novo", "Dedicar tempo ao aprendizado."],
    ["Autocuidado", "Cuidar da higiene e bem-estar."],
    ["Preparar o amanhã", "Organizar o próximo dia."]
];

// DATAS DO PROJETO

const start = new Date(2026, 10, 15);
const end = new Date(2027, 0, 15);

// DATA LOCAL DO APARELHO

function dateKey(date = new Date()) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}

// HISTÓRICO

function getHistory() {
    try {
        return JSON.parse(
            localStorage.getItem("evolucao-historico") || "{}"
        );
    } catch {
        return {};
    }
}

function saveHistory(history) {
    localStorage.setItem(
        "evolucao-historico",
        JSON.stringify(history)
    );
}

// CARREGAR MISSÕES DO DIA

function loadTasks() {
    const history = getHistory();
    const saved = history[dateKey()];

    if (!Array.isArray(saved)) {
        return Array(missions.length).fill(false);
    }

    return missions.map((_, index) => saved[index] === true);
}

// SALVAR MISSÕES AUTOMATICAMENTE

function saveTasks(data) {
    const history = getHistory();

    history[dateKey()] = data;

    saveHistory(history);
}

// MOSTRAR MISSÕES

function render() {
    const data = loadTasks();
    const list = document.getElementById("mission-list");

    list.innerHTML = "";

    missions.forEach((mission, index) => {
        const item = document.createElement("label");

        item.className =
            "mission" + (data[index] ? " done" : "");

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = !!data[index];

        checkbox.addEventListener("change", () => {
            const updated = loadTasks();

            updated[index] = checkbox.checked;

            saveTasks(updated);
            render();
        });

        const info = document.createElement("div");
        info.className = "mission-info";

        const name = document.createElement("div");
        name.className = "mission-name";
        name.textContent = mission[0];

        const desc = document.createElement("div");
        desc.className = "mission-desc";
        desc.textContent = mission[1];

        info.append(name, desc);
        item.append(checkbox, info);
        list.append(item);
    });

    updateDailyProgress(data);
    updateProject();
    renderHistory();
}

// PROGRESSO DO DIA

function updateDailyProgress(data) {
    const completed = data.filter(Boolean).length;
    const total = missions.length;
    const percent = completed / total * 100;

    document.getElementById("counter").textContent =
        `${completed}/${total}`;

    document.getElementById("done").textContent =
        completed;

    document.getElementById("progress").style.width =
        percent + "%";

    document.getElementById("message").textContent =
        completed === total
            ? "Todas as missões concluídas. Excelente!"
            : `Você já concluiu ${completed} de ${total} missões.`;

    document.getElementById("today").textContent =
        new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
}

// HISTÓRICO DE TODOS OS DIAS

function renderHistory() {
    const history = getHistory();
    const list = document.getElementById("history-list");

    list.innerHTML = "";

    const dates = Object.keys(history)
        .filter(key => /^\d{4}-\d{2}-\d{2}$/.test(key))
        .sort()
        .reverse();

    if (dates.length === 0) {
        list.innerHTML =
            '<p class="history-empty">Suas conquistas aparecerão aqui conforme você marcar as missões.</p>';
        return;
    }

    dates.forEach(key => {
        const saved = history[key];

        if (!Array.isArray(saved)) return;

        const completed = saved.filter(Boolean).length;

        const date = new Date(key + "T12:00:00");

        const formatted = date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });

        const dayNumber =
            Math.floor((date - start) / 86400000) + 1;

        const item = document.createElement("div");
        item.className = "history-item";

        const info = document.createElement("div");

        const title = document.createElement("div");
        title.className = "history-date";
        title.textContent =
            dayNumber > 0 && dayNumber <= 62
                ? `Dia ${dayNumber}`
                : formatted;

        const subtitle = document.createElement("div");
        subtitle.className = "history-subtitle";
        subtitle.textContent = formatted;

        info.append(title, subtitle);

        const score = document.createElement("div");
        score.className = "history-score";
        score.textContent = `${completed}/${missions.length}`;

        item.append(info, score);
        list.append(item);
    });
}

// PROGRESSO GERAL DO PROJETO

function updateProject() {
    const now = new Date();

    const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const duration = end - start;
    const elapsed = today - start;

    let percent = 0;

    if (today >= start) {
        percent = Math.min(100, elapsed / duration * 100);
    }

    document.getElementById("project-progress").style.width =
        percent + "%";

    let dayNumber = 0;

    if (today >= start) {
        dayNumber =
            Math.floor((today - start) / 86400000) + 1;
    }

    document.getElementById("days").textContent =
        Math.min(62, dayNumber);

    const remaining = Math.max(
        0,
        Math.ceil((end - today) / 86400000)
    );

    document.getElementById("remaining").textContent =
        today < start
            ? "O projeto começa em 15/11/2026."
            : today > end
                ? "Projeto finalizado!"
                : remaining + " dias restantes.";
}

// INICIALIZAÇÃO

render();

// Atualiza a tela quando o usuário retorna
// ao site depois de deixar a página aberta.

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        render();
    }
});