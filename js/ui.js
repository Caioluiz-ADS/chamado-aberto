// Estrutura comum das telas: menu lateral, barra superior, avisos e confirmação.

let avisoTexto = "";
const avisar = (t) => { avisoTexto = t; };

function avisoHtml() {
  const t = avisoTexto;
  avisoTexto = "";
  return t ? `<p class="aviso" role="status"><i class="ph-bold ph-check-circle" aria-hidden="true"></i>${esc(t)}</p>` : "";
}

const avatar = (nome, forte) => `<span class="avatar ${forte ? "avatar--forte" : ""}" aria-hidden="true">${esc(iniciais(nome))}</span>`;
const pessoa = (nome, forte) => nome ? `<span class="pessoa">${avatar(nome, forte)}<span>${esc(nome)}</span></span>` : `<span class="muted">—</span>`;

function seloStatus(nome) {
  const s = statusDe(nome);
  const tipo = s.final ? "final" : s.pausa ? "pausa" : s.inicial ? "inicial" : "andamento";
  return `<span class="status status--${tipo}">${esc(nome)}</span>`;
}

function bandeira(nome) {
  const s = statusDe(nome);
  const [rotulo, cor] = s.final ? ["Fechado", "fechado"] : s.pausa ? ["Pausado", "pausado"] : ["Em andamento", "ativo"];
  return `<span class="bandeira bandeira--${cor}" title="${rotulo}"><i class="ph-bold ph-flag" aria-hidden="true"></i><span class="sr">${rotulo}</span></span>`;
}

function cabecalho(titulo, descricao, icone, acoes = "") {
  return `
    <header class="pagina__topo">
      <span class="pagina__icone"><i class="ph ${icone}" aria-hidden="true"></i></span>
      <div class="pagina__titulos"><h1>${esc(titulo)}</h1><p>${esc(descricao)}</p></div>
      ${acoes ? `<div class="pagina__acoes">${acoes}</div>` : ""}
    </header>`;
}

function itemMenu(rota, rotulo, icone, atual) {
  const ativo = atual === rota || atual.startsWith(rota + "/");
  return `<li><a href="#/${rota}" ${ativo ? 'aria-current="page"' : ""}><i class="ph ${icone}" aria-hidden="true"></i>${rotulo}</a></li>`;
}

function shell(atual) {
  const admin = ehAdmin() ? `
    <p class="menu__grupo">Administração</p>
    <ul>
      ${itemMenu("admin/usuarios", "Usuários", "ph-users", atual)}
      ${itemMenu("admin/status", "Status", "ph-flow-arrow", atual)}
      ${itemMenu("admin/catalogo", "Catálogo", "ph-list-bullets", atual)}
      ${itemMenu("admin/auditoria", "Auditoria", "ph-scroll", atual)}
    </ul>` : "";
  const qtd = naoLidas();
  return `
    <a class="skip" href="#conteudo" onclick="event.preventDefault();document.getElementById('conteudo').focus()">Pular para o conteúdo</a>
    <div class="app">
      <aside class="menu" id="menu">
        <a href="#/chamados" class="brand brand--menu" aria-label="Chamado Aberto, início">
          <span class="brand__mark" aria-hidden="true">CA</span><span class="brand__name">Chamado Aberto</span>
        </a>
        <nav aria-label="Principal">
          <ul>
            ${itemMenu("chamados", ehTecnico() ? "Chamados" : "Meus chamados", "ph-tray", atual)}
            ${itemMenu("planilha", "Planilha", "ph-table", atual)}
          </ul>
          ${admin}
          <p class="menu__grupo">Minha conta</p>
          <ul>
            ${itemMenu("notificacoes", "Notificações", "ph-bell", atual)}
            ${itemMenu("senha", "Trocar senha", "ph-key", atual)}
          </ul>
          <p class="menu__grupo">Projeto</p>
          <ul>${itemMenu("sobre", "Sobre o projeto", "ph-info", atual)}</ul>
        </nav>
      </aside>
      <div class="area">
        <header class="barra">
          <button type="button" class="icone-btn barra__menu" id="btnMenu" aria-label="Abrir menu" aria-expanded="false"><i class="ph ph-list" aria-hidden="true"></i></button>
          <a href="#/notificacoes" class="icone-btn sino" aria-label="Notificações${qtd ? `, ${qtd} não lidas` : ""}">
            <i class="ph ph-bell" aria-hidden="true"></i>${qtd ? `<span class="sino__qtd">${qtd > 9 ? "9+" : qtd}</span>` : ""}
          </a>
          <div class="sessao">
            ${avatar(usuario.nome, true)}
            <span class="sessao__quem"><strong>${esc(usuario.nome)}</strong><span>${PAPEIS[usuario.papel]}</span></span>
          </div>
          <button type="button" class="link-btn" id="btnSair"><i class="ph ph-sign-out" aria-hidden="true"></i> Sair</button>
        </header>
        <main id="conteudo" class="pagina" tabindex="-1"></main>
      </div>
    </div>`;
}

function ligarShell() {
  $("#btnSair").addEventListener("click", sair);
  $("#btnMenu").addEventListener("click", (e) => {
    const aberto = $("#menu").classList.toggle("is-aberto");
    e.currentTarget.setAttribute("aria-expanded", aberto);
  });
}

// Janela de confirmação; resolve true quando a pessoa confirma.
function confirmar(titulo, texto, rotulo = "Confirmar") {
  const d = $("#confirma");
  d.innerHTML = `
    <form method="dialog">
      <h2>${esc(titulo)}</h2>
      <p>${esc(texto)}</p>
      <div class="janela__acoes">
        <button class="btn btn--ghost btn--small" value="nao">Cancelar</button>
        <button class="btn btn--small" value="sim">${esc(rotulo)}</button>
      </div>
    </form>`;
  d.returnValue = "nao";
  d.showModal();
  return new Promise((ok) => d.addEventListener("close", () => ok(d.returnValue === "sim"), { once: true }));
}
