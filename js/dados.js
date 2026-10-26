// Dados do site: equipe, contas de teste e chamados de exemplo.

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

// Contas de demonstração do protótipo (não é um login real)
const CONTAS = {
  funcionario: { email: "funcionarioteste@gmail.com", senha: "123456789", papel: "Funcionário", nome: "Funcionário Teste", icone: "ph-user" },
  suporte: { email: "suportetestes@gmail.com", senha: "123456789", papel: "Suporte", nome: "Suporte Teste", icone: "ph-wrench" },
};
const SESSION_KEY = "chamado-aberto:sessao";

const STORAGE_KEY = "chamado-aberto:v2";
const ICONS = {
  "Elevador social": "ph-elevator",
  "Elevador de serviço": "ph-elevator",
  "Ar-condicionado": "ph-snowflake",
};

// Dados de exemplo usados na simulação
const EXEMPLO = [
  { id: 1, aberto: "2026-10-19T08:12", fechado: "2026-10-19T11:47", solicitante: "Mariana Lopes", setor: "Recepção, térreo", equipamento: "Elevador social", tipo: "Travamento", status: "Resolvido", tecnico: "Anderson Reis", solucao: "Reset do quadro de comando e ajuste do sensor da porta" },
  { id: 2, aberto: "2026-10-19T13:30", fechado: "2026-10-20T09:05", solicitante: "Rafael Brito", setor: "Financeiro, 3º andar", equipamento: "Ar-condicionado", tipo: "Temperatura irregular", status: "Resolvido", tecnico: "Wellington Prado", solucao: "Limpeza dos filtros e recarga de gás" },
  { id: 3, aberto: "2026-10-21T09:40", fechado: "2026-10-21T15:18", solicitante: "Tainá Souza", setor: "RH, 2º andar", equipamento: "Ar-condicionado", tipo: "Vazamento", status: "Resolvido", tecnico: "Wellington Prado", solucao: "Desentupimento do dreno da evaporadora" },
  { id: 4, aberto: "2026-10-22T10:02", fechado: "2026-10-22T12:26", solicitante: "Lucas Andrade", setor: "Almoxarifado, subsolo", equipamento: "Elevador de serviço", tipo: "Ruído anormal", status: "Resolvido", tecnico: "Anderson Reis", solucao: "Lubrificação das guias da cabine" },
  { id: 5, aberto: "2026-10-23T14:55", fechado: "2026-10-24T10:31", solicitante: "Jéssica Nunes", setor: "Comercial, 4º andar", equipamento: "Ar-condicionado", tipo: "Não liga", status: "Resolvido", tecnico: "Wellington Prado", solucao: "Troca do capacitor do compressor" },
  { id: 6, aberto: "2026-10-26T08:20", fechado: null, solicitante: "Diego Santana", setor: "TI, 4º andar", equipamento: "Ar-condicionado", tipo: "Ruído anormal", status: "Em atendimento", tecnico: "Wellington Prado", solucao: "" },
  { id: 7, aberto: "2026-10-26T09:47", fechado: null, solicitante: "Paula Cerqueira", setor: "Diretoria, 5º andar", equipamento: "Elevador social", tipo: "Não liga", status: "Aberto" },
];
