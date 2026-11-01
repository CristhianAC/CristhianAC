<script lang="ts">
	import { profile } from '$lib/content/profile';
	import { projects } from '$lib/content/projects';
	import type { Role } from '$lib/content/types';
	import { t, ui, type Locale } from '$lib/i18n';
	import { assemble, countUp, reveal } from '$lib/motion/fx';

	let { lang }: { lang: Locale } = $props();

	// Open-ended periods end with "–".
	const period = (p: string) => (p.endsWith('–') ? `${p} ${t(ui.present, lang)}` : p);

	// Every number here is derived from facts in the content files.
	const founded = ['Marat Studio', 'UnderCodes S.A.S.', 'Olympus Analytics', 'My Little Venture'];
	const stats = [
		{ value: 11, label: ui.statFirstCode },
		{ value: profile.experience.filter((r) => founded.includes(r.org)).length, label: ui.statCompanies },
		{ value: 2, label: ui.statCountries },
		{ value: profile.skills.length, label: ui.statStack }
	];
</script>

{#snippet cards(list: Role[])}
	<ul class="cards" use:reveal={{ selector: 'li', preset: 'rise', step: 70 }}>
		{#each list as r (r.id)}
			<li class="card">
				<p class="period">{period(r.period)}</p>
				<h3>{t(r.title, lang)}</h3>
				<p class="org">{r.org}</p>
				<p>{t(r.summary, lang)}</p>
			</li>
		{/each}
	</ul>
{/snippet}

<main class="show">
	<a class="back" href="/{lang}">
		<span aria-hidden="true">◀</span>
		{t(ui.backToShow, lang)}
	</a>

	<header class="hero">
		<div class="host" aria-hidden="true">
			<span class="spot"></span>
			<img src="/sprites/host/south.png" alt="" width="96" height="96" />
		</div>
		<div use:assemble={{ selector: '.in', preset: 'kinetic', step: 90 }}>
			<p class="in onair"><span class="dot"></span>ON AIR · {profile.location}</p>
			<h1 class="in">{profile.name}</h1>
			<p class="in headline">{t(profile.headline, lang)}</p>
			<div class="in actions">
				<a class="btn primary" href="/cv/cristhian-agamez-cv-{lang}.pdf">{t(ui.downloadCv, lang)}</a>
				<a class="btn" href={profile.links.linkedin}>LinkedIn</a>
				<a class="btn" href={profile.links.github}>GitHub</a>
			</div>
		</div>
	</header>

	<ul class="stats" use:reveal={{ selector: 'li', preset: 'climb', step: 80 }}>
		{#each stats as s (s.label.en)}
			<li>
				<strong use:countUp={s.value}>{s.value}</strong>
				<span>{t(s.label, lang)}</span>
			</li>
		{/each}
	</ul>

	<section>
		<h2><span aria-hidden="true">01</span>{t(ui.experience, lang)}</h2>
		<ol class="timeline" use:reveal={{ selector: 'li', preset: 'slide', step: 70 }}>
			{#each profile.experience as r (r.id)}
				<li>
					<p class="period">{period(r.period)}</p>
					<h3>{t(r.title, lang)} · <span class="org">{r.org}</span></h3>
					<p>{t(r.summary, lang)}</p>
				</li>
			{/each}
		</ol>
	</section>

	<section>
		<h2><span aria-hidden="true">02</span>{t(ui.projects, lang)}</h2>
		<ul class="cards projects" use:reveal={{ selector: 'li', preset: 'rise', step: 70 }}>
			{#each projects as p (p.id)}
				<li class="card">
					<h3>{p.name}</h3>
					<p>{t(p.summary, lang)}</p>
					{#if p.stack.length}
						<ul class="chips">
							{#each p.stack as s}<li>{s}</li>{/each}
						</ul>
					{/if}
					<p class="links">
						{#each p.links as l}
							<a href={l.href}>{t(l.label, lang)} ↗</a>
						{/each}
					</p>
				</li>
			{/each}
		</ul>
	</section>

	<section>
		<h2><span aria-hidden="true">03</span>{t(ui.skills, lang)}</h2>
		<ul class="chips big" use:reveal={{ selector: 'li', preset: 'climb', step: 30 }}>
			{#each profile.skills as s}<li>{s}</li>{/each}
		</ul>
	</section>

	<section>
		<h2><span aria-hidden="true">04</span>{t(ui.education, lang)}</h2>
		{@render cards(profile.education)}
	</section>

	<section>
		<h2><span aria-hidden="true">05</span>{t(ui.teaching, lang)}</h2>
		{@render cards(profile.teaching)}
	</section>

	<section class="split">
		<div>
			<h2><span aria-hidden="true">06</span>{t(ui.certificates, lang)}</h2>
			<ul class="chips" use:reveal={{ selector: 'li', preset: 'climb', step: 40 }}>
				{#each profile.certificates as c}<li>{c}</li>{/each}
			</ul>
		</div>
		<div>
			<h2><span aria-hidden="true">07</span>{t(ui.awards, lang)}</h2>
			<ul class="awards" use:reveal={{ selector: 'li', preset: 'rise' }}>
				{#each profile.awards as a}<li><span aria-hidden="true">★</span> {t(a, lang)}</li>{/each}
			</ul>
		</div>
	</section>

	<section class="contact" use:reveal={{ selector: '.in', preset: 'kinetic', step: 90 }}>
		<h2 class="in">{t(ui.contact, lang)}</h2>
		<p class="in big">{t(ui.contactCta, lang)}</p>
		<div class="in actions">
			<a class="btn primary" href={profile.links.linkedin}>LinkedIn</a>
			<a class="btn" href={profile.links.undercodes}>UnderCodes</a>
			<a class="btn" href={profile.links.github}>GitHub</a>
			<a class="btn" href="/{lang}">◀ {t(ui.backToShow, lang)}</a>
		</div>
	</section>
</main>

<style>
	.show {
		--line: rgb(244 242 239 / 0.12);
		/* Small red text needs more lift than --red-lift to reach 4.5:1 on ink. */
		--red-text: #ff5a4f;
		--muted: #cbc5be;
		max-width: 64rem;
		margin: 0 auto;
		padding: 0 1rem 4rem;
		line-height: 1.55;
		position: relative;
		/* Entrance transforms must not widen the page while they play. */
		overflow-x: clip;
	}
	.show::before {
		content: '';
		position: fixed;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		background:
			radial-gradient(60rem 30rem at 15% -10%, rgb(191 0 0 / 0.28), transparent 70%),
			repeating-linear-gradient(0deg, rgb(255 255 255 / 0.025) 0 1px, transparent 1px 3px);
	}

	.back {
		position: sticky;
		top: 0.75rem;
		z-index: 2;
		display: inline-flex;
		gap: 0.5rem;
		align-items: center;
		padding: 0.5rem 0.9rem;
		background: var(--ink);
		color: var(--paper);
		font: 700 0.875rem var(--font-mono);
		text-decoration: none;
		box-shadow:
			0 -3px 0 0 var(--red),
			0 3px 0 0 var(--red),
			-3px 0 0 0 var(--red),
			3px 0 0 0 var(--red);
		transition: transform 160ms var(--ease-spring, ease-out), background 160ms;
	}
	.back:hover {
		background: var(--red-deep);
		transform: translateX(-4px);
	}
	.back:active {
		transform: scale(0.96);
	}
	.back:focus-visible,
	.btn:focus-visible {
		outline: 3px solid var(--paper);
		outline-offset: 5px;
	}

	.hero {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 2rem;
		align-items: center;
		padding: 3rem 0 2rem;
	}
	.host {
		position: relative;
		width: 192px;
		height: 192px;
	}
	.host img {
		position: relative;
		width: 192px;
		height: 192px;
		animation: bob 2.4s ease-in-out infinite;
	}
	.spot {
		position: absolute;
		inset: 20% 5% -5%;
		border-radius: 50%;
		background: radial-gradient(closest-side, rgb(224 26 26 / 0.55), transparent);
		filter: blur(6px);
		animation: pulse 2.4s ease-in-out infinite;
	}
	@keyframes bob {
		50% {
			transform: translateY(-6px);
		}
	}
	@keyframes pulse {
		50% {
			opacity: 0.6;
			transform: scale(0.92);
		}
	}
	.onair {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		font: 700 0.8rem var(--font-mono);
		letter-spacing: 0.12em;
		color: var(--red-text);
	}
	.dot {
		width: 0.6rem;
		height: 0.6rem;
		background: var(--red-lift);
		box-shadow: 0 0 12px var(--red-lift);
		animation: blink 1.2s steps(2, jump-none) infinite;
	}
	@keyframes blink {
		50% {
			opacity: 0.25;
		}
	}
	h1 {
		margin: 0.25rem 0;
		font-weight: 900;
		font-size: clamp(2.5rem, 7vw, 4.5rem);
		line-height: 1;
		letter-spacing: -0.02em;
	}
	.headline {
		margin: 0 0 1.25rem;
		font-size: 1.25rem;
		color: var(--muted);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	.btn {
		padding: 0.65rem 1.1rem;
		color: var(--paper);
		font: 700 0.9rem var(--font-mono);
		text-decoration: none;
		border: 2px solid var(--red);
		transition:
			transform 160ms var(--ease-spring, ease-out),
			background 160ms;
	}
	.btn:hover {
		background: var(--red-deep);
		transform: translateY(-2px);
	}
	.btn:active {
		transform: scale(0.96);
	}
	.btn.primary {
		background: var(--red);
	}
	.btn.primary:hover {
		background: var(--red-lift);
	}

	.stats {
		list-style: none;
		padding: 0;
		margin: 0 0 1rem;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		border-block: 1px solid var(--line);
	}
	.stats li {
		padding: 1.25rem 1rem;
		display: grid;
		gap: 0.25rem;
	}
	.stats li + li {
		border-left: 1px solid var(--line);
	}
	.stats strong {
		font-size: 2.5rem;
		font-weight: 900;
		line-height: 1;
		color: var(--red-lift);
		font-variant-numeric: tabular-nums;
	}
	.stats span {
		font-size: 0.85rem;
		color: var(--muted);
	}

	section {
		padding-top: 3rem;
	}
	h2 {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		margin: 0 0 1.5rem;
		font-size: 1.75rem;
		font-weight: 900;
	}
	h2 span {
		font: 700 0.8rem var(--font-mono);
		color: var(--red-text);
	}
	h3 {
		margin: 0;
		font-size: 1.05rem;
	}
	p {
		margin: 0.25rem 0;
	}
	.period {
		font: 600 0.8rem var(--font-mono);
		color: var(--red-text);
	}
	.org {
		color: var(--muted);
		font-weight: 600;
	}

	.timeline {
		list-style: none;
		margin: 0;
		padding: 0 0 0 1.5rem;
		border-left: 2px solid var(--red);
		display: grid;
		gap: 1.5rem;
	}
	.timeline li {
		position: relative;
	}
	.timeline li::before {
		content: '';
		position: absolute;
		left: calc(-1.5rem - 7px);
		top: 0.35rem;
		width: 12px;
		height: 12px;
		background: var(--ink);
		border: 2px solid var(--red-lift);
	}

	.cards {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
		gap: 1rem;
	}
	.card {
		padding: 1.25rem;
		background: rgb(244 242 239 / 0.04);
		border: 1px solid var(--line);
		border-top: 3px solid var(--red);
		transition:
			transform 200ms var(--ease-spring, ease-out),
			border-color 200ms,
			background 200ms;
	}
	.card:hover {
		transform: translateY(-4px);
		border-color: rgb(224 26 26 / 0.6);
		background: rgb(191 0 0 / 0.08);
	}
	.projects .card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.links {
		margin-top: auto;
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	.links a {
		color: var(--paper);
		font: 600 0.85rem var(--font-mono);
		text-decoration-color: var(--red-lift);
		text-underline-offset: 3px;
	}
	.links a:hover {
		color: var(--red-lift);
	}

	.chips {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.chips li {
		padding: 0.15rem 0.5rem;
		font: 600 0.75rem var(--font-mono);
		border: 1px solid var(--line);
	}
	.chips.big li {
		padding: 0.45rem 0.8rem;
		font-size: 0.9rem;
		background: rgb(244 242 239 / 0.04);
		transition:
			transform 160ms var(--ease-spring, ease-out),
			background 160ms;
	}
	.chips.big li:hover {
		background: var(--red-deep);
		transform: translateY(-2px) rotate(-1deg);
	}

	.split {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}
	.awards {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.awards span {
		color: var(--red-text);
	}

	.contact {
		margin-top: 3rem;
		padding: 2.5rem;
		text-align: center;
		background: linear-gradient(135deg, var(--red-deep), var(--ink));
		border: 1px solid var(--red);
	}
	.contact h2 {
		justify-content: center;
		font: 700 0.8rem var(--font-mono);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--red-text);
		margin-bottom: 0.5rem;
	}
	.contact .big {
		font-size: clamp(2rem, 6vw, 3.5rem);
		font-weight: 900;
		margin-bottom: 1.5rem;
	}
	.contact .actions {
		justify-content: center;
	}

	@media (max-width: 640px) {
		.hero {
			grid-template-columns: 1fr;
			gap: 1rem;
			padding-top: 1.5rem;
		}
		.host,
		.host img {
			width: 128px;
			height: 128px;
		}
		.stats {
			grid-template-columns: 1fr 1fr;
		}
		.stats li:nth-child(3) {
			border-left: 0;
		}
		.stats li:nth-child(n + 3) {
			border-top: 1px solid var(--line);
		}
		.split {
			grid-template-columns: 1fr;
		}
		.contact {
			padding: 2rem 1rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.host img,
		.spot,
		.dot {
			animation: none;
		}
		.back,
		.btn,
		.card,
		.chips.big li {
			transition: none;
		}
	}
</style>
