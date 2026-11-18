/* Ejercicios de práctica con números distintos cada vez.
   Las respuestas correctas salen de fisica.js (el mismo modelo del simulador). */
import { calcularMovimiento, calcularEnergia } from './fisica.js';
import { fmt as f } from '../formato.js';

const elegir = lista => lista[Math.floor(Math.random() * lista.length)];
const base = { x0: 0, modo: 'tiempo', FsMax: null };

const GENERADORES = {
  arranque() {
    const m = elegir([0.5, 1, 2]), Fr = elegir([0.2, 0.4, 0.5, 1]), a = elegir([0.5, 1, 2]), t = elegir([1, 2, 3, 4]);
    const Fa = +(Fr + m * a).toFixed(2);
    const datos = { ...base, m, Fa, Fr, v0: 0, tTotal: t };
    const mov = calcularMovimiento(datos), e = calcularEnergia(datos, mov);
    return {
      titulo: 'Arranque desde el reposo', datos,
      enunciado: `Un carro de ${f(m)} kg está quieto. Lo empujan con ${f(Fa)} N y la fuerza resistiva es ${f(Fr)} N. Suponga que el empuje supera la fricción estática máxima. Analice los primeros ${f(t, 1)} s.`,
      preguntas: [
        { texto: 'Aceleración', unidad: 'm/s²', valor: mov.aDesliza },
        { texto: `Velocidad a los ${f(t, 1)} s`, unidad: 'm/s', valor: mov.vf },
        { texto: 'Distancia recorrida', unidad: 'm', valor: e.dx },
        { texto: 'Trabajo de la resistencia', unidad: 'J', valor: e.Wr }
      ],
      pasos: [
        `Fneta = Fₐ − Fᵣ = ${f(Fa)} − ${f(Fr)} = ${f(Fa - Fr)} N`,
        `a = Fneta / m = ${f(Fa - Fr)} / ${f(m)} = ${f(mov.aDesliza)} m/s²`,
        `v = v₀ + a·t = 0 + ${f(mov.aDesliza)} × ${f(t, 1)} = ${f(mov.vf)} m/s`,
        `Δx = ½·a·t² = ½ × ${f(mov.aDesliza)} × ${f(t, 1)}² = ${f(e.dx)} m`,
        `Wᵣ = −Fᵣ·Δx = −${f(Fr)} × ${f(e.dx)} = ${f(e.Wr)} J (negativo: va contra el movimiento)`
      ]
    };
  },
  frenado() {
    const m = elegir([0.5, 1, 2]), aMag = elegir([0.5, 1, 2]), Fa = elegir([0, 0, 0.2, 0.5]), v0 = elegir([2, 3, 4, 6]);
    const Fr = +(Fa + m * aMag).toFixed(2);
    const tTotal = Math.ceil(v0 / aMag) + 2;
    const datos = { ...base, m, Fa, Fr, v0, tTotal };
    const mov = calcularMovimiento(datos), e = calcularEnergia(datos, mov);
    const empuje = Fa > 0 ? `Lo siguen empujando con ${f(Fa)} N, pero la resistencia es ${f(Fr)} N.` : `Nadie lo empuja y la resistencia es ${f(Fr)} N.`;
    return {
      titulo: 'Frenado hasta detenerse', datos,
      enunciado: `Un carro de ${f(m)} kg va a ${f(v0, 1)} m/s. ${empuje} Analice ${f(tTotal, 0)} s.`,
      preguntas: [
        { texto: 'Aceleración mientras desliza', unidad: 'm/s²', valor: mov.aDesliza },
        { texto: 'Tiempo hasta detenerse', unidad: 's', valor: mov.tParada },
        { texto: 'Distancia recorrida', unidad: 'm', valor: e.dx },
        { texto: 'Variación de energía cinética', unidad: 'J', valor: e.dK }
      ],
      pasos: [
        `Fneta = ${f(Fa)} − ${f(Fr)} = ${f(Fa - Fr)} N (hacia atrás: frena)`,
        `a = ${f(Fa - Fr)} / ${f(m)} = ${f(mov.aDesliza)} m/s²`,
        `Se detiene cuando v = 0: t = v₀ / |a| = ${f(v0, 1)} / ${f(aMag)} = ${f(mov.tParada)} s`,
        `Δx = v₀·t + ½·a·t² = ${f(v0, 1)} × ${f(mov.tParada)} + ½ × (${f(mov.aDesliza)}) × ${f(mov.tParada)}² = ${f(e.dx)} m`,
        `ΔK = 0 − ½ × ${f(m)} × ${f(v0, 1)}² = ${f(e.dK)} J. Después de detenerse queda quieto.`
      ]
    };
  },
  uniforme() {
    const F = elegir([0.3, 0.5, 1.2]), m = elegir([0.5, 1, 2]), v0 = elegir([1, 1.5, 2, 3]), t = elegir([2, 4, 5]);
    const datos = { ...base, m, Fa: F, Fr: F, v0, tTotal: t };
    const mov = calcularMovimiento(datos), e = calcularEnergia(datos, mov);
    return {
      titulo: 'Fuerzas equilibradas', datos,
      enunciado: `Un carro de ${f(m)} kg va a ${f(v0, 1)} m/s. Lo empujan con ${f(F)} N y la resistencia también es ${f(F)} N. Analice ${f(t, 0)} s.`,
      preguntas: [
        { texto: 'Aceleración', unidad: 'm/s²', valor: mov.aDesliza },
        { texto: 'Distancia recorrida', unidad: 'm', valor: e.dx },
        { texto: 'Trabajo de la fuerza aplicada', unidad: 'J', valor: e.Wa },
        { texto: 'Trabajo neto', unidad: 'J', valor: e.Wneto }
      ],
      pasos: [
        `Fneta = ${f(F)} − ${f(F)} = 0 N → a = 0: mantiene su velocidad (1.ª ley de Newton)`,
        `Δx = v₀·t = ${f(v0, 1)} × ${f(t, 0)} = ${f(e.dx)} m`,
        `Wₐ = Fₐ·Δx = ${f(F)} × ${f(e.dx)} = ${f(e.Wa)} J`,
        `Wᵣ = −${f(F)} × ${f(e.dx)} = ${f(e.Wr)} J → W neto = 0 = ΔK (la rapidez no cambia)`
      ]
    };
  }
};

export const TIPOS_PRACTICA = { aleatorio: 'Cualquiera', arranque: 'Arranque', frenado: 'Frenado', uniforme: 'Equilibrio' };

export function generarEjercicio(tipo) {
  const t = tipo === 'aleatorio' ? elegir(Object.keys(GENERADORES)) : tipo;
  return GENERADORES[t]();
}

// Margen de redondeo: 2 % del valor o 0,01, lo que sea mayor
export const respuestaCorrecta = (r, valor) => Math.abs(r - valor) <= Math.max(0.01, 0.02 * Math.abs(valor));
