// Servidor do Chamado Aberto: entrega o site e guarda os dados num banco SQLite.
// Sem dependências: usa só o Node 24 (http, fs e o SQLite que já vem nele).
//
//   node server/server.js          -> http://localhost:8080
//   PORT=3000 DB_PATH=... node server/server.js
//
// Os dados ficam num único registro (o mesmo objeto que o site usa), com um
// número de versão: quem tenta salvar sobre uma versão antiga recebe 409 e os
// dados atuais, para não apagar o que outra pessoa acabou de fazer.

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { DatabaseSync } = require("node:sqlite");

const RAIZ = path.resolve(__dirname, "..");
const PORTA = Number(process.env.PORT) || 8080;
const DB_PATH = process.env.DB_PATH || path.join(RAIZ, "dados", "chamados.db");
const LIMITE = 5 * 1024 * 1024;

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec(`CREATE TABLE IF NOT EXISTS estado (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  versao INTEGER NOT NULL,
  dados TEXT NOT NULL,
  atualizado TEXT NOT NULL
)`);

const ler = () => db.prepare("SELECT versao, dados FROM estado WHERE id = 1").get();

function estadoAtual() {
  const linha = ler();
  return linha ? { versao: linha.versao, dados: JSON.parse(linha.dados) } : { versao: 0, dados: null };
}

function gravar(versaoBase, dados) {
  const texto = JSON.stringify(dados);
  db.exec("BEGIN IMMEDIATE");
  try {
    const atual = ler();
    const versao = atual ? atual.versao : 0;
    if (versao !== versaoBase) {
      db.exec("ROLLBACK");
      return null;
    }
    db.prepare(`INSERT INTO estado (id, versao, dados, atualizado) VALUES (1, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET versao = excluded.versao, dados = excluded.dados, atualizado = excluded.atualizado`)
      .run(versao + 1, texto, new Date().toISOString());
    db.exec("COMMIT");
    return versao + 1;
  } catch (erro) {
    db.exec("ROLLBACK");
    throw erro;
  }
}

function json(res, status, corpo) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(corpo));
}

function lerCorpo(req) {
  return new Promise((ok, falha) => {
    let tamanho = 0;
    const partes = [];
    req.on("data", (p) => {
      tamanho += p.length;
      if (tamanho > LIMITE) { falha(new Error("grande")); req.destroy(); return; }
      partes.push(p);
    });
    req.on("end", () => ok(Buffer.concat(partes).toString("utf8")));
    req.on("error", falha);
  });
}

async function api(req, res) {
  if (req.method === "GET") return json(res, 200, estadoAtual());
  if (req.method !== "PUT") return json(res, 405, { erro: "Método não permitido." });
  let corpo;
  try {
    corpo = JSON.parse(await lerCorpo(req));
  } catch (_) {
    return json(res, 400, { erro: "Corpo inválido." });
  }
  const valido = corpo && Number.isInteger(corpo.versao) && corpo.dados && typeof corpo.dados === "object"
    && Array.isArray(corpo.dados.chamados) && Array.isArray(corpo.dados.usuarios);
  if (!valido) return json(res, 400, { erro: "Dados inválidos." });
  const versao = gravar(corpo.versao, corpo.dados);
  if (versao === null) return json(res, 409, estadoAtual());
  return json(res, 200, { versao });
}

// Arquivos do site. Só o que o navegador precisa: nada de server/, dados/ ou arquivos ocultos.
const TIPOS = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".md": "text/markdown; charset=utf-8",
};
const BLOQUEADOS = ["server", "dados", "node_modules"];

function arquivo(req, res) {
  let caminho;
  try {
    caminho = decodeURIComponent(new URL(req.url, "http://x").pathname);
  } catch (_) {
    res.writeHead(400).end();
    return;
  }
  if (caminho.endsWith("/")) caminho += "index.html";
  const partes = caminho.split("/").filter(Boolean);
  const alvo = path.resolve(RAIZ, ...partes);
  const proibido = !alvo.startsWith(RAIZ + path.sep) || partes.some((p) => p.startsWith(".")) || BLOQUEADOS.includes(partes[0]);
  const tipo = TIPOS[path.extname(alvo).toLowerCase()];
  if (proibido || !tipo || !fs.existsSync(alvo) || !fs.statSync(alvo).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Não encontrado.");
    return;
  }
  res.writeHead(200, { "Content-Type": tipo, "Cache-Control": "no-cache" });
  fs.createReadStream(alvo).pipe(res);
}

http.createServer((req, res) => {
  const rota = req.url.split("?")[0];
  if (rota === "/api/estado") {
    api(req, res).catch((erro) => {
      console.error(erro);
      if (!res.headersSent) json(res, 500, { erro: "Erro no servidor." });
    });
    return;
  }
  if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405).end(); return; }
  arquivo(req, res);
}).listen(PORTA, () => {
  console.log(`Chamado Aberto em http://localhost:${PORTA}`);
  const ips = Object.values(os.networkInterfaces()).flat().filter((i) => i && i.family === "IPv4" && !i.internal);
  ips.forEach((i) => console.log(`Na mesma rede (celular, outro PC): http://${i.address}:${PORTA}`));
  console.log(`Banco: ${DB_PATH}`);
});
