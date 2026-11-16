// Fumaça interativa da tela de entrada: o mouse (ou o dedo) solta nuvens que sobem,
// crescem e somem. Só desenha enquanto há fumaça na tela, e não roda com as animações desligadas.

const MAX_NUVENS = 220;

function corDoTema(nome) {
  const hex = getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  const m = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [194, 65, 12];
}

function temaEscuro() {
  const [r, g, b] = corDoTema("--bg");
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

function iniciarFumaca() {
  const canvas = $(".fumaca");
  if (!canvas) return;
  const area = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  let nuvens = [];
  let quadro = null;
  let anterior = null;
  let ultimoTempo = 0;
  let cores = null;

  function ajustarTamanho() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  ajustarTamanho();
  const aoRedimensionar = () => {
    if (!canvas.isConnected) { window.removeEventListener("resize", aoRedimensionar); return; }
    ajustarTamanho();
  };
  window.addEventListener("resize", aoRedimensionar);

  function soltar(x, y, dx, dy) {
    if (!cores) {
      const escuro = temaEscuro();
      cores = {
        laranja: corDoTema("--accent"),
        cinza: escuro ? [170, 176, 186] : [120, 126, 136],
        modo: escuro ? "lighter" : "source-over",
      };
    }
    const velocidade = Math.hypot(dx, dy);
    const quantas = Math.min(4, 1 + Math.floor(velocidade / 14));
    for (let k = 0; k < quantas; k++) {
      nuvens.push({
        x: x + (Math.random() - .5) * 10,
        y: y + (Math.random() - .5) * 10,
        vx: dx * .04 + (Math.random() - .5) * .6,
        vy: dy * .03 - .35 - Math.random() * .5,
        r: 8 + Math.random() * 14,
        cresce: .35 + Math.random() * .5,
        vida: 0,
        duracao: 1.3 + Math.random() * 1.3,
        cor: Math.random() < .6 ? cores.laranja : cores.cinza,
        forca: .16 + Math.random() * .14,
      });
    }
    if (nuvens.length > MAX_NUVENS) nuvens.splice(0, nuvens.length - MAX_NUVENS);
    if (!quadro) { ultimoTempo = performance.now(); quadro = requestAnimationFrame(desenhar); }
  }

  function desenhar(agora) {
    quadro = null;
    const largura = canvas.clientWidth;
    const altura = canvas.clientHeight;
    ctx.clearRect(0, 0, largura, altura);
    if (!canvas.isConnected || !animacoesLigadas()) { nuvens = []; return; }
    const dt = Math.min(.05, (agora - ultimoTempo) / 1000);
    ultimoTempo = agora;
    ctx.globalCompositeOperation = cores.modo;
    nuvens = nuvens.filter((n) => (n.vida += dt / n.duracao) < 1);
    for (const n of nuvens) {
      n.x += n.vx * dt * 60;
      n.y += n.vy * dt * 60;
      n.vx *= .985;
      n.vy -= .008;
      n.r += n.cresce * dt * 60;
      const entrada = Math.min(1, n.vida / .12);
      const alfa = n.forca * entrada * Math.pow(1 - n.vida, 1.6);
      const [r, g, b] = n.cor;
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      grad.addColorStop(0, `rgba(${r},${g},${b},${alfa})`);
      grad.addColorStop(.45, `rgba(${r},${g},${b},${alfa * .5})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    if (nuvens.length) quadro = requestAnimationFrame(desenhar);
  }

  area.addEventListener("pointermove", (e) => {
    if (!animacoesLigadas()) return;
    const caixa = canvas.getBoundingClientRect();
    const x = e.clientX - caixa.left;
    const y = e.clientY - caixa.top;
    const dx = anterior ? x - anterior.x : 0;
    const dy = anterior ? y - anterior.y : 0;
    anterior = { x, y };
    soltar(x, y, dx, dy);
  });
  area.addEventListener("pointerleave", () => { anterior = null; });
  // Trocar o tema muda a cor da fumaça na próxima nuvem.
  const aoClicar = (e) => {
    if (!canvas.isConnected) { document.removeEventListener("click", aoClicar); return; }
    if (e.target.closest("[data-tema-btn]")) cores = null;
  };
  document.addEventListener("click", aoClicar);
}
