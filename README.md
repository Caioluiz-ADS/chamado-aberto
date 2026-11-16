<img src="img/logo.svg" alt="" width="72" height="72">

# Chamado Aberto

Sistema de chamados de manutenção de elevadores e ar-condicionado, do projeto **Jovem Protagonista (IEL Bahia)**. É um protótipo ilustrativo.

Pode rodar de dois jeitos:

- **Com o servidor** (Node ou Docker): os dados ficam num banco SQLite e todo mundo vê os mesmos chamados. É o jeito de testar funcionário e suporte em navegadores ou aparelhos diferentes.
- **Sem servidor** (GitHub Pages ou abrindo o `index.html`): cada navegador guarda os próprios dados, então um chamado aberto num navegador não aparece em outro.

**Acesse:** https://caioluiz-ads.github.io/chamado-aberto/

## O problema

Os pedidos de manutenção chegavam por canais diferentes (mensagem, corredor, "alguém já avisou?") e se perdiam no caminho. Não havia registro de quando um chamado era aberto ou resolvido, nem de quais equipamentos quebravam com mais frequência.

## O que o sistema faz

| Perfil | O que faz |
| --- | --- |
| Funcionário | Abre chamados, acompanha os seus, comenta, anexa, avalia o atendimento e reabre dentro do prazo |
| Suporte | Vê todos os chamados, define o responsável, muda o status, diz o que foi feito e abre chamado em nome de alguém |
| Administrador | Além do suporte, cuida de usuários, status, catálogo, prazo de reabertura e auditoria |

O botão de tema (sol, lua ou meio círculo), na barra superior, no login e na página Sobre, alterna entre **Automático** (segue o sistema), **Claro** e **Escuro**. A escolha fica salva no navegador.

Suporte e administrador têm a página **Indicadores**, com números e gráficos do período escolhido (7, 30 ou 90 dias, ou tudo): chamados abertos por dia, por status, por equipamento, tempo médio de resolução por técnico e respostas da pesquisa de satisfação. Cada gráfico tem a opção **Ver dados em tabela**.

As animações ficam ligadas por padrão. O botão de brilho, na barra superior e na página Sobre, desliga e liga de novo; a escolha fica salva no navegador.

A **Planilha**, só para suporte e administrador, continua com os campos ID, Data de Abertura, Solicitante, Setor/Andar, Equipamento, Tipo de Problema, Status e Tempo de Resolução, calcula o tempo médio e o equipamento com mais falhas, filtra por status e exporta em CSV.

## Contas de teste

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Funcionário | funcionarioteste@gmail.com | 123456789 |
| Suporte | suportetestes@gmail.com | 123456789 |
| Administrador | admintestes@gmail.com | 123456789 |

1. Entre como **funcionário** e abra um chamado.
2. Saia e entre como **suporte**. Abra o chamado, escolha o responsável e mude o status para **Resolvido**.
3. Volte como **funcionário** e responda a pesquisa de satisfação.
4. Como suporte, em **Planilha**, use **Baixar CSV** para abrir no Excel, ou **Restaurar exemplo** para recomeçar.

Quando o administrador cadastra alguém em **Usuários**, o sistema gera uma **senha temporária** e mostra uma única vez. No primeiro acesso, a pessoa é levada a criar a própria senha antes de usar o sistema. Se alguém esquecer a senha, o administrador usa **Nova senha** na lista de usuários.

> O login é uma simulação para apresentação. Não use senhas reais.

## Rodando com banco de dados

Com o Node 24 ou mais novo, sem instalar nada:

```bash
npm start
```

Ou com o Docker:

```bash
docker compose up -d
```

Abra http://localhost:8080. O servidor também mostra o endereço para abrir no celular ou em outro computador da mesma rede (o Windows pode pedir para liberar no firewall). O banco fica em `dados/chamados.db`, ou no volume `dados` no Docker. Para começar do zero, use **Restaurar exemplo** na Planilha.

## Hospedando no Render

O arquivo `render.yaml` já deixa tudo configurado. No [Render](https://render.com), entre com a conta do GitHub, clique em **New > Blueprint**, escolha este repositório e confirme. Em alguns minutos o site fica num endereço `https://chamado-aberto-xxxx.onrender.com`.

No plano grátis, o serviço dorme depois de 15 minutos sem acesso e leva cerca de 1 minuto para acordar. Quando reinicia, os chamados voltam aos dados de exemplo. Antes de apresentar, abra o site uns minutos antes.

## Estrutura

```
chamado-aberto/
├── index.html
├── img/logo.svg        # Logo (balão de chamado com as setas do elevador)
├── server/server.js    # Entrega o site e guarda os dados no SQLite (API /api/estado)
├── Dockerfile
├── docker-compose.yml
├── render.yaml         # Configuração da hospedagem no Render
├── css/
│   ├── base.css        # Cores, tipografia, botões e formulários
│   ├── app.css         # Login, menu, listas, painel e administração
│   ├── animacoes.css   # Todas as animações (o botão desliga tudo)
│   └── secoes.css      # Página Sobre o projeto
└── js/
    ├── dados.js        # Equipe, contas de teste, catálogo e chamados de exemplo
    ├── utils.js        # Formatação e ajudantes de tela
    ├── estado.js       # Dados (servidor ou navegador) e regras dos chamados
    ├── ui.js           # Menu, barra superior, avisos e confirmação
    ├── conta.js        # Login, notificações, senha e pesquisa de satisfação
    ├── chamados.js     # Lista de chamados, planilha e CSV
    ├── painel.js       # Novo chamado e detalhe do chamado
    ├── admin.js        # Usuários, status, catálogo e auditoria
    ├── indicadores.js  # Gráficos para suporte e administrador
    ├── sobre.js        # Página Sobre o projeto
    └── main.js         # Navegação entre as telas
```

Feito com HTML, CSS e JavaScript puros. O servidor usa só o que já vem no Node, sem pacotes para instalar.

## Equipe

Caio Luiz · Erick Mendes · Gabriel Carlos · Geovane Oliveira · Guilherme Gomes · Iasmin Lima · José Victor Seibert · Sofia Assis · Thauan Almeida · Vinicius Bisbo

## Referência

INSTITUTO EUVALDO LODI (IEL Bahia). *Diretrizes do Projeto Jovem Protagonista.* Salvador, 2026.
