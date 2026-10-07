import { calculateAverage } from './grades.mjs';

const form = document.querySelector('#grade-form');
const list = document.querySelector('#evaluations');
const result = document.querySelector('#average');
const status = document.querySelector('#classification');
const message = document.querySelector('#message');
const addButton = document.querySelector('#add-evaluation');
let nextId = 0;

function invalidateResult() {
  result.textContent = '—';
  status.textContent = 'Pronto para calcular';
  message.textContent = 'Notas de 0 a 10. Pesos maiores que zero.';
  form.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
}

function updateLabels() {
  [...list.children].forEach((row, index) => {
    row.querySelector('.grade-label').textContent = `Nota ${index + 1}`;
    row.querySelector('.weight-label').textContent = `Peso ${index + 1}`;
    const remove = row.querySelector('button');
    remove.setAttribute('aria-label', `Remover avaliação ${index + 1}`);
    remove.disabled = list.children.length === 1;
  });
  addButton.disabled = list.children.length >= 12;
}

function addRow() {
  if (list.children.length >= 12) return;
  const row = document.createElement('div');
  row.className = 'grade-row';
  const id = nextId++;
  row.innerHTML = `<label for="grade-${id}"><span class="grade-label"></span><input id="grade-${id}" class="grade-input" inputmode="decimal" type="text" autocomplete="off" maxlength="20" placeholder="Ex.: 7,5" aria-describedby="message"></label><label for="weight-${id}"><span class="weight-label"></span><input id="weight-${id}" class="weight-input" inputmode="decimal" type="text" value="1" autocomplete="off" maxlength="20" aria-describedby="message"></label><button class="remove-button" type="button" aria-label="Remover avaliação">×</button>`;
  // Only a locally generated integer is interpolated into this static template.
  list.append(row);
  row.querySelector('button').addEventListener('click', () => {
    const rows = [...list.children];
    const previous = rows[Math.max(0, rows.indexOf(row) - 1)];
    row.remove(); updateLabels(); invalidateResult();
    (previous.isConnected ? previous.querySelector('input') : addButton).focus();
  });
  updateLabels();
  return row;
}

for (let index = 0; index < 4; index++) addRow();
addButton.addEventListener('click', () => { const row = addRow(); invalidateResult(); row?.querySelector('input').focus(); });
form.addEventListener('input', invalidateResult);
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const inputs = [...list.children].map((row) => ({ grade: row.querySelector('.grade-input'), weight: row.querySelector('.weight-input') }));
  try {
    const data = calculateAverage(inputs.map((row) => ({ grade: row.grade.value, weight: row.weight.value })), {
      passing: form.elements.passing.value, recovery: form.elements.recovery.value,
    });
    result.textContent = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(data.average);
    status.textContent = data.status;
    message.textContent = `${data.count} avaliações · Aprovação a partir de ${data.passing.toLocaleString('pt-BR')} · A classificação usa a média sem arredondar.`;
  } catch (error) {
    result.textContent = '—'; status.textContent = 'Confere os valores'; message.textContent = error.message;
    let field = form.elements[error.field];
    const match = error.field?.match(/^(grade|weight)-(\d+)$/);
    if (match) field = inputs[Number(match[2])]?.[match[1]];
    if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
  }
});
document.querySelector('#reset-grades').addEventListener('click', () => {
  form.reset(); list.replaceChildren();
  for (let index = 0; index < 4; index++) addRow();
  invalidateResult(); list.querySelector('input').focus();
});
