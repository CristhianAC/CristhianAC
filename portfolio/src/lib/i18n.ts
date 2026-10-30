export type Locale = 'es' | 'en';
export type L = Record<Locale, string>;

export const locales: Locale[] = ['es', 'en'];

export const t = (value: L, lang: Locale): string => value[lang];

/** UI strings; later tasks extend this map. */
export const ui: Record<string, L> = {
	title: { es: 'Cristhian Agamez | Portafolio', en: 'Cristhian Agamez | Portfolio' }
};
