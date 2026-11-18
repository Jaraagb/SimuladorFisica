// Números con coma decimal y signo menos tipográfico; nunca "−0,00".
export function fmt(n, dec = 2) {
  if (!Number.isFinite(n)) return '—';
  const r = Number(n.toFixed(dec)) + 0; // "+ 0" convierte −0 en 0
  return r.toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec }).replace('-', '−');
}

// Con signo explícito (+1,20 / −0,20)
export const fmtS = (n, dec = 2) => (Number(n.toFixed(dec)) > 0 ? '+' : '') + fmt(n, dec);

// Valor de un deslizador → texto del campo (con coma)
export const aTexto = (n, dec = 2) => String(Number(n.toFixed(dec))).replace('.', ',');

// Paso "bonito" para marcas de ejes y reglas
export function pasoBonito(rango, maxMarcas = 8) {
  const crudo = rango / maxMarcas;
  const p = Math.pow(10, Math.floor(Math.log10(crudo)));
  for (const k of [1, 2, 2.5, 5, 10]) if (crudo <= k * p) return k * p;
  return 10 * p;
}

export function marcas(lo, hi, maxMarcas = 6) {
  const paso = pasoBonito(hi - lo || 1, maxMarcas);
  const lista = [];
  for (let v = Math.ceil(lo / paso) * paso; v <= hi + paso * 1e-6; v += paso) lista.push(Number(v.toFixed(6)));
  return { lista, paso };
}

// Decimales necesarios para escribir las marcas de un eje con ese paso
export const decimales = paso => (paso >= 1 ? 0 : Math.abs(paso * 10 - Math.round(paso * 10)) < 1e-9 ? 1 : 2);
