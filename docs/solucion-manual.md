# Solución manual de los casos A, B y C

Resolución paso a paso, la misma que está escrita a mano en la hoja de la entrega. Cada paso tiene la cuenta y una explicación corta. Se usa g = 9,8 m/s² solo para el peso y la normal. Esta solución también se ve en el simulador, en la pestaña **Cuentas → Casos A, B y C resueltos a mano**.

## Caso A · Aceleración desde el reposo

**Datos:** m = 0,5 kg · Fₐ = 1,2 N · Fᵣ = 0,2 N · v₀ = 0 · Δx = 1,0 m

1. **Diagrama de fuerzas.** P = m·g = 0,5 × 9,8 = 4,9 N (abajo) · N = 4,9 N (arriba) · Fₐ = 1,2 N (derecha) · Fᵣ = 0,2 N (izquierda)  
   _P y N se anulan porque el carro no sube ni baja._
2. **¿Arranca?** Fₐ = 1,2 N > Fᵣ = 0,2 N → sí arranca  
   _Parte del reposo: solo se mueve si el empuje le gana a la resistencia._
3. **Fuerza neta.** Fneta = Fₐ − Fᵣ = 1,2 − 0,2 = 1,0 N  
   _Se restan porque van en sentidos opuestos._
4. **Aceleración.** a = Fneta / m = 1,0 / 0,5 = 2,0 m/s²  
   _Segunda ley de Newton._
5. **Tiempo.** Δx = v₀·t + ½·a·t² → 1,0 = 0 + ½ × 2,0 × t² → t² = 1 → t = 1,0 s  
   _Conozco la distancia y busco el tiempo; como v₀ = 0, el primer término se va._
6. **Velocidad final.** v = v₀ + a·t = 0 + 2,0 × 1,0 = 2,0 m/s  
   _Comprobación: v² = v₀² + 2·a·Δx = 0 + 2 × 2,0 × 1,0 = 4 → v = 2,0 m/s._
7. **Energía cinética.** K₀ = 0 · K = ½·m·v² = ½ × 0,5 × 2,0² = 1,0 J → ΔK = 1,0 J  
   _Arranca quieto, así que toda su energía es ganada._
8. **Trabajos.** Wₐ = Fₐ·Δx = 1,2 × 1,0 = +1,2 J · Wᵣ = −Fᵣ·Δx = −0,2 × 1,0 = −0,2 J · Wₚ = Wₙ = 0  
   _El empuje va a favor (+), la resistencia en contra (−); P y N son perpendiculares al movimiento._
9. **Teorema trabajo–energía.** W neto = 1,2 + (−0,2) = 1,0 J = ΔK ✓  
   _El trabajo total es igual al cambio de energía cinética._

## Caso B · Movimiento uniforme

**Datos:** m = 0,5 kg · Fₐ = Fᵣ = 0,3 N · v₀ = 1,0 m/s · t = 2,0 s

1. **Diagrama de fuerzas.** P = 4,9 N (abajo) · N = 4,9 N (arriba) · Fₐ = 0,3 N (derecha) · Fᵣ = 0,3 N (izquierda)  
   _Igual que en A, P y N se anulan._
2. **Fuerza neta.** Fneta = Fₐ − Fᵣ = 0,3 − 0,3 = 0 N  
   _Las fuerzas horizontales se equilibran._
3. **Aceleración.** a = Fneta / m = 0 / 0,5 = 0 m/s²  
   _Sin fuerza neta no hay aceleración (primera ley): como ya venía moviéndose, sigue igual._
4. **Velocidad.** v = v₀ + a·t = 1,0 + 0 × 2,0 = 1,0 m/s  
   _La velocidad no cambia: movimiento uniforme._
5. **Distancia.** Δx = v·t = 1,0 × 2,0 = 2,0 m  
   _Con a = 0, la fórmula general se reduce a distancia = velocidad × tiempo._
6. **Energía cinética.** K₀ = ½ × 0,5 × 1,0² = 0,25 J · K = 0,25 J → ΔK = 0 J  
   _La rapidez es la misma al inicio y al final._
7. **Trabajos.** Wₐ = 0,3 × 2,0 = +0,6 J · Wᵣ = −0,3 × 2,0 = −0,6 J  
   _Ambas fuerzas actúan durante los mismos 2,0 m._
8. **Teorema trabajo–energía.** W neto = 0,6 + (−0,6) = 0 J = ΔK ✓  
   _El empuje entrega justo la energía que la resistencia quita._

## Caso C · Frenado hasta detenerse

**Datos:** m = 0,5 kg · Fₐ = 0 · Fᵣ = 0,5 N · v₀ = 2,0 m/s

1. **Diagrama de fuerzas.** P = 4,9 N (abajo) · N = 4,9 N (arriba) · Fᵣ = 0,5 N (izquierda, contra el movimiento) · sin empuje  
   _El carro va a la derecha y la fricción siempre apunta al revés._
2. **Fuerza neta.** Fneta = 0 − 0,5 = −0,5 N  
   _Negativa: apunta contra el movimiento, por eso frena._
3. **Aceleración.** a = Fneta / m = −0,5 / 0,5 = −1,0 m/s²  
   _Pierde 1 m/s de velocidad cada segundo._
4. **Tiempo de parada.** v = v₀ + a·t → 0 = 2,0 + (−1,0)·t → t = 2,0 s  
   _Se detiene cuando v = 0._
5. **Distancia de frenado.** Δx = v₀·t + ½·a·t² = 2,0 × 2,0 + ½ × (−1,0) × 2,0² = 4,0 − 2,0 = 2,0 m  
   _Comprobación: 0 = v₀² + 2·a·Δx → Δx = 4,0 / 2,0 = 2,0 m._
6. **Energía cinética.** K₀ = ½ × 0,5 × 2,0² = 1,0 J · K = 0 → ΔK = −1,0 J  
   _Termina quieto: pierde toda su energía cinética._
7. **Trabajos.** Wᵣ = −Fᵣ·Δx = −0,5 × 2,0 = −1,0 J · Wₐ = 0  
   _No hay empuje, solo la fricción hace trabajo._
8. **Teorema trabajo–energía.** W neto = −1,0 J = ΔK ✓  
   _La fricción quita exactamente la energía que tenía._
9. **¿Y en t = 3 s?** v = 0 y x = 2,0 m (sigue quieto)  
   _Si se mete t = 3 en v = v₀ + a·t sale −1 m/s, como si retrocediera, y eso está mal: la fricción solo se opone al movimiento, no empuja. Quieto y sin empuje, nada lo mueve._
