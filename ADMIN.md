# Guía del administrador 🛠️

Cómo operar la polla una vez publicada en GitHub Pages.

## ¿Cómo funciona el almacenamiento?

La página es estática (GitHub Pages no tiene base de datos), así que los datos viven en dos lugares:

- **Datos compartidos** (los ve todo el mundo): los archivos de [public/data/](public/data/) en este repositorio — `participants.json`, `results.json` y `raffle.json`. Solo tú puedes cambiarlos (editando el repo).
- **Datos locales** (solo en cada navegador): la inscripción de cada participante y tus cambios como admin se guardan primero en el `localStorage` del navegador donde se hicieron.

El **registro oficial** de las inscripciones sigue siendo el formulario de Microsoft Forms (la app envía a cada participante allí al final de su inscripción).

## Flujo de trabajo del admin

### 1. Cierre de inscripciones (12 de junio)

1. Descarga las respuestas del formulario MUNDIAL 2026 de Microsoft Forms (Excel).
2. Abre la página publicada, registra los pronósticos de todos los participantes (o verifica los que ya tengas en tu navegador).
3. Entra al panel **Admin** y pulsa **「Exportar JSON (publicar en GitHub)」** — se descargan 3 archivos. (Si el navegador pregunta, permite las descargas múltiples.)
4. En GitHub, ve a la carpeta `public/data/`, usa **Add file → Upload files**, arrastra los 3 archivos y confirma el commit.
5. En 1–2 minutos la página se vuelve a publicar y todos ven la lista de participantes.

### 2. Después de cada partido

1. Entra al panel **Admin** en la página, ingresa el marcador real del partido y pulsa **Guardar** (queda en tu navegador).
2. Pulsa **「Exportar JSON (publicar en GitHub)」** y sube los archivos a `public/data/` como en el paso anterior.
3. Todos los participantes verán el ranking actualizado.

### 3. Empates al final

Si hay empate en los primeros lugares, el panel te mostrará el botón **「Realizar sorteo interno」** 🎲. Haz el sorteo y vuelve a exportar/subir los JSON para que el resultado quede publicado.

## Notas importantes

- **La contraseña del admin está en el código fuente** ([src/polla-sincosoft.tsx](src/polla-sincosoft.tsx), constante `ADMIN_PW`). Como el repo es público, cualquiera puede verla. Esto NO es un riesgo para los datos: aunque alguien entre al panel admin, sus cambios solo quedan en SU navegador. Los datos que ven todos son los de `public/data/`, que solo tú puedes modificar en GitHub.
- **Privacidad**: al subir `participants.json` al repositorio público, los nombres y correos quedan visibles en internet. Si prefieres, edita el archivo antes de subirlo y enmascara los correos (por ejemplo `dan***@sinco.com.co`) — la app funciona igual.
- Para corregir un resultado ya publicado, edita `public/data/results.json` directamente en GitHub.
- Para cambiar la foto del premio, sube la imagen como `public/barril.jpg` (si no existe, se muestra el barril dibujado en SVG).
