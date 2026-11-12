import { describe, expect, it } from 'vitest';
import { COLOR_PALETTE_COLUMNS, COLOR_PALETTE_MAIN, COLOR_PALETTE_SHADES, isHexColor, isLightColor } from './colorPalette.js';

describe('isHexColor', () => {
    it('accepts #rrggbb in any case', () => {
        expect(isHexColor('#000000')).toBe(true);
        expect(isHexColor('#AbCdEf')).toBe(true);
    });

    it('rejects anything else, so it never reaches markup or the QR', () => {
        for (const value of ['', '#fff', '000000', '#00000g', '#0000000', 'red', '#000000"/><script>', undefined, null, 5]) {
            expect(isHexColor(value)).toBe(false);
        }
    });
});

describe('isLightColor', () => {
    it('tells light colours from dark ones', () => {
        expect(isLightColor('#ffffff')).toBe(true);
        expect(isLightColor('#fef08a')).toBe(true);
        expect(isLightColor('#000000')).toBe(false);
        expect(isLightColor('#1d4ed8')).toBe(false);
    });
});

describe('colour palette', () => {
    it('has full rows of valid colours', () => {
        expect(COLOR_PALETTE_MAIN).toHaveLength(COLOR_PALETTE_COLUMNS);
        expect(COLOR_PALETTE_SHADES).toHaveLength(5);
        for (const row of COLOR_PALETTE_SHADES) expect(row).toHaveLength(COLOR_PALETTE_COLUMNS);
        for (const { hex } of [...COLOR_PALETTE_MAIN, ...COLOR_PALETTE_SHADES.flat()]) expect(isHexColor(hex)).toBe(true);
    });

    it('does not repeat a colour', () => {
        const hexes = [...COLOR_PALETTE_MAIN, ...COLOR_PALETTE_SHADES.flat()].map(color => color.hex);
        expect(new Set(hexes).size).toBe(hexes.length);
    });
});
