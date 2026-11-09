// Funções auxiliares de formatação e de tela.

const $ = (s, raiz = document) => raiz.querySelector(s);
const $$ = (s, raiz = document) => [...raiz.querySelectorAll(s)];
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
    return m === 60 ? `${Math.floor(h) + 1}h` : m ? `${Math.floor(h)}h ${pad(m)}` : `${Math.floor(h)}h`;
  }
  const d = Math.floor(h / 24);
  return `${d}d ${Math.round(h % 24)}h`;
}

function fmtTamanho(bytes) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1048576).toFixed(1).replace(".", ",")} MB`;
}

// Escapa texto digitado antes de colocar no HTML (conteúdo e atributos).
function esc(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const iniciais = (nome) => nome.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

function opcoes(lista, atual = "", vazio = "Selecione") {
  return `<option value="">${esc(vazio)}</option>` + lista.map((v) => `<option ${v === atual ? "selected" : ""}>${esc(v)}</option>`).join("");
}

// Mostra (ou limpa) o erro de um campo; devolve o campo quando há erro.
function marcarErro(id, msg, raiz = document) {
  const el = raiz.querySelector("#" + id);
  const campo = el.closest(".field");
  campo.classList.toggle("has-error", !!msg);
  el.setAttribute("aria-invalid", msg ? "true" : "false");
  campo.querySelector(".field__error").textContent = msg || "";
  return msg ? el : null;
}

function focarPrimeiro(erros) {
  const lista = erros.filter(Boolean);
  if (lista.length) lista[0].focus();
  return lista.length > 0;
}
