import type { L } from '$lib/i18n';

export type Era = 'cap01' | 'cap02' | 'cap03' | 'cap04' | 'cap05' | 'final';
type Base = { id: string; anecdote: L; duckHint: L; readme: L; unlocks: string[] };
export type Question = Base &
	(
		| { kind: 'choice'; prompt: L; options: L[]; answer: number }
		| { kind: 'truefalse'; statement: L; answer: boolean }
		| { kind: 'order'; prompt: L; items: L[] } // items listed in the correct order
		| { kind: 'spot'; prompt: L; lines: string[] } // any line is accepted (content P4)
		| { kind: 'match'; prompt: L; pairs: { left: L; right: L }[] } // correct pairing = same index
		| { kind: 'cta'; prompt: L; ctas: { label: L; href: string }[] }
	);
export type Round = {
	code: 'CAP-01' | 'CAP-02' | 'CAP-03' | 'CAP-04' | 'CAP-05' | 'FINAL';
	era: Era;
	age: L;
	title: L;
	questions: Question[];
};
export type Project = {
	id: string;
	name: string;
	summary: L;
	stack: string[];
	links: { label: L; href: string }[];
};
export type Role = { id: string; title: L; org: string; period: string; summary: L };
export type Profile = {
	name: string;
	headline: L;
	location: string;
	links: { linkedin: string; github: string; undercodes: string };
	experience: Role[];
	education: Role[];
	teaching: Role[];
	certificates: string[];
	skills: string[];
	awards: L[];
};
