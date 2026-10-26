// Inicialização da página.

/* ---------- Equipe ---------- */
$("#teamList").innerHTML = EQUIPE.map((n) => `<li>${esc(n)}</li>`).join("");

/* ---------- Revelação ao rolar ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
  });
}, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll(".reveal").forEach((el) => {
  const irmaos = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  el.style.setProperty("--d", `${irmaos.indexOf(el) * 80}ms`);
  io.observe(el);
});

renderAll();
try {
  const salvo = sessionStorage.getItem(SESSION_KEY);
  if (CONTAS[salvo]) entrar(salvo, false);
} catch (_) {}
