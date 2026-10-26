// Funções auxiliares de formatação.

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
