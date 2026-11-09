// Lista de chamados e planilha (tabela, indicadores, filtros e CSV).

const POR_PAGINA = 10;
let paginaAtual = 1;
let filtro = "todos";

const vazio = (icone, texto, extra = "") => `<div class="empty"><i class="ph ${icone}" aria-hidden="true"></i><p>${esc(texto)}</p>${extra}</div>`;

function tempoDe(c) {
  return c.fechado
    ? fmtDuracao(horas(c.aberto, c.fechado))
    : `<span class="muted">há ${fmtDuracao(Math.max(0, horas(c.aberto, nowLocal())))}</span>`;
}

function paginaChamados(v) {
  const tec = ehTecnico();
  const todos = meusChamados();
  const totalPag = Math.max(1, Math.ceil(todos.length / POR_PAGINA));
  paginaAtual = Math.min(paginaAtual, totalPag);
  const lista = todos.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);
  const botaoNovo = `<a href="#/chamados/novo" class="btn btn--small"><i class="ph-bold ph-file-plus" aria-hidden="true"></i> Novo chamado</a>`;

  v.innerHTML = cabecalho(tec ? "Chamados" : "Meus chamados",
    tec ? "Todos os chamados da plataforma." : "Os chamados registrados por você ou em seu nome.",
    "ph-tray", botaoNovo) + (rotaEhPainel() ? "" : avisoHtml()) + (lista.length ? `
    <div class="tabela">
      <table class="tabela--cartoes">
        <thead><tr>
          <th scope="col"><i class="ph-bold ph-flag" aria-hidden="true"></i><span class="sr">Situação</span></th>
          <th scope="col">Nº</th><th scope="col">Status</th><th scope="col">Título</th><th scope="col">Categoria</th>
          <th scope="col">Responsável</th>${tec ? '<th scope="col">Solicitante</th>' : ""}
          <th scope="col">Aberto em</th><th scope="col">Tempo</th>
        </tr></thead>
        <tbody>${lista.map((c) => `
          <tr class="linha">
            <td data-l="Situação">${bandeira(c.status)}</td>
            <td data-l="Nº"><span class="numero">${fmtId(c.id)}</span></td>
            <td data-l="Status">${seloStatus(c.status)}</td>
            <td data-l="Título"><a class="linha__link" href="#/chamados/${c.id}">${esc(tituloDe(c))}</a></td>
            <td data-l="Categoria">${esc(c.categoria)}</td>
            <td data-l="Responsável">${pessoa(c.tecnico, true)}</td>
            ${tec ? `<td data-l="Solicitante">${pessoa(c.solicitante)}</td>` : ""}
            <td data-l="Aberto em" class="mono">${fmtData(c.aberto)}</td>
            <td data-l="Tempo" class="mono">${tempoDe(c)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
    ${totalPag > 1 ? `
      <nav class="paginacao" aria-label="Páginas">
        <button class="link-btn" id="pgAnt" ${paginaAtual === 1 ? "disabled" : ""}>Anterior</button>
        <span class="muted">Página ${paginaAtual} de ${totalPag}</span>
        <button class="link-btn" id="pgProx" ${paginaAtual === totalPag ? "disabled" : ""}>Próxima</button>
      </nav>` : ""}` : vazio("ph-tray", "Nenhum chamado encontrado.", botaoNovo));

  if (totalPag > 1) {
    $("#pgAnt", v).addEventListener("click", () => { paginaAtual--; render(); });
    $("#pgProx", v).addEventListener("click", () => { paginaAtual++; render(); });
  }
}

function kpisHtml() {
  const abertos = db.chamados.filter((c) => !estaFinal(c)).length;
  const fechados = db.chamados.filter((c) => c.fechado);
  const media = fechados.length ? fmtDuracao(fechados.reduce((s, c) => s + horas(c.aberto, c.fechado), 0) / fechados.length) : "-";
  const cont = {};
  db.chamados.forEach((c) => { cont[c.categoria] = (cont[c.categoria] || 0) + 1; });
  const top = Object.entries(cont).sort((a, b) => b[1] - a[1])[0];
  return `
    <div class="kpis">
      <div class="kpi"><span class="kpi__label">Em aberto</span><span class="kpi__value">${abertos}</span></div>
      <div class="kpi"><span class="kpi__label">Tempo médio de resolução</span><span class="kpi__value">${media}</span></div>
      <div class="kpi"><span class="kpi__label">Equipamento com mais falhas</span><span class="kpi__value kpi__value--text">${top ? `${esc(top[0])}<small>${top[1]} chamados</small>` : "-"}</span></div>
    </div>`;
}

function paginaPlanilha(v) {
  const lista = db.chamados.filter((c) => filtro === "todos" || c.status === filtro).sort((a, b) => b.id - a.id);
  const chips = [["todos", "Todos"], ...db.status.filter((s) => s.ativo).map((s) => [s.nome, s.nome])];
  v.innerHTML = cabecalho("Planilha", "Todos os chamados, os indicadores e a exportação para o Excel.", "ph-table") + avisoHtml() + kpisHtml() + `
    <div class="sheet__toolbar">
      <div class="filters" role="group" aria-label="Filtrar por status">
        ${chips.map(([val, rot]) => `<button class="chip ${filtro === val ? "is-on" : ""}" data-filter="${esc(val)}" aria-pressed="${filtro === val}">${esc(rot)}</button>`).join("")}
      </div>
      <div class="sheet__actions">
        <button class="link-btn" id="btnCsv"><i class="ph ph-download-simple" aria-hidden="true"></i> Baixar CSV</button>
        <button class="link-btn" id="btnReset"><i class="ph ph-arrow-counter-clockwise" aria-hidden="true"></i> Restaurar exemplo</button>
      </div>
    </div>
    <div class="tabela" tabindex="0" aria-label="Tabela de chamados">
      <table class="tabela--larga">
        <thead><tr>${["ID", "Abertura", "Solicitante", "Setor / Andar", "Equipamento", "Problema", "Status", "Tempo"].map((t) => `<th scope="col">${t}</th>`).join("")}</tr></thead>
        <tbody>${lista.map((c) => `
          <tr title="${esc(c.tecnico ? `${c.tecnico}${c.solucao ? ": " + c.solucao : ""}` : "")}">
            <td class="mono">${podeVer(c) ? `<a href="#/chamados/${c.id}">${fmtId(c.id)}</a>` : fmtId(c.id)}</td>
            <td class="mono">${fmtData(c.aberto)}</td>
            <td>${esc(c.solicitante)}</td><td>${esc(c.setor)}</td><td>${esc(c.equipamento)}</td><td>${esc(c.tipo)}</td>
            <td>${seloStatus(c.status)}</td>
            <td class="mono">${tempoDe(c)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
      ${lista.length ? "" : vazio("ph-tray", "Nenhum chamado com esse status.")}
    </div>
    <p class="sheet__note">Dados de exemplo. Tudo fica salvo só no seu navegador.</p>`;

  $$("[data-filter]", v).forEach((b) => b.addEventListener("click", () => { filtro = b.dataset.filter; render(); }));
  $("#btnCsv", v).addEventListener("click", baixarCsv);
  $("#btnReset", v).addEventListener("click", async () => {
    if (!await confirmar("Restaurar os dados de exemplo?", "Os chamados, usuários e configurações voltam ao início.", "Restaurar")) return;
    const email = usuario.email;
    db = novoBanco();
    save();
    usuario = db.usuarios.find((u) => u.email === email) || null;
    if (!usuario) { sair(); return; }
    filtro = "todos";
    avisar("Planilha restaurada com os dados de exemplo.");
    render();
  });
}

function baixarCsv() {
  const cab = ["ID", "Data de Abertura", "Solicitante", "Setor/Andar", "Equipamento", "Tipo de Problema", "Status", "Técnico", "O que foi feito", "Data de Fechamento", "Tempo de Resolução (h)"];
  const linhas = db.chamados.map((c) => [
    fmtId(c.id), fmtData(c.aberto), c.solicitante, c.setor, c.equipamento, c.tipo, c.status,
    c.tecnico || "", c.solucao || "", c.fechado ? fmtData(c.fechado) : "",
    c.fechado ? horas(c.aberto, c.fechado).toFixed(1).replace(".", ",") : "",
  ]);
  const csv = [cab, ...linhas].map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "chamados-manutencao.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}
