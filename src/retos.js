/* Retos: el estudiante ajusta UNA cosa para cumplir una meta.
   Para ganar 3 estrellas hay que calcular, no adivinar. */
import { fmt } from './formato.js';

const base = { x0: '0', modo: 'tiempo', dx: '1', FsMax: '' };

export const RETOS = [
  {
    id: 'cita',
    titulo: 'Cita a los 2 segundos',
    mision: 'El carro parte del reposo. Ajusta el empuje para que pase por la bandera justo a los 2 s.',
    entrada: { ...base, m: '1', Fa: '1', Fr: '0,5', v0: '0', tTotal: '2' },
    ajusta: { campo: 'Fa', min: 0, max: 5, paso: 0.05 },
    bandera: 4,
    evaluar: ({ mov }) => ({
      error: Math.abs(mov.xf - 4) / 4,
      detalle: !mov.desliza ? 'El carro ni siquiera arrancó: el empuje no supera la resistencia.'
        : `A los 2 s llegó a x = ${fmt(mov.xf)} m: ${mov.xf < 4 ? 'te quedaste corto' : mov.xf > 4 ? 'te pasaste' : 'perfecto'}.`
    }),
    pista: 'Primero calcula qué aceleración necesita para recorrer 4 m en 2 s saliendo del reposo. Después, qué fuerza neta da esa aceleración.',
    solucion: ['Δx = ½·a·t² → 4 = ½·a·2² → a = 2 m/s²', 'Fneta = m·a = 1 × 2 = 2 N', 'Fₐ − Fᵣ = 2 → Fₐ = 2 + 0,5 = 2,5 N']
  },
  {
    id: 'frenada',
    titulo: 'Frenada perfecta',
    mision: 'El carro viene a 3 m/s y nadie lo empuja. Elige la resistencia para que se detenga exactamente en la bandera.',
    entrada: { ...base, m: '1', Fa: '0', Fr: '0,5', v0: '3', tTotal: '6' },
    ajusta: { campo: 'Fr', min: 0, max: 5, paso: 0.05 },
    bandera: 3,
    evaluar: ({ mov }) => ({
      error: Math.abs(mov.xf - 3) / 3,
      detalle: !mov.seDetiene ? `No alcanzó a detenerse: pasó la bandera y siguió hasta x = ${fmt(mov.xf)} m.`
        : `Se detuvo en x = ${fmt(mov.xf)} m: ${mov.xf < 3 ? 'frenaste demasiado' : mov.xf > 3 ? 'te faltó frenar' : 'perfecto'}.`
    }),
    pista: 'La distancia de frenado es v₀² / (2·|a|). Despeja la aceleración que necesitas y luego la fuerza.',
    solucion: ['Δx = v₀² / (2·|a|) → 3 = 3² / (2·|a|) → |a| = 1,5 m/s²', 'Fᵣ = m·|a| = 1 × 1,5 = 1,5 N']
  },
  {
    id: 'crucero',
    titulo: 'Velocidad crucero',
    mision: 'El carro va a 2 m/s. Ajusta el empuje para que mantenga esa velocidad y pase por la bandera (10 m) justo a los 5 s.',
    entrada: { ...base, m: '2', Fa: '0,3', Fr: '0,8', v0: '2', tTotal: '5' },
    ajusta: { campo: 'Fa', min: 0, max: 5, paso: 0.05 },
    bandera: 10,
    evaluar: ({ mov }) => ({
      error: Math.abs(mov.xf - 10) / 10,
      detalle: `A los 5 s estaba en x = ${fmt(mov.xf)} m con v = ${fmt(mov.vf)} m/s.`
    }),
    pista: 'Velocidad constante significa aceleración cero. ¿Cuánto debe valer la fuerza neta?',
    solucion: ['v constante → a = 0 → Fneta = 0', 'Fₐ − Fᵣ = 0 → Fₐ = Fᵣ = 0,8 N', 'Δx = v·t = 2 × 5 = 10 m']
  },
  {
    id: 'adivina',
    titulo: '¿Dónde se detiene?',
    mision: 'Lo empujan con 0,1 N pero la resistencia es 0,4 N. Pon la bandera donde creas que se va a detener y lánzalo.',
    entrada: { ...base, m: '0,5', Fa: '0,1', Fr: '0,4', v0: '2', tTotal: '6' },
    ajusta: { campo: 'bandera', min: 0, max: 8, paso: 0.05, inicial: 1 },
    bandera: 'ajustable',
    evaluar: ({ mov }, bandera) => ({
      error: Math.abs(mov.xf - bandera) / mov.xf,
      detalle: `Se detuvo en x = ${fmt(mov.xf)} m y tu bandera estaba en ${fmt(bandera)} m.`
    }),
    pista: 'Calcula la aceleración con la fuerza neta y usa la distancia de frenado v₀² / (2·|a|).',
    solucion: ['Fneta = 0,1 − 0,4 = −0,3 N', 'a = −0,3 / 0,5 = −0,6 m/s²', 'Δx = v₀² / (2·|a|) = 2² / 1,2 = 3,33 m']
  },
  {
    id: 'energia',
    titulo: 'Energía justa',
    mision: 'El carro parte del reposo. Ajusta el empuje para que llegue a la bandera (2 m) con exactamente 2 J de energía cinética.',
    entrada: { ...base, m: '1', Fa: '1', Fr: '0,5', v0: '0', modo: 'distancia', dx: '2', tTotal: '3' },
    ajusta: { campo: 'Fa', min: 0, max: 5, paso: 0.05 },
    bandera: 2,
    evaluar: ({ mov, energia }) => ({
      error: mov.alcanzaDx ? Math.abs(energia.Kf - 2) / 2 : 1,
      detalle: !mov.alcanzaDx ? 'No llegó a la bandera: el empuje no supera la resistencia.'
        : `Llegó con K = ${fmt(energia.Kf)} J: ${energia.Kf < 2 ? 'le faltó energía' : energia.Kf > 2 ? 'le sobró energía' : 'perfecto'}.`
    }),
    pista: 'Usa el teorema trabajo-energía: el trabajo neto en esos 2 m es igual a la energía cinética que gana.',
    solucion: ['W neto = ΔK → (Fₐ − Fᵣ)·Δx = 2 J', '(Fₐ − 0,5) × 2 = 2 → Fₐ = 1,5 N']
  }
];

export const estrellas = error => (error <= 0.02 ? 3 : error <= 0.06 ? 2 : error <= 0.12 ? 1 : 0);
