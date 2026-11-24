// English lives at the root (/about/) and Spanish under /es/ (/es/about/), with the same
// slugs. Every string the interface shows is here, in both languages (ADR 0005).
// Long-form content (case studies, experience, stack) lives in content/ as *.es.* files.

export const LANGS = ['en', 'es'] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_NAMES: Record<Lang, string> = { en: 'English', es: 'Español' };
export const OG_LOCALE: Record<Lang, string> = { en: 'en_US', es: 'es_CO' };
export const LANG_STORAGE_KEY = 'lang';

export const otherLang = (lang: Lang): Lang => (lang === 'en' ? 'es' : 'en');

// '/about/' -> '/es/about/' for Spanish. Paths are always written in their English form.
export function localePath(lang: Lang, path: string): string {
	if (lang === 'en') return path;
	return path === '/' ? '/es/' : `/es${path}`;
}

// '/es/about' or '/es/about/' -> '/about/'. Accepts what usePathname() returns.
export function basePath(pathname: string): string {
	const withSlash = pathname.endsWith('/') ? pathname : `${pathname}/`;
	if (withSlash === '/es/') return '/';
	return withSlash.startsWith('/es/') ? withSlash.slice(3) : withSlash;
}

export function langOfPath(pathname: string): Lang {
	return pathname === '/es' || pathname.startsWith('/es/') ? 'es' : 'en';
}

type Decision = { title: string; text: string; pro: string; con: string };

const en = {
	skip: 'Skip to content',
	nav: {
		label: 'Main',
		projects: 'Projects',
		about: 'About',
		contact: 'Contact',
		resume: 'Résumé',
		language: 'Language',
	},
	footer: {
		built: 'Built with Next.js by GitHub Actions',
		fromCommit: 'from commit',
		served: 'and served by GitHub Pages.',
	},
	langHint: {
		// Shown in the other language, to the visitor whose browser prefers it.
		text: 'This site is also in English.',
		go: 'View in English',
		stay: 'Stay in Spanish',
	},
	home: {
		description:
			'Juan Duque is a backend-focused Software Engineer in Colombia, building real-time systems in Python and Node.js. Open to remote roles.',
		lead: 'Software Engineer building real-time backends in Python and Node.js.',
		bio: (location: string) =>
			`More than four years on production systems: microservices, REST APIs and asynchronous pipelines. Based in ${location}, working in English at a C1 level, open to remote roles.`,
		resume: 'Download résumé (PDF)',
		emailMe: 'Email me',
		newTab: '(opens in a new tab)',
		experience: 'Experience',
		jobDates: (start: string, end: string, location: string) => `${start} to ${end}, ${location.toLowerCase()}`,
		work: 'Selected work',
		stack: 'Stack',
		contact: 'Contact',
		contactLead: "I'm open to remote roles, wherever the team is. Send me a message, or write to",
		alsoOn: 'You can also find me on',
		orDownload: 'or',
		downloadResume: 'download my résumé',
	},
	projectCard: { read: 'Read the case study' },
	projects: {
		title: 'Projects',
		description: 'Case studies by Juan Duque: the problem, the solution, the stack, his role and the result.',
		lead: 'What the problem was, what I built and how it turned out.',
		all: 'All projects',
		role: 'My role',
		result: 'Result',
		stack: 'Stack',
	},
	contact: {
		dialogTitle: 'Send me a message',
		close: 'Close',
		name: 'Name',
		email: 'Email',
		message: 'Message',
		send: 'Send message',
		sending: 'Sending…',
		sent: 'Message sent',
		reply: (email: string) => `I'll reply to ${email}.`,
		another: 'Send another message',
		live: 'Your message goes to my API and lands in my inbox.',
		notLive: "The form goes live with my API, the next thing I'm building. Until then, email me at",
		orEmail: 'Or email me at',
		tooMany: 'Too many messages from your network. Try again in a few minutes.',
		invalid: 'Some fields weren’t accepted. Check your email address and message.',
		serverError: 'My API couldn’t save the message. Try again in a moment.',
		unreachable: 'My API couldn’t be reached, so the message wasn’t sent. Try again in a moment.',
	},
	flow: {
		title: 'How this page reached you',
		hint: 'Select a step to see what it does.',
		nodes: {
			you: { name: 'You', place: 'Your browser' },
			cdn: { name: 'GitHub Pages', place: 'A CDN edge near you' },
			api: { name: 'API', place: 'A 2014 laptop working as a homelab' },
			db: { name: 'SQLite', place: 'One file on that laptop' },
		},
		offlineSr: '(not answering right now)',
		notMeasured: 'not measured',
		measuring: 'measuring',
		asking: 'asking',
		offline: 'offline',
		ok: 'ok',
		// Phones draw the steps in one column, so the API edge says where it starts.
		fromBrowser: 'from your browser',
		phases: {
			browser: 'Your browser getting ready',
			dns: 'Looking up the address',
			connect: 'Opening a connection',
			tls: 'Setting up encryption',
			server: 'Waiting for the server',
			download: 'Downloading the page',
		},
		measuringTitle: 'Measuring your visit',
		measuringText: 'Your browser is still timing this page.',
		noTimingTitle: "Your browser didn't share its timing",
		noTimingText:
			'Some browsers and privacy settings hide it. The page still came from GitHub Pages, as the next step shows.',
		cachedTitle: (ms: string) => `${ms}, straight from your browser`,
		cachedText:
			'Your browser had this page saved, so nothing crossed the network this time. Reload without the cache to see the full trip.',
		doneTitle: (ms: string, kb: string | null) =>
			`${ms} from your request to the last byte of ${kb ? `${kb} KB of HTML` : 'the HTML'}`,
		following: 'Following your request',
		replay: 'Replay the trip',
		slower: (times: number) => `The animation replays your real timings about ${times}× slower, so you can follow it.`,
		cdnTitle: 'GitHub Pages serves a file that was built in advance',
		cdnBuilt: 'GitHub Actions built this page',
		cdnFromCommit: 'from commit',
		cdnOn: 'on',
		cdnAfter: 'after the linter, the type checker and the tests passed. Nothing runs on a server when you ask for it.',
		cdnWhy:
			'The pages live on a CDN instead of my laptop on purpose: they stay up when the power or the internet goes out at home.',
		offlineBadge: 'Offline',
		apiTitle: 'An API on a 2014 laptop at my house',
		apiText:
			'A small FastAPI service runs on an ASUS X200MA with a Celeron and 2 GB of RAM, published with Tailscale Funnel so no ports are open on my home network. It receives the contact form, and your browser just asked it how it’s doing:',
		apiAnswered: (ms: string) => `Answered your browser in ${ms}`,
		laptopUp: (duration: string) => `Laptop up for ${duration}`,
		apiUp: (duration: string) => `API running for ${duration}`,
		load: (value: string) => `Load average ${value} on 2 cores`,
		memory: (used: string, total: string) => `${used} of ${total} MB of RAM in use`,
		apiAskingTitle: 'Asking the laptop',
		apiAskingText: 'Your browser is calling the API right now.',
		apiOfflineTitle: 'The laptop isn’t answering right now',
		apiOfflineText:
			'It may be off, or my home internet may be down. That’s why the pages live on a CDN: you’re reading them anyway. Until it’s back the contact form can’t send, but my email address still works.',
		apiNoneTitle: 'This build has no API',
		apiNoneText: 'It was built without an API address, so this step stays quiet.',
		apiWhy: 'Why a laptop',
		dbTitle: 'One SQLite file',
		// Around the words VACUUM INTO, which the page sets apart.
		dbBefore:
			'It stores contact messages and nothing else. No database server competing for 2 GB of RAM, and backups taken with',
		dbAfter: "because copying a live database file isn't safe.",
		dbChecked: (ms: string | null) =>
			ms ? `The health check your browser just made reached it in ${ms}.` : 'The health check your browser just made reached it.',
		dbUnavailable: 'The API is up, but it couldn’t reach the database just now.',
		dbUnknown: 'It sits behind the API, so its state shows once the API answers.',
	},
	about: {
		title: 'About this site',
		description:
			'How this site is built: Next.js pages on a CDN, a small API on a 2014 laptop, and the trade-offs behind each decision.',
		heading: 'The pages come from a CDN. The API comes from a 2014 laptop.',
		laptop: 'The laptop is an ASUS X200MA with a Celeron N2830, 2 GB of RAM and a 500 GB hard drive.',
		intro:
			'This site is a working example of how I think about software: start from the real constraints, choose the simplest thing that fits and be honest about what each choice costs. The pages went to a free host, because a laptop at home is a poor place for the part a recruiter opens first. The backend goes on the laptop, where its limits are worth showing.',
		tripTitle: 'How a request gets here',
		trip: [
			'Your browser asks GitHub Pages for the page, and its CDN sends back a file that was built in advance.',
			'The contact form talks to the API directly: Tailscale Funnel receives the request over HTTPS and forwards it to the laptop.',
			'On the laptop, FastAPI saves the message in SQLite, then asks n8n to email it to me.',
		],
		decisionsTitle: 'The decisions',
		pro: 'Pro',
		con: 'Con',
		decisions: [
			{
				title: 'Pages on a CDN, the API on a laptop',
				text: 'The pages are plain files on GitHub Pages. Only the small API runs on the laptop at home.',
				pro: 'The portfolio stays up when the power or the internet goes out at home. Only the API goes down with it.',
				con: 'Two places to operate instead of one, and the API has to accept requests from another origin.',
			},
			{
				title: 'Next.js, exported as static files',
				text: 'The first version used Astro. It was lighter, but it showed little React and looked too plain, so I rebuilt it with Next.js, React and Tailwind, exported ahead of time.',
				pro: 'React and TypeScript end to end, with no server to run. Moving to Vercel later means connecting the repository.',
				con: 'Every page ships the React runtime, and a static export gives up server features such as image optimization.',
			},
			{
				title: 'Spanish, written rather than machine-translated',
				text: 'Every page has a Spanish version under /es/, which I reviewed. The site notices your browser’s language and remembers your choice.',
				pro: 'It reads naturally, works in every browser, and search engines index it.',
				con: 'Every change to the content is written twice.',
			},
			{
				title: 'SQLite, not Postgres',
				text: 'The only data is contact messages, stored in a database file used by this site alone.',
				pro: 'No database server competing for 2 GB of RAM.',
				con: 'One writer at a time and a single machine. Backups need care, because copying a live file is not safe.',
			},
			{
				title: 'Tailscale Funnel, not open ports',
				text: 'Tailscale runs on the laptop and publishes the API on a ts.net address. It terminates HTTPS, so there is no reverse proxy to run.',
				pro: 'No open ports on my home network, no public IP and no domain needed, for free.',
				con: 'A ts.net address looks less polished than my own domain, and Funnel is still in beta. With a domain, the plan is Cloudflare Tunnel.',
			},
			{
				title: 'n8n sends the email, not the API',
				text: 'Each message is saved first. Then the API calls a webhook in n8n, which already runs on the laptop and emails me.',
				pro: 'No mail credentials in the API, and a message is never lost: if n8n is down, the API retries later.',
				con: 'The API has to reach one other service on the laptop, which is the only exception to keeping it isolated.',
			},
			{
				title: 'Build in CI, never on the server',
				text: 'GitHub Actions runs the linter, the type checker and the tests, then builds. Nothing is published unless they pass.',
				pro: 'A slow laptop never compiles anything, and what runs is what was tested.',
				con: 'Publishing depends on GitHub, which hosts the code, the CI and the pages.',
			},
			{
				title: 'What it costs',
				text: 'Nothing so far. A domain will be the first expense.',
				pro: 'The hardware already existed and the services used have free tiers.',
				con: 'I am the operations team, so every failure is mine to fix.',
			},
		] satisfies Decision[],
	},
	og: {
		subtitle: 'Software Engineer building real-time backends in Python and Node.js.',
		steps: ['You', 'CDN', 'API', 'SQLite'],
		alt: 'Juan Duque, Software Engineer building real-time backends in Python and Node.js',
	},
};

export type Dictionary = typeof en;

const es: Dictionary = {
	skip: 'Saltar al contenido',
	nav: {
		label: 'Principal',
		projects: 'Proyectos',
		about: 'Acerca de',
		contact: 'Contacto',
		resume: 'CV',
		language: 'Idioma',
	},
	footer: {
		built: 'Compilado con Next.js por GitHub Actions',
		fromCommit: 'a partir del commit',
		served: 'y servido por GitHub Pages.',
	},
	langHint: {
		text: 'Este sitio también está en español.',
		go: 'Ver en español',
		stay: 'Seguir en inglés',
	},
	home: {
		description:
			'Juan Duque es Software Engineer con enfoque backend en Colombia: construye sistemas en tiempo real con Python y Node.js. Abierto a roles remotos.',
		lead: 'Software Engineer que construye backends en tiempo real con Python y Node.js.',
		bio: (location: string) =>
			`Más de cuatro años en sistemas en producción: microservicios, APIs REST y pipelines asíncronos. Vivo en ${location}, trabajo en inglés con nivel C1 y estoy abierto a roles remotos.`,
		resume: 'Descargar CV en inglés (PDF)',
		emailMe: 'Escríbeme',
		newTab: '(se abre en una pestaña nueva)',
		experience: 'Experiencia',
		jobDates: (start: string, end: string, location: string) => `${start} a ${end}, ${location.toLowerCase()}`,
		work: 'Trabajo destacado',
		stack: 'Stack',
		contact: 'Contacto',
		contactLead: 'Estoy abierto a roles remotos, esté donde esté el equipo. Envíame un mensaje o escríbeme a',
		alsoOn: 'También me encuentras en',
		orDownload: 'o puedes',
		downloadResume: 'descargar mi CV',
	},
	projectCard: { read: 'Leer el caso de estudio' },
	projects: {
		title: 'Proyectos',
		description: 'Casos de estudio de Juan Duque: el problema, la solución, el stack, su rol y el resultado.',
		lead: 'Cuál era el problema, qué construí y cómo resultó.',
		all: 'Todos los proyectos',
		role: 'Mi rol',
		result: 'Resultado',
		stack: 'Stack',
	},
	contact: {
		dialogTitle: 'Envíame un mensaje',
		close: 'Cerrar',
		name: 'Nombre',
		email: 'Correo',
		message: 'Mensaje',
		send: 'Enviar mensaje',
		sending: 'Enviando…',
		sent: 'Mensaje enviado',
		reply: (email: string) => `Te responderé a ${email}.`,
		another: 'Enviar otro mensaje',
		live: 'Tu mensaje llega a mi API y de ahí a mi correo.',
		notLive: 'El formulario se activa con mi API, lo próximo que estoy construyendo. Mientras tanto, escríbeme a',
		orEmail: 'O escríbeme a',
		tooMany: 'Demasiados mensajes desde tu red. Intenta de nuevo en unos minutos.',
		invalid: 'Algunos campos no fueron aceptados. Revisa tu correo y tu mensaje.',
		serverError: 'Mi API no pudo guardar el mensaje. Intenta de nuevo en un momento.',
		unreachable: 'No se pudo contactar a mi API, así que el mensaje no se envió. Intenta de nuevo en un momento.',
	},
	flow: {
		title: 'Cómo te llegó esta página',
		hint: 'Elige un paso para ver qué hace.',
		nodes: {
			you: { name: 'Tú', place: 'Tu navegador' },
			cdn: { name: 'GitHub Pages', place: 'Un nodo de CDN cerca de ti' },
			api: { name: 'API', place: 'Un laptop de 2014 que uso como homelab' },
			db: { name: 'SQLite', place: 'Un archivo en ese laptop' },
		},
		offlineSr: '(no responde en este momento)',
		notMeasured: 'sin medir',
		measuring: 'midiendo',
		asking: 'consultando',
		offline: 'sin conexión',
		ok: 'ok',
		fromBrowser: 'desde tu navegador',
		phases: {
			browser: 'Tu navegador preparándose',
			dns: 'Buscando la dirección',
			connect: 'Abriendo una conexión',
			tls: 'Estableciendo el cifrado',
			server: 'Esperando al servidor',
			download: 'Descargando la página',
		},
		measuringTitle: 'Midiendo tu visita',
		measuringText: 'Tu navegador todavía está midiendo esta página.',
		noTimingTitle: 'Tu navegador no compartió sus tiempos',
		noTimingText:
			'Algunos navegadores y configuraciones de privacidad los ocultan. La página igual llegó desde GitHub Pages, como muestra el siguiente paso.',
		cachedTitle: (ms: string) => `${ms}, directo desde tu navegador`,
		cachedText:
			'Tu navegador tenía esta página guardada, así que esta vez nada viajó por la red. Recarga sin caché para ver el recorrido completo.',
		doneTitle: (ms: string, kb: string | null) =>
			`${ms} desde tu solicitud hasta el último byte de ${kb ? `${kb} KB de HTML` : 'el HTML'}`,
		following: 'Siguiendo tu solicitud',
		replay: 'Repetir el recorrido',
		slower: (times: number) =>
			`La animación repite tus tiempos reales unas ${times} veces más lento, para que puedas seguirla.`,
		cdnTitle: 'GitHub Pages sirve un archivo construido de antemano',
		cdnBuilt: 'GitHub Actions construyó esta página',
		cdnFromCommit: 'a partir del commit',
		cdnOn: 'el',
		cdnAfter:
			'después de que pasaran el linter, el chequeo de tipos y los tests. Nada se ejecuta en un servidor cuando la pides.',
		cdnWhy:
			'Las páginas viven en una CDN y no en mi laptop a propósito: siguen en línea aunque en mi casa se vaya la luz o el internet.',
		offlineBadge: 'Sin conexión',
		apiTitle: 'Una API en un laptop de 2014 en mi casa',
		apiText:
			'Un pequeño servicio FastAPI corre en un ASUS X200MA con un Celeron y 2 GB de RAM, publicado con Tailscale Funnel para no abrir puertos en mi red de casa. Recibe el formulario de contacto, y tu navegador acaba de preguntarle cómo está:',
		apiAnswered: (ms: string) => `Le respondió a tu navegador en ${ms}`,
		laptopUp: (duration: string) => `Laptop encendido hace ${duration}`,
		apiUp: (duration: string) => `API corriendo hace ${duration}`,
		load: (value: string) => `Carga promedio de ${value} en 2 núcleos`,
		memory: (used: string, total: string) => `${used} de ${total} MB de RAM en uso`,
		apiAskingTitle: 'Consultando al laptop',
		apiAskingText: 'Tu navegador está llamando a la API en este momento.',
		apiOfflineTitle: 'El laptop no responde en este momento',
		apiOfflineText:
			'Puede estar apagado, o puede que se haya caído el internet de mi casa. Por eso las páginas viven en una CDN: igual las estás leyendo. Mientras vuelve, el formulario de contacto no puede enviar, pero mi correo sigue funcionando.',
		apiNoneTitle: 'Esta versión no tiene API',
		apiNoneText: 'Se compiló sin la dirección de la API, así que este paso no muestra datos.',
		apiWhy: 'Por qué un laptop',
		dbTitle: 'Un archivo SQLite',
		dbBefore:
			'Guarda los mensajes de contacto y nada más. Sin un servidor de base de datos compitiendo por 2 GB de RAM, y con backups hechos con',
		dbAfter: 'porque copiar el archivo de una base de datos en uso no es seguro.',
		dbChecked: (ms: string | null) =>
			ms
				? `La revisión de estado que acaba de hacer tu navegador llegó hasta él en ${ms}.`
				: 'La revisión de estado que acaba de hacer tu navegador llegó hasta él.',
		dbUnavailable: 'La API responde, pero en este momento no pudo llegar a la base de datos.',
		dbUnknown: 'Está detrás de la API, así que su estado aparece cuando la API responde.',
	},
	about: {
		title: 'Sobre este sitio',
		description:
			'Cómo está hecho este sitio: páginas de Next.js en una CDN, una pequeña API en un laptop de 2014 y los pros y contras de cada decisión.',
		heading: 'Las páginas vienen de una CDN. La API viene de un laptop de 2014.',
		laptop: 'El laptop es un ASUS X200MA con un Celeron N2830, 2 GB de RAM y un disco duro de 500 GB.',
		intro:
			'Este sitio es un ejemplo práctico de cómo pienso el software: partir de las restricciones reales, elegir lo más simple que funcione y ser honesto sobre lo que cuesta cada decisión. Las páginas fueron a un hosting gratuito, porque un laptop en casa es un mal lugar para lo primero que abre un reclutador. El backend va en el laptop, donde vale la pena mostrar sus límites.',
		tripTitle: 'Cómo llega una solicitud hasta aquí',
		trip: [
			'Tu navegador le pide la página a GitHub Pages, y su CDN te devuelve un archivo construido de antemano.',
			'El formulario de contacto habla directo con la API: Tailscale Funnel recibe la solicitud por HTTPS y la reenvía al laptop.',
			'En el laptop, FastAPI guarda el mensaje en SQLite y luego le pide a n8n que me lo envíe por correo.',
		],
		decisionsTitle: 'Las decisiones',
		pro: 'A favor',
		con: 'En contra',
		decisions: [
			{
				title: 'Páginas en una CDN, la API en un laptop',
				text: 'Las páginas son archivos simples en GitHub Pages. Solo la pequeña API corre en el laptop de mi casa.',
				pro: 'El portafolio sigue en línea aunque en mi casa se vaya la luz o el internet. Solo la API se cae con ellos.',
				con: 'Son dos lugares que operar en vez de uno, y la API tiene que aceptar solicitudes de otro origen.',
			},
			{
				title: 'Next.js, exportado como archivos estáticos',
				text: 'La primera versión usaba Astro. Era más liviana, pero mostraba poco React y se veía demasiado sobria, así que la reconstruí con Next.js, React y Tailwind, exportada de antemano.',
				pro: 'React y TypeScript de punta a punta, sin servidor que mantener. Pasar a Vercel más adelante es solo conectar el repositorio.',
				con: 'Cada página carga el runtime de React, y la exportación estática renuncia a funciones de servidor como la optimización de imágenes.',
			},
			{
				title: 'Español escrito, no traducido por máquina',
				text: 'Cada página tiene su versión en español en /es/, revisada por mí. El sitio detecta el idioma de tu navegador y recuerda tu elección.',
				pro: 'Se lee natural, funciona en cualquier navegador y los buscadores la indexan.',
				con: 'Cada cambio de contenido se escribe dos veces.',
			},
			{
				title: 'SQLite, no Postgres',
				text: 'Los únicos datos son los mensajes de contacto, guardados en un archivo de base de datos que solo usa este sitio.',
				pro: 'Ningún servidor de base de datos compitiendo por 2 GB de RAM.',
				con: 'Un solo escritor a la vez y una sola máquina. Los backups requieren cuidado, porque copiar un archivo en uso no es seguro.',
			},
			{
				title: 'Tailscale Funnel, no puertos abiertos',
				text: 'Tailscale corre en el laptop y publica la API en una dirección ts.net. Se encarga del HTTPS, así que no hay un proxy inverso que mantener.',
				pro: 'Sin puertos abiertos en mi red de casa, sin IP pública y sin necesidad de dominio, gratis.',
				con: 'Una dirección ts.net se ve menos pulida que un dominio propio, y Funnel todavía está en beta. Con dominio, el plan es Cloudflare Tunnel.',
			},
			{
				title: 'n8n envía el correo, no la API',
				text: 'Cada mensaje se guarda primero. Luego la API llama a un webhook de n8n, que ya corre en el laptop y me envía el correo.',
				pro: 'Sin credenciales de correo en la API, y ningún mensaje se pierde: si n8n está caído, la API reintenta después.',
				con: 'La API tiene que llegar a otro servicio del laptop, la única excepción a mantenerla aislada.',
			},
			{
				title: 'Compilar en CI, nunca en el servidor',
				text: 'GitHub Actions corre el linter, el chequeo de tipos y los tests, y luego compila. No se publica nada si no pasan.',
				pro: 'Un laptop lento nunca compila nada, y lo que corre es lo que se probó.',
				con: 'Publicar depende de GitHub, que aloja el código, el CI y las páginas.',
			},
			{
				title: 'Lo que cuesta',
				text: 'Nada hasta ahora. Un dominio será el primer gasto.',
				pro: 'El hardware ya existía y los servicios que uso tienen planes gratuitos.',
				con: 'Yo soy el equipo de operaciones, así que cada falla me toca arreglarla a mí.',
			},
		],
	},
	og: {
		subtitle: 'Software Engineer que construye backends en tiempo real con Python y Node.js.',
		steps: ['Tú', 'CDN', 'API', 'SQLite'],
		alt: 'Juan Duque, Software Engineer que construye backends en tiempo real con Python y Node.js',
	},
};

// The language hint is written in the language it offers, so en.langHint is shown on
// Spanish pages and es.langHint on English ones.
export const dictionaries: Record<Lang, Dictionary> = { en, es };
