// Formulários: abrir chamado (funcionário) e atualizar chamado (suporte).

function atualizarSolucaoOpt() {
  const concluir = document.querySelector('input[name="acao"]:checked').value === "Resolvido";
  $("#solucaoOpt").textContent = concluir ? "" : "(opcional)";
}
document.querySelectorAll('input[name="acao"]').forEach((r) => r.addEventListener("change", atualizarSolucaoOpt));

function marcarErro(campo, erro, msg) {
  const el = document.getElementById(campo);
  el.closest(".field").classList.toggle("has-error", !!msg);
  el.setAttribute("aria-invalid", !!msg);
  document.getElementById(erro).textContent = msg || "";
  return msg ? el : null;
}

$("#supportForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const acao = document.querySelector('input[name="acao"]:checked').value;
  const erros = [
    marcarErro("sChamado", "eChamado", $("#sChamado").value ? "" : "Escolha o chamado."),
    marcarErro("sTecnico", "eTecnico", $("#sTecnico").value.trim() ? "" : "Informe o técnico responsável."),
    marcarErro("sSolucao", "eSolucao", acao === "Resolvido" && !$("#sSolucao").value.trim() ? "Descreva o que foi feito para concluir." : ""),
  ].filter(Boolean);
  if (erros.length) { erros[0].focus(); $("#formOk").textContent = ""; return; }

  const c = chamados.find((x) => x.id === Number($("#sChamado").value));
  c.status = acao;
  c.tecnico = $("#sTecnico").value.trim();
  if ($("#sSolucao").value.trim()) c.solucao = $("#sSolucao").value.trim();
  if (acao === "Resolvido") c.fechado = nowLocal();
  novoId = c.id;
  save();
  renderAll();
  e.target.reset();
  $("#sTecnico").value = CONTAS.suporte.nome;
  atualizarSolucaoOpt();
  $("#formOk").textContent = acao === "Resolvido"
    ? `${fmtId(c.id)} concluído. O tempo de resolução já entrou na média.`
    : `${fmtId(c.id)} em atendimento com ${c.tecnico}.`;
});

const REGRAS = [
  ["fSolicitante", "eSolicitante", "Informe quem está abrindo o chamado."],
  ["fSetor", "eSetor", "Informe o setor ou andar."],
  ["fEquip", "eEquip", "Escolha o equipamento."],
  ["fTipo", "eTipo", "Escolha o tipo de problema."],
];

$("#ticketForm").addEventListener("submit", (e) => {
  e.preventDefault();
  let primeiroErro = null;
  REGRAS.forEach(([campo, erro, msg]) => {
    const el = document.getElementById(campo);
    const vazio = !el.value.trim();
    el.closest(".field").classList.toggle("has-error", vazio);
    el.setAttribute("aria-invalid", vazio);
    document.getElementById(erro).textContent = vazio ? msg : "";
    if (vazio && !primeiroErro) primeiroErro = el;
  });
  if (primeiroErro) { primeiroErro.focus(); $("#formOk").textContent = ""; return; }

  const id = Math.max(0, ...chamados.map((c) => c.id)) + 1;
  chamados.push({
    id,
    aberto: nowLocal(),
    fechado: null,
    solicitante: $("#fSolicitante").value.trim(),
    setor: $("#fSetor").value.trim(),
    equipamento: $("#fEquip").value,
    tipo: $("#fTipo").value,
    descricao: $("#fDesc").value.trim(),
    status: "Aberto",
  });
  novoId = id;
  save();
  if (filtro !== "todos" && filtro !== "Aberto") document.querySelector('[data-filter="todos"]').click();
  renderAll();
  e.target.reset();
  $("#fSolicitante").value = CONTAS.funcionario.nome;
  $("#formOk").textContent = `Chamado ${fmtId(id)} registrado. Ele já aparece na planilha.`;
});

document.querySelectorAll("#ticketForm, #supportForm").forEach((f) => f.addEventListener("input", (e) => {
  const field = e.target.closest(".field");
  if (field && field.classList.contains("has-error") && e.target.value.trim()) {
    field.classList.remove("has-error");
    field.querySelector(".field__error").textContent = "";
  }
}));
