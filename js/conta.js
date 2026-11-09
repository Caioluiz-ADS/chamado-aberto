// Login de demonstração, notificações, troca de senha e pesquisa de satisfação.

const pesquisasVistas = new Set();

function entrar(email) {
  usuario = db.usuarios.find((u) => u.email === email);
  try { sessionStorage.setItem(SESSION_KEY, email); } catch (_) {}
}

function sair() {
  usuario = null;
  pesquisasVistas.clear();
  try { sessionStorage.removeItem(SESSION_KEY); } catch (_) {}
  location.hash = "#/login";
  render();
}

function paginaLogin() {
  const contas = CONTAS_TESTE.map((email) => db.usuarios.find((u) => u.email === email)).filter(Boolean);
  const icones = { funcionario: "ph-user", suporte: "ph-wrench", admin: "ph-gear" };
  $("#app").innerHTML = `
    <main class="login">
      <section class="login__marca">
        <span class="brand"><span class="brand__mark" aria-hidden="true">CA</span><span class="brand__name">Chamado Aberto</span></span>
        <div>
          <h1>O elevador parou. <em>Quem ficou sabendo?</em></h1>
          <p>Todos os chamados de manutenção de elevadores e ar-condicionado num só lugar.</p>
        </div>
        <a href="#/sobre" class="link-claro">Conheça o projeto Jovem Protagonista <i class="ph-bold ph-arrow-right" aria-hidden="true"></i></a>
      </section>
      <section class="login__form">
        <form id="loginForm" novalidate>
          <h2>Entrar</h2>
          <p class="muted">Funcionários abrem chamados. O suporte atualiza e conclui.</p>
          <div class="field">
            <label for="lEmail">E-mail</label>
            <input id="lEmail" type="email" autocomplete="username" placeholder="nome@empresa.com">
          </div>
          <div class="field">
            <label for="lSenha">Senha</label>
            <input id="lSenha" type="password" autocomplete="current-password">
            <p class="field__error" id="eLogin"></p>
          </div>
          <button type="submit" class="btn btn--full">Entrar <i class="ph-bold ph-sign-in" aria-hidden="true"></i></button>
          <div class="demo">
            <p class="demo__title">Contas de teste (clique para preencher)</p>
            ${contas.map((c) => `
              <button type="button" class="demo__acc" data-email="${esc(c.email)}">
                <i class="ph ${icones[c.papel]}" aria-hidden="true"></i>
                <span><strong>${PAPEIS[c.papel]}</strong> ${esc(c.email)}</span>
              </button>`).join("")}
          </div>
        </form>
      </section>
    </main>`;

  $$("[data-email]").forEach((b) => b.addEventListener("click", () => {
    const c = db.usuarios.find((u) => u.email === b.dataset.email);
    $("#lEmail").value = c.email;
    $("#lSenha").value = c.senha;
    marcarErro("lSenha", "");
    $('#loginForm button[type="submit"]').focus();
  }));

  $("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#lEmail").value.trim().toLowerCase();
    const senha = $("#lSenha").value;
    const achado = db.usuarios.find((u) => u.email.toLowerCase() === email && u.senha === senha);
    const msg = !email || !senha ? "Preencha e-mail e senha."
      : !achado ? "E-mail ou senha incorretos."
      : !achado.ativo ? "Este usuário está desativado." : "";
    marcarErro("lSenha", msg);
    if (msg) { (email ? $("#lSenha") : $("#lEmail")).focus(); return; }
    entrar(achado.email);
    auditar("Entrou no sistema", achado.email);
    save();
    if (location.hash === "#/chamados") render(); else location.hash = "#/chamados";
  });
}

function paginaNotificacoes(v) {
  const lista = db.notificacoes.filter((n) => n.para === usuario.nome).sort((a, b) => b.id - a.id);
  v.innerHTML = cabecalho("Notificações", "Avisos sobre os seus chamados.", "ph-bell",
    naoLidas() ? `<button class="btn btn--ghost btn--small" id="btnLerTudo">Marcar todas como lidas</button>` : "") + avisoHtml() +
    (lista.length ? `<ul class="notifs">${lista.map((n) => `
      <li class="${n.lida ? "" : "is-nova"}">
        <a href="#/chamados/${n.chamado}" data-notif="${n.id}">
          <span>${esc(n.texto)}</span><time class="mono muted">${fmtData(n.quando)}</time>
        </a>
      </li>`).join("")}</ul>` : vazio("ph-bell-slash", "Nenhuma notificação por enquanto."));

  $$("[data-notif]", v).forEach((a) => a.addEventListener("click", () => {
    db.notificacoes.find((n) => String(n.id) === a.dataset.notif).lida = true;
    save();
  }));
  const ler = $("#btnLerTudo", v);
  if (ler) ler.addEventListener("click", () => {
    db.notificacoes.forEach((n) => { if (n.para === usuario.nome) n.lida = true; });
    save();
    render();
  });
}

function paginaSenha(v) {
  v.innerHTML = cabecalho("Trocar senha", "A nova senha vale só neste navegador.", "ph-key") + avisoHtml() + `
    <form id="senhaForm" class="cartao cartao--estreito" novalidate>
      <div class="field"><label for="sAtual">Senha atual</label><input id="sAtual" type="password" autocomplete="current-password"><p class="field__error"></p></div>
      <div class="field"><label for="sNova">Nova senha</label><input id="sNova" type="password" autocomplete="new-password"><p class="field__error"></p></div>
      <div class="field"><label for="sRepete">Repita a nova senha</label><input id="sRepete" type="password" autocomplete="new-password"><p class="field__error"></p></div>
      <button class="btn btn--small">Salvar senha</button>
    </form>`;
  $("#senhaForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const nova = $("#sNova").value;
    const erro = focarPrimeiro([
      marcarErro("sAtual", $("#sAtual").value === usuario.senha ? "" : "Senha atual incorreta."),
      marcarErro("sNova", nova.length >= 8 ? "" : "Use pelo menos 8 caracteres."),
      marcarErro("sRepete", nova === $("#sRepete").value ? "" : "As senhas não são iguais."),
    ]);
    if (erro) return;
    usuario.senha = nova;
    auditar("Trocou a senha", usuario.email);
    save();
    avisar("Senha alterada.");
    render();
  });
}

function abrirPesquisa() {
  const c = pesquisasPendentes()[0];
  if (!c) return;
  pesquisasVistas.add(c.id);
  const d = $("#pesquisa");
  d.innerHTML = `
    <form id="pesquisaForm" novalidate>
      <h2>Como foi o atendimento?</h2>
      <p>${fmtId(c.id)} · ${esc(tituloDe(c))}${c.tecnico ? `, atendido por ${esc(c.tecnico)}` : ""}.</p>
      <fieldset class="notas field">
        <legend class="sr">Avaliação</legend>
        ${NOTAS.map((n) => `<label><input type="radio" name="nota" value="${n.valor}"><i class="ph ${n.icone}" aria-hidden="true"></i>${n.valor}</label>`).join("")}
        <input type="hidden" id="pNota"><p class="field__error"></p>
      </fieldset>
      <div class="field">
        <label for="pComentario">Comentário <span class="opt" id="pOpt">(opcional)</span></label>
        <textarea id="pComentario" rows="3"></textarea>
        <p class="field__error"></p>
      </div>
      <div class="janela__acoes">
        <button type="button" class="btn btn--ghost btn--small" id="pDepois">Responder depois</button>
        <button class="btn btn--small">Enviar avaliação</button>
      </div>
    </form>`;
  const notaEscolhida = () => (d.querySelector('input[name="nota"]:checked') || {}).value;
  const exige = () => ["Regular", "Ruim", "Péssimo"].includes(notaEscolhida());
  $$('input[name="nota"]', d).forEach((r) => r.addEventListener("change", () => {
    $("#pOpt", d).textContent = exige() ? "(obrigatório)" : "(opcional)";
  }));
  $("#pDepois", d).addEventListener("click", () => d.close());
  $("#pesquisaForm", d).addEventListener("submit", (e) => {
    e.preventDefault();
    const texto = $("#pComentario", d).value.trim();
    const faltaComentario = exige() && !texto;
    marcarErro("pNota", notaEscolhida() ? "" : "Escolha uma avaliação.", d);
    marcarErro("pComentario", faltaComentario ? "Conte o que aconteceu no atendimento." : "", d);
    if (!notaEscolhida() || faltaComentario) return;
    responderPesquisa(c, notaEscolhida(), texto);
    d.close();
    avisar("Obrigado pela avaliação.");
    render();
  });
  if (!d.open) d.showModal();
}
