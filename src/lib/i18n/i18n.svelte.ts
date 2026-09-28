import { setContext } from 'svelte';
import type { SupportedLanguage, Translations } from './types.js';
import { en } from './locales/en.js';
import { es } from './locales/es.js';

const dictionaries: Record<SupportedLanguage, Translations> = { en, es };
const I18N_CONTEXT_KEY = Symbol('scribe-i18n');

export class I18nService {
	lang = $state<SupportedLanguage>('en');

	constructor(initialLang: SupportedLanguage = 'en') {
		this.setLanguage(initialLang);
	}

	setLanguage(newLang?: SupportedLanguage | string) {
		if (newLang === 'es' || newLang === 'en') {
			this.lang = newLang;
		} else {
			this.lang = 'en';
		}
	}

	/**
	 * Translates a dot-notated key with optional parameter interpolation
	 * @example t('common.itemIndex', { index: 1 }) -> "Item #1"
	 */
	t = (path: string, params?: Record<string, string | number>): string => {
		const currentDict = dictionaries[this.lang] || en;
		const fallbackDict = en;

		const keys = path.split('.');
		let currentVal: unknown = currentDict;
		let fallbackVal: unknown = fallbackDict;

		for (const k of keys) {
			currentVal = (currentVal as Record<string, unknown>)?.[k];
			fallbackVal = (fallbackVal as Record<string, unknown>)?.[k];
		}

		let result = typeof currentVal === 'string' ? currentVal : typeof fallbackVal === 'string' ? fallbackVal : path;

		if (params) {
			for (const [key, value] of Object.entries(params)) {
				result = result.replaceAll(`{${key}}`, String(value));
			}
		}

		return result;
	};
}

export const i18n = new I18nService('en');
export const defaultI18n = i18n;

export function setI18n(lang: SupportedLanguage = 'en'): I18nService {
	i18n.setLanguage(lang);
	try {
		setContext(I18N_CONTEXT_KEY, i18n);
	} catch {
		// Ignore if outside component initialization
	}
	return i18n;
}

export function getI18n(): I18nService {
	return i18n;
}
