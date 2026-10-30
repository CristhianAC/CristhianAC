import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Stage from './Stage.svelte';
import Host from './Host.svelte';
import PipelineLadder from './PipelineLadder.svelte';

describe('Stage', () => {
	it('compiles the first pieces and leaves the rest as wireframe', () => {
		const { container } = render(Stage, { era: 'cap01', compiled: 3, total: 12 });
		expect(container.querySelectorAll('.piece.compiled')).toHaveLength(3);
		expect(container.querySelectorAll('.piece.wireframe')).toHaveLength(9);
		expect(container.querySelector('[data-era]')?.getAttribute('data-era')).toBe('cap01');
	});
});

describe('PipelineLadder', () => {
	it('marks the current stage as the current step', () => {
		render(PipelineLadder, { stage: 'staging', commits: 5, lang: 'es' });
		expect(screen.getByText('staging').closest('li')?.getAttribute('aria-current')).toBe('step');
		expect(screen.getByText('build').closest('li')?.hasAttribute('aria-current')).toBe(false);
		expect(screen.getByText('producción')).toBeTruthy();
	});
});

describe('Host', () => {
	it('renders the sprite and the speech bubble', () => {
		render(Host, { line: 'Bienvenidos al show', talking: true });
		const img = screen.getByRole('img', { name: 'Cristhian' });
		expect(img.getAttribute('src')).toBe('/sprites/host/south.png');
		// Screen readers get the full line in the live region; the typed copy is aria-hidden.
		const bubble = screen.getByText('Bienvenidos al show', { selector: '.sr-only' });
		expect(bubble.closest('[aria-live="polite"]')).toBeTruthy();
		expect(document.querySelector('.typed')?.getAttribute('aria-hidden')).toBe('true');
	});
});
