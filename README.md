# Carril: laboratorio de fuerzas, movimiento y energía

Simulador interactivo para Física Mecánica (Universidad Cooperativa de Colombia, 2026-2). Un carro de masa *m* se mueve sobre un carril horizontal, con una fuerza aplicada y una fuerza resistiva. El estudiante cambia las fuerzas, ve el movimiento en vivo y lo relaciona con las gráficas, el trabajo y la energía.

## Qué tiene

- **Explorar.** Deslizadores o flechas que se arrastran en el carril. Animación con velocidades de ×0,25 a ×4, marcas estroboscópicas en el piso, carro fantasma de la corrida anterior y lecturas en vivo de t, x, v y a.
  - **Movimiento (Módulo I):** gráficas x(t), v(t) y a(t) que se dibujan mientras el carro avanza.
  - **Energía (Módulo II):** la ecuación K₀ + Wₐ + Wᵣ = K actualizándose en vivo, barras de energía y tabla de trabajos con su signo.
  - **Fuerzas:** diagrama de cuerpo libre y botones «¿Qué pasa si…?» (duplicar masa, duplicar empuje, quitar resistencia, igualar fuerzas).
  - **Cuentas:** cálculo paso a paso de los dos módulos y validación contra los casos resueltos a mano.
- **Retos.** 5 misiones con estrellas: «Cita a los 2 segundos», «Frenada perfecta», «Velocidad crucero», «¿Dónde se detiene?» y «Energía justa». Incluyen pistas y la solución.
- **Predecir.** El estudiante responde tres preguntas antes de lanzar. El simulador oculta los resultados hasta comprobar.
- **Practicar.** Ejercicios con números distintos cada vez, corrección automática, solución paso a paso y botón para ver el ejercicio en el carril.
- **Ficha de clase** (`ficha.html`): actividad «Prediga, compruebe y explique», imprimible, con versión docente.
- **Fundamentación** (`fundamentacion.html`): modelo, supuestos, ecuaciones, decisiones y unidades.

Enlaces directos: `#explorar`, `#retos`, `#predecir`, `#practicar`, `#A`, `#B`, `#C`, `#ficha`, `#ficha-masa`, `#ficha-fa`.

## Cómo correrlo

Requiere Node.js 18 o superior.

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173
npm test         # pruebas del modelo físico (casos A, B, C y casos borde)
npm run build    # genera la carpeta dist/ lista para publicar
```

`npm run build` empaqueta todo el simulador en un único `dist/index.html`. Además de publicarse en internet, ese archivo abre con doble clic sin servidor, como respaldo si no hay conexión en el salón (sin conexión usa la tipografía del sistema).

## Publicar en Cloudflare Pages (gratis)

**Con GitHub (recomendado, se actualiza solo con cada cambio):**
1. Sube esta carpeta a un repositorio de GitHub (sin `node_modules` ni `dist`; el `.gitignore` ya los excluye).
2. En Cloudflare: *Workers & Pages* → *Create* → *Pages* → *Connect to Git* y elige el repositorio.
3. Configuración: *Framework preset* = Vite (o None), *Build command* = `npm run build`, *Build output directory* = `dist`.
4. *Save and Deploy*. Queda en `https://<nombre-del-proyecto>.pages.dev`.

**Sin Git:** ejecuta `npm run build` y, en *Workers & Pages* → *Create* → *Pages* → *Upload assets*, arrastra la carpeta `dist`.

## Estructura

```
src/
├── fisica/
│   ├── fisica.js         MODELO FÍSICO: todas las ecuaciones (sin interfaz)
│   ├── validacion.js     condiciones de validez de los datos
│   ├── casos-prueba.js   casos A, B, C y casos borde, con valores calculados a mano
│   └── practica.js       generador de ejercicios (usa fisica.js)
├── componentes/
│   ├── Escenario.jsx     carril, carro, flechas arrastrables, estroboscopio
│   ├── Grafica.jsx       gráficas x(t), v(t), a(t) en vivo
│   ├── Paneles.jsx       Movimiento, Energía, Fuerzas y Cuentas
│   ├── Controles.jsx     deslizadores y campos de datos
│   └── Modos.jsx         Retos, Predecir y Practicar
├── retos.js              definición de los 5 retos
├── formato.js            números con coma decimal
├── App.jsx               estado, reproducción y modos
└── estilos.css
public/                   ficha.html y fundamentacion.html
pruebas/pruebas.mjs       pruebas en Node
docs/                     validación, hitos y declaración de uso de IA
```

La interfaz **nunca** calcula física: siempre llama a `src/fisica/fisica.js`.

## Funciones del modelo físico (`src/fisica/fisica.js`)

| Función | Qué calcula | Ecuación |
| --- | --- | --- |
| `calcularAceleracion(m, Fa, Fr)` | Aceleración mientras desliza | a = (Fₐ − Fᵣ) / m |
| `analizarArranque(datos)` | Si el carro desliza al inicio | Si v₀ = 0, compara Fₐ con Fₛ,máx (o lo supone y avisa) |
| `calcularTiempoFinal(...)` | Tiempo de análisis; en modo distancia despeja t | ½·a·t² + v₀·t − Δx = 0 |
| `calcularMovimiento(datos)` | Tramos, tiempo de parada, x y v finales | t parada = v₀ / \|a\| |
| `posicionEn(mov, t)` | Posición | x = x₀ + v₀·t + ½·a·t² |
| `velocidadEn(mov, t)` | Velocidad | v = v₀ + a·t |
| `aceleracionEn(mov, t)` | Aceleración del tramo | constante por tramo |
| `calcularEnergia(datos, mov, t)` | Energía y trabajos en el instante t | K = ½·m·v², Wₐ = Fₐ·Δx, Wᵣ = −Fᵣ·Δx |

## Condiciones de validez

| Situación | Qué hace el programa |
| --- | --- |
| m ≤ 0 | Rechaza el dato con un mensaje |
| Fₐ &lt; 0 o Fᵣ &lt; 0 | Rechaza el dato: se ingresan magnitudes |
| v₀ &lt; 0 | Rechaza el dato: fuera del modelo |
| Frenado hasta v = 0 | Se detiene y queda en reposo: no retrocede |
| Arranque desde el reposo | Requiere fricción estática. Sin Fₛ,máx y con Fₐ &gt; Fᵣ, supone que arranca y lo avisa |
| Modo distancia y se detiene antes | Avisa que no alcanza la distancia pedida |
| Masa &gt; 1000 kg, fuerzas &gt; 1000 N, v₀ &gt; 20 m/s, \|x₀\| &gt; 1000 m | Bloquea: fuera del rango de un carril de laboratorio |
| El resultado superaría 20 m/s | Bloquea aunque cada dato sea válido: el aire haría que las fuerzas dejen de ser constantes |

Los límites están en `LIMITES`, en `src/fisica/validacion.js`. Las reglas se prueban con `npm test` y en la pestaña Cuentas.

## Uso de inteligencia artificial y autoría

Ver `docs/declaracion-ia.md`. La entrega no implica cesión de derechos de autor; su uso en cursos posteriores se acordará con la docente según las políticas de la universidad.

## Librerías

React 18 y Vite 5 (licencia MIT). Tipografía Archivo (Google Fonts, licencia OFL).
