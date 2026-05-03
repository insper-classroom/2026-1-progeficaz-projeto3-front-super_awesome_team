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
    prazo: 'jun. 2026',
    prazoData: '2026-06',
    alcancado: 8600,
    total: 10000,
    situacao: 'noRitmo',
    tipo: 'grupo',
    membrosIds: ['1', '2'],
    aporteIdeal: 700,
    descricao: 'Ritmo atual cobre 86% do valor previsto. Falta alinhar um aporte extra de R$ 400 para chegar no prazo com folga.',
    proximoAporte: {
      valorTotal: 950,
      porMembro: [
        { membroId: '1', valor: 500 },
        { membroId: '2', valor: 450 },
      ],
    },
    evolucaoAportes: {
      '7d':  { realizados: [0, 500, 0, 0, 450, 0, 0],              ritmo: [140, 140, 140, 140, 140, 140, 140],   labels: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'] },
      '1m':  { realizados: [500, 0, 450, 0],                        ritmo: [700, 700, 700, 700],                  labels: ['1','10','20','30'] },
      '3m':  { realizados: [850, 920, 950],                          ritmo: [700, 700, 700],                       labels: ['Fev','Mar','Abr'] },
      '6m':  { realizados: [620, 750, 820, 850, 920, 950],           ritmo: [700, 700, 700, 700, 700, 700],        labels: ['Nov','Dez','Jan','Fev','Mar','Abr'] },
    },
    estatisticasAportes: {
      '7d':  { total: 950,  variacao: 18 },
      '1m':  { total: 950,  variacao: 18 },
      '3m':  { total: 2720, variacao: 12 },
      '6m':  { total: 4910, variacao: 18 },
    },
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
    aporteIdeal: 500,
    descricao: 'A meta está no meio do caminho, mas dezembro chega rápido. Um ajuste de R$ 180 no aporte mensal deixa o plano mais confortável.',
    proximoAporte: {
      valorTotal: 640,
      porMembro: [
        { membroId: '1', valor: 320 },
        { membroId: '2', valor: 320 },
      ],
    },
    evolucaoAportes: {
      '7d':  { realizados: [0, 320, 0, 0, 0, 0, 0],                 ritmo: [100, 100, 100, 100, 100, 100, 100],   labels: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'] },
      '1m':  { realizados: [320, 0, 0, 320],                         ritmo: [500, 500, 500, 500],                  labels: ['1','10','20','30'] },
      '3m':  { realizados: [280, 320, 320],                           ritmo: [500, 500, 500],                       labels: ['Fev','Mar','Abr'] },
      '6m':  { realizados: [350, 280, 400, 280, 320, 320],            ritmo: [500, 500, 500, 500, 500, 500],        labels: ['Nov','Dez','Jan','Fev','Mar','Abr'] },
    },
    estatisticasAportes: {
      '7d':  { total: 320,  variacao: -5 },
      '1m':  { total: 640,  variacao: -5 },
      '3m':  { total: 920,  variacao: -8 },
      '6m':  { total: 1950, variacao: -5 },
    },
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
    aporteIdeal: 600,
    descricao: 'Boa consistência de aportes. Mantendo R$ 600 por mês, a reserva fecha antes do prazo previsto.',
    proximoAporte: {
      valorTotal: 600,
      porMembro: [
        { membroId: '1', valor: 600 },
      ],
    },
    evolucaoAportes: {
      '7d':  { realizados: [0, 0, 600, 0, 0, 0, 0],                 ritmo: [100, 100, 100, 100, 100, 100, 100],   labels: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'] },
      '1m':  { realizados: [600, 0, 0, 0],                           ritmo: [600, 600, 600, 600],                  labels: ['1','10','20','30'] },
      '3m':  { realizados: [580, 600, 620],                           ritmo: [600, 600, 600],                       labels: ['Fev','Mar','Abr'] },
      '6m':  { realizados: [540, 560, 580, 580, 600, 620],            ritmo: [600, 600, 600, 600, 600, 600],        labels: ['Nov','Dez','Jan','Fev','Mar','Abr'] },
    },
    estatisticasAportes: {
      '7d':  { total: 600,  variacao: 12 },
      '1m':  { total: 600,  variacao: 12 },
      '3m':  { total: 1800, variacao: 8  },
      '6m':  { total: 3480, variacao: 12 },
    },
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
    aporteIdeal: 350,
    descricao: 'Meta em atenção. O ritmo atual está abaixo do necessário para atingir o objetivo até setembro.',
    proximoAporte: {
      valorTotal: 350,
      porMembro: [
        { membroId: '2', valor: 350 },
      ],
    },
    evolucaoAportes: {
      '7d':  { realizados: [0, 0, 0, 250, 0, 0, 0],                 ritmo: [80, 80, 80, 80, 80, 80, 80],         labels: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'] },
      '1m':  { realizados: [0, 250, 0, 0],                           ritmo: [350, 350, 350, 350],                 labels: ['1','10','20','30'] },
      '3m':  { realizados: [200, 250, 250],                           ritmo: [350, 350, 350],                      labels: ['Fev','Mar','Abr'] },
      '6m':  { realizados: [150, 180, 200, 200, 250, 250],            ritmo: [350, 350, 350, 350, 350, 350],       labels: ['Nov','Dez','Jan','Fev','Mar','Abr'] },
    },
    estatisticasAportes: {
      '7d':  { total: 250,  variacao: 40  },
      '1m':  { total: 250,  variacao: -15 },
      '3m':  { total: 700,  variacao: -20 },
      '6m':  { total: 1230, variacao: -15 },
    },
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
    aporteIdeal: 400,
    descricao: 'Fase inicial de planejamento. Com aportes mensais de R$ 400, a reforma estará financiada dentro do prazo.',
    proximoAporte: {
      valorTotal: 400,
      porMembro: [
        { membroId: '1', valor: 200 },
        { membroId: '2', valor: 200 },
      ],
    },
    evolucaoAportes: {
      '7d':  { realizados: [0, 200, 0, 0, 200, 0, 0],               ritmo: [60, 60, 60, 60, 60, 60, 60],         labels: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'] },
      '1m':  { realizados: [200, 0, 200, 0],                         ritmo: [400, 400, 400, 400],                 labels: ['1','10','20','30'] },
      '3m':  { realizados: [350, 400, 400],                           ritmo: [400, 400, 400],                      labels: ['Fev','Mar','Abr'] },
      '6m':  { realizados: [200, 250, 300, 350, 400, 400],            ritmo: [400, 400, 400, 400, 400, 400],       labels: ['Nov','Dez','Jan','Fev','Mar','Abr'] },
    },
    estatisticasAportes: {
      '7d':  { total: 400,  variacao: 8 },
      '1m':  { total: 400,  variacao: 8 },
      '3m':  { total: 1150, variacao: 15 },
      '6m':  { total: 1900, variacao: 8  },
    },
  },
]

// Movimentações recentes de todas as metas do grupo.
const movimentacoes = [
  { id: '1', membroId: '1', nomeMembro: 'Brenda', metaId: '1', nomeMeta: 'Entrada do Apê',       tipo: 'aporte',  valor: 500,  data: 'hoje'     },
  { id: '2', membroId: '2', nomeMembro: 'João',   metaId: '3', nomeMeta: 'Reserva de Emergência', tipo: 'aporte',  valor: 600,  data: 'ontem'    },
  { id: '3', membroId: '1', nomeMembro: 'Brenda', metaId: '2', nomeMeta: 'Viagem de Férias',      tipo: 'ajuste',  valor: null, data: '23 abr.'  },
  { id: '4', membroId: '2', nomeMembro: 'João',   metaId: '4', nomeMeta: 'Móveis da Sala',        tipo: 'criacao', valor: null, data: '18 abr.'  },
  { id: '5', membroId: '2', nomeMembro: 'João',   metaId: '4', nomeMeta: 'Móveis da Sala',        tipo: 'aporte',  valor: 250,  data: '15 abr.'  },
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

export function getMockMetas(grupoId, periodo = '6m') {
  return {
    membros,
    metas,
    movimentacoes,
    periodo,
  }
}

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
