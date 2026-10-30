import type { Round } from './types';

export const rounds: Round[] = [
	{
		code: 'CAP-01',
		era: 'cap01',
		age: { es: '11 años', en: 'Age 11' },
		title: { es: 'Unity', en: 'Unity' },
		questions: [
			{
				id: 'p1',
				kind: 'choice',
				prompt: {
					es: '¿Con qué hizo Cristhian sus primeros juegos a los 11 años?',
					en: 'What did Cristhian use to make his first games at 11?'
				},
				options: [
					{ es: 'Scratch', en: 'Scratch' },
					{ es: 'Unity + C#', en: 'Unity + C#' },
					{ es: 'RPG Maker', en: 'RPG Maker' },
					{ es: 'Roblox Studio', en: 'Roblox Studio' }
				],
				answer: 1,
				anecdote: {
					es: 'A los 11 no tenía tutor ni bootcamp: tenía unos cursos de Unity y C# que le compró su mamá. El primero fue un juego tipo Mario Bros, muy básico. Saltaba. A veces.',
					en: "At 11 he had no tutor and no bootcamp: he had some Unity and C# courses his mom bought him. The first one was a very basic Mario Bros-style game. It jumped. Sometimes."
				},
				duckHint: {
					es: 'Piensa en un motor de juegos con un lenguaje que empieza con C.',
					en: 'Think of a game engine paired with a language that starts with C.'
				},
				readme: {
					es: 'El motor y el lenguaje de los cursos que le compró su mamá.',
					en: 'The engine and language from the courses his mom bought him.'
				},
				unlocks: []
			},
			{
				id: 'p2',
				kind: 'truefalse',
				statement: {
					es: 'Aprendió a programar en la universidad.',
					en: 'He learned to code at university.'
				},
				answer: false,
				anecdote: {
					es: 'Cuando entró a Ingeniería de Sistemas en Uninorte (2021) ya llevaba casi 7 años programando.',
					en: 'By the time he started Systems Engineering at Uninorte (2021) he had been coding for almost 7 years.'
				},
				duckHint: {
					es: 'Recuerda la edad de esta ronda: mucho antes de 2021.',
					en: 'Remember the age of this round: long before 2021.'
				},
				readme: {
					es: 'Ya programaba desde los 11, años antes de entrar a la universidad.',
					en: 'He had been coding since 11, years before university.'
				},
				unlocks: ['uninorte']
			}
		]
	},
	{
		code: 'CAP-02',
		era: 'cap02',
		age: { es: '13 años', en: 'Age 13' },
		title: { es: 'La web', en: 'The web' },
		questions: [
			{
				id: 'p3',
				kind: 'choice',
				prompt: {
					es: '¿Para quién fueron sus primeros sitios web?',
					en: 'Who were his first websites for?'
				},
				options: [
					{ es: 'Clientes de Fiverr', en: 'Fiverr clients' },
					{ es: 'Negocios de la familia', en: 'Family businesses' },
					{ es: 'Su colegio', en: 'His school' },
					{ es: 'Un foro de gaming', en: 'A gaming forum' }
				],
				answer: 1,
				anecdote: {
					es: 'Su primera clienta fue su tía, que es modista. Le hizo una web. Una web chapuza, pero web al fin.',
					en: 'His first client was his aunt, a seamstress. He built her a website. A sloppy website, but a website nonetheless.'
				},
				duckHint: {
					es: 'Los primeros clientes suelen estar en casa.',
					en: 'First clients are usually close to home.'
				},
				readme: {
					es: 'Su primera clienta fue su tía, la modista.',
					en: 'His first client was his aunt, the seamstress.'
				},
				unlocks: []
			},
			{
				id: 'p4',
				kind: 'spot',
				prompt: {
					es: 'Encuentra la peor práctica en este código de 2016.',
					en: 'Find the worst practice in this 2016 code.'
				},
				lines: [
					'<center><font size="7" color="red">Bienvenidos</font></center>',
					'<table width="100%"><tr><td style="color:red !important">Menu</td></tr></table>',
					'<div style="float:left; margin-left:13px !important">Inicio</div>',
					'<p style="font-family:Comic Sans MS !important">Mi tienda</p>',
					'<img src="foto.bmp" width="900" height="600" style="border:0 !important">'
				],
				anecdote: {
					es: 'No eran bugs: eran webs con un CSS malísimo y todas las malas prácticas del libro. Hoy es arquitecto de software. Algo aprendió.',
					en: "They weren't bugs: they were websites with terrible CSS and every bad practice in the book. Today he's a software architect. He learned something."
				},
				duckHint: {
					es: 'Cualquier línea sirve: todas rompen alguna buena práctica.',
					en: 'Any line works: they all break some best practice.'
				},
				readme: {
					es: 'No hay respuesta incorrecta; el código entero es una mala práctica.',
					en: 'There is no wrong answer; the whole snippet is bad practice.'
				},
				unlocks: []
			}
		]
	},
	{
		code: 'CAP-03',
		era: 'cap03',
		age: { es: '16 años', en: 'Age 16' },
		title: { es: 'Marat Studio', en: 'Marat Studio' },
		questions: [
			{
				id: 'p5',
				kind: 'choice',
				prompt: { es: '¿Qué fundó a los 16?', en: 'What did he found at 16?' },
				options: [
					{ es: 'Un canal de YouTube', en: 'A YouTube channel' },
					{ es: 'Marat Studio', en: 'Marat Studio' },
					{ es: 'Una startup de apps', en: 'An app startup' },
					{ es: 'Un clan de esports', en: 'An esports clan' }
				],
				answer: 1,
				anecdote: {
					es: 'Marat Studio hacía diseño y webs en PHP/WordPress. El nombre viene de Jean-Paul Marat, el revolucionario francés. A los 16 uno nombra empresas así.',
					en: 'Marat Studio did design and PHP/WordPress websites. The name comes from Jean-Paul Marat, the French revolutionary. At 16 that is how you name companies.'
				},
				duckHint: {
					es: 'Una empresa de diseño y webs que lleva el nombre de un revolucionario francés.',
					en: 'A design and web company named after a French revolutionary.'
				},
				readme: {
					es: 'Era un estudio de diseño y webs en PHP/WordPress.',
					en: 'It was a design and PHP/WordPress web studio.'
				},
				unlocks: ['marat-studio']
			},
			{
				id: 'p6',
				kind: 'order',
				prompt: {
					es: 'Ordena la línea de tiempo.',
					en: 'Put the timeline in order.'
				},
				items: [
					{ es: 'Codetec, tecnólogo en diseño (2019–2020)', en: 'Codetec, design technologist (2019–2020)' },
					{
						es: 'Senior Graphic Designer en DIGIPRICE (ene–abr 2021)',
						en: 'Senior Graphic Designer at DIGIPRICE (Jan–Apr 2021)'
					},
					{ es: 'Entra a Uninorte (2021)', en: 'Starts at Uninorte (2021)' }
				],
				anecdote: {
					es: 'Antes de ser arquitecto de software fue diseñador gráfico. Por eso los portafolios feos le duelen.',
					en: 'Before becoming a software architect he was a graphic designer. That is why ugly portfolios hurt him.'
				},
				duckHint: {
					es: 'Primero estudió, luego trabajó, luego entró a la universidad.',
					en: 'First he studied, then he worked, then he started university.'
				},
				readme: {
					es: 'Las fechas están en cada opción: de 2019 a 2021.',
					en: 'The dates are in each option: from 2019 to 2021.'
				},
				unlocks: ['codetec', 'digiprice']
			}
		]
	},
	{
		code: 'CAP-04',
		era: 'cap04',
		age: { es: '20 años', en: 'Age 20' },
		title: { es: 'UnderCodes', en: 'UnderCodes' },
		questions: [
			{
				id: 'p7',
				kind: 'choice',
				prompt: {
					es: '¿Cuándo se constituyó UnderCodes S.A.S.?',
					en: 'When was UnderCodes S.A.S. incorporated?'
				},
				options: [
					{ es: '2022', en: '2022' },
					{ es: '2023', en: '2023' },
					{ es: '18/02/2024', en: '18/02/2024' },
					{ es: '2025', en: '2025' }
				],
				answer: 2,
				anecdote: {
					es: 'Se constituyó el 18 de febrero de 2024 y se registró en la Cámara de Comercio de Barranquilla el 26. Tenía 20 años.',
					en: 'It was incorporated on 18 February 2024 and registered at the Barranquilla Chamber of Commerce on the 26th. He was 20.'
				},
				duckHint: {
					es: 'Cristhian tenía 20 años; nació en diciembre de 2003.',
					en: 'Cristhian was 20; he was born in December 2003.'
				},
				readme: {
					es: 'Febrero de 2024, cuando tenía 20 años.',
					en: 'February 2024, when he was 20.'
				},
				unlocks: ['undercodes', 'undercodes-web', 'peer-tutor', 'pedagogy-diploma', 'sergio-arboleda']
			},
			{
				id: 'p8',
				kind: 'match',
				prompt: {
					es: 'Une cada empresa con lo que hace.',
					en: 'Match each company with what it does.'
				},
				pairs: [
					{
						left: { es: 'UnderCodes', en: 'UnderCodes' },
						right: { es: 'Odoo Partner + software a medida', en: 'Odoo Partner + custom software' }
					},
					{
						left: { es: 'Olympus Analytics', en: 'Olympus Analytics' },
						right: {
							es: 'Artemisa, control de biodiversidad y especies',
							en: 'Artemisa, biodiversity and species control'
						}
					},
					{
						left: { es: 'InNova Uninorte', en: 'InNova Uninorte' },
						right: {
							es: 'Grupo estudiantil (director creativo y luego presidente)',
							en: 'Student group (creative director, then president)'
						}
					}
				],
				anecdote: {
					es: 'En 2024 era CEO de una empresa, CTO de otra, presidente de InNova y tutor, todo mientras estudiaba. ¿Cómo? Un calendario con bloques al minuto, y comer mientras estudiaba o trabajaba. Tiempo libre: no encontrado (404).',
					en: 'In 2024 he was CEO of one company, CTO of another, president of InNova and a tutor, all while studying. How? A calendar planned to the minute, and eating while studying or working. Free time: not found (404).'
				},
				duckHint: {
					es: 'Artemisa vigila la biodiversidad; InNova es un grupo de estudiantes.',
					en: 'Artemisa watches biodiversity; InNova is a student group.'
				},
				readme: {
					es: 'Una es Partner de Odoo, otra cuida especies y la tercera es un grupo estudiantil.',
					en: 'One is an Odoo Partner, one protects species and the third is a student group.'
				},
				unlocks: ['olympus-analytics', 'innova', 'ngx-gaia-gis', 'artemisa']
			}
		]
	},
	{
		code: 'CAP-05',
		era: 'cap05',
		age: { es: '21 años', en: 'Age 21' },
		title: { es: 'España', en: 'Spain' },
		questions: [
			{
				id: 'p9',
				kind: 'choice',
				prompt: {
					es: '¿En qué universidad hizo el intercambio?',
					en: 'At which university did he do his exchange?'
				},
				options: [
					{ es: 'Complutense', en: 'Complutense' },
					{ es: 'Universidad de Cantabria', en: 'Universidad de Cantabria' },
					{ es: 'Politécnica de Valencia', en: 'Politécnica de Valencia' },
					{ es: 'Universidad de Sevilla', en: 'Universidad de Sevilla' }
				],
				answer: 1,
				anecdote: {
					es: 'Se fue a Santander con sus mejores amigos y un socio, y de paso llevó UnderCodes a España. Su mayor choque cultural: entrar a una tienda y que nadie le preguntara cómo estaba.',
					en: "He went to Santander with his best friends and a partner, and took UnderCodes to Spain along the way. His biggest culture shock: walking into a shop and nobody asking how he was."
				},
				duckHint: {
					es: 'La universidad está en Santander.',
					en: 'The university is in Santander.'
				},
				readme: {
					es: 'Una universidad de Santander, en el norte de España.',
					en: 'A university in Santander, in northern Spain.'
				},
				unlocks: ['uninorte', 'procto']
			},
			{
				id: 'p10',
				kind: 'truefalse',
				statement: {
					es: 'Durante el intercambio trabajó para Banco Santander.',
					en: 'During the exchange he worked for Banco Santander.'
				},
				answer: true,
				anecdote: {
					es: 'Estudiar en Santander y trabajar para Banco Santander al mismo tiempo. El nombre le venía de fábrica.',
					en: 'Studying in Santander and working for Banco Santander at the same time. The name came built in.'
				},
				duckHint: {
					es: 'Fue Full Stack vía hiberus, con Java, Angular y React.',
					en: 'He was a Full Stack developer through hiberus, with Java, Angular and React.'
				},
				readme: {
					es: 'Trabajó de febrero a agosto de 2026 para Banco Santander vía hiberus.',
					en: 'He worked February to August 2026 for Banco Santander through hiberus.'
				},
				unlocks: ['hiberus']
			}
		]
	},
	{
		code: 'FINAL',
		era: 'final',
		age: { es: 'Hoy', en: 'Today' },
		title: { es: 'Hoy', en: 'Today' },
		questions: [
			{
				id: 'p11',
				kind: 'choice',
				prompt: {
					es: '¿Qué construye My Little Venture?',
					en: 'What does My Little Venture build?'
				},
				options: [
					{ es: 'Una app de crypto', en: 'A crypto app' },
					{
						es: 'Educación financiera para niños en EE. UU.',
						en: 'Financial education for kids in the US'
					},
					{ es: 'Un ERP', en: 'An ERP' },
					{ es: 'Un juego móvil', en: 'A mobile game' }
				],
				answer: 1,
				anecdote: {
					es: 'Como CTO y cofundador, eso implica cumplir COPPA: con datos de menores no se juega.',
					en: 'As CTO and co-founder, that means complying with COPPA: you do not play around with minors’ data.'
				},
				duckHint: {
					es: 'COPPA protege los datos de niños en EE. UU.',
					en: 'COPPA protects children’s data in the US.'
				},
				readme: {
					es: 'Cumple COPPA, la ley de EE. UU. sobre datos de menores.',
					en: 'It complies with COPPA, the US law on minors’ data.'
				},
				unlocks: ['my-little-venture', 'mlv-web']
			},
			{
				id: 'p12',
				kind: 'cta',
				prompt: {
					es: '¿Qué haces con alguien que construye software desde los 11?',
					en: 'What do you do with someone who has been building software since he was 11?'
				},
				ctas: [
					{
						label: { es: 'Mandarle SYSTEM por LinkedIn', en: 'Send him SYSTEM on LinkedIn' },
						href: 'https://www.linkedin.com/in/cristhianac'
					},
					{
						label: { es: 'Conocer UnderCodes', en: 'Get to know UnderCodes' },
						href: 'https://undercodes.net'
					}
				],
				anecdote: {
					es: 'No hay respuesta incorrecta: las dos opciones llevan al contacto.',
					en: 'There is no wrong answer: both options lead to contact.'
				},
				duckHint: {
					es: 'Las dos opciones son buenas.',
					en: 'Both options are good.'
				},
				readme: {
					es: 'Elige LinkedIn o el sitio de UnderCodes; las dos son válidas.',
					en: 'Pick LinkedIn or the UnderCodes site; both are valid.'
				},
				unlocks: ['github-repos']
			}
		]
	}
];
