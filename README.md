# 🏆 Barril Mundialista — Polla Sincosoft 2026

Polla futbolera para los partidos de la Selección Colombia 🇨🇴 en la fase de grupos del Mundial 2026. El premio: **un barril asador** 🔥.

## ¿Cómo funciona?

Cada participante registra su pronóstico del marcador para los 3 partidos de Colombia antes de la fecha límite (12 de junio de 2026, 11:59 p.m. COL):

| # | Rival | Fecha | Estadio |
|---|-------|-------|---------|
| 1 | 🇺🇿 Uzbekistán | Miércoles 17 de junio, 9:00 p.m. COL | Estadio Azteca, Ciudad de México |
| 2 | 🇨🇩 RD Congo | Martes 23 de junio, 9:00 p.m. COL | Estadio Akron, Guadalajara |
| 3 | 🇵🇹 Portugal | Sábado 27 de junio, 6:30 p.m. COL | Hard Rock Stadium, Miami |

## Sistema de puntos

| Acierto | Puntos |
|---------|--------|
| Marcador exacto | **5 pts** |
| Resultado correcto (gana / empata / pierde) sin marcador exacto | **2 pts** |
| Goles exactos de uno de los dos equipos | **+1 pt** |

Gana quien acumule más puntos al final de los 3 partidos. En caso de empate, la app incluye un sorteo aleatorio entre los empatados 🎲.

## Funcionalidades

- ⚽ Registro de participantes con pronóstico de los 3 partidos
- ⏳ Cuenta regresiva hasta el cierre de pronósticos (después del cierre, los pronósticos quedan bloqueados)
- 📊 Tabla de posiciones en vivo con puntos y marcadores exactos
- 🔐 Panel de administración protegido con contraseña: ingreso de resultados reales, gestión de participantes y sorteo de desempate
- 🎉 Confetti, escudo de Colombia y un barril asador dibujado en SVG

## Tecnología

- [React](https://react.dev/) (componente único en [polla-sincosoft.tsx](polla-sincosoft.tsx))
- [lucide-react](https://lucide.dev/) para los íconos
- Estilos inline (sin dependencias de CSS)

> **Nota:** la persistencia usa las APIs `window.storage` y `window.fs` del entorno de artefactos de Claude. Para ejecutar la app en otro entorno (Vite, Next.js, etc.) hay que adaptar esas llamadas a `localStorage` o a un backend propio.

---

Hecho con ❤️ para el equipo de Sincosoft. ¡Vamos Colombia! 🇨🇴
