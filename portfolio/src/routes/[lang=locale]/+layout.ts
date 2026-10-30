import type { Locale } from '$lib/i18n';

export const load = ({ params }: { params: { lang: string } }) => ({ lang: params.lang as Locale });
