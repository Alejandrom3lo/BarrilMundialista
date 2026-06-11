# Guía del administrador 🛠️

La polla funciona con **un solo archivo**: [polla-standalone.html](polla-standalone.html). No necesita servidor ni internet — se abre con doble clic en cualquier navegador.

## Cómo se juega

1. **Distribuye el archivo**: envía `polla-standalone.html` a tus compañeros por Teams o correo.
2. **Cada participante**: lo abre, llena nombre, correo y sus 3 marcadores, y pulsa «Enviar mi pronóstico». La app descarga `inscripcion-<nombre>.txt` (su pronóstico en JSON, con hora de inscripción) y se lo envían a ti por Teams o correo.
3. **Tú recoges los .txt**: son el registro oficial de cada pronóstico.

## Flujo de trabajo del admin

### 1. Cierre de inscripciones (12 de junio)

1. Abre tu `polla-standalone.html`, entra al panel **Admin** (contraseña en `ADMIN_PW` de [src/polla-sincosoft.tsx](src/polla-sincosoft.tsx)).
2. Pulsa **「Importar inscripciones (.txt)」** y selecciona todos los archivos que te enviaron (puedes seleccionarlos todos a la vez). La app los deserializa, valida y descarta duplicados por correo.
3. Los datos quedan guardados en el navegador de tu equipo (localStorage): no se pierden al cerrar.

### 2. Después de cada partido (17, 23 y 27 de junio)

1. En el panel **Admin**, ingresa el marcador real y pulsa **Guardar**.
2. El ranking se recalcula al instante. Compártelo con el equipo (pantallazo del ranking o **「Exportar CSV」**).

### 3. Empates al final

Si hay empate en los primeros lugares, el panel muestra el botón **「Realizar sorteo interno」** 🎲. El resultado del sorteo queda guardado y no cambia al recargar (solo se invalida si modificas los resultados oficiales).

## Respaldo de datos

El botón **「Exportar JSON (respaldo)」** descarga `participants.json`, `results.json` y `raffle.json`. Guárdalos tras cada cambio importante: con ellos puedes reconstruir la polla en otro equipo (importando `participants.json` con el botón de importar; acepta tanto una inscripción individual como un arreglo completo).

## Notas

- Los datos viven en el `localStorage` del navegador donde se importaron. Usa siempre el mismo navegador y equipo para administrar, y guarda los respaldos JSON.
- No borres el historial/datos de sitios del navegador sin antes exportar el respaldo.
- La foto del premio: en el archivo autónomo se muestra el barril dibujado en SVG (la imagen externa no carga al abrir desde un archivo local).
- Para regenerar el HTML tras cambiar el código: `npm run build:single` (queda en `dist-standalone/index.html`).
- El repositorio de GitHub queda como respaldo del código. El despliegue automático a GitHub Pages fue retirado; la última versión publicada quedó congelada (avísame si quieres darla de baja).
