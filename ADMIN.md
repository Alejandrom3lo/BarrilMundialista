# Guía del administrador 🛠️

Cómo operar la polla una vez publicada en GitHub Pages.

## ¿Cómo funciona el almacenamiento?

La página es estática (GitHub Pages no tiene base de datos), así que los datos viven en dos lugares:

- **Datos compartidos** (los ve todo el mundo): los archivos de [public/data/](public/data/) en este repositorio — `participants.json`, `results.json` y `raffle.json`. Solo tú puedes cambiarlos (editando el repo).
- **Datos locales** (solo en cada navegador): la inscripción de cada participante y tus cambios como admin se guardan primero en el `localStorage` del navegador donde se hicieron.

## ¿Cómo llegan las inscripciones?

Cuando alguien completa su pronóstico en la página, la app **descarga automáticamente un archivo `.txt` con su inscripción en formato JSON** (también puede copiarla al portapapeles). El participante te envía ese archivo por Teams o correo. Ese archivo es el registro oficial de su pronóstico, con hora de inscripción incluida.

## Flujo de trabajo del admin

### 1. Cierre de inscripciones (12 de junio)

1. Reúne todos los archivos `.txt` que te enviaron los participantes.
2. Abre la página, entra al panel **Admin** y pulsa **「Importar inscripciones (.txt)」** — puedes seleccionar todos los archivos a la vez. La app los deserializa, valida y descarta duplicados por correo.
3. Pulsa **「Exportar JSON (publicar en GitHub)」** — se descargan 3 archivos. (Si el navegador pregunta, permite las descargas múltiples.)
4. En GitHub, ve a la carpeta `public/data/`, usa **Add file → Upload files**, arrastra los 3 archivos y confirma el commit.
5. En 1–2 minutos la página se vuelve a publicar y todos ven la lista de participantes.

### 2. Después de cada partido

1. Entra al panel **Admin** en la página, ingresa el marcador real del partido y pulsa **Guardar** (queda en tu navegador).
2. Pulsa **「Exportar JSON (publicar en GitHub)」** y sube los archivos a `public/data/` como en el paso anterior.
3. Todos los participantes verán el ranking actualizado.

### 3. Empates al final

Si hay empate en los primeros lugares, el panel te mostrará el botón **「Realizar sorteo interno」** 🎲. Haz el sorteo y vuelve a exportar/subir los JSON para que el resultado quede publicado.

## Versión autónoma (un solo archivo)

[polla-standalone.html](polla-standalone.html) es toda la app compilada en un único archivo HTML: funciona con doble clic, sin servidor y sin internet. Útil como consola local del admin (importar .txt, calcular ranking, exportar). En este modo no se leen los datos compartidos de `public/data/`; todo queda en el navegador local. Para regenerarlo: `npm run build:single` (queda en `dist-standalone/index.html`).

## Notas importantes

- **La contraseña del admin está en el código fuente** ([src/polla-sincosoft.tsx](src/polla-sincosoft.tsx), constante `ADMIN_PW`). Como el repo es público, cualquiera puede verla. Esto NO es un riesgo para los datos: aunque alguien entre al panel admin, sus cambios solo quedan en SU navegador. Los datos que ven todos son los de `public/data/`, que solo tú puedes modificar en GitHub.
- **Privacidad**: al subir `participants.json` al repositorio público, los nombres y correos quedan visibles en internet. Si prefieres, edita el archivo antes de subirlo y enmascara los correos (por ejemplo `dan***@sinco.com.co`) — la app funciona igual.
- Para corregir un resultado ya publicado, edita `public/data/results.json` directamente en GitHub.
- Para cambiar la foto del premio, sube la imagen como `public/barril.jpg` (si no existe, se muestra el barril dibujado en SVG).
