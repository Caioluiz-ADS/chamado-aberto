// Página "Sobre o projeto": a apresentação do trabalho do Jovem Protagonista (IEL Bahia).

function htmlSobre() {
  return `
    <div class="sobre">
      <header class="sobre__barra">
        <div class="wrap sobre__barra-in">
          <a href="#/chamados" class="brand"><span class="brand__mark" aria-hidden="true">CA</span><span class="brand__name">Chamado Aberto</span></a>
          <a href="#/chamados" class="btn btn--small">${usuario ? "Voltar aos chamados" : "Entrar no sistema"}</a>
        </div>
      </header>

      <main id="conteudo">
        <section class="hero">
          <div class="wrap hero__grid">
            <div>
              <p class="eyebrow">Projeto Jovem Protagonista · IEL Bahia</p>
              <h1>O elevador parou. <em>Quem ficou sabendo?</em></h1>
              <p class="lead">Criamos uma planilha que junta todos os chamados de manutenção num só lugar, para ninguém mais esperar sem resposta.</p>
            </div>
          </div>
        </section>

        <section class="problem">
          <div class="wrap">
            <h2 class="problem__statement">
              Ar-condicionado quebrado no 4º andar. Elevador travando no térreo.
              O aviso ia por mensagem, por corredor, por <span class="hl">“alguém já avisou?”</span>
              E ninguém sabia quanto tempo cada conserto levava.
            </h2>
            <div class="problem__grid">
              <div class="problem__item"><i class="ph ph-chats-circle" aria-hidden="true"></i><h3>Pedidos espalhados</h3><p>Cada solicitação chegava por um canal diferente e se perdia no meio do caminho.</p></div>
              <div class="problem__item"><i class="ph ph-clock-countdown" aria-hidden="true"></i><h3>Sem medida de tempo</h3><p>Não existia registro de quando o chamado abria e quando o problema era resolvido.</p></div>
              <div class="problem__item"><i class="ph ph-repeat" aria-hidden="true"></i><h3>Falhas que se repetem</h3><p>Sem histórico, ninguém conseguia apontar qual equipamento quebrava com mais frequência.</p></div>
            </div>
            <p class="problem__credit">O gargalo foi observado no dia a dia da empresa por <strong>Erick Mendes</strong>, um dos jovens aprendizes do grupo.</p>
          </div>
        </section>

        <section class="method">
          <div class="wrap">
            <h2 class="section-title">Do corredor à planilha, em cinco movimentos</h2>
            <ol class="track">
              <li class="track__step"><span class="track__icon"><i class="ph ph-eye" aria-hidden="true"></i></span><h3>Observar</h3><p>Erick identificou a demora nas manutenções de elevadores e ar-condicionado.</p></li>
              <li class="track__step"><span class="track__icon"><i class="ph ph-users-three" aria-hidden="true"></i></span><h3>Conversar</h3><p>O grupo discutiu como o fluxo de chamados poderia ficar mais simples e rápido.</p></li>
              <li class="track__step"><span class="track__icon"><i class="ph ph-check-square-offset" aria-hidden="true"></i></span><h3>Escolher</h3><p>A solução: uma planilha padronizada, acessível a todos e fácil de acompanhar.</p></li>
              <li class="track__step"><span class="track__icon"><i class="ph ph-table" aria-hidden="true"></i></span><h3>Construir</h3><p>Montamos os campos: ID, data, solicitante, setor, equipamento, descrição, status e tempo.</p></li>
              <li class="track__step"><span class="track__icon"><i class="ph ph-flask" aria-hidden="true"></i></span><h3>Testar</h3><p>Simulamos chamados reais e validamos o cálculo automático do tempo de resposta.</p></li>
            </ol>
          </div>
        </section>

        <section class="flow">
          <div class="wrap">
            <h2 class="section-title">Dois perfis, uma planilha</h2>
            <p class="section-sub">Ninguém edita a planilha na mão. Quem pede abre o chamado, o suporte atualiza, e a planilha organiza tudo sozinha.</p>
            <div class="flow__grid">
              <div class="lane">
                <h3 class="lane__title"><i class="ph ph-user" aria-hidden="true"></i> Quem pede</h3>
                <ol class="lane__steps">
                  <li><strong>Abre o chamado</strong><span>Informa setor, equipamento e o tipo de problema.</span></li>
                  <li><strong>Recebe o número do chamado</strong><span>Com o ID (ex.: CH-0010) dá para acompanhar o andamento.</span></li>
                  <li><strong>Consulta o status</strong><span>Vê se está aberto, em atendimento ou resolvido, e avalia o atendimento.</span></li>
                </ol>
              </div>
              <div class="hub">
                <i class="ph ph-table" aria-hidden="true"></i>
                <h3>Planilha</h3>
                <ul>
                  <li>Gera o ID e a data de abertura</li>
                  <li>Guarda quem atendeu e o que foi feito</li>
                  <li>Calcula o tempo de resolução</li>
                  <li>Mostra o equipamento que mais falha</li>
                </ul>
              </div>
              <div class="lane">
                <h3 class="lane__title"><i class="ph ph-wrench" aria-hidden="true"></i> Suporte</h3>
                <ol class="lane__steps">
                  <li><strong>Vê os chamados em aberto</strong><span>A fila mostra todos os chamados e a situação de cada um.</span></li>
                  <li><strong>Inicia o atendimento</strong><span>No chamado, escolhe o técnico responsável e muda o status.</span></li>
                  <li><strong>Conclui o chamado</strong><span>Diz o que foi feito. O status vira Resolvido.</span></li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section class="results">
          <div class="wrap">
            <h2 class="section-title">O que muda com a planilha</h2>
            <div class="bento">
              <article class="bento__cell bento__cell--feature"><i class="ph ph-magnifying-glass" aria-hidden="true"></i><h3>Histórico transparente</h3><p>Todo chamado fica registrado, do pedido até a solução. Qualquer pessoa consegue consultar o andamento.</p></article>
              <article class="bento__cell bento__cell--accent"><i class="ph ph-warning-diamond" aria-hidden="true"></i><h3>Falhas recorrentes à vista</h3><p>Fica fácil enxergar qual equipamento mais quebra e agir na causa.</p></article>
              <article class="bento__cell bento__cell--dark"><i class="ph ph-timer" aria-hidden="true"></i><h3>Tempo médio medido</h3><p>O setor de manutenção passa a ter um número real para acompanhar e melhorar.</p></article>
              <article class="bento__cell bento__cell--skills">
                <h3>O que a gente aprendeu</h3>
                <ul class="skills"><li>Trabalho em equipe</li><li>Capacidade analítica</li><li>Responsabilidade</li><li>Protagonismo jovem</li></ul>
              </article>
            </div>
          </div>
        </section>

        <section class="closing">
          <div class="wrap closing__inner">
            <p class="eyebrow">Conclusão</p>
            <p class="closing__text">Pequenos ajustes na comunicação geram grande impacto na rotina. Mesmo em formação, <strong>aprendizes conseguem propor mudanças reais</strong> dentro da empresa.</p>
            <div class="next">
              <i class="ph ph-arrow-bend-down-right" aria-hidden="true"></i>
              <div>
                <h3>Próximo passo</h3>
                <p>Automatizar a abertura de chamados com formulários digitais (Google Forms ou Microsoft Forms) ligados direto à planilha.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer class="footer">
        <div class="wrap footer__grid">
          <div>
            <span class="brand"><span class="brand__mark" aria-hidden="true">CA</span><span class="brand__name">Chamado Aberto</span></span>
            <p class="footer__about">Projeto desenvolvido por jovens aprendizes no programa Jovem Protagonista do IEL Bahia, 2026.</p>
          </div>
          <div>
            <h2 class="footer__h">Equipe</h2>
            <ul class="team">${EQUIPE.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
          </div>
          <div>
            <h2 class="footer__h">Referência</h2>
            <p class="ref">INSTITUTO EUVALDO LODI (IEL Bahia). <em>Diretrizes do Projeto Jovem Protagonista.</em> Salvador, 2026.</p>
          </div>
        </div>
      </footer>
    </div>`;
}
