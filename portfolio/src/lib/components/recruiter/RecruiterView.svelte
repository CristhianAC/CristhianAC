<script lang="ts">
	import { profile } from '$lib/content/profile';
	import { projects } from '$lib/content/projects';
	import type { Role } from '$lib/content/types';
	import { t, ui, type Locale } from '$lib/i18n';

	let { lang, print = false }: { lang: Locale; print?: boolean } = $props();

	// Open-ended periods end with "–".
	const period = (p: string) => (p.endsWith('–') ? `${p} ${t(ui.present, lang)}` : p);
</script>

{#snippet roles(list: Role[])}
	<ul class="roles">
		{#each list as r (r.id)}
			<li>
				<h3>{t(r.title, lang)} · {r.org}</h3>
				<p class="period">{period(r.period)}</p>
				<p>{t(r.summary, lang)}</p>
			</li>
		{/each}
	</ul>
{/snippet}

<main class="recruiter" class:print>
	<header>
		<h1>{profile.name}</h1>
		<p>{t(profile.headline, lang)}</p>
		<p class="period">{profile.location}</p>
		<a class="cv" href="/cv/cristhian-agamez-cv-{lang}.pdf">{t(ui.downloadCv, lang)}</a>
	</header>

	<section>
		<h2>{t(ui.experience, lang)}</h2>
		{@render roles(profile.experience)}
	</section>

	<section>
		<h2>{t(ui.projects, lang)}</h2>
		<ul class="roles">
			{#each projects as p (p.id)}
				<li>
					<h3>{p.name}</h3>
					<p>{t(p.summary, lang)}</p>
					{#if p.stack.length}<p class="period">{p.stack.join(' · ')}</p>{/if}
					{#each p.links as l}
						<a href={l.href}>{t(l.label, lang)}: {l.href}</a>
					{/each}
				</li>
			{/each}
		</ul>
	</section>

	<section>
		<h2>{t(ui.education, lang)}</h2>
		{@render roles(profile.education)}
	</section>

	<section>
		<h2>{t(ui.teaching, lang)}</h2>
		{@render roles(profile.teaching)}
	</section>

	<section>
		<h2>{t(ui.certificates, lang)}</h2>
		<ul>
			{#each profile.certificates as c}<li>{c}</li>{/each}
		</ul>
	</section>

	<section>
		<h2>{t(ui.skills, lang)}</h2>
		<p>{profile.skills.join(' · ')}</p>
	</section>

	<section>
		<h2>{t(ui.awards, lang)}</h2>
		<ul>
			{#each profile.awards as a}<li>{t(a, lang)}</li>{/each}
		</ul>
	</section>

	<section>
		<h2>{t(ui.contact, lang)}</h2>
		<ul>
			<li><a href={profile.links.linkedin}>LinkedIn</a></li>
			<li><a href={profile.links.github}>GitHub</a></li>
			<li><a href={profile.links.undercodes}>UnderCodes</a></li>
		</ul>
	</section>
</main>

<style>
	.recruiter {
		max-width: 48rem;
		margin: 0 auto;
		padding: 1rem;
		line-height: 1.5;
	}
	h1 {
		font-weight: 900;
		margin: 0;
	}
	h2 {
		color: var(--red-lift);
		border-bottom: 2px solid var(--red);
		padding-bottom: 0.25rem;
	}
	h3 {
		margin: 0;
		font-size: 1rem;
	}
	.roles {
		list-style: none;
		padding: 0;
	}
	.roles li {
		margin-bottom: 1rem;
	}
	.period {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		margin: 0.125rem 0;
	}
	a {
		color: var(--paper);
		text-decoration-color: var(--red-lift);
		overflow-wrap: anywhere;
	}
	.cv {
		display: inline-block;
		margin-top: 0.5rem;
		padding: 0.5rem 1rem;
		background: var(--red);
		text-decoration: none;
		font-weight: 700;
	}
	.print {
		background: var(--paper);
		color: var(--ink);
	}
	.print a {
		color: var(--ink);
	}
	.print h2 {
		color: var(--red-deep);
	}
</style>
