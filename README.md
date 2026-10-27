# Jale ☀️

**¡Hay jale!** App gratuita para personas que **saben hacer su trabajo pero no saben hacer un currículum** ni usar mucho la computadora. Hecha para Chicago, en español.

## Qué hace

| Herramienta | Para qué sirve |
|---|---|
| 📝 Hacer mi currículum | 8 pasos sencillos. La persona **toca** las tareas que sabe hacer (ya traducidas) y sale un currículum de una página en **inglés y español**, listo para imprimir o guardar como PDF. Tiene opción de mostrar solo los últimos 15 años para quien le dicen “sobrecalificado”. |
| 🔍 ¿Es real este trabajo? | Antes de mandar el currículum: botones que abren la dirección y el teléfono de la empresa en el mapa, opiniones de trabajadores, quejas, BBB y el registro de empresas de Illinois. Más una lista de señales de estafa. |
| 📍 Dónde buscar trabajo | Centros gratuitos de empleo, universidades (UIC, UChicago, Northwestern, Loyola, DePaul, City Colleges) y la Ciudad de Chicago, con las palabras en inglés para buscar según su oficio. |
| 🎤 Practicar la entrevista | 14 preguntas comunes, en inglés y español, con consejo, ejemplo y botón para oírlas. |
| 🗣️ Inglés para el trabajo | Frases útiles con audio. |
| 📋 Mis solicitudes | Anotar dónde mandó su currículum y cómo va. |
| ✅ Qué llevar y mis derechos | Documentos, salario mínimo de Chicago y cómo evitar estafas. |

Pensada para poca experiencia con computadoras: letra y botones grandes, una pregunta por pantalla, **🎤 dictar en vez de escribir** y **🔊 escuchar** cada pantalla.

**Privacidad:** los datos se guardan solo en el navegador de la persona (no hay cuentas ni base de datos). Hay botones para guardar una copia y para borrar todo, pensando en computadoras públicas.

### Ayuda con IA (opcional)

Si se configura una clave de la API de Claude (`ANTHROPIC_API_KEY`), aparecen tres botones más:
- **Investigar esta empresa:** busca en internet la dirección, el teléfono y señales de alerta del anuncio.
- **¿Qué tal mi respuesta?:** consejos sobre la respuesta de entrevista que la persona escribió o dictó.
- **Traducir tareas propias** al inglés para el currículum.

Sin la clave, la app funciona completa y esos botones no aparecen. Usar la IA **cuesta dinero** por cada uso; por eso hay límites: 15 usos por hora por persona y 300 al día en total (se cambian con `IA_LIMITE_POR_HORA` y `IA_LIMITE_DIARIO`).

## Publicarla en internet (GitHub + Render)

### 1. Subir el código a GitHub
1. Entre a [github.com](https://github.com) con su cuenta (o cree una).
2. Toque **New repository**, llámelo `jale`, déjelo **sin** README y toque **Create repository**.
3. En una terminal, dentro de esta carpeta:
   ```bash
   git remote add origin https://github.com/jmanolito17-hash/jale.git
   git push -u origin main
   ```
   Se abrirá el navegador para que entre a GitHub.

### 2. Publicarla en Render
1. Entre a [render.com](https://render.com) con **Sign in with GitHub**.
2. Toque **New → Blueprint** y elija el repositorio `jale`.
3. Render lee el archivo `render.yaml` y le pide `ANTHROPIC_API_KEY`: déjela vacía o pegue su clave.
4. Toque **Apply**. En unos 3 minutos la app queda en una dirección como `https://jale.onrender.com`.

Cada vez que suba cambios a GitHub, Render la actualiza solo.

> En el plan gratis de Render, la app se “duerme” si nadie la usa por 15 minutos. La primera visita después tarda cerca de un minuto en abrir.

### 3. Activar la IA después (opcional)
Cree una clave en [platform.claude.com](https://platform.claude.com) y péguela en Render → su servicio → **Environment** → `ANTHROPIC_API_KEY`.

## Probar en su computadora

Requiere Node 22 o más reciente.

```bash
npm install
npm start
```

Abra http://localhost:3000. Para la IA, copie `.env.example` como `.env` y ponga su clave.

## Estructura

```
public/index.html   la página
public/app.js       pantallas y lógica (todo en el navegador)
public/datos.js     oficios, tareas, preguntas, frases y recursos de Chicago
public/app.css      estilos (y la hoja de impresión del currículum)
server.js           sirve la página y la ayuda opcional con IA (/api/ia)
render.yaml         configuración para Render
```

Los recursos de Chicago y el salario mínimo ($17.05 desde el 1 de julio de 2026) se verificaron en octubre de 2026. Revíselos cada año en `public/datos.js`.
