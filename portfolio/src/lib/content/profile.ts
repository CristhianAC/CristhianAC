import type { Profile } from './types';

export const profile: Profile = {
	name: 'Cristhian Agamez',
	headline: {
		es: 'Arquitecto de software y fundador de UnderCodes',
		en: 'Software architect and founder of UnderCodes'
	},
	location: 'Barranquilla, Colombia',
	links: {
		linkedin: 'https://www.linkedin.com/in/cristhianac',
		github: 'https://github.com/CristhianAC',
		undercodes: 'https://undercodes.net'
	},
	experience: [
		{
			id: 'my-little-venture',
			title: { es: 'CTO y cofundador', en: 'CTO & co-founder' },
			org: 'My Little Venture',
			period: '2025-12 –',
			summary: {
				es: 'Educación financiera para niños en EE. UU. (Next.js, Strapi, AWS Lambda, DynamoDB), con cumplimiento de COPPA.',
				en: 'Financial education for kids in the US (Next.js, Strapi, AWS Lambda, DynamoDB), COPPA-compliant.'
			}
		},
		{
			id: 'hiberus',
			title: {
				es: 'Desarrollador Full Stack para Banco Santander',
				en: 'Full Stack developer for Banco Santander'
			},
			org: 'hiberus',
			period: '2026-02 – 2026-08',
			summary: { es: 'Java, Angular y React.', en: 'Java, Angular and React.' }
		},
		{
			id: 'undercodes',
			title: { es: 'CEO y fundador', en: 'CEO & founder' },
			org: 'UnderCodes S.A.S.',
			period: '2024-02 –',
			summary: {
				es: 'Constituida el 18/02/2024 y registrada en la Cámara de Comercio de Barranquilla el 26/02/2024. Partner oficial de Odoo, expandida a España.',
				en: 'Incorporated on 18/02/2024 and registered at the Barranquilla Chamber of Commerce on 26/02/2024. Official Odoo Partner, expanded to Spain.'
			}
		},
		{
			id: 'olympus-analytics',
			title: { es: 'CTO y cofundador', en: 'CTO & co-founder' },
			org: 'Olympus Analytics',
			period: '2024-01 –',
			summary: {
				es: 'Artemisa: control de biodiversidad y especies.',
				en: 'Artemisa: biodiversity and species control.'
			}
		},
		{
			id: 'innova',
			title: {
				es: 'Director creativo y luego presidente',
				en: 'Creative director, then president'
			},
			org: 'InNova, Universidad del Norte',
			period: '2022 – 2024',
			summary: {
				es: 'Director creativo 2022–23 y presidente 2023–24 del grupo estudiantil.',
				en: 'Creative director 2022–23 and president 2023–24 of the student group.'
			}
		},
		{
			id: 'digiprice',
			title: { es: 'Diseñador gráfico senior', en: 'Senior Graphic Designer' },
			org: 'DIGIPRICE',
			period: '2021-01 – 2021-04',
			summary: { es: 'Diseño gráfico.', en: 'Graphic design.' }
		},
		{
			id: 'marat-studio',
			title: { es: 'Fundador', en: 'Founder' },
			org: 'Marat Studio',
			period: '—',
			summary: {
				es: 'Fundada a los 16 años: diseño y sitios web en PHP/WordPress.',
				en: 'Founded at 16: design and PHP/WordPress websites.'
			}
		}
	],
	education: [
		{
			id: 'uninorte',
			title: { es: 'Ingeniería de Sistemas', en: 'Systems Engineering' },
			org: 'Universidad del Norte',
			period: '2021 – 2026',
			summary: {
				es: 'Incluye un intercambio en la Universidad de Cantabria (España).',
				en: 'Includes an exchange at Universidad de Cantabria (Spain).'
			}
		},
		{
			id: 'codetec',
			title: { es: 'Tecnólogo en diseño', en: 'Design technologist' },
			org: 'Codetec',
			period: '2019 – 2020',
			summary: { es: 'Tecnólogo en diseño.', en: 'Design technologist degree.' }
		}
	],
	teaching: [
		{
			id: 'peer-tutor',
			title: { es: 'Tutor par', en: 'Peer tutor' },
			org: 'Universidad del Norte',
			period: '2023',
			summary: { es: 'Tutoría entre pares.', en: 'Peer tutoring.' }
		},
		{
			id: 'pedagogy-diploma',
			title: { es: 'Diplomado en Pedagogía', en: 'Diploma in Pedagogy' },
			org: 'Universidad del Norte',
			period: '2023 – 2024',
			summary: { es: 'Diplomado en Pedagogía.', en: 'Diploma in Pedagogy.' }
		},
		{
			id: 'sergio-arboleda',
			title: {
				es: 'Consultor técnico del currículo "Digital Business"',
				en: 'Technical consultant for the "Digital Business" curriculum'
			},
			org: 'Universidad Sergio Arboleda',
			period: '2025',
			summary: {
				es: 'Consultoría técnica para el currículo "Digital Business".',
				en: 'Technical consulting for the "Digital Business" curriculum.'
			}
		}
	],
	certificates: [
		'Python & Django REST API',
		'Flutter UI',
		'Logo design (Domestika)',
		'Xamarin',
		'Angular',
		'Blender',
		'Premiere'
	],
	skills: [
		'Java',
		'Angular',
		'React',
		'TypeScript',
		'Svelte / SvelteKit',
		'Next.js',
		'Strapi',
		'AWS Lambda',
		'DynamoDB',
		'FastAPI',
		'Python',
		'Django',
		'C#',
		'Unity',
		'Kotlin Multiplatform',
		'Odoo',
		'Docker',
		'PostgreSQL',
		'Figma'
	],
	awards: [
		{
			es: 'Ganador del primer torneo de debate de la Universidad del Norte (2025)',
			en: "Winner of Universidad del Norte's first debate tournament (2025)"
		}
	]
};
