import type { ParamMatcher } from '@sveltejs/kit';
import { locales, type Locale } from '$lib/i18n';

export const match = ((param: string): param is Locale =>
	(locales as string[]).includes(param)) satisfies ParamMatcher;
