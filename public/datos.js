// Contenido de la app. Cada texto tiene versión en español (es) y en inglés (en).
// Revisado en octubre de 2026. Los enlaces y datos de Chicago se verificaron en esa fecha.

const OFICIOS = [
  { id: "limpieza", icono: "🧹", es: "Limpieza / Conserje", en: "Custodian / Cleaner",
    buscar: "Custodian, Janitor, Housekeeper, Building Service Worker, Environmental Services",
    tareas: [
      ["Barrer, trapear y encerar pisos", "Swept, mopped and waxed floors"],
      ["Limpiar y desinfectar baños", "Cleaned and disinfected restrooms"],
      ["Limpiar oficinas, salones y áreas comunes", "Cleaned offices, classrooms and common areas"],
      ["Sacar la basura y el reciclaje", "Removed trash and recycling"],
      ["Reponer papel, jabón y otros suministros", "Restocked paper, soap and other supplies"],
      ["Usar máquinas lavadoras de pisos y aspiradoras", "Operated floor scrubbers and vacuum cleaners"],
      ["Lavar ventanas y vidrios", "Cleaned windows and glass"],
      ["Usar productos químicos de forma segura", "Handled cleaning chemicals safely"],
      ["Limpiar habitaciones de hotel y tender camas", "Cleaned hotel rooms and made beds"],
      ["Avisar al supervisor de daños o peligros", "Reported damage and safety hazards to supervisor"]
    ] },
  { id: "cocina", icono: "🍳", es: "Cocina", en: "Cook / Kitchen Helper",
    buscar: "Line Cook, Prep Cook, Dishwasher, Kitchen Helper, Food Service Worker",
    tareas: [
      ["Preparar ingredientes (cortar, picar, medir)", "Prepared ingredients (cutting, chopping, measuring)"],
      ["Cocinar platillos siguiendo recetas", "Cooked dishes following recipes"],
      ["Usar plancha, freidora y horno", "Operated grill, fryer and oven"],
      ["Lavar platos, ollas y utensilios", "Washed dishes, pots and utensils"],
      ["Mantener la cocina limpia y ordenada", "Kept the kitchen clean and organized"],
      ["Guardar y rotar alimentos (lo primero que entra, primero sale)", "Stored and rotated food using FIFO"],
      ["Seguir reglas de higiene y temperatura", "Followed food safety and temperature rules"],
      ["Trabajar rápido en horas de mucho trabajo", "Worked quickly during busy hours"],
      ["Recibir y acomodar mercancía", "Received and put away deliveries"]
    ] },
  { id: "construccion", icono: "🧱", es: "Construcción", en: "Construction Worker",
    buscar: "Construction Laborer, General Laborer, Painter, Drywall Installer, Helper",
    tareas: [
      ["Cargar y mover materiales", "Loaded and moved building materials"],
      ["Demoler y limpiar el área de trabajo", "Performed demolition and job site cleanup"],
      ["Mezclar y colar concreto", "Mixed and poured concrete"],
      ["Instalar tablaroca (drywall)", "Installed drywall"],
      ["Pintar interiores y exteriores", "Painted interiors and exteriors"],
      ["Poner pisos y azulejo", "Installed flooring and tile"],
      ["Hacer trabajos de techo", "Performed roofing work"],
      ["Usar herramientas eléctricas de forma segura", "Used power tools safely"],
      ["Leer medidas y planos sencillos", "Read measurements and basic blueprints"],
      ["Seguir reglas de seguridad en la obra", "Followed job site safety rules"]
    ] },
  { id: "almacen", icono: "📦", es: "Almacén / Bodega", en: "Warehouse Worker",
    buscar: "Warehouse Associate, Picker Packer, Material Handler, Forklift Operator",
    tareas: [
      ["Cargar y descargar camiones", "Loaded and unloaded trucks"],
      ["Surtir y empacar pedidos", "Picked and packed orders"],
      ["Etiquetar productos", "Labeled products and shipments"],
      ["Contar inventario", "Counted inventory"],
      ["Usar escáner de mano", "Used handheld scanners"],
      ["Manejar montacargas", "Operated forklift"],
      ["Usar patín (pallet jack)", "Operated pallet jack"],
      ["Mantener el área ordenada y segura", "Kept the work area clean and safe"],
      ["Levantar hasta 50 libras", "Lifted up to 50 lbs"]
    ] },
  { id: "fabrica", icono: "🏭", es: "Fábrica / Producción", en: "Production Worker / Machine Operator",
    buscar: "Production Worker, Machine Operator, Assembler, CNC Operator, Machinist",
    tareas: [
      ["Trabajar en línea de producción", "Worked on a production line"],
      ["Operar máquinas de producción", "Operated production machines"],
      ["Operar torno o fresadora", "Operated lathe or milling machine"],
      ["Medir piezas con calibrador (vernier)", "Measured parts with calipers"],
      ["Revisar la calidad de las piezas", "Inspected parts for quality"],
      ["Ensamblar productos", "Assembled products"],
      ["Empacar productos terminados", "Packed finished products"],
      ["Limpiar y dar mantenimiento básico a las máquinas", "Cleaned and performed basic machine maintenance"],
      ["Cumplir metas de producción", "Met production goals"],
      ["Seguir reglas de seguridad", "Followed safety procedures"]
    ] },
  { id: "jardineria", icono: "🌳", es: "Jardinería", en: "Landscaper",
    buscar: "Landscaper, Groundskeeper, Landscape Laborer, Snow Removal",
    tareas: [
      ["Cortar pasto", "Mowed lawns"],
      ["Podar arbustos y árboles", "Trimmed bushes and trees"],
      ["Plantar flores y árboles", "Planted flowers and trees"],
      ["Recoger hojas y limpiar el área", "Raked leaves and cleaned up sites"],
      ["Quitar nieve y echar sal", "Removed snow and salted walkways"],
      ["Usar podadora, desbrozadora y sopladora", "Operated mowers, trimmers and blowers"],
      ["Regar y cuidar plantas", "Watered and cared for plants"],
      ["Poner piedra o adoquín", "Installed stone and pavers"]
    ] },
  { id: "cuidado", icono: "🤝", es: "Cuidado de personas", en: "Caregiver",
    buscar: "Caregiver, Home Care Aide, Personal Care Aide, Nanny",
    tareas: [
      ["Ayudar a personas mayores en su día a día", "Assisted elderly clients with daily activities"],
      ["Ayudar a bañarse y vestirse", "Helped clients with bathing and dressing"],
      ["Preparar comidas", "Prepared meals"],
      ["Recordar la hora de las medicinas", "Gave medication reminders"],
      ["Acompañar a citas médicas", "Accompanied clients to appointments"],
      ["Limpiar la casa y lavar ropa", "Did light housekeeping and laundry"],
      ["Cuidar niños", "Cared for children"],
      ["Dar compañía y apoyo", "Provided companionship and support"]
    ] },
  { id: "mantenimiento", icono: "🔧", es: "Mantenimiento", en: "Maintenance Worker",
    buscar: "Maintenance Worker, Maintenance Technician, Handyman, Building Engineer",
    tareas: [
      ["Hacer reparaciones generales", "Performed general repairs"],
      ["Arreglar plomería sencilla", "Fixed basic plumbing problems"],
      ["Cambiar focos y arreglar electricidad sencilla", "Replaced light fixtures and did basic electrical work"],
      ["Pintar y resanar paredes", "Painted and patched walls"],
      ["Arreglar puertas, chapas y muebles", "Repaired doors, locks and furniture"],
      ["Revisar calefacción y aire acondicionado", "Checked heating and air conditioning"],
      ["Preparar departamentos para nuevos inquilinos", "Prepared apartments for new tenants"],
      ["Mover muebles y equipo", "Moved furniture and equipment"]
    ] },
  { id: "entregas", icono: "🚚", es: "Chofer / Entregas", en: "Delivery Driver",
    buscar: "Delivery Driver, Driver Helper, Courier, CDL Driver",
    tareas: [
      ["Entregar paquetes a tiempo", "Delivered packages on time"],
      ["Planear rutas de entrega", "Planned delivery routes"],
      ["Cargar y descargar el vehículo", "Loaded and unloaded the vehicle"],
      ["Manejar con cuidado, sin accidentes", "Drove safely with a clean record"],
      ["Revisar el vehículo antes de salir", "Inspected the vehicle before each trip"],
      ["Atender a los clientes con amabilidad", "Provided friendly customer service"],
      ["Usar GPS y aplicaciones de entregas", "Used GPS and delivery apps"],
      ["Llevar registro de entregas y cobros", "Kept delivery and payment records"]
    ] },
  { id: "tienda", icono: "🛒", es: "Tienda / Atención al cliente", en: "Retail / Customer Service",
    buscar: "Cashier, Stocker, Retail Associate, Customer Service",
    tareas: [
      ["Atender clientes", "Assisted customers"],
      ["Cobrar en caja", "Operated the cash register"],
      ["Acomodar mercancía en anaqueles", "Stocked shelves"],
      ["Mantener la tienda limpia y ordenada", "Kept the store clean and organized"],
      ["Recibir mercancía", "Received merchandise"],
      ["Contar dinero y hacer corte de caja", "Counted money and balanced the register"]
    ] }
];

const CUALIDADES = [
  ["Puntual y responsable", "Punctual and reliable"],
  ["Trabajo bien en equipo", "Team player"],
  ["Trabajo sin que me estén vigilando", "Works well without supervision"],
  ["Aprendo rápido", "Fast learner"],
  ["Cuidadoso(a) con los detalles", "Detail-oriented"],
  ["Honesto(a) y de confianza", "Honest and trustworthy"],
  ["Aguanto trabajo físico pesado", "Able to do heavy physical work"],
  ["Buen trato con la gente", "Friendly and respectful with people"],
  ["Cuido la seguridad", "Safety-conscious"],
  ["Organizado(a)", "Organized"]
];

const CERTIFICADOS = [
  ["Licencia de manejo", "Valid driver's license"],
  ["Licencia comercial (CDL)", "Commercial Driver's License (CDL)"],
  ["OSHA 10", "OSHA 10 certified"],
  ["OSHA 30", "OSHA 30 certified"],
  ["Montacargas (forklift)", "Forklift certified"],
  ["Manejo de alimentos (Food Handler)", "Food Handler certificate"],
  ["ServSafe", "ServSafe certified"],
  ["Primeros auxilios / RCP", "First Aid / CPR certified"],
  ["Asistente de enfermería (CNA)", "Certified Nursing Assistant (CNA)"]
];

const DISPONIBILIDAD = [
  ["Mañanas", "mornings"], ["Tardes", "afternoons"], ["Noches", "nights"],
  ["Fines de semana", "weekends"], ["Tiempo completo", "full-time"], ["Medio tiempo", "part-time"]
];

const NIVEL_INGLES = [
  ["nada", "No hablo inglés", ""],
  ["basico", "Un poco (básico)", "Basic English"],
  ["intermedio", "Me defiendo (intermedio)", "Conversational English"],
  ["bueno", "Bien (fluido)", "Fluent English"]
];

const ESTUDIOS = [
  ["", "Prefiero no ponerlo", ""],
  ["primaria", "Primaria", "Elementary school"],
  ["secundaria", "Secundaria", "Middle school"],
  ["prepa", "Preparatoria / High school", "High school"],
  ["ged", "GED", "GED"],
  ["tecnico", "Carrera técnica", "Technical school"],
  ["universidad", "Universidad", "College / University"]
];

// Preguntas de entrevista: qué preguntan, cómo responder y un ejemplo sencillo.
const PREGUNTAS = [
  { en: "Tell me about yourself.", es: "Hábleme de usted.",
    consejo: "Diga 3 cosas: qué trabajo sabe hacer, cuántos años tiene haciéndolo y por qué le interesa este trabajo. No cuente su vida personal.",
    ej_es: "Tengo 10 años de experiencia en limpieza. Soy puntual y me gusta dejar todo bien hecho. Busco un trabajo estable.",
    ej_en: "I have 10 years of experience in cleaning. I am punctual and I like to do things right. I am looking for a stable job." },
  { en: "Why do you want to work here?", es: "¿Por qué quiere trabajar aquí?",
    consejo: "Diga algo bueno y real de la empresa: que está cerca, que tiene buena fama o que le gusta el tipo de trabajo.",
    ej_es: "Me queda cerca, me dijeron que tratan bien a sus trabajadores y quiero un trabajo donde quedarme.",
    ej_en: "It is close to my home, I heard you treat your workers well, and I want a job where I can stay." },
  { en: "What experience do you have?", es: "¿Qué experiencia tiene?",
    consejo: "Diga dónde trabajó, cuántos años y 2 o 3 tareas que hacía. Si trabajó en otro país, también cuenta.",
    ej_es: "Trabajé 6 años en una fábrica. Operaba máquinas, revisaba la calidad y cumplía las metas del turno.",
    ej_en: "I worked 6 years in a factory. I operated machines, checked quality and met my shift goals." },
  { en: "Why did you leave your last job?", es: "¿Por qué dejó su último trabajo?",
    consejo: "Sea breve y positivo. Nunca hable mal de su jefe anterior.",
    ej_es: "La empresa cerró. / Me mudé. / Busco un trabajo con más horas.",
    ej_en: "The company closed. / I moved. / I am looking for more hours." },
  { en: "You have a lot of experience. Why do you want this job?", es: "Usted tiene mucha experiencia. ¿Por qué quiere este trabajo?",
    consejo: "Esta pregunta es para ver si se va a ir pronto. Diga que busca estabilidad y que el sueldo del puesto le parece bien.",
    ej_es: "Busco un trabajo estable para quedarme mucho tiempo. Conozco el sueldo del puesto y estoy de acuerdo.",
    ej_en: "I want a stable job where I can stay a long time. I know the pay for this position and I am fine with it." },
  { en: "What are your strengths?", es: "¿Cuáles son sus puntos fuertes?",
    consejo: "Diga 2 cualidades y un ejemplo corto de cada una.",
    ej_es: "Soy puntual: en 5 años nunca llegué tarde. Y aprendo rápido.",
    ej_en: "I am punctual: in 5 years I was never late. And I learn fast." },
  { en: "Tell me about a problem at work and how you solved it.", es: "Cuénteme de un problema en el trabajo y cómo lo resolvió.",
    consejo: "Cuente qué pasó, qué hizo usted y cómo terminó. Corto y con un final bueno.",
    ej_es: "Un día faltó un compañero. Me organicé, terminé mi área y ayudé con la suya. Todo quedó listo a tiempo.",
    ej_en: "One day a coworker was absent. I organized my time, finished my area and helped with his. Everything was done on time." },
  { en: "Can you work nights or weekends?", es: "¿Puede trabajar de noche o en fines de semana?",
    consejo: "Diga la verdad. Entre más horarios pueda, más oportunidades tiene.",
    ej_es: "Sí, puedo trabajar en las noches y los sábados.",
    ej_en: "Yes, I can work nights and Saturdays." },
  { en: "Can you lift 50 pounds?", es: "¿Puede levantar 50 libras?",
    consejo: "50 libras son unos 23 kilos. Conteste sí o no con honestidad.",
    ej_es: "Sí, en mi trabajo anterior cargaba cajas así todos los días.",
    ej_en: "Yes, in my last job I lifted boxes like that every day." },
  { en: "How will you get to work?", es: "¿Cómo va a llegar al trabajo?",
    consejo: "Quieren saber si va a llegar a tiempo. Diga cómo llega y cuánto tarda.",
    ej_es: "Tomo el autobús. Hago 30 minutos y salgo con tiempo.",
    ej_en: "I take the bus. It takes 30 minutes and I leave early." },
  { en: "What would you do if you saw something unsafe?", es: "¿Qué haría si ve algo peligroso?",
    consejo: "Siempre: proteger a las personas, marcar el área y avisar al supervisor.",
    ej_es: "Pongo un aviso para que nadie pase y le aviso al supervisor de inmediato.",
    ej_en: "I put up a sign so nobody walks there and I tell my supervisor right away." },
  { en: "When can you start?", es: "¿Cuándo puede empezar?",
    consejo: "Si puede empezar pronto, dígalo. Es un punto a su favor.",
    ej_es: "Puedo empezar de inmediato.",
    ej_en: "I can start right away." },
  { en: "How much do you expect to earn?", es: "¿Cuánto espera ganar?",
    consejo: "Pregunte primero cuánto pagan. En Chicago el mínimo es $17.05 la hora (desde julio de 2026).",
    ej_es: "¿Cuál es el pago para este puesto? Estoy abierto(a) a lo que ofrecen.",
    ej_en: "What is the pay for this position? I am open to your offer." },
  { en: "Do you have any questions for us?", es: "¿Tiene alguna pregunta para nosotros?",
    consejo: "Siempre haga 1 o 2 preguntas. Así ven que le interesa.",
    ej_es: "¿Cuál sería mi horario? ¿Cuándo me avisan si me eligieron?",
    ej_en: "What would my schedule be? When will I know if I got the job?" }
];

// Frases útiles en inglés, por situación.
const FRASES = [
  { tema: "Pedir trabajo", icono: "👋", frases: [
    ["Hola, me llamo ___.", "Hello, my name is ___."],
    ["¿Están contratando?", "Are you hiring?"],
    ["Busco trabajo.", "I am looking for a job."],
    ["¿Puedo llenar una solicitud?", "Can I fill out an application?"],
    ["Aquí está mi currículum.", "Here is my resume."],
    ["Vengo a la entrevista.", "I am here for the job interview."]
  ] },
  { tema: "En la entrevista", icono: "💬", frases: [
    ["¿Puede repetirlo, por favor?", "Can you repeat that, please?"],
    ["¿Puede hablar más despacio, por favor?", "Can you speak more slowly, please?"],
    ["Tengo ___ años de experiencia.", "I have ___ years of experience."],
    ["Soy muy trabajador(a).", "I am a hard worker."],
    ["Puedo empezar de inmediato.", "I can start right away."],
    ["Gracias por su tiempo.", "Thank you for your time."]
  ] },
  { tema: "Por teléfono", icono: "📞", frases: [
    ["Llamo por el trabajo.", "I am calling about the job."],
    ["¿Todavía está disponible el puesto?", "Is the position still open?"],
    ["¿Cuál es la dirección?", "What is the address?"],
    ["¿A qué hora debo llegar?", "What time should I come?"],
    ["Mi número de teléfono es ___.", "My phone number is ___."]
  ] },
  { tema: "En el trabajo", icono: "🛠️", frases: [
    ["Ya terminé.", "I finished."],
    ["¿Qué hago ahora?", "What should I do next?"],
    ["Necesito ayuda, por favor.", "I need help, please."],
    ["No entiendo, ¿me puede enseñar?", "I don't understand. Can you show me?"],
    ["¿Dónde están los materiales?", "Where are the supplies?"],
    ["La máquina tiene un problema.", "There is a problem with the machine."]
  ] },
  { tema: "Seguridad", icono: "⚠️", frases: [
    ["¡Cuidado, piso mojado!", "Caution, wet floor!"],
    ["Alguien se lastimó.", "Someone is hurt."],
    ["Llamen al 911.", "Call 911."],
    ["Hay una fuga de agua.", "There is a water leak."],
    ["Huele a gas.", "I smell gas."]
  ] }
];

// Recursos en Chicago (verificados en octubre de 2026). Llame antes de ir: horarios y programas cambian.
const RECURSOS = [
  { grupo: "Ayuda gratis para buscar trabajo", items: [
    { nombre: "American Job Centers (Chicago Cook Workforce Partnership)", url: "https://chicookworks.org/career-seeker-services/",
      que: "Centros gratuitos del gobierno: ayuda con el currículum, cursos y ofertas de trabajo. Hay varios en Chicago, por ejemplo en Truman College y Malcolm X College." },
    { nombre: "Instituto del Progreso Latino", url: "https://www.institutochicago.org", tel: "(773) 890-0055", dir: "2520 S. Western Ave., Chicago, IL 60608",
      que: "Capacitación para trabajos en salud, manufactura y más. Atienden en español." },
    { nombre: "National Able Network (programa para 55 años o más)", url: "https://www.nationalable.org/jobseekers/",
      que: "Ayuda para encontrar trabajo, con un programa especial (SCSEP) para personas de 55 años o más con bajos ingresos." },
    { nombre: "Illinois workNet", url: "https://www.illinoisworknet.com",
      que: "Página del estado con buscador de trabajos, guías para el currículum y una sección en español." },
    { nombre: "Illinois JobLink", url: "https://illinoisjoblink.illinois.gov",
      que: "Bolsa de trabajo oficial del estado de Illinois." }
  ] },
  { grupo: "Universidades y colegios (busque: Custodian, Building Service Worker, Housekeeper)", items: [
    { nombre: "University of Illinois Chicago (UIC)", url: "https://jobs.uic.edu", que: "Puestos de personal (Staff) y de servicio civil." },
    { nombre: "University of Chicago", url: "https://humanresources.uchicago.edu/jobs/", que: "Ofertas de trabajo de la universidad y su centro médico." },
    { nombre: "Northwestern University", url: "https://careers.northwestern.edu", que: "Campus en Chicago (centro) y en Evanston." },
    { nombre: "Loyola University Chicago", url: "https://www.luc.edu/hr/careers/facultystaffopportunities/", que: "Busque en la sección de personal (Staff)." },
    { nombre: "DePaul University", url: "https://offices.depaul.edu/human-resources/careers", que: "Puestos de tiempo completo y medio tiempo." },
    { nombre: "City Colleges of Chicago", url: "https://www.ccc.edu/departments/Staffing", que: "Siete colegios comunitarios en distintas zonas de la ciudad." }
  ] },
  { grupo: "Gobierno", items: [
    { nombre: "Trabajos de la Ciudad de Chicago", url: "https://www.chicago.gov/jobs", que: "Empleos de la ciudad. Muchos tienen buenas prestaciones." },
    { nombre: "Línea 311 de Chicago", tel: "311", que: "Para quejas por pago menor al mínimo o sin pagar. Pida la Oficina de Normas Laborales (Office of Labor Standards)." }
  ] }
];

// Señales de que un anuncio puede ser falso. "grave" = casi seguro estafa.
const SENALES = [
  { t: "¿Le piden dinero para darle el trabajo, para un curso o para el uniforme?", grave: true },
  { t: "¿Le piden su número de Seguro Social o su cuenta de banco antes de una entrevista de verdad?", grave: true },
  { t: "¿Le mandan un cheque y le piden que devuelva una parte del dinero?", grave: true },
  { t: "¿Le ofrecen mucho dinero por muy poco trabajo?" },
  { t: "¿El anuncio no dice el nombre de la empresa ni la dirección?" },
  { t: "¿Solo le escriben por WhatsApp, Telegram o mensaje de texto?" },
  { t: "¿El correo es de Gmail, Yahoo o Hotmail en vez de la empresa?" },
  { t: "¿Le contratan sin entrevista, o la entrevista es solo por chat?" },
  { t: "¿Le presionan para decidir hoy mismo?" },
  { t: "¿La descripción del trabajo es muy vaga, sin decir qué va a hacer?" }
];

const ESTADOS = [
  ["por-enviar", "Por enviar", ""], ["enviada", "Enviada", "wait"], ["entrevista", "Entrevista", "ok"],
  ["contratado", "¡Me contrataron!", "ok"], ["no", "No me eligieron", "no"]
];
