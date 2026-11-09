// Painel lateral: novo chamado e detalhe do chamado (abas, atendimento, comentários e anexos).

const TIPOS_ANEXO = ["pdf", "png", "jpg", "jpeg", "txt"];
const MAX_ANEXOS = 5;
const MAX_BYTES = 10 * 1024 * 1024;

let abaAtual = "principal";
let painelId = null;

function mostrarPainel(html) {
  const d = $("#painel");
  d.innerHTML = html;
  if (!d.open) d.showModal();
}

const topoPainel = (selo, titulo, descricao = "") => `
  <header class="painel__topo">
    <div>
      <p class="eyebrow">${esc(selo)}</p>
      <h2>${esc(titulo)}</h2>
      ${descricao ? `<p class="muted">${esc(descricao)}</p>` : ""}
    </div>
    <button type="button" class="icone-btn" data-fechar aria-label="Fechar painel"><i class="ph ph-x" aria-hidden="true"></i></button>
  </header>`;

function ligarFechar() {
  $$("[data-fechar]", $("#painel")).forEach((b) => b.addEventListener("click", () => $("#painel").close()));
}

/* ---------- Novo chamado ---------- */

function painelNovo() {
  painelId = "novo";
  const tec = ehTecnico();
  const bloqueado = !tec && pesquisasPendentes().length > 0;
  const categorias = db.catalogo.filter((k) => k.ativo && k.servicos.some((s) => s.ativo));

  mostrarPainel(topoPainel("Chamados", "Novo chamado",
    tec ? "Registre o pedido de um solicitante. O chamado fica com ele." : "Descreva o problema. O andamento aparece na página do chamado.") + `
    <form id="ticketForm" class="painel__form" novalidate>
      <div class="painel__corpo">
        ${bloqueado ? `
          <div class="alerta" role="status">
            <i class="ph ph-star" aria-hidden="true"></i>
            <p>Antes de abrir um novo chamado, avalie o atendimento dos chamados encerrados. Leva menos de um minuto.</p>
            <button type="button" class="btn btn--small" id="btnPesquisa">Responder pesquisa</button>
          </div>` : ""}
        <div class="field">
          <label for="fSolicitante">Solicitante</label>
          ${tec ? `<select id="fSolicitante">${opcoes(solicitantes())}</select>`
            : `<input id="fSolicitante" value="${esc(usuario.nome)}" readonly>`}
          <p class="field__error"></p>
        </div>
        <div class="field">
          <label for="fSetor">Setor / Andar</label>
          <input id="fSetor" type="text" placeholder="Ex.: Financeiro, 3º andar">
          <p class="field__error"></p>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="fCat">Categoria</label>
            <select id="fCat">${opcoes(categorias.map((k) => k.nome))}</select>
            <p class="field__error"></p>
          </div>
          <div class="field">
            <label for="fEquip">Equipamento</label>
            <select id="fEquip" disabled><option value="">Escolha a categoria</option></select>
            <p class="field__error"></p>
          </div>
        </div>
        <div class="field">
          <label for="fTipo">Tipo de problema</label>
          <select id="fTipo">${opcoes(TIPOS)}</select>
          <p class="field__error"></p>
        </div>
        <div class="field">
          <label for="fDesc">Descrição <span class="opt">(opcional)</span></label>
          <textarea id="fDesc" rows="4" placeholder="O que está acontecendo?"></textarea>
        </div>
      </div>
      <footer class="painel__rodape">
        <span></span>
        <div>
          <button type="button" class="btn btn--ghost btn--small" data-fechar>Cancelar</button>
          <button class="btn btn--small" ${bloqueado ? "disabled" : ""}>Registrar chamado</button>
        </div>
      </footer>
    </form>`);
  ligarFechar();

  const btnP = $("#btnPesquisa");
  if (btnP) btnP.addEventListener("click", abrirPesquisa);

  $("#fCat").addEventListener("change", (e) => {
    const k = categorias.find((x) => x.nome === e.target.value);
    const equip = $("#fEquip");
    equip.disabled = !k;
    equip.innerHTML = k ? opcoes(k.servicos.filter((s) => s.ativo).map((s) => s.nome)) : `<option value="">Escolha a categoria</option>`;
  });

  $("#ticketForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!ehTecnico() && pesquisasPendentes().length) return;
    const regra = (id, msg) => marcarErro(id, $("#" + id).value.trim() ? "" : msg);
    const erro = focarPrimeiro([
      regra("fSolicitante", "Informe o solicitante."),
      regra("fSetor", "Informe o setor ou andar."),
      regra("fCat", "Escolha a categoria."),
      regra("fEquip", "Escolha o equipamento."),
      regra("fTipo", "Escolha o tipo de problema."),
    ]);
    if (erro) return;
    const c = criarChamado({
      solicitante: $("#fSolicitante").value,
      setor: $("#fSetor").value.trim(),
      categoria: $("#fCat").value,
      equipamento: $("#fEquip").value,
      tipo: $("#fTipo").value,
      descricao: $("#fDesc").value.trim(),
    });
    avisar(`Chamado ${fmtId(c.id)} registrado.`);
    location.hash = `#/chamados/${c.id}`;
  });
}

/* ---------- Detalhe do chamado ---------- */

function painelChamado(id) {
  const c = db.chamados.find((x) => x.id === id);
  if (painelId !== id) { abaAtual = "principal"; painelId = id; }
  if (!c || !podeVer(c)) {
    mostrarPainel(topoPainel(`Chamado`, "Chamado não encontrado") + `<div class="painel__corpo"><p>Este chamado não existe ou não está disponível para o seu perfil.</p></div>`);
    ligarFechar();
    return;
  }
  const tec = ehTecnico();
  const comentarios = c.comentarios.filter((x) => tec || !x.interno);
  const anexos = c.anexos.filter((x) => tec || !x.interno);
  const abas = [
    ["principal", "Principal", "ph-file-text", 0],
    ...(tec ? [["historico", "Histórico", "ph-clock-counter-clockwise", 0]] : []),
    ["anexos", "Anexos", "ph-paperclip", anexos.length],
    ["comentarios", "Comentários", "ph-chat-circle", comentarios.length],
  ];
  if (!abas.some(([a]) => a === abaAtual)) abaAtual = "principal";

  const conteudo = { principal: abaPrincipal, historico: abaHistorico, anexos: abaAnexos, comentarios: abaComentarios }[abaAtual](c, { comentarios, anexos });
  const salvar = tec && abaAtual === "principal"
    ? `<button class="btn btn--small" type="submit" form="atendForm" id="btnSalvar" disabled><i class="ph-bold ph-floppy-disk" aria-hidden="true"></i> Salvar</button>` : "";
  const comentarBtn = !tec && abaAtual !== "comentarios"
    ? `<button class="btn btn--small" type="button" id="btnComentar"><i class="ph-bold ph-chat-circle" aria-hidden="true"></i> Comentar</button>` : "";

  mostrarPainel(topoPainel(`Chamado ${fmtId(c.id)}`, tituloDe(c)) + `
    <div class="abas" role="tablist" aria-label="Seções do chamado">
      ${abas.map(([a, rot, ic, n]) => `
        <button type="button" role="tab" class="aba" data-aba="${a}" aria-selected="${a === abaAtual}">
          <i class="ph ${ic}" aria-hidden="true"></i>${rot}${n ? `<span class="aba__qtd">${n}</span>` : ""}
        </button>`).join("")}
    </div>
    <div class="painel__corpo">${avisoHtml()}${conteudo}</div>
    <footer class="painel__rodape">
      <span class="muted">Última atualização <strong class="mono">${fmtData(c.atualizado)}</strong></span>
      <div>
        <button type="button" class="btn btn--ghost btn--small" data-fechar>Fechar</button>
        ${salvar}${comentarBtn}
      </div>
    </footer>`);
  ligarFechar();

  $$("[data-aba]").forEach((b) => b.addEventListener("click", () => { abaAtual = b.dataset.aba; painelChamado(id); }));
  const comentarB = $("#btnComentar");
  if (comentarB) comentarB.addEventListener("click", () => { abaAtual = "comentarios"; painelChamado(id); $("#cTexto").focus(); });

  if (abaAtual === "principal") { ligarAtendimento(c); ligarReabrir(c); ligarAvaliar(); }
  if (abaAtual === "anexos") ligarAnexos(c);
  if (abaAtual === "comentarios") ligarComentarios(c);
}

const secao = (icone, titulo, corpo) => `
  <section class="secao">
    <h3><i class="ph ${icone}" aria-hidden="true"></i>${titulo}</h3>
    ${corpo}
  </section>`;

const visibilidade = () => `
  <fieldset class="field choice choice--linha">
    <legend>Quem pode ver</legend>
    <label><input type="radio" name="visib" value="publico" checked> Solicitante e equipe</label>
    <label><input type="radio" name="visib" value="interno"> Só a equipe</label>
  </fieldset>`;
const ehInterno = () => $('input[name="visib"]:checked').value === "interno";

function abaPrincipal(c) {
  const tec = ehTecnico();
  return `
    <dl class="resumo">
      <div><dt>Status</dt><dd>${seloStatus(c.status)}</dd></div>
      <div><dt>Aberto em</dt><dd class="mono">${fmtData(c.aberto)}</dd></div>
      <div><dt>Serviço</dt><dd><small>${esc(c.categoria)}</small>${esc(c.equipamento)}</dd></div>
      <div><dt>Tempo de resolução</dt><dd class="mono">${tempoDe(c)}</dd></div>
    </dl>
    ${blocoFechado(c)}
    ${tec ? blocoAtendimento(c) : ""}
    ${secao("ph-file-text", "Detalhes da solicitação", `
      <dl class="detalhes">
        <div><dt>Setor / Andar</dt><dd>${esc(c.setor)}</dd></div>
        <div><dt>Tipo de problema</dt><dd>${esc(c.tipo)}</dd></div>
        <div><dt>Descrição</dt><dd>${c.descricao ? esc(c.descricao) : '<span class="muted">Sem descrição.</span>'}</dd></div>
        ${c.solucao ? `<div><dt>O que foi feito</dt><dd>${esc(c.solucao)}</dd></div>` : ""}
      </dl>`)}
    ${secao("ph-users", "Pessoas envolvidas", `
      <ul class="pessoas">
        <li>${avatar(c.solicitante)}<span><small>Solicitante</small>${esc(c.solicitante)}</span></li>
        <li>${avatar(c.tecnico || "?", true)}<span><small>Técnico responsável</small>${c.tecnico ? esc(c.tecnico) : '<span class="muted">Ainda não atribuído</span>'}</span></li>
        ${c.abertoPor ? `<li>${avatar(c.abertoPor, true)}<span><small>Aberto por</small>${esc(c.abertoPor)}</span></li>` : ""}
      </ul>`)}`;
}

function blocoFechado(c) {
  if (!estaFinal(c) || c.solicitante !== usuario.nome) return "";
  const pendente = !c.pesquisa
    ? `<div class="alerta" role="status"><i class="ph ph-star" aria-hidden="true"></i><p>Conte como foi o atendimento deste chamado.</p><button type="button" class="btn btn--small" id="btnAvaliar">Responder pesquisa</button></div>` : "";
  const limite = limiteReabrir(c);
  if (limite < new Date()) {
    return pendente + secao("ph-arrow-counter-clockwise", "Chamado fechado", `<p class="caixa">O prazo para reabrir terminou em <strong>${pad(limite.getDate())}/${pad(limite.getMonth() + 1)}</strong>. Se o problema continua, abra um chamado novo.</p>`);
  }
  return pendente + secao("ph-arrow-counter-clockwise", "O problema continua?", `
    <form id="reabrirForm" class="caixa" novalidate>
      <div class="field">
        <label for="rMotivo">Motivo da reabertura</label>
        <textarea id="rMotivo" rows="2"></textarea>
        <p class="field__error"></p>
      </div>
      <button class="btn btn--ghost btn--small">Reabrir chamado</button>
    </form>`);
}

function ligarAvaliar() {
  const b = $("#btnAvaliar");
  if (b) b.addEventListener("click", abrirPesquisa);
}

function ligarReabrir(c) {
  const f = $("#reabrirForm");
  if (!f) return;
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const motivo = $("#rMotivo").value.trim();
    if (focarPrimeiro([marcarErro("rMotivo", motivo ? "" : "Informe o motivo.")])) return;
    reabrir(c, motivo);
    avisar("Chamado reaberto.");
    render();
  });
}

function blocoAtendimento(c) {
  const nomes = c.tecnico && !tecnicos().includes(c.tecnico) ? [c.tecnico, ...tecnicos()] : tecnicos();
  const alvos = db.status.filter((s) => s.ativo && s.nome !== c.status).map((s) => s.nome);
  return secao("ph-headset", "Atendimento", `
    <form id="atendForm" class="caixa" novalidate>
      <div class="field">
        <label for="aTecnico">Responsável</label>
        <select id="aTecnico">${opcoes(nomes, c.tecnico, "Selecione um técnico")}</select>
        <p class="field__error"></p>
      </div>
      <div class="field">
        <label for="aStatus">Novo status</label>
        <select id="aStatus">${opcoes(alvos, "", "Selecione o novo status")}</select>
        <p class="field__error"></p>
      </div>
      <div class="field">
        <label for="aSolucao">O que foi feito <span class="opt" id="aOpt">(opcional)</span></label>
        <textarea id="aSolucao" rows="2" placeholder="Ex.: troca do sensor da porta">${esc(c.solucao)}</textarea>
        <p class="field__error"></p>
      </div>
    </form>`);
}

function ligarAtendimento(c) {
  const f = $("#atendForm");
  if (!f) return;
  const ler = () => ({ tecnico: $("#aTecnico").value, status: $("#aStatus").value, solucao: $("#aSolucao").value.trim() });
  const mudou = (v) => (v.tecnico && v.tecnico !== c.tecnico) || v.status || v.solucao !== c.solucao;
  f.addEventListener("input", () => {
    const v = ler();
    $("#btnSalvar").disabled = !mudou(v);
    $("#aOpt").textContent = v.status && statusDe(v.status).final ? "(obrigatório)" : "(opcional)";
  });
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const v = ler();
    if (!mudou(v)) return;
    const erro = focarPrimeiro([
      marcarErro("aTecnico", v.status && !statusDe(v.status).inicial && !v.tecnico ? "Escolha o técnico responsável." : ""),
      marcarErro("aSolucao", v.status && statusDe(v.status).final && !v.solucao ? "Descreva o que foi feito para concluir." : ""),
    ]);
    if (erro) return;
    const linhas = [
      v.tecnico && v.tecnico !== c.tecnico ? `Responsável: de ${c.tecnico || "ninguém"} para ${v.tecnico}.` : "",
      v.status ? `Status: de ${c.status} para ${v.status}.` : "",
      v.solucao !== c.solucao ? "O que foi feito: atualizado." : "",
    ].filter(Boolean).join(" ");
    if (!await confirmar(`Salvar as alterações do chamado ${fmtId(c.id)}?`, `${linhas} As mudanças ficam registradas no histórico.`, "Salvar")) return;
    salvarAtendimento(c, v);
    avisar(v.status && statusDe(v.status).final ? `${fmtId(c.id)} concluído. O tempo de resolução já entrou na média.` : "Alterações salvas.");
    render();
  });
}

function abaHistorico(c) {
  return `<ol class="historico">${[...c.eventos].reverse().map((ev) => `
    <li><time class="mono muted">${fmtData(ev.quando)}</time><p>${esc(ev.texto)}</p><small class="muted">${esc(ev.autor)}</small></li>`).join("")}</ol>`;
}

function abaAnexos(c, { anexos }) {
  return `
    ${anexos.length ? `<ul class="anexos">${anexos.map((a) => `
      <li><i class="ph ph-file" aria-hidden="true"></i>
        <span><strong>${esc(a.nome)}</strong><small class="muted">${fmtTamanho(a.tamanho)} · ${esc(a.autor)} · ${fmtData(a.quando)}${a.interno ? " · só a equipe" : ""}</small></span>
      </li>`).join("")}</ul>` : vazio("ph-paperclip", "Nenhum anexo neste chamado.")}
    <form id="anexoForm" class="caixa" novalidate>
      <div class="field">
        <label for="aArquivo">Adicionar arquivo</label>
        <input id="aArquivo" type="file" accept=".pdf,.png,.jpg,.jpeg,.txt">
        <p class="field__error"></p>
      </div>
      ${ehTecnico() ? visibilidade() : ""}
      <button class="btn btn--ghost btn--small">Enviar anexo</button>
      <p class="sheet__note">PDF, PNG, JPEG ou TXT, até 10 MB. Por ser ilustrativo, só o nome e o tamanho ficam registrados.</p>
    </form>`;
}

function ligarAnexos(c) {
  $("#anexoForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const arq = $("#aArquivo").files[0];
    const ext = arq ? arq.name.split(".").pop().toLowerCase() : "";
    const msg = !arq ? "Escolha um arquivo."
      : !TIPOS_ANEXO.includes(ext) ? "Tipo de arquivo não permitido. Envie PDF, PNG, JPEG ou TXT."
      : arq.size > MAX_BYTES ? "O arquivo não pode ter mais de 10 MB."
      : c.anexos.length >= MAX_ANEXOS ? `Este chamado já tem o máximo de ${MAX_ANEXOS} anexos.` : "";
    if (focarPrimeiro([marcarErro("aArquivo", msg)])) return;
    anexar(c, arq, ehTecnico() && ehInterno());
    avisar("Anexo adicionado.");
    render();
  });
}

function abaComentarios(c, { comentarios }) {
  return `
    ${comentarios.length ? `<ul class="comentarios">${comentarios.map((x) => `
      <li class="${x.interno ? "is-interno" : ""}">
        ${avatar(x.autor, x.autor !== c.solicitante)}
        <div>
          <p class="comentarios__topo"><strong>${esc(x.autor)}</strong><time class="mono muted">${fmtData(x.quando)}</time>${x.interno ? '<span class="status status--pausa">Só a equipe</span>' : ""}</p>
          <p>${esc(x.texto)}</p>
        </div>
      </li>`).join("")}</ul>` : vazio("ph-chat-circle", "Nenhum comentário ainda.")}
    <form id="comentarioForm" class="caixa" novalidate>
      <div class="field">
        <label for="cTexto">Novo comentário</label>
        <textarea id="cTexto" rows="3"></textarea>
        <p class="field__error"></p>
      </div>
      ${ehTecnico() ? visibilidade() : ""}
      <button class="btn btn--small">Comentar</button>
    </form>`;
}

function ligarComentarios(c) {
  $("#comentarioForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const texto = $("#cTexto").value.trim();
    if (focarPrimeiro([marcarErro("cTexto", texto ? "" : "Escreva o comentário.")])) return;
    comentar(c, texto, ehTecnico() && ehInterno());
    render();
  });
}
