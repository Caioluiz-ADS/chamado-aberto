// Planilha: tabela, indicadores, filtros, CSV e chamados do topo.

/* ---------- Render ---------- */

function renderSheet() {
  const body = $("#sheetBody");
  const lista = [...chamados]
    .filter((c) => filtro === "todos" || c.status === filtro)
    .sort((a, b) => b.id - a.id);

  body.innerHTML = lista.map((c) => {
    const tempo = c.fechado
      ? fmtDuracao(horas(c.aberto, c.fechado))
      : `<span class="muted">há ${fmtDuracao(Math.max(0, horas(c.aberto, nowLocal())))}</span>`;
    const resolvido = c.status === "Resolvido";
    const travado = resolvido || perfil !== "suporte";
    const label = travado ? `Status ${c.status}` : `Status ${c.status}. Atualizar no formulário do suporte`;
    const dica = c.tecnico ? `${c.tecnico}${c.solucao ? ": " + c.solucao : ""}` : "";
    return `
      <tr data-id="${c.id}" class="${c.id === novoId ? "is-new" : ""}">
        <td class="mono">${fmtId(c.id)}</td>
        <td class="mono">${fmtData(c.aberto)}</td>
        <td>${esc(c.solicitante)}</td>
        <td>${esc(c.setor)}</td>
        <td>${esc(c.equipamento)}</td>
        <td>${esc(c.tipo)}</td>
        <td><button class="status ${statusClass(c.status)}" data-pick="${c.id}" aria-label="${label}" title="${esc(dica)}" ${travado ? "disabled" : ""}>
          <i class="ph-bold ${statusIcon(c.status)}" aria-hidden="true"></i>${c.status}</button></td>
        <td class="mono">${tempo}</td>
      </tr>`;
  }).join("");

  $("#emptyState").hidden = lista.length > 0;
  novoId = null;
}

function renderKpis() {
  const abertos = chamados.filter((c) => c.status !== "Resolvido").length;
  $("#kOpen").textContent = abertos;

  const resolvidos = chamados.filter((c) => c.fechado);
  if (resolvidos.length) {
    const media = resolvidos.reduce((s, c) => s + horas(c.aberto, c.fechado), 0) / resolvidos.length;
    $("#kAvg").textContent = fmtDuracao(media);
  } else {
    $("#kAvg").textContent = "-";
  }

  const cont = {};
  chamados.forEach((c) => {
    const chave = c.equipamento.startsWith("Elevador") ? "Elevadores" : c.equipamento;
    cont[chave] = (cont[chave] || 0) + 1;
  });
  const top = Object.entries(cont).sort((a, b) => b[1] - a[1])[0];
  $("#kTop").innerHTML = top ? `${esc(top[0])}<small>${top[1]} chamados</small>` : "-";
}

function renderHero() {
  const ultimos = [...chamados].sort((a, b) => b.id - a.id).slice(0, 3).reverse();
  $("#heroStack").innerHTML = ultimos.map((c, i) => `
    <li class="ticket" style="--i:${i}">
      <span class="ticket__icon"><i class="ph ${ICONS[c.equipamento] || "ph-wrench"}" aria-hidden="true"></i></span>
      <span class="ticket__id">${fmtId(c.id)}</span>
      <span class="status ${statusClass(c.status)}"><i class="ph-bold ${statusIcon(c.status)}" aria-hidden="true"></i>${c.status}</span>
      <span class="ticket__title">${esc(c.equipamento)}: ${esc(c.tipo.toLowerCase())}</span>
      <span class="ticket__meta">${esc(c.setor)} · aberto por ${esc(c.solicitante.split(" ")[0])}</span>
    </li>`).join("");
}

function renderSupportOptions() {
  const sel = $("#sChamado");
  const atual = sel.value;
  const pendentes = chamados.filter((c) => c.status !== "Resolvido").sort((a, b) => a.id - b.id);
  sel.innerHTML = pendentes.length
    ? `<option value="">Selecione</option>` + pendentes.map((c) =>
        `<option value="${c.id}">${fmtId(c.id)} · ${esc(c.equipamento)} (${c.status.toLowerCase()})</option>`).join("")
    : `<option value="">Nenhum chamado pendente</option>`;
  if (pendentes.some((c) => String(c.id) === atual)) sel.value = atual;
}

function renderAll() {
  renderSupportOptions();
  renderSheet();
  renderKpis();
  renderHero();
}

$("#sheetBody").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-pick]");
  if (!btn || btn.disabled) return;
  $("#sChamado").value = btn.dataset.pick;
  const c = chamados.find((x) => x.id === Number(btn.dataset.pick));
  if (c.status === "Em atendimento") {
    document.querySelector('input[name="acao"][value="Resolvido"]').checked = true;
    if (c.tecnico) $("#sTecnico").value = c.tecnico;
  }
  atualizarSolucaoOpt();
  $("#sChamado").closest(".panel__form").scrollIntoView({ behavior: "smooth", block: "nearest" });
  $("#sTecnico").focus({ preventScroll: true });
});

document.querySelectorAll("[data-filter]").forEach((chip) => {
  chip.addEventListener("click", () => {
    filtro = chip.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((c) => {
      c.classList.toggle("is-on", c === chip);
      c.setAttribute("aria-pressed", c === chip);
    });
    renderSheet();
  });
});

$("#btnReset").addEventListener("click", () => {
  chamados = structuredClone(EXEMPLO);
  save();
  renderAll();
  $("#formOk").textContent = "Planilha restaurada com os dados de exemplo.";
});

$("#btnCsv").addEventListener("click", () => {
  const cab = ["ID", "Data de Abertura", "Solicitante", "Setor/Andar", "Equipamento", "Tipo de Problema", "Status", "Técnico", "O que foi feito", "Data de Fechamento", "Tempo de Resolução (h)"];
  const linhas = chamados.map((c) => [
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
});
