/* Solución manuscrita de los casos A, B y C de la guía, paso a paso.
   Es la misma que el autor resolvió a mano (docs/solucion-manual.md).
   Se usa g = 9,8 m/s² solo para el peso y la normal. */
export const SOLUCION_MANUAL = [
  {
    caso: 'A', titulo: 'Caso A · Aceleración desde el reposo',
    datos: 'm = 0,5 kg · Fₐ = 1,2 N · Fᵣ = 0,2 N · v₀ = 0 · Δx = 1,0 m',
    pasos: [
      { paso: 'Diagrama de fuerzas', cuenta: 'P = m·g = 0,5 × 9,8 = 4,9 N (abajo) · N = 4,9 N (arriba) · Fₐ = 1,2 N (derecha) · Fᵣ = 0,2 N (izquierda)', porque: 'P y N se anulan porque el carro no sube ni baja.' },
      { paso: '¿Arranca?', cuenta: 'Fₐ = 1,2 N > Fᵣ = 0,2 N → sí arranca', porque: 'Parte del reposo: solo se mueve si el empuje le gana a la resistencia.' },
      { paso: 'Fuerza neta', cuenta: 'Fneta = Fₐ − Fᵣ = 1,2 − 0,2 = 1,0 N', porque: 'Se restan porque van en sentidos opuestos.' },
      { paso: 'Aceleración', cuenta: 'a = Fneta / m = 1,0 / 0,5 = 2,0 m/s²', porque: 'Segunda ley de Newton.' },
      { paso: 'Tiempo', cuenta: 'Δx = v₀·t + ½·a·t² → 1,0 = 0 + ½ × 2,0 × t² → t² = 1 → t = 1,0 s', porque: 'Conozco la distancia y busco el tiempo; como v₀ = 0, el primer término se va.' },
      { paso: 'Velocidad final', cuenta: 'v = v₀ + a·t = 0 + 2,0 × 1,0 = 2,0 m/s', porque: 'Comprobación: v² = v₀² + 2·a·Δx = 0 + 2 × 2,0 × 1,0 = 4 → v = 2,0 m/s.' },
      { paso: 'Energía cinética', cuenta: 'K₀ = 0 · K = ½·m·v² = ½ × 0,5 × 2,0² = 1,0 J → ΔK = 1,0 J', porque: 'Arranca quieto, así que toda su energía es ganada.' },
      { paso: 'Trabajos', cuenta: 'Wₐ = Fₐ·Δx = 1,2 × 1,0 = +1,2 J · Wᵣ = −Fᵣ·Δx = −0,2 × 1,0 = −0,2 J · Wₚ = Wₙ = 0', porque: 'El empuje va a favor (+), la resistencia en contra (−); P y N son perpendiculares al movimiento.' },
      { paso: 'Teorema trabajo–energía', cuenta: 'W neto = 1,2 + (−0,2) = 1,0 J = ΔK ✓', porque: 'El trabajo total es igual al cambio de energía cinética.' }
    ]
  },
  {
    caso: 'B', titulo: 'Caso B · Movimiento uniforme',
    datos: 'm = 0,5 kg · Fₐ = Fᵣ = 0,3 N · v₀ = 1,0 m/s · t = 2,0 s',
    pasos: [
      { paso: 'Diagrama de fuerzas', cuenta: 'P = 4,9 N (abajo) · N = 4,9 N (arriba) · Fₐ = 0,3 N (derecha) · Fᵣ = 0,3 N (izquierda)', porque: 'Igual que en A, P y N se anulan.' },
      { paso: 'Fuerza neta', cuenta: 'Fneta = Fₐ − Fᵣ = 0,3 − 0,3 = 0 N', porque: 'Las fuerzas horizontales se equilibran.' },
      { paso: 'Aceleración', cuenta: 'a = Fneta / m = 0 / 0,5 = 0 m/s²', porque: 'Sin fuerza neta no hay aceleración (primera ley): como ya venía moviéndose, sigue igual.' },
      { paso: 'Velocidad', cuenta: 'v = v₀ + a·t = 1,0 + 0 × 2,0 = 1,0 m/s', porque: 'La velocidad no cambia: movimiento uniforme.' },
      { paso: 'Distancia', cuenta: 'Δx = v·t = 1,0 × 2,0 = 2,0 m', porque: 'Con a = 0, la fórmula general se reduce a distancia = velocidad × tiempo.' },
      { paso: 'Energía cinética', cuenta: 'K₀ = ½ × 0,5 × 1,0² = 0,25 J · K = 0,25 J → ΔK = 0 J', porque: 'La rapidez es la misma al inicio y al final.' },
      { paso: 'Trabajos', cuenta: 'Wₐ = 0,3 × 2,0 = +0,6 J · Wᵣ = −0,3 × 2,0 = −0,6 J', porque: 'Ambas fuerzas actúan durante los mismos 2,0 m.' },
      { paso: 'Teorema trabajo–energía', cuenta: 'W neto = 0,6 + (−0,6) = 0 J = ΔK ✓', porque: 'El empuje entrega justo la energía que la resistencia quita.' }
    ]
  },
  {
    caso: 'C', titulo: 'Caso C · Frenado hasta detenerse',
    datos: 'm = 0,5 kg · Fₐ = 0 · Fᵣ = 0,5 N · v₀ = 2,0 m/s',
    pasos: [
      { paso: 'Diagrama de fuerzas', cuenta: 'P = 4,9 N (abajo) · N = 4,9 N (arriba) · Fᵣ = 0,5 N (izquierda, contra el movimiento) · sin empuje', porque: 'El carro va a la derecha y la fricción siempre apunta al revés.' },
      { paso: 'Fuerza neta', cuenta: 'Fneta = 0 − 0,5 = −0,5 N', porque: 'Negativa: apunta contra el movimiento, por eso frena.' },
      { paso: 'Aceleración', cuenta: 'a = Fneta / m = −0,5 / 0,5 = −1,0 m/s²', porque: 'Pierde 1 m/s de velocidad cada segundo.' },
      { paso: 'Tiempo de parada', cuenta: 'v = v₀ + a·t → 0 = 2,0 + (−1,0)·t → t = 2,0 s', porque: 'Se detiene cuando v = 0.' },
      { paso: 'Distancia de frenado', cuenta: 'Δx = v₀·t + ½·a·t² = 2,0 × 2,0 + ½ × (−1,0) × 2,0² = 4,0 − 2,0 = 2,0 m', porque: 'Comprobación: 0 = v₀² + 2·a·Δx → Δx = 4,0 / 2,0 = 2,0 m.' },
      { paso: 'Energía cinética', cuenta: 'K₀ = ½ × 0,5 × 2,0² = 1,0 J · K = 0 → ΔK = −1,0 J', porque: 'Termina quieto: pierde toda su energía cinética.' },
      { paso: 'Trabajos', cuenta: 'Wᵣ = −Fᵣ·Δx = −0,5 × 2,0 = −1,0 J · Wₐ = 0', porque: 'No hay empuje, solo la fricción hace trabajo.' },
      { paso: 'Teorema trabajo–energía', cuenta: 'W neto = −1,0 J = ΔK ✓', porque: 'La fricción quita exactamente la energía que tenía.' },
      { paso: '¿Y en t = 3 s?', cuenta: 'v = 0 y x = 2,0 m (sigue quieto)', porque: 'Si se mete t = 3 en v = v₀ + a·t sale −1 m/s, como si retrocediera, y eso está mal: la fricción solo se opone al movimiento, no empuja. Quieto y sin empuje, nada lo mueve.' }
    ]
  }
];
