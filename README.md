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

## 🌐 Página en vivo

La app está publicada con GitHub Pages:

**https://alejandrom3lo.github.io/BarrilMundialista/**

Cada push a `main` la vuelve a publicar automáticamente (workflow en [.github/workflows/deploy.yml](.github/workflows/deploy.yml)).

## Tecnología

- [React](https://react.dev/) + [Vite](https://vite.dev/) (componente principal en [src/polla-sincosoft.tsx](src/polla-sincosoft.tsx))
- [lucide-react](https://lucide.dev/) para los íconos
- Estilos inline (sin dependencias de CSS)
- Sin backend: los datos compartidos viven en [public/data/](public/data/) y los actualiza el administrador (ver [ADMIN.md](ADMIN.md)); la inscripción de cada participante se guarda en su navegador (`localStorage`) y el registro oficial es el formulario de Microsoft Forms

## Desarrollo local

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173/BarrilMundialista/
npm run build    # compila a dist/
```

---

Hecho con ❤️ para el equipo de Sincosoft. ¡Vamos Colombia! 🇨🇴
