"use strict";
// Jale. Todo vive en el navegador (localStorage); el servidor solo se usa para la ayuda opcional con IA.

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const enc = encodeURIComponent;
const AHORA = new Date().getFullYear();
const CLAVE = "empleo-claro-v1";
const hoyLocal = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

/* ---------- Datos guardados ---------- */
function nuevo() {
  return {
    perfil: { nombre: "", telefono: "", email: "", ciudad: "Chicago, IL", objetivo: "", trabajos: [], cualidades: [],
      certificados: [], ingles: "", otrosIdiomas: "", disponibilidad: [], estudios: "", estudiosPais: "" },
    solicitudes: [], respuestas: {}, recortar: false, idiomaCV: "en"
  };
}
// Límites: evitan que los datos crezcan sin control.
const LIM = { trabajos: 15, solicitudes: 300, tareas: 30, archivoBytes: 1_000_000 };

// Revisa y limpia datos que vienen de fuera (el almacenamiento o un archivo de copia):
// solo pasan los campos conocidos, con su tipo y largo máximo. Los ids se usan en enlaces y atributos.
const txt = (v, max) => (typeof v === "string" ? v : "").slice(0, max);
const idOk = v => typeof v === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(v);
const anio = v => /^\d{4}$/.test(String(v ?? "")) ? String(v) : "";
const lista = (v, ok) => Array.isArray(v) ? v.filter(ok) : [];
function limpiarDatos(d) {
  const n = nuevo();
  if (!d || typeof d !== "object") return n;
  const p = d.perfil && typeof d.perfil === "object" ? d.perfil : {};
  const deLista = (arr, base) => [...new Set(lista(arr, x => base.some(b => b[0] === x)))];
  n.perfil = {
    nombre: txt(p.nombre, 80), telefono: txt(p.telefono, 30), email: txt(p.email, 80), ciudad: typeof p.ciudad === "string" ? txt(p.ciudad, 60) : "Chicago, IL",
    objetivo: OFICIOS.some(o => o.id === p.objetivo) ? p.objetivo : "",
    trabajos: lista(p.trabajos, t => t && typeof t === "object" && idOk(t.id)).slice(0, LIM.trabajos).map(t => ({
      id: t.id, oficio: OFICIOS.some(o => o.id === t.oficio) ? t.oficio : "", lugar: txt(t.lugar, 80), ciudad: txt(t.ciudad, 60),
      desde: anio(t.desde), hasta: anio(t.hasta), actual: t.actual === true,
      tareas: lista(t.tareas, x => Array.isArray(x) && typeof x[0] === "string" && typeof x[1] === "string").slice(0, LIM.tareas).map(x => [x[0].slice(0, 200), x[1].slice(0, 200)])
    })),
    cualidades: deLista(p.cualidades, CUALIDADES).slice(0, 5), certificados: deLista(p.certificados, CERTIFICADOS),
    ingles: NIVEL_INGLES.some(x => x[0] === p.ingles) ? p.ingles : "", otrosIdiomas: txt(p.otrosIdiomas, 60),
    disponibilidad: deLista(p.disponibilidad, DISPONIBILIDAD),
    estudios: ESTUDIOS.some(x => x[0] === p.estudios) ? p.estudios : "", estudiosPais: txt(p.estudiosPais, 40)
  };
  n.solicitudes = lista(d.solicitudes, s => s && typeof s === "object" && idOk(s.id)).slice(0, LIM.solicitudes).map(s => ({
    id: s.id, empresa: txt(s.empresa, 100), puesto: txt(s.puesto, 100), fecha: /^\d{4}-\d{2}-\d{2}$/.test(s.fecha) ? s.fecha : "",
    estado: ESTADOS.some(e => e[0] === s.estado) ? s.estado : "por-enviar", direccion: txt(s.direccion, 150), telefono: txt(s.telefono, 30),
    notas: txt(s.notas, 1000), conocido: txt(s.conocido, 120), rrhh: txt(s.rrhh, 120)
  }));
  if (d.respuestas && typeof d.respuestas === "object") for (const [k, v] of Object.entries(d.respuestas)) if (/^\d{1,2}$/.test(k)) n.respuestas[k] = txt(v, 1500);
  n.recortar = d.recortar === true;
  n.idiomaCV = d.idiomaCV === "es" ? "es" : "en";
  return n;
}

let S;
function cargar() {
  S = nuevo();
  try { const raw = localStorage.getItem(CLAVE); if (raw) S = limpiarDatos(JSON.parse(raw)); } catch (e) {}
}
function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(S)); } catch (e) {} }
cargar();

// La app corre en dos lugares: en su propio servidor (Render) o como página de claude.ai (visor).
// En el visor no se puede imprimir, usar el micrófono ni mostrar confirm(); se usan sus capacidades.
const EN_VISOR = !!window.claude;
let IA = false;          // el servidor tiene la ayuda con IA configurada (Render)
let MUESTRA = null;      // en el visor: preguntar a Claude con la cuenta de quien usa la página
let DESCARGAS = null;    // en el visor: ofrecer archivos para guardar
if (EN_VISOR && window.claude.use) {
  window.claude.use("sample").then(s => { if (s) { MUESTRA = s; render(); } }).catch(() => {});
  window.claude.use("downloads").then(d => { if (d) { DESCARGAS = d; render(); } }).catch(() => {});
} else {
  fetch("/api/estado").then(r => r.json()).then(d => { IA = !!d.ia; render(); }).catch(() => {});
}
// ¿Hay ayuda con IA para esta tarea? Investigar empresas necesita buscar en internet: solo con el servidor.
const iaPara = tipo => IA || (!!MUESTRA && tipo !== "empresa");
const puedeImprimir = !EN_VISOR;

/* ---------- Voz: escuchar y dictar ---------- */
function hablar(texto, lang = "es-US") {
  if (!("speechSynthesis" in window)) return toast("Este aparato no puede leer en voz alta");
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = lang; u.rate = 0.9;
  const voces = speechSynthesis.getVoices();
  u.voice = voces.find(v => v.lang === lang) || voces.find(v => v.lang.startsWith(lang.slice(0, 2))) || null;
  speechSynthesis.speak(u);
}
const oir = (texto, lang = "es-US", etiqueta = "🔊 Escuchar") =>
  `<button type="button" class="btn chico oir no-print" data-oir="${esc(texto)}" data-lang="${lang}">${etiqueta}</button>`;

const Reconocer = EN_VISOR ? null : (window.SpeechRecognition || window.webkitSpeechRecognition);
const mic = (id, lang = "es-US") => Reconocer ? `<button type="button" class="mic" data-mic="${id}" data-lang="${lang}" aria-label="Hablar en vez de escribir" title="Hablar en vez de escribir">🎤</button>` : "";
let oyendo = null;
function dictar(btn) {
  if (oyendo) { oyendo.stop(); return; }
  const campo = document.getElementById(btn.dataset.mic);
  const r = new Reconocer();
  r.lang = btn.dataset.lang;
  r.onresult = e => {
    const t = e.results[0][0].transcript;
    campo.value = (campo.value.trim() ? campo.value.trimEnd() + " " : "") + t;
    campo.dispatchEvent(new Event("input", { bubbles: true }));
  };
  r.onerror = e => toast(e.error === "not-allowed" ? "Permita el uso del micrófono para poder hablar" : "No le escuché bien. Intente otra vez.");
  r.onend = () => { btn.classList.remove("oyendo"); oyendo = null; };
  btn.classList.add("oyendo"); oyendo = r; r.start();
  toast("Le escucho… hable ahora");
}

function toast(t) {
  const el = $("#toast"); el.textContent = t; el.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 3000);
}

// Confirmación dentro de la página (confirm() no funciona en todos lados).
function confirmar(texto, si = "Sí, borrar") {
  return new Promise(resolver => {
    const capa = document.createElement("div");
    capa.className = "capa";
    capa.innerHTML = `<div class="panel dialogo" role="alertdialog" aria-modal="true" aria-labelledby="dlg-t">
      <p id="dlg-t" class="fuerte">${esc(texto)}</p>
      <div class="nav-pasos"><button type="button" class="btn" data-r="no">No</button><button type="button" class="btn primary" data-r="si">${esc(si)}</button></div></div>`;
    const cerrar = v => { capa.remove(); resolver(v); };
    capa.addEventListener("click", e => { const b = e.target.closest("[data-r]"); if (b) cerrar(b.dataset.r === "si"); else if (e.target === capa) cerrar(false); });
    capa.addEventListener("keydown", e => { if (e.key === "Escape") cerrar(false); });
    document.body.appendChild(capa);
    capa.querySelector("[data-r=no]").focus();
  });
}

const MENSAJES_MUESTRA = {
  not_granted: "No se dio permiso para usar la ayuda de Claude.", sampling_disabled: "La ayuda de Claude no está disponible en esta cuenta.",
  rate_limited: "Se usó mucho la ayuda. Espere un rato e intente otra vez.", session_expired: "Vuelva a entrar a su cuenta de Claude.",
  refused: "No se pudo responder eso. Intente escribirlo de otra forma."
};
async function iaMuestra(body) {
  const base = "Ayudas a una persona hispanohablante en Chicago que busca trabajo; sabe hacer bien su oficio pero tiene poca experiencia con computadoras y currículums. Escribe en español sencillo, frases cortas, tratando de usted. No inventes datos.";
  try {
    if (body.tipo === "tarea") {
      const r = await MUESTRA.json(`${base}\n\nConvierte lo que la persona hacía en una línea corta de currículum que empiece con un verbo en pasado. Mantén el significado; no agregues logros que no dijo.\nOficio: ${body.oficio || "no indicado"}\nLo que escribió: """${body.texto}"""\n\nResponde solo con JSON así: {"en": "línea en inglés", "es": "línea en español"}`, { modelTier: "quick" });
      return { en: String(r?.en || "").slice(0, 200), es: String(r?.es || "").slice(0, 200) };
    }
    if (body.tipo === "consejo") {
      const r = await MUESTRA(`${base} Eres un coach de entrevistas amable para trabajos como limpieza, cocina, almacén, construcción o fábrica. Cada entrevistador pregunta distinto: enseña la idea, no un guion para memorizar.\n\nPregunta de la entrevista: "${body.pregunta}"\nRespuesta de la persona: """${body.respuesta}"""\n\nResponde en texto simple (sin markdown ni asteriscos), máximo 120 palabras, con tres partes:\nLo bueno: ...\nPara mejorar: ...\nUna forma de decirlo: ... (corto, y luego la misma frase en inglés sencillo)`, { cache: false });
      return { texto: r.text };
    }
  } catch (e) {
    if (["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].includes(e?.code)) { MUESTRA = null; setTimeout(renderQuieto, 0); }
    throw new Error(MENSAJES_MUESTRA[e?.code] || "La ayuda no respondió. Intente otra vez.");
  }
  throw new Error("Esta ayuda no está disponible aquí.");
}

async function ia(body) {
  if (!IA && MUESTRA) return iaMuestra(body);
  let r;
  try { r = await fetch("/api/ia", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); }
  catch (e) { throw new Error("Sin conexión a internet. Intente otra vez."); }
  const d = await r.json().catch(() => null);
  if (!r.ok) throw new Error(d?.error || "No se pudo. Intente más tarde.");
  return d;
}

/* ---------- Utilidades del currículum ---------- */
const oficio = id => OFICIOS.find(o => o.id === id);
const par = (lista, es) => lista.find(x => x[0] === es);
const finDe = t => t.actual ? AHORA : (+t.hasta || +t.desde || AHORA);
function listaBonita(arr, y) { return arr.length > 1 ? arr.slice(0, -1).join(", ") + ` ${y} ` + arr[arr.length - 1] : (arr[0] || ""); }

function trabajosCV() {
  let ts = [...S.perfil.trabajos].sort((a, b) => finDe(b) - finDe(a) || (+b.desde || 0) - (+a.desde || 0));
  if (S.recortar) ts = ts.filter(t => finDe(t) >= AHORA - 15);
  return ts;
}
function aniosExperiencia(ts) {
  const conFecha = ts.filter(t => +t.desde);
  if (!conFecha.length) return 0;
  const suma = conFecha.reduce((a, t) => a + Math.max(1, finDe(t) - +t.desde), 0);
  const primero = Math.min(...conFecha.map(t => +t.desde));
  return Math.min(suma, AHORA - primero) || 1;
}

function cvHTML(L) {
  const p = S.perfil, en = L === "en", i = en ? 1 : 0;
  const obj = oficio(p.objetivo);
  const ts = trabajosCV();
  const anios = aniosExperiencia(ts);
  const cual = p.cualidades.map(c => par(CUALIDADES, c)).filter(Boolean).map(x => x[i]);
  const disp = p.disponibilidad.map(d => par(DISPONIBILIDAD, d)).filter(Boolean).map(x => en ? x[1] : x[0].toLowerCase());
  const cert = p.certificados.map(c => par(CERTIFICADOS, c)).filter(Boolean).map(x => x[i]);
  const ing = NIVEL_INGLES.find(n => n[0] === p.ingles);
  const est = ESTUDIOS.find(e => e[0] === p.estudios && e[0]);

  const titulo = obj ? (en ? obj.en : `Trabajador(a) de ${obj.es.toLowerCase()}`) : (en ? "Worker" : "Trabajador(a)");
  let resumen = anios
    ? (en ? `${titulo} with ${anios}+ years of work experience.` : `${titulo} con ${anios} año${anios === 1 ? "" : "s"} o más de experiencia laboral.`)
    : (en ? `Hardworking and reliable ${titulo.toLowerCase()}, ready to start.` : `${titulo}, responsable y con ganas de empezar.`);
  if (cual.length) resumen += en ? ` Strengths: ${cual.slice(0, 3).join(", ")}.` : ` Fortalezas: ${cual.slice(0, 3).join(", ").toLowerCase()}.`;
  if (disp.length) resumen += en ? ` Available ${listaBonita(disp, "and")}.` : ` Disponible: ${listaBonita(disp, "y")}.`;

  const idiomas = [en ? "Spanish (native)" : "Español (nativo)"];
  if (ing && ing[0] !== "nada") idiomas.push(en ? ing[2] : `Inglés ${ing[1].match(/\((.*)\)/)?.[1] || ""}`.trim());
  if (p.otrosIdiomas.trim()) idiomas.push(p.otrosIdiomas.trim());

  const contacto = [p.telefono, p.email, p.ciudad].filter(x => x && x.trim()).map(esc).join(" · ");
  return `
  <article class="cv" lang="${L}">
    <h1>${esc(p.nombre || (en ? "Your Name" : "Su nombre"))}</h1>
    <p class="contacto">${contacto}</p>
    <h2>${en ? "Summary" : "Resumen"}</h2>
    <p>${esc(resumen)}</p>
    ${ts.length ? `<h2>${en ? "Work Experience" : "Experiencia de trabajo"}</h2>
      ${ts.map(t => {
        const o = oficio(t.oficio);
        const fechas = t.desde || t.hasta || t.actual ? `${esc(t.desde || "")} – ${t.actual ? (en ? "Present" : "Actual") : esc(t.hasta || "")}` : "";
        const lugar = t.lugar.trim() || (en ? "Various employers" : "Varios empleadores");
        return `<div class="trabajo-cab"><span><b>${esc(o ? (en ? o.en : o.es) : "")}</b> · ${esc(lugar)}${t.ciudad ? `, ${esc(t.ciudad)}` : ""}</span><span>${fechas}</span></div>
          ${t.tareas.length ? `<ul>${t.tareas.map(x => `<li>${esc(x[i])}</li>`).join("")}</ul>` : ""}`;
      }).join("")}` : ""}
    ${cual.length ? `<h2>${en ? "Skills" : "Habilidades"}</h2><ul>${cual.map(c => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
    ${cert.length ? `<h2>${en ? "Licenses and Certificates" : "Licencias y certificados"}</h2><ul>${cert.map(c => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
    <h2>${en ? "Languages" : "Idiomas"}</h2><p>${esc(idiomas.join(" · "))}</p>
    ${est ? `<h2>${en ? "Education" : "Estudios"}</h2><p>${esc(est[en ? 2 : 1])}${p.estudiosPais.trim() ? ` · ${esc(p.estudiosPais)}` : ""}</p>` : ""}
    <h2>${en ? "References" : "Referencias"}</h2><p>${en ? "Available upon request." : "Disponibles si las piden."}</p>
  </article>`;
}

/* ---------- Pasos del currículum ---------- */
const casilla = (name, valor, texto, marcado, tipo = "checkbox") =>
  `<label class="opcion"><input type="${tipo}" name="${name}" value="${esc(valor)}" ${marcado ? "checked" : ""}><span>${texto}</span></label>`;
const marcados = name => $$(`input[name="${name}"]:checked`).map(i => i.value);

const PASOS = [
  { titulo: "¿Cómo se llama?", ayuda: "Escriba su nombre y apellido. Así aparecerá arriba en su currículum.",
    html: p => `<label class="campo" for="f-nombre">Nombre completo<div class="con-mic"><input type="text" id="f-nombre" value="${esc(p.nombre)}" autocomplete="name" maxlength="80">${mic("f-nombre")}</div></label>`,
    leer: p => { p.nombre = $("#f-nombre").value.trim(); } },
  { titulo: "¿Cómo le pueden contactar?", ayuda: "Ponga un teléfono donde siempre conteste. El correo es opcional, pero casi todas las solicitudes en internet lo piden.",
    html: p => `
      <label class="campo" for="f-tel">Teléfono<input type="tel" id="f-tel" value="${esc(p.telefono)}" autocomplete="tel" inputmode="tel" maxlength="30" placeholder="(312) 555-0100"></label>
      <label class="campo" for="f-email">Correo electrónico (opcional)<input type="email" id="f-email" value="${esc(p.email)}" autocomplete="email" maxlength="80"></label>
      <p class="small muted">¿No tiene correo? Pida ayuda para crear uno gratis (por ejemplo, en Gmail). Use uno serio, como su nombre y apellido.</p>
      <label class="campo" for="f-ciudad">Ciudad<input type="text" id="f-ciudad" value="${esc(p.ciudad)}" maxlength="60"></label>`,
    leer: p => { p.telefono = $("#f-tel").value.trim(); p.email = $("#f-email").value.trim(); p.ciudad = $("#f-ciudad").value.trim(); } },
  { titulo: "¿Qué trabajo busca?", ayuda: "Toque uno. Si busca de varios tipos, puede hacer otro currículum después cambiando esta respuesta.",
    html: p => `<div class="opciones dos">${OFICIOS.map(o => casilla("objetivo", o.id, `<span class="ico" aria-hidden="true">${o.icono}</span> ${esc(o.es)}`, p.objetivo === o.id, "radio")).join("")}</div>`,
    leer: p => { p.objetivo = marcados("objetivo")[0] || p.objetivo; } },
  { titulo: "¿Dónde ha trabajado?", ayuda: "Agregue sus trabajos, también los de otro país y los trabajos por su cuenta. Solo va a tocar las tareas que sabe hacer.",
    html: p => `
      ${p.trabajos.length ? `<div class="panel">${p.trabajos.map(t => {
        const o = oficio(t.oficio);
        return `<div class="item"><span><b>${o ? o.icono + " " + esc(o.es) : ""}</b><br><span class="small muted">${esc(t.lugar || "Varios lugares")}${t.desde ? ` · ${esc(t.desde)}–${t.actual ? "hoy" : esc(t.hasta)}` : ""} · ${t.tareas.length} tareas</span></span>
          <span class="row"><a class="btn chico" href="#/cv/trabajo/${t.id}">✏️ Cambiar</a><button type="button" class="btn chico ghost" data-borrar-trabajo="${t.id}" aria-label="Borrar este trabajo">🗑️</button></span></div>`;
      }).join("")}</div>` : `<div class="note gold">Todavía no ha agregado trabajos.</div>`}
      <a class="btn primary block" href="#/cv/trabajo/nuevo">➕ Agregar un trabajo</a>`,
    leer: () => {} },
  { titulo: "¿Cómo es usted como trabajador(a)?", ayuda: "Elija hasta 5 cosas que sean verdad. Así lo verán los patrones.",
    html: p => `<div class="opciones dos">${CUALIDADES.map(c => casilla("cual", c[0], esc(c[0]), p.cualidades.includes(c[0]))).join("")}</div>`,
    leer: p => { p.cualidades = marcados("cual"); } },
  { titulo: "Idiomas y licencias", ayuda: "Diga la verdad sobre su inglés. Muchos trabajos no piden inglés.",
    html: p => `
      <h3>¿Cuánto inglés habla?</h3>
      <div class="opciones">${NIVEL_INGLES.map(n => casilla("ingles", n[0], esc(n[1]), p.ingles === n[0], "radio")).join("")}</div>
      <label class="campo" for="f-idiomas">¿Habla otro idioma? (opcional)<input type="text" id="f-idiomas" value="${esc(p.otrosIdiomas)}" maxlength="60" placeholder="Por ejemplo: Portugués"></label>
      <h3>¿Tiene alguna de estas licencias o certificados?</h3>
      <div class="opciones dos">${CERTIFICADOS.map(c => casilla("cert", c[0], esc(c[0]), p.certificados.includes(c[0]))).join("")}</div>`,
    leer: p => { p.ingles = marcados("ingles")[0] || ""; p.otrosIdiomas = $("#f-idiomas").value.trim(); p.certificados = marcados("cert"); } },
  { titulo: "¿Cuándo puede trabajar?", ayuda: "Marque todo lo que pueda. Entre más horarios, más oportunidades.",
    html: p => `<div class="opciones dos">${DISPONIBILIDAD.map(d => casilla("disp", d[0], esc(d[0]), p.disponibilidad.includes(d[0]))).join("")}</div>`,
    leer: p => { p.disponibilidad = marcados("disp"); } },
  { titulo: "¿Hasta qué año estudió?", ayuda: "No es obligatorio. Para muchos trabajos casi no importa. Si le han dicho que está “sobrecalificado”, puede no ponerlo.",
    html: p => `
      <div class="opciones">${ESTUDIOS.map(e => casilla("est", e[0], esc(e[1]), p.estudios === e[0], "radio")).join("")}</div>
      <label class="campo" for="f-pais">¿En qué país estudió? (opcional)<input type="text" id="f-pais" value="${esc(p.estudiosPais)}" maxlength="40"></label>`,
    leer: p => { p.estudios = marcados("est")[0] ?? ""; p.estudiosPais = $("#f-pais").value.trim(); } }
];

let borrador = null; // trabajo que se está editando

function vCV(arg, arg2) {
  if (arg === "trabajo") return vTrabajo(arg2);
  if (arg === "ver") return vResultado();
  const n = Math.min(Math.max(+arg || 1, 1), PASOS.length), paso = PASOS[n - 1];
  return `
  <section class="stack">
    <div class="progreso"><span class="small muted">Su currículum · Paso ${n} de ${PASOS.length}</span><progress class="barra" max="${PASOS.length}" value="${n}" aria-label="Paso ${n} de ${PASOS.length}"></progress></div>
    <h2>${paso.titulo}</h2>
    <p>${paso.ayuda}</p>
    ${oir(paso.titulo + ". " + paso.ayuda)}
    <form class="stack" id="form-paso" data-paso="${n}">
      ${paso.html(S.perfil)}
      <div class="nav-pasos">
        <button type="button" class="btn" data-paso-ir="${n - 1}">← Atrás</button>
        <button type="submit" class="btn primary">${n === PASOS.length ? "Ver mi currículum ✓" : "Siguiente →"}</button>
      </div>
    </form>
  </section>`;
}

function vTrabajo(id) {
  if (!borrador || borrador.id !== id && !(id === "nuevo" && borrador.nuevo)) {
    const t = S.perfil.trabajos.find(t => t.id === id);
    borrador = t ? JSON.parse(JSON.stringify(t))
      : { id: "t" + Date.now().toString(36), nuevo: true, oficio: S.perfil.objetivo || "", lugar: "", ciudad: "Chicago, IL", desde: "", hasta: "", actual: false, tareas: [] };
  }
  const t = borrador, o = oficio(t.oficio);
  const propias = t.tareas.filter(x => !o?.tareas.some(y => y[0] === x[0]));
  return `
  <section class="stack">
    <a class="btn ghost chico inicio" href="#/cv/4">← Volver a mis trabajos</a>
    <h2>${t.nuevo ? "Agregar un trabajo" : "Cambiar este trabajo"}</h2>
    ${oir("¿Qué tipo de trabajo era? Después escriba dónde fue y toque las tareas que hacía.")}
    <form class="stack" id="form-trabajo">
      <div class="panel">
        <h3>1. ¿Qué tipo de trabajo era?</h3>
        <div class="opciones dos">${OFICIOS.map(x => casilla("t-oficio", x.id, `<span class="ico" aria-hidden="true">${x.icono}</span> ${esc(x.es)}`, t.oficio === x.id, "radio")).join("")}</div>
      </div>
      <div class="panel">
        <h3>2. ¿Dónde fue?</h3>
        <label class="campo" for="t-lugar">Nombre del lugar o empresa<div class="con-mic"><input type="text" id="t-lugar" value="${esc(t.lugar)}" maxlength="80" placeholder="Si fue por su cuenta, déjelo vacío">${mic("t-lugar")}</div></label>
        <label class="campo" for="t-ciudad">Ciudad y país<input type="text" id="t-ciudad" value="${esc(t.ciudad)}" maxlength="60"></label>
        <div class="row abajo">
          <label class="campo mitad" for="t-desde">Año en que empezó<input type="number" id="t-desde" inputmode="numeric" min="1950" max="${AHORA}" value="${esc(t.desde)}"></label>
          <label class="campo mitad" for="t-hasta">Año en que terminó<input type="number" id="t-hasta" inputmode="numeric" min="1950" max="${AHORA}" value="${esc(t.hasta)}" ${t.actual ? "disabled" : ""}></label>
        </div>
        <label class="opcion"><input type="checkbox" id="t-actual" ${t.actual ? "checked" : ""}><span>Todavía trabajo ahí</span></label>
      </div>
      ${o ? `<div class="panel">
        <h3>3. Toque las tareas que hacía</h3>
        <p class="small muted">Ya están traducidas al inglés para su currículum.</p>
        <div class="opciones">${o.tareas.map(x => casilla("t-tarea", x[0], esc(x[0]), t.tareas.some(y => y[0] === x[0]))).join("")}
          ${propias.map(x => casilla("t-tarea", x[0], esc(x[0]) + (x[1] !== x[0] ? ` <span class="small muted">· ${esc(x[1])}</span>` : ""), true)).join("")}</div>
        <label class="campo" for="t-otra">¿Hacía otra cosa? Escríbala o díctela<div class="con-mic"><input type="text" id="t-otra" maxlength="160">${mic("t-otra")}</div></label>
        <button type="button" class="btn" id="agregar-tarea">➕ Agregar esta tarea</button>
        ${iaPara("tarea") ? "" : `<p class="small muted">Las tareas que usted escriba aparecerán tal como las escribió, también en el currículum en inglés.</p>`}
      </div>` : `<div class="note gold">Primero toque el tipo de trabajo para ver las tareas.</div>`}
      <button type="submit" class="btn primary block">✓ Guardar este trabajo</button>
    </form>
  </section>`;
}

function leerTrabajo() {
  const t = borrador; if (!t || !$("#form-trabajo")) return;
  t.oficio = marcados("t-oficio")[0] || t.oficio;
  t.lugar = $("#t-lugar").value.trim(); t.ciudad = $("#t-ciudad").value.trim();
  t.desde = $("#t-desde").value; t.hasta = $("#t-hasta").value; t.actual = $("#t-actual").checked;
  if ($("input[name=t-tarea]")) {
    const elegidas = marcados("t-tarea"), o = oficio(t.oficio);
    const todas = [...(o?.tareas || []), ...t.tareas];
    t.tareas = elegidas.map(es => todas.find(x => x[0] === es)).filter(Boolean);
  }
}

function vResultado() {
  const p = S.perfil, L = S.idiomaCV;
  const falta = [!p.nombre && "su nombre", !p.telefono && "su teléfono", !p.trabajos.length && "al menos un trabajo"].filter(Boolean);
  const viejos = p.trabajos.some(t => finDe(t) < AHORA - 15);
  return `
  <section class="stack">
    <div class="no-print stack">
      <h2>¡Su currículum está listo! 🎉</h2>
      ${falta.length ? `<div class="note gold">Le falta ${listaBonita(falta, "y")}. <a href="#/cv/1">Completar</a></div>` : ""}
      <p>Para los trabajos en Chicago, entregue el de <b>inglés</b>. El de español sirve para que usted sepa qué dice.</p>
      <div class="opciones dos" role="group" aria-label="Idioma del currículum">
        <button type="button" class="opcion" data-idioma="en" aria-pressed="${L === "en"}"><span class="ico" aria-hidden="true">📄</span><span>En inglés <span class="small muted">· para entregar</span></span></button>
        <button type="button" class="opcion" data-idioma="es" aria-pressed="${L === "es"}"><span class="ico" aria-hidden="true">👀</span><span>En español <span class="small muted">· para revisar</span></span></button>
      </div>
      ${viejos ? `<label class="opcion"><input type="checkbox" id="recortar" ${S.recortar ? "checked" : ""}><span>Mostrar solo los últimos 15 años <span class="small muted">· ayuda si le dicen que tiene “demasiada experiencia”</span></span></label>` : ""}
      ${puedeImprimir ? `<button type="button" class="btn primary block" id="imprimir">🖨️ Imprimir o guardar como PDF</button>
      <p class="small muted">Al imprimir, puede elegir “Guardar como PDF” para mandarlo por correo o subirlo a una página de trabajo.</p>`
      : DESCARGAS ? `<button type="button" class="btn primary block" id="descargar-cv">⬇️ Descargar para imprimir</button>
      <p class="small muted">Se guarda un archivo en Descargas. Al abrirlo, sale la ventana para imprimir o guardar como PDF.</p>` : ""}
      <button type="button" class="btn block" id="copiar-cv">📋 Copiar el texto del currículum</button>
    </div>
    ${cvHTML(L)}
    <div class="panel no-print">
      <h3>¿Quiere cambiar algo?</h3>
      <div class="row">${PASOS.map((x, i) => `<a class="btn chico" href="#/cv/${i + 1}">${i + 1}. ${esc(x.titulo.replace(/[¿?]/g, ""))}</a>`).join("")}</div>
    </div>
  </section>`;
}

/* ---------- Revisar si un trabajo es real ---------- */
let revisar = { empresa: "", ciudad: "Chicago, IL", anuncio: "", resultado: null, cargando: false, senales: [] };

function enlacesEmpresa() {
  const e = revisar.empresa.trim(), c = revisar.ciudad.trim();
  if (!e) return `<p class="muted small">Escriba el nombre de la empresa para ver los botones.</p>`;
  const g = q => `https://www.google.com/search?q=${enc(q)}`;
  const links = [
    ["📍", "Ver dirección y teléfono en el mapa", `https://www.google.com/maps/search/?api=1&query=${enc(e + " " + c)}`],
    ["🔎", "Buscar la empresa en Google", g(`"${e}" ${c} phone address`)],
    ["⭐", "Ver qué dicen sus trabajadores", g(`"${e}" ${c} employee reviews`)],
    ["🚩", "Buscar quejas o estafas", g(`"${e}" scam OR fraud OR complaints OR estafa`)],
    ["🏛️", "Buscar en Better Business Bureau (BBB)", `https://www.bbb.org/search?find_country=USA&find_text=${enc(e)}&find_loc=${enc(c)}`]
  ];
  return `<div class="opciones">${links.map(([i, t, u]) => `<a class="opcion" href="${esc(u)}" target="_blank" rel="noopener noreferrer"><span class="ico" aria-hidden="true">${i}</span><span>${t} ↗</span></a>`).join("")}
    <a class="opcion" href="https://apps.ilsos.gov/businessentitysearch/" target="_blank" rel="noopener noreferrer"><span class="ico" aria-hidden="true">📜</span><span>Ver si está registrada en Illinois ↗ <span class="small muted">· escriba el nombre ahí</span></span></a></div>`;
}

function nivelRiesgo() {
  const sel = revisar.senales.map(i => SENALES[i]);
  if (!sel.length) return ["Marque lo que vea en el anuncio.", ""];
  if (sel.some(s => s.grave) || sel.length >= 3) return ["🚩 Peligro: parece estafa. No mande sus datos ni dinero.", "bad"];
  return ["⚠️ Cuidado: revise bien la empresa antes de mandar su currículum.", "gold"];
}

function vRevisar() {
  const r = revisar, [txtRiesgo, cls] = nivelRiesgo();
  return `
  <section class="stack">
    <h2>¿Es real este trabajo?</h2>
    <p>Antes de mandar su currículum, revise que la empresa exista: dónde está, su teléfono y qué dicen de ella.</p>
    ${oir("¿Es real este trabajo? Antes de mandar su currículum, revise que la empresa exista: dónde está, su teléfono, y qué dicen de ella.")}
    <div class="panel">
      <h3>1. Investigue la empresa</h3>
      <label class="campo" for="r-empresa">Nombre de la empresa<div class="con-mic"><input type="text" id="r-empresa" value="${esc(r.empresa)}" maxlength="100">${mic("r-empresa", "en-US")}</div></label>
      <label class="campo" for="r-ciudad">Ciudad<input type="text" id="r-ciudad" value="${esc(r.ciudad)}" maxlength="60"></label>
      <div id="r-enlaces">${enlacesEmpresa()}</div>
      <div class="note small"><b>Consejo:</b> llame al teléfono que <b>usted</b> encontró en el mapa, no al del anuncio, y pregunte si de verdad están contratando para ese puesto.</div>
    </div>
    ${iaPara("empresa") ? `<div class="panel">
      <h3>🤖 Que la computadora investigue por usted</h3>
      <p class="small">Pegue aquí el anuncio (opcional). Se buscará en internet la dirección, el teléfono y señales de alerta.</p>
      <label class="campo" for="r-anuncio">Texto del anuncio<textarea id="r-anuncio" maxlength="6000">${esc(r.anuncio)}</textarea></label>
      <button type="button" class="btn primary" id="r-ia" ${r.cargando ? "disabled" : ""}>${r.cargando ? "Buscando… puede tardar un minuto" : "🔍 Investigar esta empresa"}</button>
      ${r.error ? `<p class="error" role="alert">${esc(r.error)}</p>` : ""}
      ${r.resultado ? `<div class="ia-resp">${esc(r.resultado.texto)}</div>
        ${r.resultado.fuentes?.length ? `<p class="small"><b>Fuentes:</b></p><ul class="small">${r.resultado.fuentes.map(f => `<li><a href="${esc(f.url)}" target="_blank" rel="noopener noreferrer">${esc(f.titulo || f.url)}</a></li>`).join("")}</ul>` : ""}
        <p class="small muted">La computadora puede equivocarse. Confirme llamando o yendo en persona.</p>` : ""}
    </div>` : ""}
    <div class="panel">
      <h3>2. Revise el anuncio</h3>
      <p class="small muted">Marque lo que sea verdad.</p>
      <div class="opciones">${SENALES.map((s, i) => casilla("senal", i, esc(s.t), r.senales.includes(i))).join("")}</div>
      <div class="note ${cls}" id="riesgo"><span class="riesgo">${txtRiesgo}</span></div>
      <p class="small">Nunca pague para conseguir un trabajo. Un trabajo de verdad le paga a usted, no al revés.</p>
    </div>
    <button type="button" class="btn block" id="r-guardar" ${r.empresa.trim() ? "" : "disabled"}>📋 Guardar esta empresa en mis solicitudes</button>
  </section>`;
}

/* ---------- Dónde buscar ---------- */
function vBuscar() {
  const o = oficio(S.perfil.objetivo);
  return `
  <section class="stack">
    <h2>Dónde buscar trabajo en Chicago</h2>
    <p>Lugares que ayudan <b>gratis</b>. Llame antes de ir: los horarios cambian.</p>
    ${oir("Dónde buscar trabajo en Chicago. Lugares que ayudan gratis. Llame antes de ir, porque los horarios cambian.")}
    ${o ? `<div class="note"><b>Palabras para buscar en inglés (${esc(o.es)}):</b><br>${esc(o.buscar)}</div>` : ""}
    ${RECURSOS.map(g => `
      <div class="panel">
        <h3>${esc(g.grupo)}</h3>
        ${g.items.map(x => `
          <div class="item"><span class="stack junto">
            <b>${esc(x.nombre)}</b>
            <span class="small">${esc(x.que)}</span>
            ${x.dir ? `<span class="small muted">📍 ${esc(x.dir)}</span>` : ""}
            <span class="row">
              ${x.url ? `<a class="btn chico" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">Abrir página ↗</a>` : ""}
              ${x.tel ? `<a class="btn chico" href="tel:${esc(x.tel.replace(/[^\d]/g, ""))}">📞 ${esc(x.tel)}</a>` : ""}
            </span>
          </span></div>`).join("")}
      </div>`).join("")}
    <div class="panel">
      <h3>Consejos</h3>
      <ul class="stack lista">
        <li>Vaya en persona con 2 copias de su currículum impreso. En limpieza, cocina y almacén funciona muy bien.</li>
        <li>En las universidades, busque la oficina de <b>Facilities</b> o <b>Human Resources</b>.</li>
        <li>Antes de mandar su currículum a una empresa que no conoce, use <a href="#/revisar">¿Es real este trabajo?</a></li>
      </ul>
    </div>
  </section>`;
}

/* ---------- Entrevista ---------- */
let consejoIA = {}; // índice -> {texto, cargando}

function bloquePregunta(q, i) {
  const c = consejoIA[i] || {};
  return `
    <p class="small muted">Le pueden preguntar en inglés:</p>
    <p class="grande"><b>“${esc(q.en)}”</b></p>
    <p>${esc(q.es)}</p>
    <div class="row">${oir(q.en, "en-US", "🔊 Oír en inglés")}${oir(q.es, "es-US", "🔊 En español")}</div>
    <div class="note"><b>Cómo responder:</b> ${esc(q.consejo)}</div>
    <p><b>Ejemplo:</b> ${esc(q.ej_es)}</p>
    <p lang="en"><b>En inglés:</b> ${esc(q.ej_en)}</p>
    ${oir(q.ej_en, "en-US", "🔊 Oír el ejemplo en inglés")}
    <label class="campo" for="resp-${i}">Su respuesta (para practicar)<div class="con-mic"><textarea id="resp-${i}" data-resp="${i}" maxlength="1500">${esc(S.respuestas[i] || "")}</textarea>${mic("resp-" + i)}</div></label>
    ${iaPara("consejo") ? `<button type="button" class="btn" data-consejo="${i}" ${c.cargando ? "disabled" : ""}>${c.cargando ? "Pensando…" : "🤖 ¿Qué tal mi respuesta?"}</button>
      ${c.texto ? `<div class="ia-resp">${esc(c.texto)}</div>` : ""}${c.error ? `<p class="error" role="alert">${esc(c.error)}</p>` : ""}` : ""}`;
}

function vEntrevista(arg) {
  if (arg !== undefined && PREGUNTAS[+arg]) {
    const i = +arg;
    return `
    <section class="stack">
      <a class="btn ghost chico inicio" href="#/entrevista">← Todas las preguntas</a>
      <h2>Practicar: pregunta ${i + 1} de ${PREGUNTAS.length}</h2>
      <div class="panel">${bloquePregunta(PREGUNTAS[i], i)}</div>
      <div class="nav-pasos">
        <a class="btn" href="#/entrevista/${(i - 1 + PREGUNTAS.length) % PREGUNTAS.length}">← Anterior</a>
        <a class="btn primary" href="#/entrevista/${(i + 1) % PREGUNTAS.length}">Siguiente pregunta →</a>
      </div>
    </section>`;
  }
  return `
  <section class="stack">
    <h2>Practicar la entrevista</h2>
    <p>Cada entrevistador pregunta distinto, pero casi siempre salen estas preguntas. No las memorice: entienda la idea y dígala con sus palabras.</p>
    ${oir("Practicar la entrevista. Cada entrevistador pregunta distinto, pero casi siempre salen estas preguntas. No las memorice. Entienda la idea y dígala con sus palabras.")}
    <a class="btn primary block" href="#/entrevista/0">▶️ Empezar a practicar</a>
    <div class="panel">
      ${PREGUNTAS.map((q, i) => `<div class="item"><span><b>${esc(q.es)}</b><br><span class="small muted" lang="en">${esc(q.en)}</span></span><a class="btn chico" href="#/entrevista/${i}">Ver</a></div>`).join("")}
    </div>
  </section>`;
}

/* ---------- Inglés ---------- */
function vIngles() {
  return `
  <section class="stack">
    <h2>Inglés para el trabajo</h2>
    <p>Toque 🔊 para oír cómo se dice. Repítalo en voz alta.</p>
    ${FRASES.map(g => `
      <div class="panel">
        <h3>${g.icono} ${esc(g.tema)}</h3>
        ${g.frases.map(f => `<div class="frase"><span><span class="en" lang="en">${esc(f[1])}</span><br><span class="small muted">${esc(f[0])}</span></span>${oir(f[1].replace(/_+/g, "…"), "en-US", "🔊")}</div>`).join("")}
      </div>`).join("")}
  </section>`;
}

/* ---------- Mis solicitudes ---------- */
let editando = null;
function vSolicitudes(id) {
  if (id) {
    const s = id === "nueva" ? (editando?.id === "nueva" ? editando : { id: "nueva", empresa: "", puesto: "", fecha: hoyLocal(), estado: "por-enviar", direccion: "", telefono: "", notas: "" })
      : S.solicitudes.find(x => x.id === id);
    if (!s) { location.hash = "#/solicitudes"; return ""; }
    return `
    <section class="stack">
      <a class="btn ghost chico inicio" href="#/solicitudes">← Mis solicitudes</a>
      <h2>${id === "nueva" ? "Nueva solicitud" : esc(s.empresa)}</h2>
      <form class="stack" id="form-sol" data-id="${esc(s.id)}">
        <label class="campo" for="s-empresa">Empresa<input type="text" id="s-empresa" value="${esc(s.empresa)}" required maxlength="100"></label>
        <label class="campo" for="s-puesto">Puesto<input type="text" id="s-puesto" value="${esc(s.puesto)}" maxlength="100"></label>
        <label class="campo" for="s-fecha">Fecha<input type="date" id="s-fecha" value="${esc(s.fecha)}"></label>
        <h3>¿Cómo va?</h3>
        <div class="opciones dos">${ESTADOS.map(e => casilla("s-estado", e[0], esc(e[1]), s.estado === e[0], "radio")).join("")}</div>
        <label class="campo" for="s-dir">Dirección<input type="text" id="s-dir" value="${esc(s.direccion)}" maxlength="150"></label>
        <label class="campo" for="s-tel">Teléfono<input type="tel" id="s-tel" value="${esc(s.telefono)}" maxlength="30"></label>
        <h3>🤝 ¿Conoce a alguien ahí?</h3>
        <label class="campo" for="s-conocido">Nombre y teléfono de su conocido (opcional)<input type="text" id="s-conocido" value="${esc(s.conocido || "")}" maxlength="120" placeholder="Juan, turno de noche · (773) 555-0100"></label>
        <label class="campo" for="s-rrhh">Persona que contrata o de recursos humanos (opcional)<input type="text" id="s-rrhh" value="${esc(s.rrhh || "")}" maxlength="120" placeholder="Nombre, correo o teléfono"></label>
        <label class="campo" for="s-notas">Notas<div class="con-mic"><textarea id="s-notas" maxlength="1000" placeholder="Con quién habló, cuándo volver a llamar…">${esc(s.notas)}</textarea>${mic("s-notas")}</div></label>
        <button type="submit" class="btn primary block">✓ Guardar</button>
        ${id !== "nueva" ? `<button type="button" class="btn ghost" data-borrar-sol="${esc(s.id)}">🗑️ Borrar esta solicitud</button>` : ""}
      </form>
    </section>`;
  }
  const lista = [...S.solicitudes].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  return `
  <section class="stack">
    <h2>Mis solicitudes</h2>
    <p>Anote dónde mandó su currículum para no olvidar a quién llamar.</p>
    <a class="btn primary block" href="#/solicitudes/nueva">➕ Anotar una solicitud</a>
    ${lista.length ? `<div class="panel">${lista.map(s => {
      const e = ESTADOS.find(x => x[0] === s.estado) || ESTADOS[0];
      return `<div class="item"><span><b>${esc(s.empresa)}</b> <span class="pill ${e[2]}">${esc(e[1])}</span><br><span class="small muted">${esc(s.puesto)}${s.fecha ? ` · ${esc(s.fecha)}` : ""}${s.conocido ? ` · 🤝 ${esc(s.conocido)}` : ""}</span></span>
        <span class="row">${s.telefono ? `<a class="btn chico" href="tel:${esc(s.telefono.replace(/[^\d+]/g, ""))}" aria-label="Llamar">📞</a>` : ""}<a class="btn chico" href="#/solicitudes/${esc(s.id)}">Abrir</a></span></div>`;
    }).join("")}</div>` : `<div class="note gold">Todavía no ha anotado ninguna.</div>`}
    <p class="small muted">Consejo: si mandó su currículum y en una semana no le llaman, llame usted y pregunte. Eso muestra interés.</p>
  </section>`;
}

/* ---------- Qué llevar y sus derechos ---------- */
function vDerechos() {
  return `
  <section class="stack">
    <h2>Qué llevar y sus derechos</h2>
    <div class="panel">
      <h3>📁 Qué llevar a la entrevista</h3>
      <ul class="stack lista">
        <li>Identificación con foto.</li>
        <li>2 copias de su currículum impreso.</li>
        <li>2 o 3 referencias: nombre y teléfono de exjefes o compañeros (no familiares). Avíseles antes.</li>
        <li>Una pluma.</li>
        <li>Al contratarle le pedirán documentos para trabajar (la forma <b>I-9</b>), como la tarjeta del Seguro Social o un permiso de trabajo.</li>
      </ul>
    </div>
    <div class="panel">
      <h3>💵 Cuánto le deben pagar</h3>
      <ul class="stack lista">
        <li><b>Ciudad de Chicago: $17.05 la hora</b> desde el 1 de julio de 2026 (empresas con 4 o más trabajadores).</li>
        <li>Resto del condado de Cook: $15.40 la hora. Resto de Illinois: $15.00 la hora.</li>
        <li>Si trabaja por hora y pasa de 40 horas en una semana, casi siempre le deben pagar <b>tiempo y medio</b> por las horas extra.</li>
        <li>Le tienen que pagar <b>todas</b> las horas trabajadas, sin importar su estatus migratorio.</li>
        <li>En Chicago, la mayoría de los trabajadores van juntando horas pagadas por enfermedad y de descanso. Pregunte cuántas tiene.</li>
      </ul>
      <div class="note">¿No le pagan o le pagan menos? En Chicago llame al <b><a href="tel:311">311</a></b> y pida la <b>Office of Labor Standards</b> (Oficina de Normas Laborales).</div>
    </div>
    <div class="panel">
      <h3>🚩 Cuidado con las estafas</h3>
      <ul class="stack lista">
        <li>Nunca pague para conseguir trabajo.</li>
        <li>No dé su número de Seguro Social ni su cuenta de banco antes de una entrevista de verdad.</li>
        <li>Si le mandan un cheque y le piden devolver parte del dinero, es estafa.</li>
      </ul>
      <a class="btn" href="#/revisar">🔍 Revisar un anuncio</a>
    </div>
    <p class="small muted">Información general, revisada en octubre de 2026. No es asesoría legal. Para su caso, llame al 311 o a un centro de ayuda.</p>
  </section>`;
}

/* ---------- Recomendaciones (conocer a alguien adentro) ---------- */
function vRecomendacion() {
  return `
  <section class="stack">
    <h2>¿Conoce a alguien ahí?</h2>
    <p>Muchas empresas contratan primero a quien les recomienda un trabajador de confianza. Para alguien con experiencia, una buena recomendación pesa más que cualquier papel.</p>
    ${oir("¿Conoce a alguien ahí? Muchas empresas contratan primero a quien les recomienda un trabajador de confianza. Una buena recomendación pesa más que cualquier papel.")}
    <div class="panel">
      <h3>Cómo pedir una recomendación</h3>
      <ol class="paso-lista">
        <li><span><b>Pregunte a su gente.</b> Familia, vecinos, la iglesia, excompañeros: “¿Dónde trabaja usted? ¿Están contratando?” Muchos trabajos nunca se anuncian.</span></li>
        <li><span><b>Pida que le recomienden con nombre.</b> “¿Le puede decir a su supervisor o a recursos humanos que yo soy de confianza?”</span></li>
        <li><span><b>Pida el nombre de quien contrata.</b> Así usted llega preguntando por esa persona, no por “alguien”.</span></li>
        <li><span><b>Vaya en persona</b> con su currículum impreso y diga quién le manda: “Me manda Juan, del turno de noche.”</span></li>
        <li><span><b>Dé las gracias</b> a quien le recomendó, le contraten o no.</span></li>
      </ol>
      <p class="small muted">Algunas empresas dan un bono al trabajador que recomienda a alguien que se queda. A su conocido también le conviene.</p>
    </div>
    <div class="panel">
      <h3>Para hablar con recursos humanos (Human Resources)</h3>
      ${[["Mi amigo ___ trabaja aquí y me recomendó.", "My friend ___ works here and recommended me."],
         ["¿Con quién hablo sobre trabajos de ___?", "Who can I talk to about ___ jobs?"],
         ["Tengo experiencia y puedo empezar pronto.", "I have experience and I can start soon."],
         ["¿Me puede dar su nombre y su correo, por favor?", "Can I have your name and email, please?"]]
        .map(f => `<div class="frase"><span><span class="en" lang="en">${esc(f[1])}</span><br><span class="small muted">${esc(f[0])}</span></span>${oir(f[1].replace(/_+/g, "…"), "en-US", "🔊")}</div>`).join("")}
    </div>
    <div class="nav-pasos">
      <a class="btn" href="#/ingles">🗣️ Más frases</a>
      <a class="btn primary" href="#/solicitudes/nueva">📋 Anotar a mi conocido</a>
    </div>
  </section>`;
}

/* ---------- Acerca y privacidad ---------- */
function vAcerca() {
  return `
  <section class="stack">
    <h2>Acerca de Jale</h2>
    <p><b>Jale</b> es una ayuda gratuita para personas que saben hacer su trabajo pero no tienen práctica con computadoras ni con currículums. Está hecha para Chicago y en español.</p>
    <div class="row">
      <a class="btn" href="#/privacidad">🔒 Aviso de privacidad</a>
      <a class="btn" href="#/terminos">📄 Términos de uso</a>
    </div>
    <div class="panel">
      <h3>De dónde sale la información</h3>
      <p class="small">Los lugares de Chicago, el salario mínimo y los derechos se revisaron en octubre de 2026 en páginas oficiales. Es información general, no asesoría legal. Los horarios y programas cambian: llame antes de ir.</p>
    </div>
    ${bloqueCompartir()}
  </section>`;
}

const REVISADO = "26 de octubre de 2026";
function vPrivacidad() {
  return `
  <section class="stack">
    <h2>Aviso de privacidad</h2>
    <p class="small muted">Última actualización: ${REVISADO}</p>
    <div class="panel">
      <h3>Lo más importante</h3>
      <ul class="stack lista">
        <li><b>No hay cuentas.</b> No pedimos correo ni contraseña para usar Jale.</li>
        <li><b>Sus datos se quedan en su aparato.</b> Lo que escribe (nombre, teléfono, trabajos, solicitudes) se guarda en el almacenamiento de este navegador. Nosotros no lo recibimos ni lo guardamos en ningún servidor.</li>
        <li><b>No vendemos ni compartimos datos.</b> No hay publicidad ni rastreadores.</li>
      </ul>
    </div>
    <div class="panel">
      <h3>Cuándo sale información de su aparato</h3>
      <ul class="stack lista">
        <li><b>Ayuda con inteligencia artificial</b> (solo si usted toca esos botones): se manda el texto de esa pantalla para recibir la respuesta. Lo procesa Anthropic (Claude). No se guarda con su nombre en Jale.</li>
        <li><b>Letras de la página:</b> se cargan desde Google Fonts, que puede ver la dirección de internet (IP) de su aparato.</li>
        <li><b>Enlaces a otras páginas</b> (mapas, Google, WhatsApp, centros de empleo): al abrirlos, se aplican las reglas de privacidad de esas páginas.</li>
        <li><b>Registros del servidor:</b> para que el servicio funcione y para detectar errores se registran datos técnicos (fecha, página pedida, tipo de error). No registramos lo que usted escribe.</li>
      </ul>
    </div>
    <div class="panel">
      <h3>Cookies</h3>
      <p>Jale <b>no usa cookies</b>. Usa el almacenamiento del navegador solo para guardar sus datos en este aparato y para poder abrir sin internet.</p>
    </div>
    <div class="panel">
      <h3>Usted decide</h3>
      <ul class="stack lista">
        <li>Puede <b>guardar una copia</b> de sus datos o <b>borrarlos todos</b> con los botones de abajo de cada pantalla.</li>
        <li>Si usa una computadora pública, borre sus datos al terminar.</li>
        <li>Jale no está hecha para menores de 16 años.</li>
      </ul>
    </div>
    <a class="btn" href="#/terminos">📄 Ver los términos de uso</a>
  </section>`;
}

function vTerminos() {
  return `
  <section class="stack">
    <h2>Términos de uso</h2>
    <p class="small muted">Última actualización: ${REVISADO}</p>
    <div class="panel">
      <ul class="stack lista">
        <li><b>Jale es gratis</b> y se ofrece tal como está, para ayudarle a preparar su búsqueda de trabajo.</li>
        <li><b>No garantizamos un empleo.</b> Le ayudamos a prepararse; la decisión de contratar es de cada empresa.</li>
        <li><b>Información general, no asesoría legal.</b> Los datos de salarios, derechos y lugares pueden cambiar. Confirme con la fuente oficial o llame al 311.</li>
        <li><b>Usted es responsable de lo que pone en su currículum.</b> Escriba solo información verdadera.</li>
        <li><b>La ayuda con inteligencia artificial puede equivocarse.</b> Revise siempre lo que le sugiere, sobre todo direcciones y teléfonos.</li>
        <li><b>Páginas de otros:</b> no somos responsables del contenido de los enlaces externos ni de las ofertas de trabajo que usted encuentre.</li>
        <li><b>Uso correcto:</b> no use Jale para molestar a otras personas, para fines ilegales ni para intentar dañar el servicio. Podemos limitar el uso para proteger el servicio.</li>
      </ul>
    </div>
    <a class="btn" href="#/privacidad">🔒 Ver el aviso de privacidad</a>
  </section>`;
}

function vNoEncontrado() {
  return `
  <section class="panel stack centrado">
    <p class="emoji-grande" aria-hidden="true">🧭</p>
    <h2>No encontramos esa pantalla</h2>
    <p>Puede que el enlace esté incompleto. Sus datos están a salvo.</p>
    <a class="btn primary" href="#/">🏠 Volver al inicio</a>
  </section>`;
}

/* ---------- Compartir ---------- */
const URL_PUBLICA = "https://jale-cm3r.onrender.com/";
const MENSAJE_COMPARTIR = "Mira esta página gratis para buscar trabajo en Chicago. Te ayuda a hacer tu currículum en inglés, revisar si un trabajo es real y practicar la entrevista. En español y sin crear cuenta: ";
function bloqueCompartir() {
  return `
    <div class="compartir no-print">
      <p><b>¿Conoce a alguien que busca jale?</b> Compártale esta página.</p>
      <div class="row">
        <a class="btn whatsapp" href="https://wa.me/?text=${enc(MENSAJE_COMPARTIR + URL_PUBLICA)}" target="_blank" rel="noopener noreferrer">💬 Mandar por WhatsApp</a>
        <button type="button" class="btn" id="copiar-enlace">🔗 Copiar el enlace</button>
      </div>
    </div>`;
}

/* ---------- Inicio ---------- */
function vInicio() {
  const p = S.perfil, tieneCV = p.nombre && p.trabajos.length;
  const tools = [
    ["#/cv/" + (tieneCV ? "ver" : "1"), "📝", tieneCV ? "Mi currículum" : "Hacer mi currículum", tieneCV ? "Verlo, cambiarlo o imprimirlo" : "Paso a paso, en inglés y español. Toque lo que sabe hacer.", "principal"],
    ["#/revisar", "🔍", "¿Es real este trabajo?", "Dirección y teléfono de la empresa antes de mandar sus datos"],
    ["#/buscar", "📍", "Dónde buscar trabajo", "Lugares en Chicago que ayudan gratis"],
    ["#/recomendacion", "🤝", "¿Conoce a alguien ahí?", "Cómo pedir una recomendación"],
    ["#/entrevista", "🎤", "Practicar la entrevista", "Preguntas comunes y cómo responder"],
    ["#/ingles", "🗣️", "Inglés para el trabajo", "Frases útiles que puede escuchar"],
    ["#/solicitudes", "📋", "Mis solicitudes", `${S.solicitudes.length} anotada${S.solicitudes.length === 1 ? "" : "s"}`],
    ["#/derechos", "✅", "Qué llevar y mis derechos", "Documentos, pago mínimo y estafas"]
  ];
  return `
  <section class="stack">
    <div class="hero">
      ${p.nombre ? `<p class="muted">Hola, ${esc(p.nombre.split(" ")[0])} 👋</p>` : ""}
      <p class="grito" role="heading" aria-level="2">¡Hay <em>jale</em>!</p>
      <p class="lead">Usted sabe trabajar. Nosotros le ayudamos con lo demás: el currículum en inglés, la entrevista y revisar que el trabajo sea real.</p>
      <div class="sellos"><span class="sello">Gratis</span><span class="sello">En español</span><span class="sello">Sin crear cuenta</span><span class="sello">Chicago</span></div>
      ${oir("¡Hay jale! Usted sabe trabajar. Nosotros le ayudamos con lo demás: el currículum en inglés, la entrevista, y revisar que el trabajo sea real. Es gratis y no tiene que crear cuenta. Toque el botón verde grande para empezar su currículum.")}
    </div>
    <nav class="menu" aria-label="Herramientas">
      ${tools.map(([h, i, t, d, cls]) => `<a class="tool ${cls || ""}" href="${h}"><span class="ico" aria-hidden="true">${i}</span><span><b>${t}</b><span class="muted">${d}</span></span></a>`).join("")}
    </nav>
    ${bloqueCompartir()}
  </section>`;
}

/* ---------- Render y eventos ---------- */
const RUTAS = { "": vInicio, cv: vCV, revisar: vRevisar, buscar: vBuscar, entrevista: vEntrevista, ingles: vIngles, solicitudes: vSolicitudes, derechos: vDerechos, recomendacion: vRecomendacion, acerca: vAcerca, privacidad: vPrivacidad, terminos: vTerminos };
let rutaAnterior = null;
function render() {
  const h = location.hash;
  const [, base = "", a, b] = h.split("/");
  const valida = h === "" || h === "#" || h.startsWith("#/");
  const vista = valida ? (Object.hasOwn(RUTAS, base) ? RUTAS[base] : vNoEncontrado) : vInicio;
  let html;
  try { html = vista(a, b); }
  catch (e) { console.error(e); html = `<section class="panel stack centrado"><h2>Algo salió mal en esta pantalla</h2><p>Sus datos siguen guardados. Vuelva al inicio e intente otra vez.</p><a class="btn primary" href="#/">🏠 Volver al inicio</a></section>`; }
  if (html === "") return;
  $("#view").innerHTML = html;
  $("#btn-inicio").hidden = !base;
  if (h !== rutaAnterior) {
    window.scrollTo({ top: 0 });
    // Al cambiar de pantalla, llevar el foco al título (ayuda a quien navega con teclado o lector de pantalla).
    if (rutaAnterior !== null) { const t = $("#view h2, #view [role=heading]"); if (t) { t.tabIndex = -1; t.focus({ preventScroll: true }); } }
    rutaAnterior = h;
  }
}
function renderQuieto() { const y = window.scrollY; render(); window.scrollTo({ top: y }); }
addEventListener("hashchange", () => { if (!location.hash.startsWith("#/cv/trabajo")) borrador = null; render(); });

const V = $("#view");

V.addEventListener("click", async e => {
  const b = e.target.closest("button"); if (!b) return;
  const d = b.dataset;
  if (d.oir) return hablar(d.oir, d.lang);
  if (d.mic) return dictar(b);
  if (d.pasoIr !== undefined) {
    const n = +$("#form-paso").dataset.paso;
    PASOS[n - 1].leer(S.perfil); guardar();
    location.hash = +d.pasoIr < 1 ? "#/" : "#/cv/" + d.pasoIr; return;
  }
  if (d.borrarTrabajo) {
    if (!(await confirmar("¿Borrar este trabajo de su currículum?"))) return;
    S.perfil.trabajos = S.perfil.trabajos.filter(t => t.id !== d.borrarTrabajo); guardar(); render(); return;
  }
  if (b.id === "agregar-tarea") {
    const campo = $("#t-otra"), txt = campo.value.trim();
    if (!txt) { toast("Escriba o dicte la tarea primero"); campo.focus(); return; }
    leerTrabajo();
    let tarea = [txt, txt];
    if (iaPara("tarea")) {
      b.disabled = true; b.textContent = "Traduciendo…";
      try { const r = await ia({ tipo: "tarea", texto: txt, oficio: oficio(borrador.oficio)?.es || "" }); tarea = [r.es || txt, r.en || txt]; }
      catch (err) { toast("No se pudo traducir. Se guardará como la escribió."); }
    }
    if (borrador.tareas.length >= LIM.tareas) { toast(`Puede poner hasta ${LIM.tareas} tareas por trabajo.`); return; }
    borrador.tareas.push(tarea); renderQuieto(); toast("Tarea agregada"); return;
  }
  if (d.idioma) { S.idiomaCV = d.idioma; guardar(); renderQuieto(); return; }
  if (b.id === "imprimir") {
    const t = document.title; document.title = `Resume - ${S.perfil.nombre || "Jale"}`;
    window.print(); document.title = t; return;
  }
  if (b.id === "descargar-cv") {
    const nombre = (S.perfil.nombre || "Curriculum").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
    const doc = `<!doctype html><html lang="${S.idiomaCV}"><head><meta charset="utf-8"><title>${esc(S.perfil.nombre || "Resume")}</title><style>
      @page { size: letter; margin: 0.6in; } body { margin: 0; background: #fff; }
      .cv { max-width: 7.5in; margin: 24px auto; color: #111; font-family: "Segoe UI", Arial, sans-serif; font-size: 15px; line-height: 1.4; }
      .cv h1 { font-size: 26px; margin: 0; } .cv .contacto { color: #333; margin: 4px 0 0; } .cv p { margin: 0; }
      .cv h2 { font-size: 15px; text-transform: uppercase; letter-spacing: .06em; color: #0D6B57; border-bottom: 1.5px solid #0D6B57; padding-bottom: 3px; margin: 18px 0 8px; }
      .cv ul { margin: 4px 0 10px; padding-left: 20px; } .cv li { margin: 2px 0; }
      .cv .trabajo-cab { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
      @media print { .cv { margin: 0; } }
      </style></head><body>${cvHTML(S.idiomaCV)}<script>addEventListener("load", () => print());<\/script></body></html>`;
    try { await DESCARGAS.save({ filename: `${nombre}-${S.idiomaCV === "en" ? "Resume" : "Curriculum"}.html`, data: doc }); toast("Listo. Ábralo desde Descargas para imprimir."); }
    catch (err) { if (err?.code !== "declined") toast("No se pudo descargar aquí. Use “Copiar el texto”."); }
    return;
  }
  if (b.id === "copiar-enlace") {
    try { await navigator.clipboard.writeText(URL_PUBLICA); toast("Enlace copiado. Péguelo en un mensaje."); }
    catch (err) { toast("El enlace es: " + URL_PUBLICA); }
    return;
  }
  if (b.id === "copiar-cv") {
    const el = $(".cv");
    try { await navigator.clipboard.writeText(el.innerText); toast("Copiado. Péguelo en Word o en un correo."); }
    catch (err) { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast("Texto seleccionado. Cópielo con Ctrl+C."); }
    return;
  }
  if (b.id === "r-ia") {
    if (!revisar.empresa.trim() && !revisar.anuncio.trim()) { toast("Escriba el nombre de la empresa o pegue el anuncio"); return; }
    revisar.cargando = true; revisar.resultado = null; renderQuieto();
    revisar.error = "";
    try { revisar.resultado = await ia({ tipo: "empresa", empresa: revisar.empresa, ciudad: revisar.ciudad, anuncio: revisar.anuncio }); }
    catch (err) { revisar.error = err.message; }
    revisar.cargando = false; renderQuieto(); return;
  }
  if (b.id === "r-guardar") {
    editando = { id: "nueva", empresa: revisar.empresa.trim(), puesto: "", fecha: hoyLocal(), estado: "por-enviar", direccion: "", telefono: "", notas: "" };
    location.hash = "#/solicitudes/nueva"; return;
  }
  if (d.consejo !== undefined) {
    const i = +d.consejo, resp = (S.respuestas[i] || "").trim();
    if (resp.length < 10) { toast("Primero escriba o dicte su respuesta"); return; }
    consejoIA[i] = { cargando: true }; renderQuieto();
    try { const r = await ia({ tipo: "consejo", pregunta: PREGUNTAS[i].es, respuesta: resp }); consejoIA[i] = { texto: r.texto }; }
    catch (err) { consejoIA[i] = { error: err.message }; }
    renderQuieto(); return;
  }
  if (d.borrarSol) {
    if (!(await confirmar("¿Borrar esta solicitud?"))) return;
    S.solicitudes = S.solicitudes.filter(s => s.id !== d.borrarSol); guardar(); location.hash = "#/solicitudes"; return;
  }
});

V.addEventListener("input", e => {
  const t = e.target;
  if (t.dataset.resp !== undefined) { S.respuestas[t.dataset.resp] = t.value; guardar(); }
  if (t.id === "r-empresa" || t.id === "r-ciudad") {
    revisar[t.id === "r-empresa" ? "empresa" : "ciudad"] = t.value;
    $("#r-enlaces").innerHTML = enlacesEmpresa();
    const g = $("#r-guardar"); if (g) g.disabled = !revisar.empresa.trim();
  }
  if (t.id === "r-anuncio") revisar.anuncio = t.value;
});

V.addEventListener("change", e => {
  const t = e.target;
  if (t.name === "cual" && marcados("cual").length > 5) { t.checked = false; toast("Elija máximo 5"); }
  if (t.name === "t-oficio") { leerTrabajo(); renderQuieto(); }
  if (t.id === "t-actual") $("#t-hasta").disabled = t.checked;
  if (t.name === "senal") { revisar.senales = marcados("senal").map(Number); const [txt, cls] = nivelRiesgo(); const r = $("#riesgo"); r.className = "note " + cls; r.innerHTML = `<span class="riesgo">${esc(txt)}</span>`; }
  if (t.id === "recortar") { S.recortar = t.checked; guardar(); renderQuieto(); }
});

V.addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target;
  if (f.id === "form-paso") {
    const n = +f.dataset.paso;
    PASOS[n - 1].leer(S.perfil);
    if (n === 1 && !S.perfil.nombre) { toast("Escriba su nombre para seguir"); return; }
    guardar();
    location.hash = n === PASOS.length ? "#/cv/ver" : "#/cv/" + (n + 1); return;
  }
  if (f.id === "form-trabajo") {
    leerTrabajo();
    const t = borrador;
    if (!t.oficio) { toast("Toque el tipo de trabajo"); return; }
    for (const [k, nombre] of [["desde", "empezó"], ["hasta", "terminó"]]) {
      if (t[k] && (+t[k] < 1950 || +t[k] > AHORA)) { toast(`Revise el año en que ${nombre}`); return; }
    }
    if (t.desde && t.hasta && !t.actual && +t.hasta < +t.desde) { toast("El año en que terminó va después del año en que empezó"); return; }
    const { nuevo: _, ...limpio } = t;
    const i = S.perfil.trabajos.findIndex(x => x.id === t.id);
    if (i < 0 && S.perfil.trabajos.length >= LIM.trabajos) { toast(`Puede poner hasta ${LIM.trabajos} trabajos. Deje los más importantes.`); return; }
    if (i >= 0) S.perfil.trabajos[i] = limpio; else S.perfil.trabajos.push(limpio);
    if (!S.perfil.objetivo) S.perfil.objetivo = t.oficio;
    guardar(); borrador = null; toast("Trabajo guardado"); location.hash = "#/cv/4"; return;
  }
  if (f.id === "form-sol") {
    const s = {
      id: f.dataset.id === "nueva" ? "s" + Date.now().toString(36) : f.dataset.id,
      empresa: $("#s-empresa").value.trim(), puesto: $("#s-puesto").value.trim(), fecha: $("#s-fecha").value,
      estado: marcados("s-estado")[0] || "por-enviar", direccion: $("#s-dir").value.trim(), telefono: $("#s-tel").value.trim(), notas: $("#s-notas").value.trim(),
      conocido: $("#s-conocido").value.trim(), rrhh: $("#s-rrhh").value.trim()
    };
    if (!s.empresa) { toast("Escriba el nombre de la empresa"); return; }
    const i = S.solicitudes.findIndex(x => x.id === s.id);
    if (i < 0 && S.solicitudes.length >= LIM.solicitudes) { toast(`Puede anotar hasta ${LIM.solicitudes} solicitudes. Borre algunas viejas.`); return; }
    if (i >= 0) S.solicitudes[i] = s; else S.solicitudes.push(s);
    editando = null; guardar(); toast("Guardado"); location.hash = "#/solicitudes"; return;
  }
});

/* ---------- Copia de seguridad y borrar ---------- */
$("#guardar-copia").addEventListener("click", async () => {
  const archivo = `jale-${(S.perfil.nombre || "copia").replace(/[^\w]+/g, "-").toLowerCase()}.json`;
  if (EN_VISOR) {
    if (!DESCARGAS) { toast("Aquí no se pueden guardar archivos."); return; }
    try { await DESCARGAS.save({ filename: archivo, data: JSON.stringify(S, null, 2) }); toast("Copia guardada. Guárdela en una memoria USB o mándesela por correo."); }
    catch (err) { if (err?.code !== "declined") toast("No se pudo guardar la copia aquí."); }
    return;
  }
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = archivo;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast("Copia guardada en Descargas. Guárdela en una memoria USB o mándesela por correo.");
});
$("#btn-abrir-copia").addEventListener("click", () => $("#abrir-copia").click());
$(".saltar").addEventListener("click", e => { e.preventDefault(); $("#view").focus(); });
$("#abrir-copia").addEventListener("change", async e => {
  const f = e.target.files[0]; e.target.value = ""; if (!f) return;
  if (f.size > LIM.archivoBytes) { toast("Ese archivo es demasiado grande para ser una copia de Jale"); return; }
  try {
    const d = JSON.parse(await f.text());
    if (!d || typeof d.perfil !== "object") throw new Error();
    S = limpiarDatos(d); guardar();
    toast("Sus datos se abrieron bien"); location.hash = "#/"; render();
  } catch (err) { toast("Ese archivo no es una copia de Jale"); }
});
$("#borrar-todo").addEventListener("click", async () => {
  if (!(await confirmar("¿Borrar todos sus datos de este aparato? Si no guardó una copia, no se pueden recuperar.", "Sí, borrar todo"))) return;
  try { localStorage.removeItem(CLAVE); } catch (e) {}
  S = nuevo(); revisar.empresa = ""; revisar.anuncio = ""; revisar.resultado = null; revisar.senales = []; consejoIA = {};
  toast("Sus datos se borraron"); location.hash = "#/"; render();
});

if ("speechSynthesis" in window) speechSynthesis.getVoices(); // precarga las voces
// Permite instalar Jale en el celular y abrirla aunque falle el internet (solo en su propio servidor).
if (!EN_VISOR && "serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
render();
