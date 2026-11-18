// Ejecutar:  npm test   (o  node pruebas/pruebas.mjs)
import * as Fisica from '../src/fisica/fisica.js';
import { CASOS_PRUEBA, correrCaso, CASOS_VALIDACION, correrValidacion } from '../src/fisica/casos-prueba.js';
import { validarDatos } from '../src/fisica/validacion.js';

let fallas = 0;
for (const caso of CASOS_PRUEBA) {
  const filas = correrCaso(Fisica, caso);
  const ok = filas.every(f => f.ok);
  console.log(`${ok ? '✓' : '✗'} ${caso.nombre}`);
  for (const f of filas.filter(f => !f.ok)) {
    fallas++;
    console.log(`    ${f.campo}: esperado ${f.esperado}, obtenido ${f.obtenido}`);
  }
}
console.log('\nValidación de datos:');
for (const caso of CASOS_VALIDACION) {
  const ok = correrValidacion(validarDatos, caso);
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${caso.nombre}`);
}
console.log(fallas === 0 ? '\nTodas las pruebas pasaron.' : `\n${fallas} comparaciones fallaron.`);
process.exit(fallas === 0 ? 0 : 1);
