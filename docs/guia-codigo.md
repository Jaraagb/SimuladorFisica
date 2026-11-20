# Guía del código de cálculo de Carrilab

Guía para estudiar y explicar la parte física del programa: qué hace cada función, de qué ecuación sale y por qué está escrita así. Todo el cálculo vive en `src/fisica/`. La interfaz (React) solo llama a esas funciones y muestra los resultados.

Los números de los ejemplos fueron comprobados ejecutando el código real.

## 1. Mapa general

| Archivo | Para qué sirve | ¿Dibuja algo? |
| --- | --- | --- |
| `src/fisica/fisica.js` | El modelo físico: aceleración, arranque, movimiento por tramos, posición, velocidad y energía | No |
| `src/fisica/validacion.js` | Convierte lo que escribe el usuario en números y bloquea lo imposible | No |
| `src/fisica/casos-prueba.js` | Casos A, B, C y casos borde con valores calculados a mano; reglas de validación a probar | No |
| `src/fisica/practica.js` | Genera ejercicios con números distintos y su solución paso a paso | No |
| `src/formato.js` | Escribe números con coma decimal (solo presentación) | No |
| `pruebas/pruebas.mjs` | Corre todo con `npm test` | No |

**Regla del proyecto:** la interfaz nunca calcula física. Si un número aparece en pantalla, salió de `fisica.js`.

### Flujo de una simulación

```
texto escrito por el usuario
        │
        ▼
validarDatos(entrada)        →  convierte a números y revisa cada campo
        │  (si hay errores: se bloquea y se explica por campo)
        ▼
calcularMovimiento(datos)    →  tramos, tiempo de parada, x y v finales
        │
        ▼
validarResultado(mov)        →  ¿el resultado es realista? (v ≤ 20 m/s)
        │  (si no: se bloquea con un mensaje)
        ▼
posicionEn / velocidadEn / aceleracionEn(mov, t)   →  valores en cualquier instante
calcularEnergia(datos, mov, t)                     →  K, trabajos y teorema trabajo–energía
```

`validarTodo` ejecuta los dos primeros pasos de validación juntos; la interfaz y las pruebas usan esa función.

## 2. El modelo físico

**Sistema:** un cuerpo de masa *m* sobre un carril horizontal, en una dimensión (eje +x hacia la derecha).

**Fuerzas:** Fₐ (empuje, hacia +x), Fᵣ (resistencia, hacia −x), peso P y normal N. En vertical P = N = m·g, se anulan, y no afectan el movimiento horizontal (por eso g = 9,8 m/s² solo se usa en el diagrama).

**Supuestos (de los que depende todo):**

1. Fuerzas horizontales **constantes** en cada tramo.
2. Masa constante; el cuerpo es una partícula.
3. Movimiento rectilíneo.
4. La resistencia solo frena: nunca empuja ni hace retroceder.
5. Unidades SI: kg, N, m, s, m/s, m/s², J.

Si algo de esto falla (por ejemplo, el aire a alta velocidad), el modelo deja de valer. Por eso el programa bloquea más de 20 m/s.

## 3. Las ecuaciones y de dónde salen

Con aceleración constante *a*:

| Ecuación | Origen |
| --- | --- |
| Fneta = Fₐ − Fᵣ | Fuerzas en x (Fₐ a favor, Fᵣ en contra) |
| a = Fneta / m | 2.ª ley de Newton |
| v = v₀ + a·t | Integrar *a* constante |
| x = x₀ + v₀·t + ½·a·t² | Integrar *v* |
| tₚ = v₀ / \|a\| | Parada: v = 0 en v = v₀ + a·t |
| d = v₀² / (2·\|a\|) | Reemplazar tₚ en la posición |
| K = ½·m·v² | Definición de energía cinética |
| W = F·Δx·cos θ | Definición de trabajo (aquí θ = 0° o 180°) |

**Teorema trabajo–energía (demostración corta).** Como Fneta es constante, Wneto = Fneta·Δx = m·a·Δx. De v² = v₀² + 2·a·Δx se despeja a·Δx = (v² − v₀²)/2. Entonces Wneto = ½·m·v² − ½·m·v₀² = ΔK.

**Trabajos de cada fuerza.** Wₐ = Fₐ·Δx es positivo (a favor del movimiento). Wᵣ = −Fᵣ·Δx es negativo (en contra). Wₚ = Wₙ = 0 porque son perpendiculares al desplazamiento.

## 4. `fisica.js`, función por función

### `G = 9.8`
Gravedad en m/s². Se exporta para el diagrama de cuerpo libre.

### `calcularAceleracion(m, Fa, Fr)`
```js
return (Fa - Fr) / m;
```
Es la 2.ª ley de Newton. El signo da el caso: positiva acelera, cero mantiene la velocidad, negativa frena. Nunca se llama con m ≤ 0 porque `validacion.js` lo rechaza antes.

### `analizarArranque(datos)`
Decide si el cuerpo **desliza** al empezar. Devuelve `{ desliza, supuesto }`.

| Situación | Resultado | Por qué |
| --- | --- | --- |
| v₀ > 0 | desliza | Ya se mueve; no hay nada que decidir |
| v₀ = 0 y Fₐ = 0 | no desliza | Nadie empuja |
| v₀ = 0 y se da Fₛ,máx | desliza si Fₐ > Fₛ,máx | Modelo estático dado por el usuario |
| v₀ = 0 y no se da Fₛ,máx | desliza si Fₐ > Fᵣ, con `supuesto: true` | Ver abajo |

**Por qué existe `supuesto`.** Para arrancar desde el reposo hay que vencer la fricción estática máxima (Fₛ,máx = μₛ·N), que casi siempre es mayor o igual que la cinética. Sin ese dato:
- Si Fₐ ≤ Fᵣ, con certeza no arranca (porque Fₛ,máx ≥ Fᵣ).
- Si Fₐ > Fᵣ, **no se puede saber**. El programa supone que arranca y lo avisa en pantalla: «Supuesto: arranca porque el empuje supera la fricción estática máxima».

Esta es una de las decisiones de modelación más importantes y la más probable en una pregunta de sustentación.

### `calcularTiempoFinal(datos, desliza, a, tParada)`
Devuelve el tiempo de análisis `t` y si el carro `alcanzaDx`.

- **Modo tiempo:** el tiempo es el que escribió el usuario.
- **Modo distancia:** hay que despejar *t* de Δx = v₀·t + ½·a·t², es decir ½·a·t² + v₀·t − Δx = 0.

  El discriminante es D = v₀² + 2·a·Δx.

  | Caso | Qué hace | Significado |
  | --- | --- | --- |
  | no desliza | t = 5 s, no alcanza | Está quieto, nunca llega; 5 s es solo un tiempo para mostrar |
  | D < 0 | t = 1,25·tₚ, no alcanza | Frena antes de recorrer Δx; se muestra un poco más allá de la parada |
  | a = 0 | t = Δx / v₀ | Velocidad constante |
  | otro | t = (−v₀ + √D) / a | Raíz de la cuadrática |

  Con a < 0 se usa esa raíz porque es la **primera** vez que pasa por Δx (la otra raíz sería la vuelta, que no ocurre porque no retrocede). El caso a = 0 con v₀ = 0 no puede ocurrir mientras desliza, así que no hay división entre cero.

### `calcularMovimiento(datos)`
La función central. Construye el movimiento como **tramos de aceleración constante**:

- Tramo `desliza`: a = (Fₐ − Fᵣ)/m.
- Tramo `reposo`: a = 0, v = 0, x constante.

Pasos:
1. `analizarArranque` → ¿desliza?
2. `a` = aceleración si desliza, 0 si no.
3. `tParada` = v₀/|a| solo si desliza y a < 0.
4. `calcularTiempoFinal` → hasta cuándo analizar.
5. `tDesliza = min(tiempo final, tParada)`: se desliza hasta el final o hasta parar, lo que ocurra primero.
6. Se crea el tramo `desliza` (si tDesliza > 0) y, si sobra tiempo, el tramo `reposo` desde la posición donde paró.
7. Se calculan `xf`, `vf` y `seDetiene`.

Devuelve `mov` con: `tramos`, `aDesliza`, `tParada`, `tFin`, `alcanzaDx`, `desliza`, `supuestoArranque`, `xf`, `vf`, `seDetiene`.

**Por qué por tramos y no con una simulación paso a paso.** Con fuerzas constantes las ecuaciones exactas existen. Así no hay error numérico, y la parada ocurre exactamente en tₚ y no «en el paso más cercano». Es la forma de garantizar que **no retrocede**: después de tₚ el tramo `reposo` fija v = 0.

### `tramoEn(mov, t)`
Devuelve el tramo que contiene el instante *t* (`t <= tr.t1`). Si *t* pasa del final, devuelve el último tramo.

### `posicionEn(mov, t)`, `velocidadEn(mov, t)`, `aceleracionEn(mov, t)`
Buscan el tramo y aplican las ecuaciones con **tiempo medido desde el inicio del tramo** (`dt = t − tr.t0`):

- x = tr.x0 + tr.v0·dt + ½·tr.a·dt²
- v = tr.v0 + tr.a·dt
- a = tr.a

Las gráficas x(t), v(t) y a(t) y la animación son llamadas repetidas a estas tres funciones.

### `friccionInicial(datos, mov)`
Devuelve la fricción que actúa al inicio, para el diagrama de cuerpo libre:
- Si desliza: **cinética**, con valor Fᵣ.
- Si está en reposo: **estática**, con valor Fₐ. Es el único valor que mantiene la fuerza neta en 0 (por eso «la fricción estática iguala al empuje»).

### `calcularEnergia(datos, mov, t = mov.tFin)`
Calcula trabajo y energía en cualquier instante *t*:

```
v  = velocidadEn(mov, t)
Δx = posicionEn(mov, t) − x₀
K₀ = ½·m·v₀²     Kf = ½·m·v²
Wa = Fa·Δx       Wr = −Fr·Δx       Wneto = Wa + Wr
Wpeso = 0        Wnormal = 0
consistente = |Wneto − (Kf − K₀)| < 1e-9
```

Detalles para explicar:
- Si el carro está en reposo, Δx = 0, así que **todos los trabajos son 0**, aunque haya empuje (la fricción estática no hace trabajo porque no hay desplazamiento).
- Tras detenerse, Δx deja de crecer: el trabajo también se congela. Por eso en el caso C, Wᵣ = −Fᵣ·d con *d* la distancia de frenado y no con la distancia hasta t = 3 s.
- `consistente` verifica Wneto = ΔK, pero **no es una validación independiente**: ambos lados salen de las mismas ecuaciones. La validación real es comparar con la solución manual (`docs/validacion.md`).

## 5. `validacion.js`

### `LIMITES`
Fuera de estos valores el programa bloquea y explica por qué:

| Límite | Valor | Razón |
| --- | --- | --- |
| m | 1000 kg | No es un carro de carril |
| F (Fₐ, Fᵣ, Fₛ,máx) | 1000 N | Rango de laboratorio |
| v₀ | 20 m/s | El aire frena con fuerza que crece con v² |
| \|x₀\| | 1000 m | Rango de laboratorio |
| t | 600 s | Rango razonable |
| Δx | 1000 m | Rango de laboratorio |
| vMax | 20 m/s | Misma razón que v₀, pero aplicada al **resultado** |

### `leerNumero(texto)`
Acepta coma o punto decimal («0,50» = «0.50»). Un campo vacío da `NaN`.

### `validarDatos(entrada)`
Convierte cada campo a número y revisa las reglas. Devuelve `{ ok, datos, errores }`, con un mensaje **por campo**:

| Regla | Qué rechaza | Por qué |
| --- | --- | --- |
| RN-01 | m ≤ 0 (y m > 1000) | a = F/m no tiene sentido |
| RN-02 | Fₐ < 0, Fᵣ < 0 | Son magnitudes; el sentido lo fija el modelo |
| RN-03 | v₀ < 0 | Iría hacia −x y Fᵣ cambiaría de sentido |
| RN-04 | t ≤ 0, Δx ≤ 0 | El análisis debe tener duración y el carro solo avanza hacia +x |
| Extra | Fₛ,máx < Fᵣ | La fricción estática máxima no puede ser menor que la cinética |
| Extra | texto no numérico, campo vacío (excepto Fₛ,máx) | No es un número |

El campo Fₛ,máx es opcional: vacío significa «sin dato» (`null`).

### `validarResultado(mov)`
Revisa el **resultado**, no los datos: aunque cada dato sea válido, la combinación puede ser irreal (por ejemplo, 0,1 kg empujado con 5 N durante 30 s). Como *a* es constante en cada tramo, la rapidez máxima está al inicio o al final de un tramo, así que basta mirar `v₀` de cada tramo y `vf`. Si supera 20 m/s, devuelve un mensaje; si no, `null`.

### `validarTodo(entrada)`
Une las dos revisiones: primero `validarDatos`; si todo está bien, `calcularMovimiento`; luego `validarResultado`. Devuelve `mov` solo si todo es válido.

## 6. `practica.js`

Genera ejercicios de **arranque**, **frenado** y **equilibrio** con números distintos. Las respuestas correctas **no se escriben a mano**: salen de `calcularMovimiento` y `calcularEnergia`. Así el modo Practicar usa exactamente el mismo modelo del simulador.

- Los datos se construyen «al revés» para que den números limpios (por ejemplo, se elige la aceleración y se calcula Fₐ = Fᵣ + m·a).
- `respuestaCorrecta(r, valor)`: acepta un margen de 2 % del valor o 0,01, el que sea mayor, para tolerar el redondeo.

## 7. Ejemplos resueltos (con la salida del código)

### Caso A · Arranque (m = 0,5 kg, Fₐ = 1,2 N, Fᵣ = 0,2 N, v₀ = 0, Δx = 1 m)
1. Fneta = 1,2 − 0,2 = 1,0 N → a = 1,0 / 0,5 = **2,0 m/s²**.
2. Distancia: Δx = ½·a·t² → t = √(2·1/2) = **1,0 s**.
3. v = a·t = **2,0 m/s**.
4. K = ½·0,5·2² = **1,0 J**.
5. Wₐ = 1,2·1 = **+1,2 J**; Wᵣ = −0,2·1 = **−0,2 J**; Wneto = **+1,0 J = ΔK** ✓.

Programa: `a=2, tFin=1, vf=2, Wa=1.2, Wr=−0.2, Wneto=1`.

### Caso B · Equilibrio (m = 0,5 kg, Fₐ = Fᵣ = 0,3 N, v₀ = 1 m/s, t = 2 s)
Fneta = 0 → a = 0 → v = 1 m/s constante. Δx = v₀·t = **2 m**. ΔK = 0. Wₐ = +0,6 J, Wᵣ = −0,6 J, Wneto = 0 ✓.

### Caso C · Frenado (m = 0,5 kg, Fₐ = 0, Fᵣ = 0,5 N, v₀ = 2 m/s)
1. a = (0 − 0,5)/0,5 = **−1 m/s²**.
2. tₚ = 2/1 = **2 s**.
3. d = v₀²/(2|a|) = 4/2 = **2 m**.
4. ΔK = −½·0,5·2² = **−1 J**; Wᵣ = −0,5·2 = **−1 J** ✓.
5. A t = 3 s: tramo `reposo` → v = 0, x = 2 m. **No retrocede.**

### Ejemplo extra · El empuje hace trabajo positivo y aun así frena
m = 2 kg, Fₐ = 1 N, Fᵣ = 3 N, v₀ = 4 m/s, t = 5 s.
- a = (1 − 3)/2 = −1 m/s²; tₚ = 4 s; d = 16/2 = 8 m.
- A los 5 s: tramos `desliza` (0–4 s) y `reposo` (4–5 s). v = 0, x = 8 m.
- Wₐ = 1·8 = **+8 J**; Wᵣ = −3·8 = **−24 J**; Wneto = **−16 J = ΔK** (K₀ = 16 J → 0).

Idea clave: el empuje aporta energía (+8 J), pero la resistencia quita más (−24 J).

### Ejemplo extra · Modo distancia con frenado
m = 0,5 kg, Fₐ = 0, Fᵣ = 0,5 N, v₀ = 2 m/s.
- Δx = 1 m: D = 4 − 2 = 2 > 0 → t = (−2 + √2)/(−1) = **0,586 s**; v = 2 − 0,586 = **1,414 m/s**. Alcanza la distancia.
- Δx = 5 m: D = 4 − 10 < 0 → no alcanza. Se detiene a los 2 m (tₚ = 2 s) y el programa muestra 2,5 s (= 1,25·tₚ).

## 8. Pruebas automáticas (`npm test`)

- **10 casos físicos:** A, B, C y 7 casos borde (Caso C a t = 3 s, reposo con Fₐ ≤ Fᵣ, reposo con Fₐ = Fᵣ, Fₛ,máx dada sin y con arranque, modo distancia que frena antes, x₀ ≠ 0). Los valores esperados están calculados a mano y se comparan con tolerancia 1e-9.
- **13 reglas de validación:** cada una debe ser aceptada o rechazada como se espera (masa 0, masa negativa, coma decimal, empuje negativo, etc.).

## 9. Preguntas probables en la sustentación

**¿Por qué no simulan paso a paso (Euler)?** Con fuerzas constantes hay solución exacta. Es más precisa y garantiza que la parada ocurra en tₚ.

**¿Cómo saben que no retrocede?** Porque el modelo tiene un tramo `reposo` con v = 0 y a = 0 después de tₚ. La resistencia solo se opone al movimiento y no puede invertir la velocidad.

**¿Cómo deciden si arranca desde el reposo?** Comparando Fₐ con Fₛ,máx. Si no se da, se compara con Fᵣ y se **avisa que es un supuesto** cuando Fₐ > Fᵣ.

**¿Por qué Wneto = ΔK no basta como validación?** Porque los dos lados salen de las mismas ecuaciones. La validación independiente es la solución manual de A, B y C.

**¿Qué pasa si Fₐ = Fᵣ en reposo?** No arranca: la fricción estática iguala al empuje, a = 0, no hay desplazamiento ni trabajo.

**¿Por qué el límite de 20 m/s?** A esa rapidez el aire frena con una fuerza que crece con v². El supuesto de fuerzas constantes deja de valer, así que se bloquea.

**¿La normal y el peso afectan el cálculo?** No en horizontal: se anulan y su trabajo es 0. El peso solo se usa en el diagrama (P = m·g).

**¿Qué limitaciones tiene el modelo?** Una dimensión, fuerzas constantes, sin resistencia del aire, sin retroceso, sin polea ni masas colgantes, y fricción estática solo como umbral de arranque.

## 10. Ejercicios para practicar

Resuélvelos a mano y compáralos con el simulador.

1. m = 1 kg, Fₐ = 3 N, Fᵣ = 1 N, v₀ = 0, t = 4 s. Halla a, v, Δx y Wneto.
2. m = 2 kg, Fₐ = 0, Fᵣ = 4 N, v₀ = 6 m/s. Halla tₚ, d y ΔK.
3. m = 0,5 kg, Fₐ = Fᵣ = 0,4 N, v₀ = 3 m/s, t = 5 s. Halla Δx y todos los trabajos.
4. ¿Cuánto vale Fᵣ si un carro de 1 kg que va a 4 m/s, sin empuje, debe detenerse en 2 m?

**Respuestas:**
1. a = 2 m/s²; v = 8 m/s; Δx = 16 m; Wneto = 32 J.
2. a = −2 m/s²; tₚ = 3 s; d = 9 m; ΔK = −36 J.
3. a = 0; Δx = 15 m; Wₐ = +6 J; Wᵣ = −6 J; Wneto = 0.
4. Fᵣ = m·v₀²/(2·d) = 1·16/4 = 4 N.
