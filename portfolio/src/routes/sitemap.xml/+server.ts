import { locales } from '$lib/i18n';

export const prerender = true;

const ORIGIN = 'https://cristhianac.dev';

export const GET = () => {
	const urls = locales.flatMap((l) => [`/${l}`, `/${l}/recruiter`]);
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `<url><loc>${ORIGIN}${u}</loc></url>`).join('\n')}
</urlset>
`;
	return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
