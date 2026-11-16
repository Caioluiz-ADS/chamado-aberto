// Administração: usuários, status, catálogo e auditoria.

const botaoAtivo = (ativo, attr) => `<button class="link-btn" ${attr}>${ativo ? "Desativar" : "Ativar"}</button>`;
const seloAtivo = (ativo) => `<span class="status status--${ativo ? "andamento" : "final"}">${ativo ? "Ativo" : "Inativo"}</span>`;

function concluirAdmin(acao, alvo, msg) {
  auditar(acao, alvo);
  save();
  avisar(msg);
  render();
}

let editandoSetor = null;

function celulaSetor(u, i) {
  if (editandoSetor === i) {
    return `
      <form class="setor-edita" data-salvar-setor="${i}" novalidate>
        <div class="field"><label class="sr" for="eSetor${i}">Setor de ${esc(u.nome)}</label><input id="eSetor${i}" value="${esc(u.setor)}"><p class="field__error"></p></div>
        <button class="link-btn">Salvar</button>
        <button type="button" class="link-btn" data-cancelar-setor>Cancelar</button>
      </form>`;
  }
  return `<span class="setor-celula">${u.setor ? esc(u.setor) : '<span class="muted">—</span>'}
    <button type="button" class="link-btn" data-editar-setor="${i}" aria-label="Alterar o setor de ${esc(u.nome)}"><i class="ph ph-pencil-simple" aria-hidden="true"></i></button></span>`;
}

function paginaUsuarios(v) {
  const papeis = Object.entries(PAPEIS).map(([k, r]) => `<option value="${k}">${r}</option>`).join("");
  const setoresUsados = [...new Set(db.usuarios.map((u) => u.setor).filter(Boolean))].sort();
  v.innerHTML = cabecalho("Usuários", "Quem pode entrar no sistema, com qual perfil e de qual setor.", "ph-users") + avisoHtml() + `
    <form id="userForm" class="cartao form-linha" novalidate>
      <div class="field"><label for="uNome">Nome</label><input id="uNome"><p class="field__error"></p></div>
      <div class="field"><label for="uEmail">E-mail</label><input id="uEmail" type="email"><p class="field__error"></p></div>
      <div class="field"><label for="uSetor">Setor / Andar</label><input id="uSetor" list="listaSetores" placeholder="Ex.: Financeiro, 3º andar"><p class="field__error"></p></div>
      <div class="field"><label for="uPapel">Perfil</label><select id="uPapel">${papeis}</select></div>
      <button class="btn btn--small">Adicionar</button>
      <datalist id="listaSetores">${setoresUsados.map((s) => `<option value="${esc(s)}">`).join("")}</datalist>
    </form>
    <p class="sheet__note">Novos usuários entram com a senha ${SENHA_PADRAO}. O setor já vem preenchido quando o chamado é aberto para a pessoa.</p>
    <div class="tabela">
      <table class="tabela--cartoes">
        <thead><tr><th scope="col">Nome</th><th scope="col">E-mail</th><th scope="col">Setor / Andar</th><th scope="col">Perfil</th><th scope="col">Situação</th><th scope="col"><span class="sr">Ações</span></th></tr></thead>
        <tbody>${db.usuarios.map((u, i) => `
          <tr>
            <td data-l="Nome">${pessoa(u.nome)}</td><td data-l="E-mail">${esc(u.email)}</td>
            <td data-l="Setor / Andar">${celulaSetor(u, i)}</td>
            <td data-l="Perfil">${PAPEIS[u.papel]}</td>
            <td data-l="Situação">${seloAtivo(u.ativo)}</td>
            <td data-l="Ações">${u.email === usuario.email ? '<span class="muted">Você</span>' : botaoAtivo(u.ativo, `data-u="${i}"`)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>`;

  $$("[data-u]", v).forEach((b) => b.addEventListener("click", () => {
    const u = db.usuarios[b.dataset.u];
    u.ativo = !u.ativo;
    concluirAdmin(u.ativo ? "Ativou usuário" : "Desativou usuário", u.email, `${u.nome} ${u.ativo ? "ativado" : "desativado"}.`);
  }));
  $$("[data-editar-setor]", v).forEach((b) => b.addEventListener("click", () => {
    editandoSetor = Number(b.dataset.editarSetor);
    render();
    $(`#eSetor${editandoSetor}`).focus();
  }));
  $$("[data-cancelar-setor]", v).forEach((b) => b.addEventListener("click", () => { editandoSetor = null; render(); }));
  $$("[data-salvar-setor]", v).forEach((f) => f.addEventListener("submit", (e) => {
    e.preventDefault();
    const i = Number(f.dataset.salvarSetor);
    const setor = $(`#eSetor${i}`).value.trim();
    if (focarPrimeiro([marcarErro(`eSetor${i}`, setor ? "" : "Informe o setor.")])) return;
    const u = db.usuarios[i];
    editandoSetor = null;
    if (setor === u.setor) { render(); return; }
    u.setor = setor;
    concluirAdmin("Alterou o setor do usuário", `${u.email}: ${setor}`, `Setor de ${u.nome} atualizado.`);
  }));
  $("#userForm", v).addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = $("#uNome").value.trim();
    const email = $("#uEmail").value.trim().toLowerCase();
    const setor = $("#uSetor").value.trim();
    const erro = focarPrimeiro([
      marcarErro("uNome", !nome ? "Informe o nome." : db.usuarios.some((u) => u.nome === nome) ? "Já existe um usuário com esse nome." : ""),
      marcarErro("uEmail", !/^\S+@\S+\.\S+$/.test(email) ? "Informe um e-mail válido." : db.usuarios.some((u) => u.email === email) ? "Este e-mail já está cadastrado." : ""),
      marcarErro("uSetor", setor ? "" : "Informe o setor."),
    ]);
    if (erro) return;
    db.usuarios.push(conta(nome, email, $("#uPapel").value, setor));
    concluirAdmin("Criou usuário", `${email} (${setor})`, `${nome} adicionado.`);
  });
}

function paginaStatus(v) {
  v.innerHTML = cabecalho("Status", "As etapas pelas quais um chamado pode passar.", "ph-flow-arrow") + avisoHtml() + `
    <form id="statusForm" class="cartao form-linha" novalidate>
      <div class="field"><label for="stNome">Novo status</label><input id="stNome"><p class="field__error"></p></div>
      <div class="field choice choice--linha">
        <label><input type="checkbox" id="stFinal"> Encerra o chamado</label>
        <label><input type="checkbox" id="stPausa"> Pausa o atendimento</label>
      </div>
      <button class="btn btn--small">Adicionar</button>
    </form>
    <div class="tabela">
      <table class="tabela--cartoes">
        <thead><tr><th scope="col">Nome</th><th scope="col">Tipo</th><th scope="col">Situação</th><th scope="col"><span class="sr">Ações</span></th></tr></thead>
        <tbody>${db.status.map((s, i) => `
          <tr>
            <td data-l="Nome">${bandeira(s.nome)} ${esc(s.nome)}</td>
            <td data-l="Tipo">${s.inicial ? "Inicial" : s.final ? "Final" : s.pausa ? "Pausa" : "Intermediário"}</td>
            <td data-l="Situação">${seloAtivo(s.ativo)}</td>
            <td data-l="Ações">${s.inicial ? '<span class="muted">Obrigatório</span>' : botaoAtivo(s.ativo, `data-s="${i}"`)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
    <form id="prazoForm" class="cartao form-linha" novalidate>
      <div class="field"><label for="pzDias">Prazo para reabrir (dias)</label><input id="pzDias" type="number" min="0" max="365" value="${db.prazoReabrir}"><p class="field__error"></p></div>
      <button class="btn btn--ghost btn--small">Salvar prazo</button>
    </form>`;

  $$("[data-s]", v).forEach((b) => b.addEventListener("click", () => {
    const s = db.status[b.dataset.s];
    s.ativo = !s.ativo;
    concluirAdmin(s.ativo ? "Ativou status" : "Desativou status", s.nome, `Status ${s.nome} ${s.ativo ? "ativado" : "desativado"}.`);
  }));
  $("#statusForm", v).addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = $("#stNome").value.trim();
    const existe = db.status.some((s) => s.nome.toLowerCase() === nome.toLowerCase());
    if (focarPrimeiro([marcarErro("stNome", !nome ? "Informe o nome." : existe ? "Já existe um status com esse nome." : "")])) return;
    const final = $("#stFinal").checked;
    db.status.push({ nome, inicial: false, final, pausa: !final && $("#stPausa").checked, ativo: true });
    concluirAdmin("Criou status", nome, `Status ${nome} adicionado.`);
  });
  $("#prazoForm", v).addEventListener("submit", (e) => {
    e.preventDefault();
    const dias = Number($("#pzDias").value);
    if (focarPrimeiro([marcarErro("pzDias", Number.isInteger(dias) && dias >= 0 && dias <= 365 && $("#pzDias").value !== "" ? "" : "Informe de 0 a 365 dias.")])) return;
    db.prazoReabrir = dias;
    concluirAdmin("Alterou o prazo para reabrir", `${dias} dias`, "Prazo salvo.");
  });
}

function paginaCatalogo(v) {
  v.innerHTML = cabecalho("Catálogo", "Categorias e equipamentos oferecidos na abertura do chamado.", "ph-list-bullets") + avisoHtml() + `
    <form id="catForm" class="cartao form-linha" novalidate>
      <div class="field"><label for="kNome">Nova categoria</label><input id="kNome"><p class="field__error"></p></div>
      <button class="btn btn--small">Adicionar</button>
    </form>
    ${db.catalogo.map((k, i) => `
      <section class="cartao">
        <div class="cartao__topo">
          <h2>${esc(k.nome)}</h2>${seloAtivo(k.ativo)}${botaoAtivo(k.ativo, `data-k="${i}"`)}
        </div>
        <ul class="servicos">${k.servicos.map((s, j) => `
          <li><span>${esc(s.nome)}</span>${seloAtivo(s.ativo)}${botaoAtivo(s.ativo, `data-sv="${i}:${j}"`)}</li>`).join("")}
        </ul>
        <form class="form-linha" data-novo-sv="${i}" novalidate>
          <div class="field"><label for="sv${i}">Novo equipamento</label><input id="sv${i}"><p class="field__error"></p></div>
          <button class="btn btn--ghost btn--small">Adicionar</button>
        </form>
      </section>`).join("")}`;

  $$("[data-k]", v).forEach((b) => b.addEventListener("click", () => {
    const k = db.catalogo[b.dataset.k];
    k.ativo = !k.ativo;
    concluirAdmin(k.ativo ? "Ativou categoria" : "Desativou categoria", k.nome, `Categoria ${k.ativo ? "ativada" : "desativada"}.`);
  }));
  $$("[data-sv]", v).forEach((b) => b.addEventListener("click", () => {
    const [i, j] = b.dataset.sv.split(":");
    const s = db.catalogo[i].servicos[j];
    s.ativo = !s.ativo;
    concluirAdmin(s.ativo ? "Ativou equipamento" : "Desativou equipamento", s.nome, `Equipamento ${s.ativo ? "ativado" : "desativado"}.`);
  }));
  $("#catForm", v).addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = $("#kNome").value.trim();
    const existe = db.catalogo.some((k) => k.nome.toLowerCase() === nome.toLowerCase());
    if (focarPrimeiro([marcarErro("kNome", !nome ? "Informe o nome." : existe ? "Já existe uma categoria com este nome." : "")])) return;
    db.catalogo.push({ nome, ativo: true, servicos: [] });
    concluirAdmin("Criou categoria", nome, `Categoria ${nome} adicionada.`);
  });
  $$("[data-novo-sv]", v).forEach((f) => f.addEventListener("submit", (e) => {
    e.preventDefault();
    const k = db.catalogo[f.dataset.novoSv];
    const id = `sv${f.dataset.novoSv}`;
    const nome = $("#" + id).value.trim();
    const existe = k.servicos.some((s) => s.nome.toLowerCase() === nome.toLowerCase());
    if (focarPrimeiro([marcarErro(id, !nome ? "Informe o nome." : existe ? "Esta categoria já tem um equipamento com este nome." : "")])) return;
    k.servicos.push({ nome, ativo: true });
    concluirAdmin("Criou equipamento", nome, `${nome} adicionado.`);
  }));
}

function paginaAuditoria(v) {
  const lista = [...db.auditoria].reverse();
  v.innerHTML = cabecalho("Auditoria", "O que foi feito na administração e nos acessos.", "ph-scroll") + (lista.length ? `
    <div class="tabela">
      <table class="tabela--cartoes">
        <thead><tr><th scope="col">Quando</th><th scope="col">Quem</th><th scope="col">Ação</th><th scope="col">Alvo</th></tr></thead>
        <tbody>${lista.map((a) => `
          <tr><td data-l="Quando" class="mono">${fmtData(a.quando)}</td><td data-l="Quem">${esc(a.autor)}</td><td data-l="Ação">${esc(a.acao)}</td><td data-l="Alvo">${esc(a.alvo)}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>` : vazio("ph-scroll", "Nenhum registro ainda."));
}
