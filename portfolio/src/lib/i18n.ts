export type Locale = 'es' | 'en';
export type L = Record<Locale, string>;

export const locales: Locale[] = ['es', 'en'];

export const t = (value: L, lang: Locale): string => value[lang];

/** UI strings; later tasks extend this map. */
export const ui: Record<string, L> = {
	title: { es: 'Cristhian Agamez | Portafolio', en: 'Cristhian Agamez | Portfolio' },
	recruiter: { es: 'Modo reclutador', en: 'Recruiter mode' },
	recruiterTitle: { es: 'Cristhian Agamez | Modo reclutador', en: 'Cristhian Agamez | Recruiter mode' },
	switchLang: { es: 'English', en: 'Español' },
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
