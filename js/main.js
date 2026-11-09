// Inicialização e navegação entre as telas (pelo endereço após o #).

const PAGINAS = {
  chamados: paginaChamados,
  planilha: paginaPlanilha,
  notificacoes: paginaNotificacoes,
  senha: paginaSenha,
  "admin/usuarios": paginaUsuarios,
  "admin/status": paginaStatus,
  "admin/catalogo": paginaCatalogo,
  "admin/auditoria": paginaAuditoria,
};

const rotaAtual = () => location.hash.replace(/^#\/?/, "").replace(/\/$/, "");
const rotaEhPainel = () => /^chamados\/(novo|\d+)$/.test(rotaAtual());

function fecharJanelas() {
  ["#painel", "#pesquisa"].forEach((s) => { if ($(s).open) $(s).close(); });
}

function render() {
  const rota = rotaAtual();

  if (rota === "sobre") {
    fecharJanelas();
    $("#app").innerHTML = htmlSobre();
    window.scrollTo(0, 0);
    return;
  }
  if (!usuario) {
    fecharJanelas();
    if (rota !== "login") { location.hash = "#/login"; return; }
    paginaLogin();
    return;
  }

  let chave = rotaEhPainel() ? "chamados" : rota;
  const restrita = chave.startsWith("admin/") && !ehAdmin();
  if (!PAGINAS[chave] || restrita) {
    location.hash = "#/chamados";
    return;
  }

  $("#app").innerHTML = shell(chave);
  ligarShell();
  PAGINAS[chave]($("#conteudo"));

  if (rotaEhPainel()) {
    const alvo = rota.split("/")[1];
    if (alvo === "novo") painelNovo(); else painelChamado(Number(alvo));
  } else {
    painelId = null;
    if ($("#painel").open) $("#painel").close();
  }

  // Oferece a pesquisa de satisfação uma vez, sem cobrir um painel aberto.
  const pendente = !ehTecnico() && pesquisasPendentes().find((c) => !pesquisasVistas.has(c.id));
  if (pendente && !rotaEhPainel() && !$("#pesquisa").open) abrirPesquisa();
}

// Fechar o painel volta para a lista.
$("#painel").addEventListener("close", () => {
  if (rotaEhPainel()) location.hash = "#/chamados";
});
// Clique fora do painel também fecha.
$("#painel").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) e.currentTarget.close();
});

window.addEventListener("hashchange", render);

try {
  const salvo = sessionStorage.getItem(SESSION_KEY);
  const u = db.usuarios.find((x) => x.email === salvo && x.ativo);
  if (u) usuario = u;
} catch (_) {}

render();
