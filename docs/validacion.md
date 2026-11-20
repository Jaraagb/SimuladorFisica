# Validación: cálculo manual vs. programa

La columna «Manual» sale de la solución manuscrita, paso a paso en [solucion-manual.md](solucion-manual.md). La columna «Programa» se calculó por separado con el simulador.

La columna «Programa» sale de la pestaña Cuentas del simulador o de `npm test` (también con los botones Caso A, B y C).

## Caso A · Aceleración desde el reposo
Datos: m = 0,50 kg; Fₐ = 1,20 N; Fᵣ = 0,20 N; v₀ = 0; Δx = 1,00 m

| Magnitud | Manual | Programa | Diferencia |
| --- | --- | --- | --- |
| a (m/s²) | 2,0 | 2,00 | 0 |
| t (s) | 1,0 | 1,00 | 0 |
| v final (m/s) | 2,0 | 2,00 | 0 |
| K final (J) | 1,0 | 1,00 | 0 |
| Wₐ (J) | +1,2 | +1,20 | 0 |
| Wᵣ (J) | −0,2 | −0,20 | 0 |
| W neto (J) | +1,0 | +1,00 | 0 |

## Caso B · Movimiento uniforme
Datos: m = 0,50 kg; Fₐ = Fᵣ = 0,30 N; v₀ = 1,0 m/s; t = 2,0 s

| Magnitud | Manual | Programa | Diferencia |
| --- | --- | --- | --- |
| a (m/s²) | 0 | 0,00 | 0 |
| Δx (m) | 2,0 | 2,00 | 0 |
| ΔK (J) | 0 | 0,00 | 0 |
| Wₐ (J) | +0,6 | +0,60 | 0 |
| Wᵣ (J) | −0,6 | −0,60 | 0 |

## Caso C · Frenado hasta detenerse
Datos: m = 0,50 kg; Fₐ = 0; Fᵣ = 0,50 N; v₀ = 2,0 m/s

| Magnitud | Manual | Programa | Diferencia |
| --- | --- | --- | --- |
| a mientras desliza (m/s²) | −1,0 | −1,00 | 0 |
| t de parada (s) | 2,0 | 2,00 | 0 |
| Δx (m) | 2,0 | 2,00 | 0 |
| ΔK (J) | −1,0 | −1,00 | 0 |
| Wᵣ (J) | −1,0 | −1,00 | 0 |
| v en t = 3 s (m/s) | 0 (no retrocede) | 0,00 (no retrocede) | 0 |

## Explicación de diferencias

- El programa usa las mismas ecuaciones exactas por tramos que la solución manual (no hay simulación paso a paso), así que no debería haber diferencias de método.
- Las únicas diferencias posibles son de **redondeo**: el programa muestra 2 decimales.
- El valor g = 9,8 m/s² solo se usa para el peso y la normal del diagrama; no afecta ningún resultado horizontal.
- La igualdad W neto = ΔK que muestra el programa **no** es una validación independiente: ambos valores salen de las mismas ecuaciones. La validación es esta tabla, comparada con soluciones manuscritas hechas por separado.
