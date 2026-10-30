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
	}
};
