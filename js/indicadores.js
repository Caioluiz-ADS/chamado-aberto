// Indicadores (administrador e técnico): números e gráficos dos chamados.
// Gráficos feitos em HTML/CSS, sem biblioteca, para seguirem o tema claro ou escuro.

let periodoInd = 30;
const PERIODOS = [[7, "7 dias"], [30, "30 dias"], [90, "90 dias"], ["todos", "Tudo"]];
const DIA = 864e5;

const chaveDia = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const rotuloDia = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
const inicioDoDia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

function inicioPeriodo() {
  const hoje = inicioDoDia(new Date());
  if (periodoInd !== "todos") return new Date(hoje - (periodoInd - 1) * DIA);
  const primeiro = db.chamados.reduce((m, c) => Math.min(m, new Date(c.aberto)), hoje);
  return inicioDoDia(new Date(primeiro));
}

// Chamados abertos por dia; períodos longos viram semanas para as colunas não ficarem finas demais.
function porDia(lista, inicio) {
  const hoje = inicioDoDia(new Date());
  const dias = Math.round((hoje - inicio) / DIA) + 1;
  const passo = dias > 60 ? 7 : 1;
  const grupos = [];
  for (let t = +inicio; t <= +hoje; t += passo * DIA) {
    const d = new Date(t);
    grupos.push({ inicio: d, fim: new Date(t + passo * DIA), valor: 0 });
  }
  lista.forEach((c) => {
    const g = grupos.find((x) => new Date(c.aberto) >= x.inicio && new Date(c.aberto) < x.fim);
    if (g) g.valor++;
  });
  return grupos.map((g) => ({
    rotulo: rotuloDia(g.inicio),
    valor: g.valor,
    dica: passo === 1
      ? `${rotuloDia(g.inicio)}: ${g.valor} ${g.valor === 1 ? "chamado" : "chamados"}`
      : `Semana de ${rotuloDia(g.inicio)}: ${g.valor} ${g.valor === 1 ? "chamado" : "chamados"}`,
  }));
}

function contar(lista, campo) {
  const m = new Map();
  lista.forEach((c) => m.set(c[campo], (m.get(c[campo]) || 0) + 1));
  return [...m].map(([rotulo, valor]) => ({ rotulo, valor })).sort((a, b) => b.valor - a.valor);
}

/* ---------- Peças dos gráficos ---------- */

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

function tabelaDados(colunas, linhas) {
  return `
    <details class="g-tabela">
      <summary>Ver dados em tabela</summary>
      <table>
        <thead><tr>${colunas.map((c) => `<th scope="col">${c}</th>`).join("")}</tr></thead>
        <tbody>${linhas.map((l) => `<tr>${l.map((v) => `<td>${esc(v)}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </details>`;
}

function cartaoGrafico(titulo, subtitulo, corpo, largo = false) {
  return `
    <section class="g-cartao ${largo ? "g-cartao--largo" : ""}">
      <h2>${esc(titulo)}</h2>
      <p class="muted">${esc(subtitulo)}</p>
      ${corpo}
    </section>`;
}

// Colunas verticais (série única, no tempo).
function graficoColunas(itens, descricao) {
  const max = Math.max(1, ...itens.map((i) => i.valor));
  // No máximo umas 6 datas no eixo, para caberem até no celular.
  const salto = Math.ceil(itens.length / 6);
  return `
    <div class="g-colunas" role="img" aria-label="${esc(descricao)}">
      <span class="g-colunas__max">${max}</span>
      <div class="g-colunas__area">
        ${itens.map((i, n) => `
          <div class="g-col" data-dica="${esc(i.dica)}" style="--n:${n}">
            <span class="g-col__barra" style="--v:${(i.valor / max) * 100}%"></span>
          </div>`).join("")}
      </div>
      <div class="g-colunas__eixo" aria-hidden="true">
        ${itens.map((i, n) => `<span>${n % salto === 0 ? i.rotulo : ""}</span>`).join("")}
      </div>
    </div>
    ${tabelaDados(["Data", "Chamados"], itens.map((i) => [i.rotulo, i.valor]))}`;
}

// Barras horizontais (série única, comparação entre categorias), com o valor escrito ao lado.
function graficoBarras(itens, descricao, cabecalhoTabela) {
  if (!itens.length) return `<p class="g-vazio">Sem dados no período.</p>`;
  const max = Math.max(1, ...itens.map((i) => i.valor));
  return `
    <ul class="g-barras" role="img" aria-label="${esc(descricao)}">
      ${itens.map((i, n) => `
        <li data-dica="${esc(i.dica || `${i.rotulo}: ${i.texto ?? i.valor}`)}" style="--n:${n}">
          <span class="g-barras__rotulo">${esc(i.rotulo)}</span>
          <span class="g-barras__trilha"><span class="g-barras__barra" style="--v:${(i.valor / max) * 100}%"></span></span>
          <span class="g-barras__valor">${esc(i.texto ?? i.valor)}</span>
        </li>`).join("")}
    </ul>
    ${tabelaDados(cabecalhoTabela, itens.map((i) => [i.rotulo, i.texto ?? i.valor]))}`;
}

/* ---------- Página ---------- */

function paginaIndicadores(v) {
  const inicio = inicioPeriodo();
  const lista = db.chamados.filter((c) => new Date(c.aberto) >= inicio);
  const fechados = lista.filter((c) => c.fechado);
  const media = fechados.length ? fmtDuracao(fechados.reduce((s, c) => s + horas(c.aberto, c.fechado), 0) / fechados.length) : "-";
  const emAberto = db.chamados.filter((c) => !estaFinal(c)).length;
  const avaliados = lista.filter((c) => c.pesquisa);
  const positivos = avaliados.filter((c) => ["Ótimo", "Bom"].includes(c.pesquisa.nota)).length;

  const ordemStatus = db.status.map((s) => s.nome);
  const status = contar(lista, "status").sort((a, b) => ordemStatus.indexOf(a.rotulo) - ordemStatus.indexOf(b.rotulo));

  const porTecnico = new Map();
  fechados.filter((c) => c.tecnico).forEach((c) => {
    const t = porTecnico.get(c.tecnico) || { soma: 0, n: 0 };
    t.soma += horas(c.aberto, c.fechado);
    t.n++;
    porTecnico.set(c.tecnico, t);
  });
  const tempos = [...porTecnico].map(([rotulo, t]) => ({
    rotulo, valor: t.soma / t.n, texto: fmtDuracao(t.soma / t.n),
    dica: `${rotulo}: ${fmtDuracao(t.soma / t.n)} em média (${plural(t.n, "chamado", "chamados")})`,
  })).sort((a, b) => a.valor - b.valor);

  const notas = NOTAS.map((n) => ({ rotulo: n.valor, valor: avaliados.filter((c) => c.pesquisa.nota === n.valor).length }));
  const dias = porDia(lista, inicio);

  v.innerHTML = cabecalho("Indicadores", "Como estão os chamados de manutenção no período escolhido.", "ph-chart-bar") + `
    <div class="filters g-periodo" role="group" aria-label="Período">
      ${PERIODOS.map(([val, rot]) => `<button class="chip ${periodoInd === val ? "is-on" : ""}" data-periodo="${val}" aria-pressed="${periodoInd === val}">${rot}</button>`).join("")}
    </div>
    <div class="ind-kpis">
      <div class="kpi"><span class="kpi__label">Abertos no período</span><span class="kpi__value">${lista.length}</span></div>
      <div class="kpi"><span class="kpi__label">Em aberto agora</span><span class="kpi__value">${emAberto}</span></div>
      <div class="kpi"><span class="kpi__label">Tempo médio de resolução</span><span class="kpi__value">${media}</span></div>
      <div class="kpi"><span class="kpi__label">Avaliações boas</span><span class="kpi__value">${avaliados.length ? Math.round((positivos / avaliados.length) * 100) + "%" : "-"}</span><span class="kpi__nota">${avaliados.length ? `Ótimo ou Bom, de ${plural(avaliados.length, "avaliação", "avaliações")}` : "Nenhuma avaliação"}</span></div>
    </div>
    <div class="g-grade">
      ${cartaoGrafico("Chamados abertos", dias.length > 60 ? "Por semana" : "Por dia", graficoColunas(dias, `Chamados abertos por ${dias.length > 60 ? "semana" : "dia"} no período`), true)}
      ${cartaoGrafico("Por status", "Situação dos chamados abertos no período", graficoBarras(status.map((s) => ({ ...s, dica: `${s.rotulo}: ${plural(s.valor, "chamado", "chamados")}` })), "Chamados por status", ["Status", "Chamados"]))}
      ${cartaoGrafico("Por equipamento", "Onde estão as falhas", graficoBarras(contar(lista, "equipamento").map((s) => ({ ...s, dica: `${s.rotulo}: ${plural(s.valor, "chamado", "chamados")}` })), "Chamados por equipamento", ["Equipamento", "Chamados"]))}
      ${cartaoGrafico("Tempo médio por técnico", "Do chamado aberto até resolvido; menor é melhor", graficoBarras(tempos, "Tempo médio de resolução por técnico", ["Técnico", "Tempo médio"]))}
      ${cartaoGrafico("Pesquisa de satisfação", plural(avaliados.length, "avaliação no período", "avaliações no período"), avaliados.length ? graficoBarras(notas.map((s) => ({ ...s, dica: `${s.rotulo}: ${plural(s.valor, "avaliação", "avaliações")}` })), "Respostas da pesquisa de satisfação", ["Avaliação", "Respostas"]) : `<p class="g-vazio">Nenhuma avaliação no período.</p>`)}
    </div>`;

  $$("[data-periodo]", v).forEach((b) => b.addEventListener("click", () => {
    periodoInd = b.dataset.periodo === "todos" ? "todos" : Number(b.dataset.periodo);
    entradaForcada = true;
    render();
  }));
}

/* ---------- Dica ao passar o mouse ---------- */

const dica = document.createElement("div");
dica.className = "g-dica";
dica.setAttribute("role", "tooltip");
dica.hidden = true;
document.body.appendChild(dica);

document.addEventListener("pointermove", (e) => {
  const alvo = e.target.closest && e.target.closest("[data-dica]");
  if (!alvo) { dica.hidden = true; return; }
  dica.textContent = alvo.dataset.dica;
  dica.hidden = false;
  const larg = dica.offsetWidth;
  const x = Math.min(Math.max(8, e.clientX - larg / 2), innerWidth - larg - 8);
  dica.style.left = `${x}px`;
  dica.style.top = `${Math.max(8, e.clientY - dica.offsetHeight - 14)}px`;
});
document.addEventListener("pointerleave", () => { dica.hidden = true; });
window.addEventListener("hashchange", () => { dica.hidden = true; });
