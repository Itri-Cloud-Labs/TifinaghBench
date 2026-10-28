import type {Lang} from '../i18n';

// Where scripts/cards.mjs writes the share images and badges, kept apart from the layouts so pages
// link them without bundling Satori markup.
export const cardSize = {width: 1200, height: 630};
export const cardPath = (lang: Lang, slug?: string) => (slug ? `/og/${lang}/models/${slug}.png` : `/og/${lang}.png`);
export const badgeHeight = 24;
export const badgePath = (slug: string) => `/badge/${slug}.svg`;
