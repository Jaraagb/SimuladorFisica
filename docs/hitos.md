# Registro de proceso: tres hitos

Completa las fechas y los cambios reales a medida que ocurran.

| Hito | Fecha | Qué se hizo | Cambios principales |
| --- | --- | --- | --- |
| 1. Modelo físico | 15–__ nov 2026 | Lectura de la guía y levantamiento de requisitos (15 nov). DCL y solución manuscrita de los casos A, B y C. Supuestos del modelo. | Decisión: fórmulas exactas por tramos en lugar de simulación numérica. Decisión: arranque desde el reposo con aviso de supuesto y campo opcional de fricción estática. |
| 2. Primer prototipo | 17 nov 2026 | Núcleo `fisica.js` con pruebas automáticas (casos A, B, C y 6 casos borde). Primera interfaz en HTML y JavaScript con los módulos I y II, gráficas, DCL y validaciones. | Se agregó el modo «analizar hasta Δx» porque el caso A viene dado por desplazamiento. |
| 3. Versión final | 17–__ nov 2026 | Rediseño completo como laboratorio interactivo (React + Vite) para que la clase sea más dinámica: carril animado, flechas arrastrables, estroboscopio, gráficas en vivo, energía en vivo, retos, modo de predicción y práctica. Despliegue en Cloudflare Pages. | El núcleo físico no cambió (mismas pruebas); solo se agregó calcular la energía en cualquier instante t. La primera interfaz se veía como un formulario y se reemplazó. |
