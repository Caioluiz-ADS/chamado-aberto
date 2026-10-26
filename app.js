// Edite aqui os nomes do grupo
const EQUIPE = [
  "Caio Luiz",
  "Erick Mendes",
  "Gabriel Carlos",
  "Geovane Oliveira",
  "Guilherme Gomes",
  "Iasmin Lima",
  "José Victor Seibert",
  "Sofia Assis",
  "Thauan Almeida",
  "Vinicius Bisbo",
];

// Contas de demonstração do protótipo (não é um login real)
const CONTAS = {
  funcionario: { email: "funcionarioteste@gmail.com", senha: "123456789", papel: "Funcionário", nome: "Funcionário Teste", icone: "ph-user" },
  suporte: { email: "suportetestes@gmail.com", senha: "123456789", papel: "Suporte", nome: "Suporte Teste", icone: "ph-wrench" },
};
const SESSION_KEY = "chamado-aberto:sessao";

const STORAGE_KEY = "chamado-aberto:v2";
const ICONS = {
  "Elevador social": "ph-elevator",
  "Elevador de serviço": "ph-elevator",
  "Ar-condicionado": "ph-snowflake",
};

// Dados de exemplo usados na simulação
const EXEMPLO = [
  { id: 1, aberto: "2026-10-19T08:12", fechado: "2026-10-19T11:47", solicitante: "Mariana Lopes", setor: "Recepção, térreo", equipamento: "Elevador social", tipo: "Travamento", status: "Resolvido", tecnico: "Anderson Reis", solucao: "Reset do quadro de comando e ajuste do sensor da porta" },
  { id: 2, aberto: "2026-10-19T13:30", fechado: "2026-10-20T09:05", solicitante: "Rafael Brito", setor: "Financeiro, 3º andar", equipamento: "Ar-condicionado", tipo: "Temperatura irregular", status: "Resolvido", tecnico: "Wellington Prado", solucao: "Limpeza dos filtros e recarga de gás" },
  { id: 3, aberto: "2026-10-21T09:40", fechado: "2026-10-21T15:18", solicitante: "Tainá Souza", setor: "RH, 2º andar", equipamento: "Ar-condicionado", tipo: "Vazamento", status: "Resolvido", tecnico: "Wellington Prado", solucao: "Desentupimento do dreno da evaporadora" },
  { id: 4, aberto: "2026-10-22T10:02", fechado: "2026-10-22T12:26", solicitante: "Lucas Andrade", setor: "Almoxarifado, subsolo", equipamento: "Elevador de serviço", tipo: "Ruído anormal", status: "Resolvido", tecnico: "Anderson Reis", solucao: "Lubrificação das guias da cabine" },
  { id: 5, aberto: "2026-10-23T14:55", fechado: "2026-10-24T10:31", solicitante: "Jéssica Nunes", setor: "Comercial, 4º andar", equipamento: "Ar-condicionado", tipo: "Não liga", status: "Resolvido", tecnico: "Wellington Prado", solucao: "Troca do capacitor do compressor" },
  { id: 6, aberto: "2026-10-26T08:20", fechado: null, solicitante: "Diego Santana", setor: "TI, 4º andar", equipamento: "Ar-condicionado", tipo: "Ruído anormal", status: "Em atendimento", tecnico: "Wellington Prado", solucao: "" },
  { id: 7, aberto: "2026-10-26T09:47", fechado: null, solicitante: "Paula Cerqueira", setor: "Diretoria, 5º andar", equipamento: "Elevador social", tipo: "Não liga", status: "Aberto" },
];

let chamados = load();
let filtro = "todos";
let novoId = null;
let perfil = null;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return structuredClone(EXEMPLO);
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(chamados)); } catch (_) {}
}

const $ = (s) => document.querySelector(s);
const pad = (n) => String(n).padStart(2, "0");
const fmtId = (id) => "CH-" + String(id).padStart(4, "0");

function nowLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtData(iso) {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function horas(a, b) {
  return (new Date(b) - new Date(a)) / 36e5;
}

function fmtDuracao(h) {
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min`;
  if (h < 24) {
    const m = Math.round((h % 1) * 60);
    return m ? `${Math.floor(h)}h ${pad(m)}` : `${Math.floor(h)}h`;
  }
  const d = Math.floor(h / 24);
  return `${d}d ${Math.round(h % 24)}h`;
}

function statusClass(s) {
  return s === "Aberto" ? "status--aberto" : s === "Em atendimento" ? "status--atendimento" : "status--resolvido";
}

function statusIcon(s) {
  return s === "Aberto" ? "ph-circle-dashed" : s === "Em atendimento" ? "ph-wrench" : "ph-check";
}

function esc(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ---------- Render ---------- */

function renderSheet() {
  const body = $("#sheetBody");
  const lista = [...chamados]
    .filter((c) => filtro === "todos" || c.status === filtro)
    .sort((a, b) => b.id - a.id);

  body.innerHTML = lista.map((c) => {
    const tempo = c.fechado
      ? fmtDuracao(horas(c.aberto, c.fechado))
      : `<span class="muted">há ${fmtDuracao(Math.max(0, horas(c.aberto, nowLocal())))}</span>`;
    const resolvido = c.status === "Resolvido";
    const travado = resolvido || perfil !== "suporte";
    const label = travado ? `Status ${c.status}` : `Status ${c.status}. Atualizar no formulário do suporte`;
    const dica = c.tecnico ? `${c.tecnico}${c.solucao ? ": " + c.solucao : ""}` : "";
    return `
      <tr data-id="${c.id}" class="${c.id === novoId ? "is-new" : ""}">
        <td class="mono">${fmtId(c.id)}</td>
        <td class="mono">${fmtData(c.aberto)}</td>
        <td>${esc(c.solicitante)}</td>
        <td>${esc(c.setor)}</td>
        <td>${esc(c.equipamento)}</td>
        <td>${esc(c.tipo)}</td>
        <td><button class="status ${statusClass(c.status)}" data-pick="${c.id}" aria-label="${label}" title="${esc(dica)}" ${travado ? "disabled" : ""}>
          <i class="ph-bold ${statusIcon(c.status)}" aria-hidden="true"></i>${c.status}</button></td>
        <td class="mono">${tempo}</td>
      </tr>`;
  }).join("");

  $("#emptyState").hidden = lista.length > 0;
  novoId = null;
}

function renderKpis() {
  const abertos = chamados.filter((c) => c.status !== "Resolvido").length;
  $("#kOpen").textContent = abertos;

  const resolvidos = chamados.filter((c) => c.fechado);
  if (resolvidos.length) {
    const media = resolvidos.reduce((s, c) => s + horas(c.aberto, c.fechado), 0) / resolvidos.length;
    $("#kAvg").textContent = fmtDuracao(media);
  } else {
    $("#kAvg").textContent = "-";
  }

  const cont = {};
  chamados.forEach((c) => {
    const chave = c.equipamento.startsWith("Elevador") ? "Elevadores" : c.equipamento;
    cont[chave] = (cont[chave] || 0) + 1;
  });
  const top = Object.entries(cont).sort((a, b) => b[1] - a[1])[0];
  $("#kTop").innerHTML = top ? `${esc(top[0])}<small>${top[1]} chamados</small>` : "-";
}

function renderHero() {
  const ultimos = [...chamados].sort((a, b) => b.id - a.id).slice(0, 3).reverse();
  $("#heroStack").innerHTML = ultimos.map((c, i) => `
    <li class="ticket" style="--i:${i}">
      <span class="ticket__icon"><i class="ph ${ICONS[c.equipamento] || "ph-wrench"}" aria-hidden="true"></i></span>
      <span class="ticket__id">${fmtId(c.id)}</span>
      <span class="status ${statusClass(c.status)}"><i class="ph-bold ${statusIcon(c.status)}" aria-hidden="true"></i>${c.status}</span>
      <span class="ticket__title">${esc(c.equipamento)}: ${esc(c.tipo.toLowerCase())}</span>
      <span class="ticket__meta">${esc(c.setor)} · aberto por ${esc(c.solicitante.split(" ")[0])}</span>
    </li>`).join("");
}

function renderSupportOptions() {
  const sel = $("#sChamado");
  const atual = sel.value;
  const pendentes = chamados.filter((c) => c.status !== "Resolvido").sort((a, b) => a.id - b.id);
  sel.innerHTML = pendentes.length
    ? `<option value="">Selecione</option>` + pendentes.map((c) =>
        `<option value="${c.id}">${fmtId(c.id)} · ${esc(c.equipamento)} (${c.status.toLowerCase()})</option>`).join("")
    : `<option value="">Nenhum chamado pendente</option>`;
  if (pendentes.some((c) => String(c.id) === atual)) sel.value = atual;
}

function renderAll() {
  renderSupportOptions();
  renderSheet();
  renderKpis();
  renderHero();
}

/* ---------- Interações ---------- */

$("#sheetBody").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-pick]");
  if (!btn || btn.disabled) return;
  $("#sChamado").value = btn.dataset.pick;
  const c = chamados.find((x) => x.id === Number(btn.dataset.pick));
  if (c.status === "Em atendimento") {
    document.querySelector('input[name="acao"][value="Resolvido"]').checked = true;
    if (c.tecnico) $("#sTecnico").value = c.tecnico;
  }
  atualizarSolucaoOpt();
  $("#sChamado").closest(".panel__form").scrollIntoView({ behavior: "smooth", block: "nearest" });
  $("#sTecnico").focus({ preventScroll: true });
});

/* ---------- Login ---------- */
function entrar(chave, focar) {
  perfil = chave;
  try { sessionStorage.setItem(SESSION_KEY, chave); } catch (_) {}
  const conta = CONTAS[chave];
  $("#loginForm").hidden = true;
  $("#sessionBar").hidden = false;
  $("#sessionRole").textContent = conta.papel;
  $("#sessionEmail").textContent = conta.email;
  $("#sessionIcon").innerHTML = `<i class="ph-bold ${conta.icone}"></i>`;
  $("#ticketForm").hidden = chave !== "funcionario";
  $("#supportForm").hidden = chave !== "suporte";
  if (chave === "funcionario") $("#fSolicitante").value = conta.nome;
  if (chave === "suporte") $("#sTecnico").value = conta.nome;
  $("#formOk").textContent = "";
  renderSheet();
  if (focar) (chave === "funcionario" ? $("#fSetor") : $("#sChamado")).focus();
}

function sair() {
  perfil = null;
  try { sessionStorage.removeItem(SESSION_KEY); } catch (_) {}
  $("#loginForm").reset();
  $("#loginForm").hidden = false;
  $("#sessionBar").hidden = true;
  $("#ticketForm").hidden = true;
  $("#supportForm").hidden = true;
  $("#formOk").textContent = "";
  renderSheet();
  $("#lEmail").focus();
}

$("#loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("#lEmail").value.trim().toLowerCase();
  const senha = $("#lSenha").value;
  const chave = Object.keys(CONTAS).find((k) => CONTAS[k].email === email && CONTAS[k].senha === senha);
  const msg = !email || !senha ? "Preencha e-mail e senha." : !chave ? "E-mail ou senha incorretos." : "";
  $("#eLogin").textContent = msg;
  $("#lSenha").closest(".field").classList.toggle("has-error", !!msg);
  if (msg) { (email ? $("#lSenha") : $("#lEmail")).focus(); return; }
  entrar(chave, true);
});

document.querySelectorAll("[data-conta]").forEach((b) => b.addEventListener("click", () => {
  const conta = CONTAS[b.dataset.conta];
  $("#lEmail").value = conta.email;
  $("#lSenha").value = conta.senha;
  $("#eLogin").textContent = "";
  $("#lSenha").closest(".field").classList.remove("has-error");
  $("#loginForm").querySelector('button[type="submit"]').focus();
}));

$("#btnSair").addEventListener("click", sair);

/* ---------- Formulário do suporte ---------- */
function atualizarSolucaoOpt() {
  const concluir = document.querySelector('input[name="acao"]:checked').value === "Resolvido";
  $("#solucaoOpt").textContent = concluir ? "" : "(opcional)";
}
document.querySelectorAll('input[name="acao"]').forEach((r) => r.addEventListener("change", atualizarSolucaoOpt));

function marcarErro(campo, erro, msg) {
  const el = document.getElementById(campo);
  el.closest(".field").classList.toggle("has-error", !!msg);
  el.setAttribute("aria-invalid", !!msg);
  document.getElementById(erro).textContent = msg || "";
  return msg ? el : null;
}

$("#supportForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const acao = document.querySelector('input[name="acao"]:checked').value;
  const erros = [
    marcarErro("sChamado", "eChamado", $("#sChamado").value ? "" : "Escolha o chamado."),
    marcarErro("sTecnico", "eTecnico", $("#sTecnico").value.trim() ? "" : "Informe o técnico responsável."),
    marcarErro("sSolucao", "eSolucao", acao === "Resolvido" && !$("#sSolucao").value.trim() ? "Descreva o que foi feito para concluir." : ""),
  ].filter(Boolean);
  if (erros.length) { erros[0].focus(); $("#formOk").textContent = ""; return; }

  const c = chamados.find((x) => x.id === Number($("#sChamado").value));
  c.status = acao;
  c.tecnico = $("#sTecnico").value.trim();
  if ($("#sSolucao").value.trim()) c.solucao = $("#sSolucao").value.trim();
  if (acao === "Resolvido") c.fechado = nowLocal();
  novoId = c.id;
  save();
  renderAll();
  e.target.reset();
  $("#sTecnico").value = CONTAS.suporte.nome;
  atualizarSolucaoOpt();
  $("#formOk").textContent = acao === "Resolvido"
    ? `${fmtId(c.id)} concluído. O tempo de resolução já entrou na média.`
    : `${fmtId(c.id)} em atendimento com ${c.tecnico}.`;
});

document.querySelectorAll("[data-filter]").forEach((chip) => {
  chip.addEventListener("click", () => {
    filtro = chip.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((c) => {
      c.classList.toggle("is-on", c === chip);
      c.setAttribute("aria-pressed", c === chip);
    });
    renderSheet();
  });
});

const REGRAS = [
  ["fSolicitante", "eSolicitante", "Informe quem está abrindo o chamado."],
  ["fSetor", "eSetor", "Informe o setor ou andar."],
  ["fEquip", "eEquip", "Escolha o equipamento."],
  ["fTipo", "eTipo", "Escolha o tipo de problema."],
];

$("#ticketForm").addEventListener("submit", (e) => {
  e.preventDefault();
  let primeiroErro = null;
  REGRAS.forEach(([campo, erro, msg]) => {
    const el = document.getElementById(campo);
    const vazio = !el.value.trim();
    el.closest(".field").classList.toggle("has-error", vazio);
    el.setAttribute("aria-invalid", vazio);
    document.getElementById(erro).textContent = vazio ? msg : "";
    if (vazio && !primeiroErro) primeiroErro = el;
  });
  if (primeiroErro) { primeiroErro.focus(); $("#formOk").textContent = ""; return; }

  const id = Math.max(0, ...chamados.map((c) => c.id)) + 1;
  chamados.push({
    id,
    aberto: nowLocal(),
    fechado: null,
    solicitante: $("#fSolicitante").value.trim(),
    setor: $("#fSetor").value.trim(),
    equipamento: $("#fEquip").value,
    tipo: $("#fTipo").value,
    descricao: $("#fDesc").value.trim(),
    status: "Aberto",
  });
  novoId = id;
  save();
  if (filtro !== "todos" && filtro !== "Aberto") document.querySelector('[data-filter="todos"]').click();
  renderAll();
  e.target.reset();
  $("#fSolicitante").value = CONTAS.funcionario.nome;
  $("#formOk").textContent = `Chamado ${fmtId(id)} registrado. Ele já aparece na planilha.`;
});

document.querySelectorAll("#ticketForm, #supportForm").forEach((f) => f.addEventListener("input", (e) => {
  const field = e.target.closest(".field");
  if (field && field.classList.contains("has-error") && e.target.value.trim()) {
    field.classList.remove("has-error");
    field.querySelector(".field__error").textContent = "";
  }
}));

$("#btnReset").addEventListener("click", () => {
  chamados = structuredClone(EXEMPLO);
  save();
  renderAll();
  $("#formOk").textContent = "Planilha restaurada com os dados de exemplo.";
});

$("#btnCsv").addEventListener("click", () => {
  const cab = ["ID", "Data de Abertura", "Solicitante", "Setor/Andar", "Equipamento", "Tipo de Problema", "Status", "Técnico", "O que foi feito", "Data de Fechamento", "Tempo de Resolução (h)"];
  const linhas = chamados.map((c) => [
    fmtId(c.id), fmtData(c.aberto), c.solicitante, c.setor, c.equipamento, c.tipo, c.status,
    c.tecnico || "", c.solucao || "", c.fechado ? fmtData(c.fechado) : "",
    c.fechado ? horas(c.aberto, c.fechado).toFixed(1).replace(".", ",") : "",
  ]);
  const csv = [cab, ...linhas].map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "chamados-manutencao.csv";
  a.click();
  URL.revokeObjectURL(a.href);
});

/* ---------- Equipe ---------- */
$("#teamList").innerHTML = EQUIPE.map((n) => `<li>${esc(n)}</li>`).join("");

/* ---------- Revelação ao rolar ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
  });
}, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll(".reveal").forEach((el) => {
  const irmaos = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  el.style.setProperty("--d", `${irmaos.indexOf(el) * 80}ms`);
  io.observe(el);
});

renderAll();
try {
  const salvo = sessionStorage.getItem(SESSION_KEY);
  if (CONTAS[salvo]) entrar(salvo, false);
} catch (_) {}
