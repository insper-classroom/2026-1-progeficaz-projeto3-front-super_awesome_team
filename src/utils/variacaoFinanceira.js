export function calcularVariacaoPercentual(totalAtual, totalAnterior) {
  const atual = Number(totalAtual)
  const anterior = Number(totalAnterior)

  if (!Number.isFinite(atual) || !Number.isFinite(anterior) || anterior <= 0) {
    return null
  }

  return ((atual - anterior) / anterior) * 100
}
