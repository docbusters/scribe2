/** Names of the colours of the palette: the keys of `colorPicker.names` in the i18n texts */
export type ColorName = 'white' | 'black' | 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'indigo' | 'purple' | 'pink';

export interface PaletteColor {
    /** `#rrggbb` */
    hex: string;
    name: ColorName;
}

/** Number of columns of the palette: the main row and every row of shades have this many colours */
export const COLOR_PALETTE_COLUMNS = 11;

const color = (name: ColorName, hex: string): PaletteColor => ({ name, hex });

/** The hues (Tailwind 500) after white and black, and their lighter and darker shades (100, 200, 300, 700 and 900), in column order */
const HUES: { name: ColorName; main: string; shades: [string, string, string, string, string] }[] = [
    { name: 'red', main: '#ef4444', shades: ['#fee2e2', '#fecaca', '#fca5a5', '#b91c1c', '#7f1d1d'] },
    { name: 'orange', main: '#f97316', shades: ['#ffedd5', '#fed7aa', '#fdba74', '#c2410c', '#7c2d12'] },
    { name: 'yellow', main: '#eab308', shades: ['#fef9c3', '#fef08a', '#fde047', '#a16207', '#713f12'] },
    { name: 'green', main: '#22c55e', shades: ['#dcfce7', '#bbf7d0', '#86efac', '#15803d', '#14532d'] },
    { name: 'cyan', main: '#06b6d4', shades: ['#cffafe', '#a5f3fc', '#67e8f9', '#0e7490', '#164e63'] },
    { name: 'blue', main: '#3b82f6', shades: ['#dbeafe', '#bfdbfe', '#93c5fd', '#1d4ed8', '#1e3a8a'] },
    { name: 'indigo', main: '#6366f1', shades: ['#e0e7ff', '#c7d2fe', '#a5b4fc', '#4338ca', '#312e81'] },
    { name: 'purple', main: '#a855f7', shades: ['#f3e8ff', '#e9d5ff', '#d8b4fe', '#7e22ce', '#581c87'] },
    { name: 'pink', main: '#ec4899', shades: ['#fce7f3', '#fbcfe8', '#f9a8d4', '#be185d', '#831843'] },
];

/** The greys of the first two columns of the shades, from the lightest to the darkest (slate 50 to 400, then 500 to 900) */
const GREYS = ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a'];

/** The first row: white, black and one colour per hue */
export const COLOR_PALETTE_MAIN: PaletteColor[] = [
    color('white', '#ffffff'),
    color('black', '#000000'),
    ...HUES.map(hue => color(hue.name, hue.main)),
];

/** The rows below it: two columns of greys, then the shades of each hue, from the lightest row to the darkest */
export const COLOR_PALETTE_SHADES: PaletteColor[][] = Array.from({ length: 5 }, (_, row) => [
    color('gray', GREYS[row]),
    color('gray', GREYS[row + 5]),
    ...HUES.map(hue => color(hue.name, hue.shades[row])),
]);

/** Whether a `#rrggbb` colour is light enough that dark ink reads on it (used for the check mark over a swatch). Rough perceived brightness, not WCAG */
export function isLightColor(hex: string): boolean {
    const [r, g, b] = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16));
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}

/** Whether the value is a colour written as `#rrggbb`. What a document stores is checked with this before it is drawn */
export function isHexColor(value: unknown): value is string {
    return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
}
