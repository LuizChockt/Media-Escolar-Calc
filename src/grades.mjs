export class GradeError extends Error {
  constructor(message, field) { super(message); this.name = 'GradeError'; this.field = field; }
}

export function parseDecimal(value, label = 'Valor', field) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const text = String(value ?? '').trim();
  if (!/^\d+(?:[.,]\d+)?$/.test(text)) {
    throw new GradeError(`${label}: digita um número válido, como 7,5.`, field);
  }
  const result = Number(text.replace(',', '.'));
  if (!Number.isFinite(result)) throw new GradeError(`${label}: valor fora do limite numérico.`, field);
  return result;
}

export function calculateAverage(rows, options = {}) {
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) {
    throw new GradeError('Usa entre 1 e 12 avaliações.');
  }
  const passing = parseDecimal(options.passing ?? 7, 'Média para aprovação', 'passing');
  const recovery = parseDecimal(options.recovery ?? 5, 'Média para recuperação', 'recovery');
  if (passing > 10 || passing < 0 || recovery < 0 || recovery >= passing) {
    throw new GradeError('Os critérios devem estar entre 0 e 10, com recuperação abaixo da aprovação.', 'passing');
  }
  let total = 0;
  let weights = 0;
  rows.forEach((row, index) => {
    const grade = parseDecimal(row.grade, `Nota ${index + 1}`, `grade-${index}`);
    const weight = parseDecimal(row.weight ?? 1, `Peso ${index + 1}`, `weight-${index}`);
    if (grade < 0 || grade > 10) throw new GradeError(`Nota ${index + 1}: usa um valor entre 0 e 10.`, `grade-${index}`);
    if (weight <= 0) throw new GradeError(`Peso ${index + 1}: usa um valor maior que zero.`, `weight-${index}`);
    total += grade * weight;
    weights += weight;
  });
  const average = total / weights;
  if (!Number.isFinite(average)) throw new GradeError('Os pesos excedem o limite numérico.');
  const status = average >= passing ? 'Aprovado' : average >= recovery ? 'Recuperação' : 'Abaixo da média mínima';
  return { average, status, passing, recovery, count: rows.length };
}
