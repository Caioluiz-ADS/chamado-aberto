// Estado do sistema, salvo no navegador (localStorage), e as regras dos chamados.

let db = load();
let usuario = null;

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

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return novoBanco();
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch (_) {}
}

/* ---------- Consultas ---------- */

const ehTecnico = () => usuario && usuario.papel !== "funcionario";
const ehAdmin = () => usuario && usuario.papel === "admin";
const statusDe = (nome) => db.status.find((s) => s.nome === nome) || {};
const statusInicial = () => db.status.find((s) => s.inicial);
const estaFinal = (c) => !!statusDe(c.status).final;
const tecnicos = () => db.usuarios.filter((u) => u.ativo && u.papel === "suporte").map((u) => u.nome);
const solicitantes = () => db.usuarios.filter((u) => u.ativo && u.papel === "funcionario").map((u) => u.nome);
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
