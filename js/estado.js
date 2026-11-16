// Estado do sistema e as regras dos chamados.
// Com o servidor (server/server.js), os dados ficam no banco e todos veem os mesmos chamados.
// Sem ele (GitHub Pages, arquivo aberto direto), ficam só no navegador (localStorage).

let db = load();
let usuario = null;
let modoServidor = false;
let versao = 0;
let fila = Promise.resolve();

function prepararExemplo(c) {
  const categoria = CATALOGO_INICIAL.find((k) => k.servicos.some((s) => s.nome === c.equipamento)).nome;
  const eventos = [{ quando: c.aberto, autor: c.solicitante, texto: "Chamado aberto." }];
  if (c.tecnico) eventos.push({ quando: c.aberto, autor: c.tecnico, texto: `Responsável definido: ${c.tecnico}.` });
  if (c.status !== "Aberto") eventos.push({ quando: c.fechado || c.aberto, autor: c.tecnico, texto: `Status: de Aberto para ${c.status}.` });
  return {
    descricao: "", solucao: "", tecnico: "", abertoPor: "", ...c, categoria,
    atualizado: c.fechado || c.aberto,
    comentarios: [], anexos: [], eventos,
    pesquisa: c.fechado ? { nota: "Bom", comentario: "" } : null,
  };
}

function novoBanco() {
  return {
    usuarios: structuredClone(USUARIOS_INICIAIS),
    status: structuredClone(STATUS_INICIAIS),
    catalogo: structuredClone(CATALOGO_INICIAL),
    chamados: EXEMPLO.map(prepararExemplo),
    notificacoes: [],
    auditoria: [],
    prazoReabrir: 7,
  };
}

// Dados salvos antes de existir o setor do usuário: completa os de exemplo pelo e-mail.
function completar(d) {
  d.usuarios.forEach((u) => {
    if (u.setor === undefined) u.setor = (USUARIOS_INICIAIS.find((x) => x.email === u.email) || {}).setor || "";
  });
  return d;
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return completar(JSON.parse(raw));
  } catch (_) {}
  return novoBanco();
}

function save() {
  if (!modoServidor) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch (_) {}
    return;
  }
  // Um envio por vez, sempre com a versão mais nova que o servidor confirmou.
  fila = fila.then(enviar).catch(() => {
    avisar("Não foi possível salvar no servidor. Confira se ele está ligado.");
    render();
  });
}

async function enviar() {
  const r = await fetch("api/estado", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ versao, dados: db }),
  });
  if (r.status === 409) {
    const atual = await r.json();
    // Banco zerado no servidor: os dados desta tela viram o novo começo.
    if (!atual.dados) { versao = 0; return enviar(); }
    trocarDados(atual);
    avisar("Outra pessoa alterou os dados ao mesmo tempo. Confira e faça de novo.");
    fecharJanelas();
    render();
    return;
  }
  if (!r.ok) throw new Error(r.status);
  versao = (await r.json()).versao;
}

function trocarDados(resposta) {
  versao = resposta.versao;
  db = completar(resposta.dados);
  if (usuario) usuario = db.usuarios.find((u) => u.email === usuario.email && u.ativo) || null;
}

// Descobre se há servidor. Banco vazio recebe os dados de exemplo.
async function iniciarDados() {
  try {
    const r = await fetch("api/estado", { cache: "no-store" });
    if (!r.ok) return;
    const resposta = await r.json();
    modoServidor = true;
    if (resposta.dados) trocarDados(resposta);
    else { db = novoBanco(); versao = 0; save(); }
  } catch (_) {}
}

// Ninguém está digitando nem com uma janela aberta: dá para trocar os dados e redesenhar.
function telaLivre() {
  const el = document.activeElement;
  const digitando = el && ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) && el.closest("form");
  return !digitando && !$$("dialog").some((d) => d.open);
}

function atualizarDeFora(novos) {
  const quem = usuario;
  trocarDados(novos);
  if (quem && !usuario) { sair(); return; }
  render();
}

// Busca o que os outros salvaram a cada poucos segundos.
function acompanharServidor() {
  setInterval(async () => {
    if (!telaLivre()) return;
    await fila;
    try {
      const r = await fetch("api/estado", { cache: "no-store" });
      if (!r.ok) return;
      const resposta = await r.json();
      // Diferente, e não só maior: se o banco foi zerado, a versão do servidor volta para trás.
      if (resposta.versao !== versao && resposta.dados && telaLivre()) atualizarDeFora(resposta);
    } catch (_) {}
  }, 3000);
}

// Sem servidor: outra aba do mesmo navegador salvou.
window.addEventListener("storage", (e) => {
  if (modoServidor || e.key !== STORAGE_KEY || !e.newValue || !telaLivre()) return;
  try { atualizarDeFora({ versao: 0, dados: JSON.parse(e.newValue) }); } catch (_) {}
});

/* ---------- Consultas ---------- */

const ehTecnico = () => usuario && usuario.papel !== "funcionario";
const ehAdmin = () => usuario && usuario.papel === "admin";
const statusDe = (nome) => db.status.find((s) => s.nome === nome) || {};
const statusInicial = () => db.status.find((s) => s.inicial);
const estaFinal = (c) => !!statusDe(c.status).final;
const tecnicos = () => db.usuarios.filter((u) => u.ativo && u.papel === "suporte").map((u) => u.nome);
const setorDe = (nome) => (db.usuarios.find((u) => u.nome === nome) || {}).setor || "";
const solicitantes = () =>db.usuarios.filter((u) => u.ativo && u.papel === "funcionario").map((u) => u.nome);
const podeVer = (c) => ehTecnico() || c.solicitante === usuario.nome;
const meusChamados = () => db.chamados.filter(podeVer).sort((a, b) => b.id - a.id);
const pesquisasPendentes = () => db.chamados.filter((c) => c.solicitante === usuario.nome && estaFinal(c) && !c.pesquisa);
const naoLidas = () => db.notificacoes.filter((n) => n.para === usuario.nome && !n.lida).length;

function limiteReabrir(c) {
  const d = new Date(c.fechado);
  d.setDate(d.getDate() + db.prazoReabrir);
  return d;
}

/* ---------- Registros ---------- */

function registrar(c, texto) {
  const agora = nowLocal();
  c.eventos.push({ quando: agora, autor: usuario.nome, texto });
  c.atualizado = agora;
}

function notificar(para, texto, chamado) {
  if (!para || para === usuario.nome) return;
  db.notificacoes.push({ id: Date.now() + Math.random(), para, texto, chamado, quando: nowLocal(), lida: false });
}

function auditar(acao, alvo) {
  db.auditoria.push({ quando: nowLocal(), autor: usuario.nome, acao, alvo });
}

/* ---------- Ações sobre os chamados ---------- */

function criarChamado(dados) {
  const id = Math.max(0, ...db.chamados.map((c) => c.id)) + 1;
  const agora = nowLocal();
  const c = {
    id, aberto: agora, atualizado: agora, fechado: null,
    tecnico: "", solucao: "", comentarios: [], anexos: [], eventos: [], pesquisa: null,
    status: statusInicial().nome,
    abertoPor: dados.solicitante === usuario.nome ? "" : usuario.nome,
    ...dados,
  };
  db.chamados.push(c);
  registrar(c, c.abertoPor ? `Chamado aberto em nome de ${c.solicitante}.` : "Chamado aberto.");
  tecnicos().forEach((t) => notificar(t, `Novo chamado ${fmtId(id)}: ${tituloDe(c)}.`, id));
  if (c.abertoPor) notificar(c.solicitante, `${usuario.nome} abriu o chamado ${fmtId(id)} em seu nome.`, id);
  save();
  return c;
}

function salvarAtendimento(c, { tecnico, status, solucao }) {
  if (tecnico && tecnico !== c.tecnico) {
    registrar(c, `Responsável: de ${c.tecnico || "ninguém"} para ${tecnico}.`);
    c.tecnico = tecnico;
    notificar(tecnico, `Você é o responsável pelo chamado ${fmtId(c.id)}.`, c.id);
    notificar(c.solicitante, `${tecnico} assumiu o chamado ${fmtId(c.id)}.`, c.id);
  }
  if (solucao && solucao !== c.solucao) {
    c.solucao = solucao;
    registrar(c, `O que foi feito: ${solucao}`);
  }
  if (status && status !== c.status) {
    registrar(c, `Status: de ${c.status} para ${status}.`);
    c.status = status;
    if (statusDe(status).final) {
      c.fechado = nowLocal();
      c.pesquisa = null;
      notificar(c.solicitante, `O chamado ${fmtId(c.id)} foi concluído. Avalie o atendimento.`, c.id);
    } else {
      c.fechado = null;
      notificar(c.solicitante, `O chamado ${fmtId(c.id)} agora está: ${status}.`, c.id);
    }
  }
  save();
}

function comentar(c, texto, interno) {
  c.comentarios.push({ quando: nowLocal(), autor: usuario.nome, texto, interno });
  registrar(c, interno ? "Comentário interno adicionado." : "Comentário adicionado.");
  if (ehTecnico()) {
    if (!interno) notificar(c.solicitante, `Novo comentário no chamado ${fmtId(c.id)}.`, c.id);
  } else {
    notificar(c.tecnico, `${usuario.nome} comentou no chamado ${fmtId(c.id)}.`, c.id);
  }
  save();
}

function anexar(c, arquivo, interno) {
  c.anexos.push({ quando: nowLocal(), autor: usuario.nome, nome: arquivo.name, tamanho: arquivo.size, interno });
  registrar(c, `Anexo adicionado: ${arquivo.name}.`);
  save();
}

function reabrir(c, motivo) {
  const inicial = statusInicial().nome;
  registrar(c, `Chamado reaberto. Status: de ${c.status} para ${inicial}.`);
  c.status = inicial;
  c.fechado = null;
  c.pesquisa = null;
  c.solucao = "";
  c.comentarios.push({ quando: nowLocal(), autor: usuario.nome, texto: `Reabertura: ${motivo}`, interno: false });
  notificar(c.tecnico, `${usuario.nome} reabriu o chamado ${fmtId(c.id)}.`, c.id);
  save();
}

function responderPesquisa(c, nota, comentario) {
  c.pesquisa = { nota, comentario };
  registrar(c, `Pesquisa de satisfação respondida: ${nota}.`);
  save();
}

const tituloDe = (c) => `${c.equipamento}: ${c.tipo.toLowerCase()}`;
