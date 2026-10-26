// Login de demonstração (funcionário e suporte).

function entrar(chave, focar) {
  perfil = chave;
  try { sessionStorage.setItem(SESSION_KEY, chave); } catch (_) {}
  const conta = CONTAS[chave];
  $("#loginForm").hidden = true;
  $("#sessionBar").hidden = false;
  $("#sessionRole").textContent = conta.papel;
  $("#sessionEmail").textContent = conta.email;
  $("#sessionIcon").innerHTML = `<i class="ph-bold ${conta.icone}"></i>`;
  $("#ticketForm").hidden = chave !== "funcionario";
  $("#supportForm").hidden = chave !== "suporte";
  if (chave === "funcionario") $("#fSolicitante").value = conta.nome;
  if (chave === "suporte") $("#sTecnico").value = conta.nome;
  $("#formOk").textContent = "";
  renderSheet();
  if (focar) (chave === "funcionario" ? $("#fSetor") : $("#sChamado")).focus();
}

function sair() {
  perfil = null;
  try { sessionStorage.removeItem(SESSION_KEY); } catch (_) {}
  $("#loginForm").reset();
  $("#loginForm").hidden = false;
  $("#sessionBar").hidden = true;
  $("#ticketForm").hidden = true;
  $("#supportForm").hidden = true;
  $("#formOk").textContent = "";
  renderSheet();
  $("#lEmail").focus();
}

$("#loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("#lEmail").value.trim().toLowerCase();
  const senha = $("#lSenha").value;
  const chave = Object.keys(CONTAS).find((k) => CONTAS[k].email === email && CONTAS[k].senha === senha);
  const msg = !email || !senha ? "Preencha e-mail e senha." : !chave ? "E-mail ou senha incorretos." : "";
  $("#eLogin").textContent = msg;
  $("#lSenha").closest(".field").classList.toggle("has-error", !!msg);
  if (msg) { (email ? $("#lSenha") : $("#lEmail")).focus(); return; }
  entrar(chave, true);
});

document.querySelectorAll("[data-conta]").forEach((b) => b.addEventListener("click", () => {
  const conta = CONTAS[b.dataset.conta];
  $("#lEmail").value = conta.email;
  $("#lSenha").value = conta.senha;
  $("#eLogin").textContent = "";
  $("#lSenha").closest(".field").classList.remove("has-error");
  $("#loginForm").querySelector('button[type="submit"]').focus();
}));

$("#btnSair").addEventListener("click", sair);
