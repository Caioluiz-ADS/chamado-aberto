// Estado da planilha, salvo no navegador (localStorage).

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
