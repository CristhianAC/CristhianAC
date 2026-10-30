import type { Project } from './types';

const open = { es: 'Abrir', en: 'Open' };

export const projects: Project[] = [
	{
		id: 'procto',
		name: 'Procto (CheatingAI)',
		summary: {
			es: 'Tesis: proctoring de exámenes en línea con visión por computador (MediaPipe, DeepFace/Facenet), evidencia con marca de tiempo y puntaje de riesgo de 0 a 100, más detección de plagio de código (Winnowing, Redis/Celery). Con Mateo Guerrero Escobar; tutor Daniel José Romero Martínez.',
			en: 'Thesis: online exam proctoring with computer vision (MediaPipe, DeepFace/Facenet), timestamped evidence and a 0–100 risk score, plus code-plagiarism detection (Winnowing, Redis/Celery). With Mateo Guerrero Escobar; tutor Daniel José Romero Martínez.'
		},
		stack: ['FastAPI', 'SvelteKit 5', 'Docker Compose', 'Supabase', 'MediaPipe', 'Redis', 'Celery'],
		links: [{ label: { es: 'Código', en: 'Code' }, href: 'https://github.com/CristhianAC/CheatingAI' }]
	},
	{
		id: 'ngx-gaia-gis',
		name: 'ngx-gaia-gis',
		summary: {
			es: 'Librería Angular 20 para mapas con OpenLayers (rasters GeoTIFF, puntos, dibujo de polígonos), publicada en npm.',
			en: 'Angular 20 library for OpenLayers maps (GeoTIFF rasters, points, polygon drawing), published on npm.'
		},
		stack: ['Angular 20', 'OpenLayers', 'GeoTIFF'],
		links: [
			{ label: { es: 'Código', en: 'Code' }, href: 'https://github.com/Olympus-Analytics/ngx-gaia-gis' }
		]
	},
	{
		id: 'undercodes-web',
		name: 'UnderCodes',
		summary: {
			es: 'Sitio web de UnderCodes (repositorio privado).',
			en: 'UnderCodes website (private repository).'
		},
		stack: [],
		links: [{ label: open, href: 'https://undercodes.net' }]
	},
	{
		id: 'mlv-web',
		name: 'My Little Venture',
		summary: {
			es: 'Sitio web de My Little Venture, educación financiera para niños en EE. UU.',
			en: 'My Little Venture website, financial education for kids in the US.'
		},
		stack: ['Next.js', 'Strapi', 'AWS Lambda', 'DynamoDB'],
		links: [{ label: open, href: 'https://mylittleventure.com/' }]
	},
	{
		id: 'artemisa',
		name: 'Artemisa',
		summary: {
			es: 'Servicio de Olympus Analytics para el control de biodiversidad y especies.',
			en: 'Olympus Analytics service for biodiversity and species control.'
		},
		stack: [],
		links: [{ label: open, href: 'https://artemisa.olympus-analytics.dev/' }]
	},
	{
		id: 'github-repos',
		name: 'GitHub',
		summary: {
			es: 'Repos seleccionados: NeoReg (microservicios + RAG), KmpMovies (Kotlin Multiplatform), shadow-protocol (juego de equipo en UE5) y nvim-cristhianac.',
			en: 'Selected repos: NeoReg (microservices + RAG), KmpMovies (Kotlin Multiplatform), shadow-protocol (UE5 team game) and nvim-cristhianac.'
		},
		stack: ['Kotlin Multiplatform', 'Unreal Engine 5', 'Neovim'],
		links: [{ label: open, href: 'https://github.com/CristhianAC' }]
	}
];
