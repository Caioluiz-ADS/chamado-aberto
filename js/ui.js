// Estrutura comum das telas: menu lateral, barra superior, avisos e confirmação.

/* ---------- Tema: Automático (segue o sistema), Claro ou Escuro ---------- */

const TEMA_KEY = "chamado-aberto:tema";
const TEMAS = [
  { valor: "auto", rotulo: "Automático", icone: "ph-circle-half" },
  { valor: "claro", rotulo: "Claro", icone: "ph-sun" },
  { valor: "escuro", rotulo: "Escuro", icone: "ph-moon" },
];

function temaAtual() {
  try {
    const t = localStorage.getItem(TEMA_KEY);
    if (TEMAS.some((x) => x.valor === t)) return t;
  } catch (_) {}
  return "auto";
}

function aplicarTema(t) {
  const raiz = document.documentElement;
  if (t === "auto") raiz.removeAttribute("data-tema"); else raiz.setAttribute("data-tema", t);
  $('meta[name="color-scheme"]').content = t === "claro" ? "light" : t === "escuro" ? "dark" : "light dark";
}

function conteudoBotaoTema() {
  const i = TEMAS.findIndex((x) => x.valor === temaAtual());
  const atual = TEMAS[i];
  const proximo = TEMAS[(i + 1) % TEMAS.length];
  return {
    html: `<i class="ph ${atual.icone}" aria-hidden="true"></i>`,
    rotulo: `Tema: ${atual.rotulo}. Mudar para ${proximo.rotulo}`,
  };
}

function botaoTema(classe = "") {
  const { html, rotulo } = conteudoBotaoTema();
  return `<button type="button" class="icone-btn ${classe}" data-tema-btn aria-label="${rotulo}" title="${rotulo}">${html}</button>`;
}

// Um clique em qualquer botão de tema troca para o próximo; só os botões são redesenhados.
document.addEventListener("click", (e) => {
  if (!e.target.closest("[data-tema-btn]")) return;
  const i = TEMAS.findIndex((x) => x.valor === temaAtual());
  const novo = TEMAS[(i + 1) % TEMAS.length].valor;
  try {
    if (novo === "auto") localStorage.removeItem(TEMA_KEY); else localStorage.setItem(TEMA_KEY, novo);
  } catch (_) {}
  aplicarTema(novo);
  const { html, rotulo } = conteudoBotaoTema();
  $$("[data-tema-btn]").forEach((b) => {
    b.innerHTML = html;
    b.setAttribute("aria-label", rotulo);
    b.title = rotulo;
  });
});

aplicarTema(temaAtual());

/* ---------- Animações: ligadas por padrão, com botão para desligar ---------- */

const ANIM_KEY = "chamado-aberto:animacoes";
const animacoesLigadas = () => document.documentElement.getAttribute("data-animacoes") !== "desligadas";

function conteudoBotaoAnimacoes() {
  const on = animacoesLigadas();
  return {
    html: `<i class="ph ${on ? "ph-sparkle" : "ph-pause-circle"}" aria-hidden="true"></i>`,
    rotulo: on ? "Animações ligadas. Desligar" : "Animações desligadas. Ligar",
  };
}

function botaoAnimacoes() {
  const { html, rotulo } = conteudoBotaoAnimacoes();
  return `<button type="button" class="icone-btn" data-animacoes-btn aria-pressed="${animacoesLigadas()}" aria-label="${rotulo}" title="${rotulo}">${html}</button>`;
}

document.addEventListener("click", (e) => {
  if (!e.target.closest("[data-animacoes-btn]")) return;
  const ligar = !animacoesLigadas();
  try {
    if (ligar) localStorage.removeItem(ANIM_KEY); else localStorage.setItem(ANIM_KEY, "desligadas");
  } catch (_) {}
  if (ligar) document.documentElement.removeAttribute("data-animacoes");
  else document.documentElement.setAttribute("data-animacoes", "desligadas");
  const { html, rotulo } = conteudoBotaoAnimacoes();
  $$("[data-animacoes-btn]").forEach((b) => {
    b.innerHTML = html;
    b.setAttribute("aria-label", rotulo);
    b.setAttribute("aria-pressed", String(ligar));
    b.title = rotulo;
  });
  if (ligar) { entradaForcada = true; render(); }
});

/* ---------- Título da tela inicial: o equipamento troca a cada 3 segundos ---------- */

let trocaTimer = null;

// Cada letra num <span> próprio, para sumir e entrar uma de cada vez.
const letras = (palavra) => Array.from(palavra).map((ch, i) => `<span class="l" style="--i:${i}">${esc(ch)}</span>`).join("");

// O leitor de tela ouve uma frase fixa; a palavra que troca fica só na tela.
function tituloRotativo() {
  return `<span class="sr">Um equipamento parou.</span><span aria-hidden="true"><span class="troca" data-troca>${letras(EQUIPAMENTOS_TITULO[0])}</span> parou.</span>`;
}

function iniciarTrocaTitulo() {
  clearInterval(trocaTimer);
  const el = $("[data-troca]");
  if (!el) return;
  let i = 0;
  trocaTimer = setInterval(() => {
    if (!el.isConnected) { clearInterval(trocaTimer); return; }
    i = (i + 1) % EQUIPAMENTOS_TITULO.length;
    const nova = EQUIPAMENTOS_TITULO[i];
    if (!animacoesLigadas()) { el.innerHTML = letras(nova); return; }
    // Sai: letras sobem e se desfazem uma a uma; depois as da próxima palavra entram.
    const saida = 400 + el.querySelectorAll(".l").length * 28;
    el.classList.remove("troca--entrando");
    el.classList.add("troca--saindo");
    setTimeout(() => {
      if (!el.isConnected) return;
      el.innerHTML = letras(nova);
      el.classList.remove("troca--saindo");
      void el.offsetWidth;
      el.classList.add("troca--entrando");
    }, saida);
  }, 3000);
}

// Números dos cartões contam de zero até o valor (só números inteiros ou porcentagens).
function contarNumeros(raiz) {
  if (!animacoesLigadas()) return;
  $$(".kpi__value", raiz).forEach((el) => {
    const m = el.textContent.trim().match(/^(\d+)(%?)$/);
    if (!m || Number(m[1]) === 0) return;
    const alvo = Number(m[1]);
    const inicio = performance.now();
    const passo = (agora) => {
      const t = Math.min(1, (agora - inicio) / 900);
      const suave = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(alvo * suave) + m[2];
      if (t < 1 && el.isConnected) requestAnimationFrame(passo);
    };
    el.textContent = "0" + m[2];
    requestAnimationFrame(passo);
  });
}

// Página Sobre: os blocos aparecem conforme a pessoa rola.
function revelarAoRolar(raiz) {
  if (!animacoesLigadas() || !("IntersectionObserver" in window)) return;
  const alvos = $$(".problem__statement, .problem__item, .problem__credit, .section-title, .section-sub, .track__step, .lane, .hub, .bento__cell, .closing__inner, .footer__grid > div", raiz);
  const io = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  alvos.forEach((el) => {
    const irmaos = [...el.parentElement.children].filter((c) => alvos.includes(c));
    el.style.setProperty("--d", `${Math.max(0, irmaos.indexOf(el)) * 90}ms`);
    el.classList.add("revelar");
    io.observe(el);
  });
}

let avisoTexto = "";
let ultimoQtdSino = 0;
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
  const sinoNovo = qtd > ultimoQtdSino;
  ultimoQtdSino = qtd;
  return `
    <a class="skip" href="#conteudo" onclick="event.preventDefault();document.getElementById('conteudo').focus()">Pular para o conteúdo</a>
    <div class="app">
      <aside class="menu" id="menu">
        <a href="#/chamados" class="brand brand--menu" aria-label="Chamado Aberto, início">
          <img class="brand__mark" src="img/logo.svg" alt="" width="34" height="34"><span class="brand__name">Chamado Aberto</span>
        </a>
        <nav aria-label="Principal">
          <ul>
            ${itemMenu("chamados", ehTecnico() ? "Chamados" : "Meus chamados", "ph-tray", atual)}
            ${ehTecnico() ? itemMenu("indicadores", "Indicadores", "ph-chart-bar", atual) : ""}
            ${ehTecnico() ? itemMenu("planilha", "Planilha", "ph-table", atual) : ""}
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
          ${botaoAnimacoes()}
          ${botaoTema()}
          <a href="#/notificacoes" class="icone-btn sino" aria-label="Notificações${qtd ? `, ${qtd} não lidas` : ""}">
            <i class="ph ph-bell" aria-hidden="true"></i>${qtd ? `<span class="sino__qtd${sinoNovo ? " sino__qtd--novo" : ""}">${qtd > 9 ? "9+" : qtd}</span>` : ""}
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
