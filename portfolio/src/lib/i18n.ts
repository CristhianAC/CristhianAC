export type Locale = 'es' | 'en';
export type L = Record<Locale, string>;

export const locales: Locale[] = ['es', 'en'];

export const t = (value: L, lang: Locale): string => value[lang];

/** UI strings; later tasks extend this map. */
export const ui: Record<string, L> = {
	title: { es: 'Cristhian Agamez | Portafolio', en: 'Cristhian Agamez | Portfolio' },
	description: {
		es: 'Portafolio de Cristhian Agamez, desarrollador de software, presentado como un quiz show con anécdotas reales de su carrera.',
		en: "Portfolio of Cristhian Agamez, software developer, presented as a quiz show with real stories from his career."
	},
	navLabel: { es: 'Navegación principal', en: 'Main navigation' },
	recruiter: { es: 'Modo reclutador', en: 'Recruiter mode' },
	recruiterTitle: { es: 'Cristhian Agamez | Modo reclutador', en: 'Cristhian Agamez | Recruiter mode' },
	switchLang: { es: 'English', en: 'Español' },
	soundOn: { es: 'Sonido: activado', en: 'Sound: on' },
	soundOff: { es: 'Sonido: desactivado', en: 'Sound: off' },
	present: { es: 'presente', en: 'present' },
	experience: { es: 'Experiencia', en: 'Experience' },
	projects: { es: 'Proyectos', en: 'Projects' },
	education: { es: 'Educación', en: 'Education' },
	teaching: { es: 'Docencia', en: 'Teaching' },
	certificates: { es: 'Certificados', en: 'Certificates' },
	skills: { es: 'Habilidades', en: 'Skills' },
	awards: { es: 'Reconocimientos', en: 'Awards' },
	contact: { es: 'Contacto', en: 'Contact' },
	downloadCv: { es: 'Descargar CV (PDF)', en: 'Download CV (PDF)' },
	backToShow: { es: 'Volver al show', en: 'Back to the show' },
	statFirstCode: { es: 'años tenía en su primer juego (Unity + C#)', en: 'years old at his first game (Unity + C#)' },
	statCompanies: { es: 'empresas fundadas o cofundadas', en: 'companies founded or co-founded' },
	statCountries: { es: 'países: Colombia y España', en: 'countries: Colombia and Spain' },
	statStack: { es: 'tecnologías en el stack', en: 'technologies in the stack' },
	contactCta: { es: '¿Hablamos?', en: "Let's talk?" },
	pipeline: { es: 'Pipeline de despliegue', en: 'Deployment pipeline' },
	commits: { es: 'commits', en: 'commits' },
	production: { es: 'producción', en: 'production' },
	hostWelcome: {
		es: 'Bienvenidos a EN VIVO DESDE PRODUCCIÓN. El set todavía está compilando.',
		en: 'Welcome to LIVE FROM PRODUCTION. The set is still compiling.'
	},
	true: { es: 'Verdadero', en: 'True' },
	false: { es: 'Falso', en: 'False' },
	confirm: { es: 'Confirmar', en: 'Confirm' },
	moveUp: { es: 'Subir', en: 'Move up' },
	moveDown: { es: 'Bajar', en: 'Move down' },
	pickRight: { es: 'Elige su pareja', en: 'Pick its match' },
	lifelineDuck: { es: 'Patito de goma', en: 'Rubber duck' },
	lifelineReadme: { es: 'Leer el README', en: 'Read the README' },
	lifelineBlame: { es: 'git blame', en: 'git blame' },
	showTitle: { es: 'EN VIVO DESDE PRODUCCIÓN', en: 'LIVE FROM PRODUCTION' },
	showTagline: {
		es: 'Un quiz show sobre cómo un niño de 11 años terminó desplegando a producción.',
		en: 'A quiz show about how an 11-year-old ended up deploying to production.'
	},
	start: { es: 'Empezar', en: 'Start' },
	continue: { es: 'Seguir', en: 'Continue' },
	question: { es: 'Pregunta', en: 'Question' },
	lifelines: { es: 'Comodines', en: 'Lifelines' },
	compiled: { es: '¡Compilado!', en: 'Compiled!' },
	unlocked: { es: 'Desbloqueado en el set', en: 'Unlocked on set' },
	buildFailed: { es: 'Build fallido. El show sigue.', en: 'Build failed. The show goes on.' },
	hostRight: { es: '¡Eso es! Otra pieza del set compila.', en: "That's it! Another piece of the set compiles." },
	hostWrong: { es: 'Casi. Pero eso me recuerda una historia…', en: 'Close. But that reminds me of a story…' },
	hostChapter: { es: 'Siguiente capítulo.', en: 'Next chapter.' },
	blameReveal: {
		es: 'git blame: esas dos opciones fueron culpa de otro.',
		en: 'git blame: those two options were someone else’s fault.'
	},
	system: {
		es: 'Deploy completado. El set está en producción y el host espera tu mensaje.',
		en: 'Deploy complete. The set is live in production and the host is waiting for your message.'
	},
	playAgain: { es: 'Jugar de nuevo', en: 'Play again' }
};

/** What the host says while a question is on the panel (the question itself is only on the panel). */
export const presenterLines: L[] = [
	{ es: 'Pregunta {n}. Sin presión… bueno, un poco.', en: 'Question {n}. No pressure… well, a little.' },
	{ es: 'Atentos, que esta compila.', en: 'Eyes up, this one compiles.' },
	{ es: '¿Lo sabes o le preguntamos al patito?', en: 'Do you know it, or ask the duck?' },
	{ es: 'Vamos con la {n}.', en: 'On to number {n}.' },
	{ es: 'Sin Stack Overflow para esta.', en: 'No Stack Overflow for this one.' },
	{ es: 'Piénsalo bien. El deploy no espera.', en: "Think it through. The deploy won't wait." },
	{ es: 'Cámara uno, pregunta en pantalla.', en: 'Camera one, question on screen.' }
];

/** Line for the 0-based question index: cycles in order, so consecutive questions never repeat. */
export const presenterLine = (index: number, lang: Locale): string =>
	t(presenterLines[index % presenterLines.length], lang).replace('{n}', String(index + 1));
