// Dados iniciais do site: equipe, contas de teste, catálogo e chamados de exemplo.
// Não existe banco de dados: tudo parte daqui e fica salvo só no navegador.

// Edite aqui os nomes do grupo
const EQUIPE = [
  "Caio Luiz",
  "Erick Mendes",
  "Gabriel Carlos",
  "Geovane Oliveira",
  "Guilherme Gomes",
  "Iasmin Lima",
  "José Victor Seibert",
  "Sofia Assis",
  "Thauan Almeida",
  "Vinicius Bisbo",
];

const SESSION_KEY = "chamado-aberto:sessao";
const STORAGE_KEY = "chamado-aberto:v3";

const PAPEIS = { funcionario: "Funcionário", suporte: "Suporte", admin: "Administrador" };
const SENHA_PADRAO = "123456789";

// Contas de demonstração (não é um login real)
const CONTAS_TESTE = ["funcionarioteste@gmail.com", "suportetestes@gmail.com", "admintestes@gmail.com"];

const conta = (nome, email, papel) => ({ nome, email, papel, senha: SENHA_PADRAO, ativo: true });

const USUARIOS_INICIAIS = [
  conta("Funcionário Teste", "funcionarioteste@gmail.com", "funcionario"),
  conta("Suporte Teste", "suportetestes@gmail.com", "suporte"),
  conta("Administrador Teste", "admintestes@gmail.com", "admin"),
  conta("Anderson Reis", "anderson.reis@empresa.com", "suporte"),
  conta("Wellington Prado", "wellington.prado@empresa.com", "suporte"),
  conta("Mariana Lopes", "mariana.lopes@empresa.com", "funcionario"),
  conta("Rafael Brito", "rafael.brito@empresa.com", "funcionario"),
  conta("Tainá Souza", "taina.souza@empresa.com", "funcionario"),
  conta("Lucas Andrade", "lucas.andrade@empresa.com", "funcionario"),
  conta("Jéssica Nunes", "jessica.nunes@empresa.com", "funcionario"),
  conta("Diego Santana", "diego.santana@empresa.com", "funcionario"),
  conta("Paula Cerqueira", "paula.cerqueira@empresa.com", "funcionario"),
];

const STATUS_INICIAIS = [
  { nome: "Aberto", inicial: true, final: false, pausa: false, ativo: true },
  { nome: "Em atendimento", inicial: false, final: false, pausa: false, ativo: true },
  { nome: "Aguardando peça", inicial: false, final: false, pausa: true, ativo: true },
  { nome: "Resolvido", inicial: false, final: true, pausa: false, ativo: true },
];

const CATALOGO_INICIAL = [
  { nome: "Elevadores", ativo: true, servicos: [{ nome: "Elevador social", ativo: true }, { nome: "Elevador de serviço", ativo: true }] },
  { nome: "Ar-condicionado", ativo: true, servicos: [{ nome: "Ar-condicionado", ativo: true }] },
];

const TIPOS = ["Não liga", "Ruído anormal", "Travamento", "Vazamento", "Temperatura irregular", "Outro"];

// Avaliações da pesquisa de satisfação
const NOTAS = [
  { valor: "Ótimo", icone: "ph-smiley-wink" },
  { valor: "Bom", icone: "ph-smiley" },
  { valor: "Regular", icone: "ph-smiley-meh" },
  { valor: "Ruim", icone: "ph-smiley-sad" },
  { valor: "Péssimo", icone: "ph-smiley-angry" },
];

// Dados de exemplo usados na simulação
const EXEMPLO = [
  { id: 1, aberto: "2026-10-19T08:12", fechado: "2026-10-19T11:47", solicitante: "Mariana Lopes", setor: "Recepção, térreo", equipamento: "Elevador social", tipo: "Travamento", status: "Resolvido", tecnico: "Anderson Reis", solucao: "Reset do quadro de comando e ajuste do sensor da porta" },
  { id: 2, aberto: "2026-10-19T13:30", fechado: "2026-10-20T09:05", solicitante: "Rafael Brito", setor: "Financeiro, 3º andar", equipamento: "Ar-condicionado", tipo: "Temperatura irregular", status: "Resolvido", tecnico: "Wellington Prado", solucao: "Limpeza dos filtros e recarga de gás" },
  { id: 3, aberto: "2026-10-21T09:40", fechado: "2026-10-21T15:18", solicitante: "Tainá Souza", setor: "RH, 2º andar", equipamento: "Ar-condicionado", tipo: "Vazamento", status: "Resolvido", tecnico: "Wellington Prado", solucao: "Desentupimento do dreno da evaporadora" },
  { id: 4, aberto: "2026-10-22T10:02", fechado: "2026-10-22T12:26", solicitante: "Lucas Andrade", setor: "Almoxarifado, subsolo", equipamento: "Elevador de serviço", tipo: "Ruído anormal", status: "Resolvido", tecnico: "Anderson Reis", solucao: "Lubrificação das guias da cabine" },
  { id: 5, aberto: "2026-10-23T14:55", fechado: "2026-10-24T10:31", solicitante: "Jéssica Nunes", setor: "Comercial, 4º andar", equipamento: "Ar-condicionado", tipo: "Não liga", status: "Resolvido", tecnico: "Wellington Prado", solucao: "Troca do capacitor do compressor" },
  { id: 6, aberto: "2026-10-26T08:20", fechado: null, solicitante: "Diego Santana", setor: "TI, 4º andar", equipamento: "Ar-condicionado", tipo: "Ruído anormal", status: "Em atendimento", tecnico: "Wellington Prado", solucao: "" },
  { id: 7, aberto: "2026-10-26T09:47", fechado: null, solicitante: "Paula Cerqueira", setor: "Diretoria, 5º andar", equipamento: "Elevador social", tipo: "Não liga", status: "Aberto" },
  { id: 8, aberto: "2026-10-27T10:15", fechado: "2026-10-27T16:40", solicitante: "Funcionário Teste", setor: "Compras, 2º andar", equipamento: "Ar-condicionado", tipo: "Vazamento", status: "Resolvido", tecnico: "Anderson Reis", solucao: "Vedação da bandeja de condensado" },
  { id: 9, aberto: "2026-11-03T11:05", fechado: null, solicitante: "Funcionário Teste", setor: "Compras, 2º andar", equipamento: "Elevador de serviço", tipo: "Travamento", status: "Aguardando peça", tecnico: "Anderson Reis", solucao: "", descricao: "A porta do elevador de serviço trava no 2º andar." },
];
