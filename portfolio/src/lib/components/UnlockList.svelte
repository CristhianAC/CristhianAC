<script lang="ts">
	import { t, ui, type Locale } from '$lib/i18n';
	import { projects } from '$lib/content/projects';
	import { profile } from '$lib/content/profile';

	let { ids, lang }: { ids: string[]; lang: Locale } = $props();

	type Item = { id: string; name: string; detail: string; href?: string };
	const roles = [...profile.experience, ...profile.education, ...profile.teaching];
	// Unlock ids point at a project or a CV role (content.test checks every id resolves).
	const items = $derived(
		ids.flatMap((id): Item[] => {
			const p = projects.find((x) => x.id === id);
			if (p) return [{ id, name: p.name, detail: t(p.summary, lang), href: p.links[0]?.href }];
			const r = roles.find((x) => x.id === id);
			return r ? [{ id, name: r.org, detail: t(r.title, lang) }] : [];
		})
	);
</script>

{#if items.length}
	<section class="unlocks" aria-labelledby="unlocks-title">
		<h3 id="unlocks-title">{t(ui.unlocked, lang)}</h3>
		<ul>
			{#each items as item (item.id)}
				<li>
					{#if item.href}
						<a href={item.href} target="_blank" rel="noopener noreferrer">{item.name}</a>
					{:else}
						<strong>{item.name}</strong>
					{/if}
					<span>{item.detail}</span>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<style>
	.unlocks {
		margin: 0 0 1.2rem;
	}
	h3 {
		margin: 0 0 0.6rem;
		font: 600 0.8rem/1.3 var(--font-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--red-lift);
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.6rem;
	}
	li {
		display: grid;
		gap: 0.15rem;
		padding-left: 0.8rem;
		box-shadow: inset 4px 0 0 var(--red);
		line-height: 1.4;
	}
	a,
	strong {
		color: var(--paper);
		font: 700 1rem/1.3 var(--font-mono);
	}
	a:hover {
		color: var(--red-lift);
	}
	span {
		font-size: 0.9rem;
		color: rgb(244 242 239 / 0.8);
	}
</style>
