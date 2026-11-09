# Chamado Aberto

Sistema de chamados de manutenção de elevadores e ar-condicionado, do projeto **Jovem Protagonista (IEL Bahia)**. É um protótipo ilustrativo: não tem banco de dados e tudo fica salvo só no navegador de quem usa.

**Acesse:** https://caioluiz-ads.github.io/chamado-aberto/

## O problema

Os pedidos de manutenção chegavam por canais diferentes (mensagem, corredor, "alguém já avisou?") e se perdiam no caminho. Não havia registro de quando um chamado era aberto ou resolvido, nem de quais equipamentos quebravam com mais frequência.

## O que o sistema faz

| Perfil | O que faz |
| --- | --- |
| Funcionário | Abre chamados, acompanha os seus, comenta, anexa, avalia o atendimento e reabre dentro do prazo |
| Suporte | Vê todos os chamados, define o responsável, muda o status, diz o que foi feito e abre chamado em nome de alguém |
| Administrador | Além do suporte, cuida de usuários, status, catálogo, prazo de reabertura e auditoria |

A **Planilha** continua com os campos ID, Data de Abertura, Solicitante, Setor/Andar, Equipamento, Tipo de Problema, Status e Tempo de Resolução, calcula o tempo médio e o equipamento com mais falhas, filtra por status e exporta em CSV.

## Contas de teste

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Funcionário | funcionarioteste@gmail.com | 123456789 |
| Suporte | suportetestes@gmail.com | 123456789 |
| Administrador | admintestes@gmail.com | 123456789 |

1. Entre como **funcionário** e abra um chamado.
2. Saia e entre como **suporte**. Abra o chamado, escolha o responsável e mude o status para **Resolvido**.
3. Volte como **funcionário** e responda a pesquisa de satisfação.
4. Em **Planilha**, use **Baixar CSV** para abrir no Excel, ou **Restaurar exemplo** para recomeçar.

> O login é uma simulação para apresentação. Não use senhas reais.

## Estrutura

```
chamado-aberto/
├── index.html
├── css/
│   ├── base.css        # Cores, tipografia, botões e formulários
│   ├── app.css         # Login, menu, listas, painel e administração
│   └── secoes.css      # Página Sobre o projeto
└── js/
    ├── dados.js        # Equipe, contas de teste, catálogo e chamados de exemplo
    ├── utils.js        # Formatação e ajudantes de tela
    ├── estado.js       # Dados salvos no navegador e regras dos chamados
    ├── ui.js           # Menu, barra superior, avisos e confirmação
    ├── conta.js        # Login, notificações, senha e pesquisa de satisfação
    ├── chamados.js     # Lista de chamados, planilha e CSV
    ├── painel.js       # Novo chamado e detalhe do chamado
    ├── admin.js        # Usuários, status, catálogo e auditoria
    ├── sobre.js        # Página Sobre o projeto
    └── main.js         # Navegação entre as telas
```

Feito com HTML, CSS e JavaScript puros, sem instalação. Para rodar no computador, basta abrir o `index.html` no navegador.

## Equipe

Caio Luiz · Erick Mendes · Gabriel Carlos · Geovane Oliveira · Guilherme Gomes · Iasmin Lima · José Victor Seibert · Sofia Assis · Thauan Almeida · Vinicius Bisbo

## Referência

INSTITUTO EUVALDO LODI (IEL Bahia). *Diretrizes do Projeto Jovem Protagonista.* Salvador, 2026.
