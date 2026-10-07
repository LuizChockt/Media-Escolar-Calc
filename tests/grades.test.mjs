import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateAverage, parseDecimal } from '../src/grades.mjs';

test('calculates a simple average with default criteria', () => {
  const result = calculateAverage([8, 7, 9, 6].map((grade) => ({ grade })));
  assert.equal(result.average, 7.5);
  assert.equal(result.status, 'Aprovado');
});
test('calculates a weighted average and accepts decimal comma', () => {
  assert.equal(calculateAverage([{ grade: '8', weight: '2' }, { grade: '5', weight: '1' }]).average, 7);
  assert.equal(calculateAverage([{ grade: '7,5', weight: '0,5' }, { grade: '8,5', weight: '0,5' }]).average, 8);
});
test('uses exact boundary values without rounding the classification', () => {
  const at = (grade) => calculateAverage([{ grade }]).status;
  assert.equal(at(7), 'Aprovado');
  assert.equal(at(6.999), 'Recuperação');
  assert.equal(at(5), 'Recuperação');
  assert.equal(at(4.999), 'Abaixo da média mínima');
  assert.equal(at(0), 'Abaixo da média mínima');
});
test('supports configurable criteria', () => {
  assert.equal(calculateAverage([{ grade: 6 }], { passing: 6, recovery: 4 }).status, 'Aprovado');
});
test('rejects missing, out-of-range and nonnumeric grades', () => {
  for (const grade of ['', ' ', -1, 11, NaN, Infinity, '1e2', 'texto', '0x10']) {
    assert.throws(() => calculateAverage([{ grade }]), Error, String(grade));
  }
});
test('rejects zero or negative weights, impossible criteria and invalid row counts', () => {
  for (const weight of [0, -1, '', Infinity]) assert.throws(() => calculateAverage([{ grade: 5, weight }]));
  for (const options of [{ passing: 11 }, { passing: 5, recovery: 5 }, { recovery: -1 }]) {
    assert.throws(() => calculateAverage([{ grade: 5 }], options));
  }
  assert.throws(() => calculateAverage([]));
  assert.throws(() => calculateAverage(Array(13).fill({ grade: 5 })));
});
test('rejects nonfinite arithmetic and malformed decimal values', () => {
  assert.throws(() => calculateAverage([{ grade: 10, weight: Number.MAX_VALUE }, { grade: 10, weight: Number.MAX_VALUE }]));
  assert.throws(() => parseDecimal('7,5,2'));
  assert.equal(parseDecimal(' 7,5 '), 7.5);
});
