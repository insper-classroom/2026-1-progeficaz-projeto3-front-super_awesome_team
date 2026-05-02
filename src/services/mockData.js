// Dados simulados por período — mesma estrutura que a API vai retornar.
// Quando o backend estiver pronto, só remover o uso deste arquivo em useVisaoGeral.js.

const membros = [
  { id: '1', nome: 'Brenda', iniciais: 'B', cor: '#ff2d87', foto: null },
  { id: '2', nome: 'João',   iniciais: 'J', cor: '#7c2fff', foto: null },
]

const categorias = [
  { nome: 'Alimentação', valor: 710,  pct: 38, cor: '#ff2d87' },
  { nome: 'Transporte',  valor: 447,  pct: 24, cor: '#ff9f00' },
  { nome: 'Lazer',       valor: 372,  pct: 20, cor: '#7c2fff' },
  { nome: 'Outros',      valor: 331,  pct: 18, cor: '#03fc83' },
]

const categoriasPrev = [
  { nome: 'Alimentação', valor: 806,  variacaoPct: -12 },
  { nome: 'Transporte',  valor: 812,  variacaoPct: -45 },
  { nome: 'Lazer',       valor: 186,  variacaoPct: 100 },
  { nome: 'Outros',      valor: 447,  variacaoPct: -65 },
]

const metas = [
  {
    id: '1',
    nome: 'Entrada do Apê',
    emoji: '🏠',
    prazo: 'jun. 2026',       // texto exibido na tela
    prazoData: '2026-06',     // formato AAAA-MM usado para calcular dias restantes
    alcancado: 8600,
    total: 10000,
    situacao: 'noRitmo',      // 'noRitmo' = barra verde | 'atencao' = barra laranja
    tipo: 'grupo',            // 'grupo' = todos participam | 'pessoal' = só um membro
    membrosIds: ['1', '2'],   // IDs dos membros que participam desta meta
  },
  {
    id: '2',
    nome: 'Viagem de Férias',
    emoji: '✈️',
    prazo: 'dez. 2026',
    prazoData: '2026-12',
    alcancado: 2500,
    total: 5000,
    situacao: 'atencao',
    tipo: 'grupo',
    membrosIds: ['1', '2'],
  },
  {
    id: '3',
    nome: 'Reserva de Emergência',
    emoji: '🛡️',
    prazo: 'jun. 2027',
    prazoData: '2027-06',
    alcancado: 7200,
    total: 10000,
    situacao: 'noRitmo',
    tipo: 'pessoal',
    membrosIds: ['1'],
  },
  {
    id: '4',
    nome: 'Móveis da Sala',
    emoji: '🪑',
    prazo: 'set. 2026',
    prazoData: '2026-09',
    alcancado: 980,
    total: 3000,
    situacao: 'atencao',
    tipo: 'pessoal',
    membrosIds: ['2'],
  },
  {
    id: '5',
    nome: 'Reforma da Cozinha',
    emoji: '🔨',
    prazo: 'mar. 2027',
    prazoData: '2027-03',
    alcancado: 1200,
    total: 8000,
    situacao: 'noRitmo',
    tipo: 'grupo',
    membrosIds: ['1', '2'],
  },
]

// Evolução de gastos: valores cumulativos (7d, 30d) ou totais mensais (3m, 6m, 1a)
const evolucao = {
  '7d': {
    curr: [45, 125, 155, 250, 245, 245, 312],
    prev: [55, 150, 195, 295, 335, 375, 407],
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    cumulativo: true,
  },
  '30d': {
    curr: [30,100,155,200,245,280,312,380,450,520,600,680,720,760,820,880,960,1010,1080,1180,1280,1380,1450,1540,1620,1680,1730,1780,1830,1860],
    prev: [40,120,190,250,310,380,450,530,620,700,790,880,970,1060,1150,1240,1330,1400,1480,1580,1680,1790,1880,1960,2040,2110,2170,2210,2230,2251],
    labels: ['1', '10', '20', '30'],
    cumulativo: true,
  },
  '3m': {
    curr: [2100, 2251, 1860],
    prev: [1980, 2100, 2251],
    labels: ['Fev', 'Mar', 'Abr'],
    cumulativo: false,
  },
  '6m': {
    curr: [1980, 2450, 2300, 2100, 2251, 1860],
    prev: [1750, 1980, 2450, 2300, 2100, 2251],
    labels: ['Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr'],
    cumulativo: false,
  },
  '1a': {
    curr: [1820,2100,1750,1680,1950,2200,2400,2100,1980,2100,2251,1860],
    prev: [1650,1900,1600,1550,1800,2050,2200,1950,1820,1980,2100,2251],
    labels: ['Mai','Jun','Jul','Ago','Set','Out','Nov','Dez','Jan','Fev','Mar','Abr'],
    cumulativo: false,
  },
}

const totaisPorPeriodo = {
  '7d':  { atual: 312,    anterior: 407   },
  '30d': { atual: 1860,   anterior: 2251  },
  '3m':  { atual: 6211,   anterior: 6331  },
  '6m':  { atual: 12941,  anterior: 11960 },
  '1a':  { atual: 24191,  anterior: 22590 },
}

// Saldo fixo — representa o que o usuário deve ao grupo no mês atual.
// Não muda com o filtro de período (é uma dívida presente, não histórica).
const voceDeVeAtual = 120

export function getMockVisaoGeral(grupoId, periodo = '30d') {
  const { atual, anterior } = totaisPorPeriodo[periodo]
  return {
    grupo: {
      id: grupoId,
      nome: 'Casa com João',
      membros,
    },
    totalAtual: atual,
    totalAnterior: anterior,
    voceDeVe: voceDeVeAtual,
    categorias,
    categoriasPrev,
    evolucao: evolucao[periodo],
    metas,
  }
}
