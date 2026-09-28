export type SupportedLanguage = 'en' | 'es';

export interface Translations {
	common: {
		cancel: string;
		apply: string;
		save: string;
		delete: string;
		close: string;
		empty: string;
		loading: string;
		addItem: string;
		itemIndex: string;
		removeItem: string;
		incompatible: string;
		true: string;
		false: string;
		textPlaceholder: string;
	};
	types: {
		string: string;
		stringDesc: string;
		number: string;
		numberDesc: string;
		boolean: string;
		booleanDesc: string;
		array: string;
		arrayDesc: string;
		record: string;
		recordDesc: string;
		date: string;
		dateDesc: string;
		empty: string;
		emptyDesc: string;
		binding: string;
		bindingDefault: string;
		bindingDefaultDesc: string;
		bindingCustom: string;
		bindingCustomDesc: string;
	};
	valueSelector: {
		typeTitle: string;
		typeDesc: string;
		configTitle: string;
		configDesc: string;
	};
	bindingSelector: {
		searchPlaceholder: string;
		clearSearch: string;
		noMatchTitle: string;
		noMatchSubtitle: string;
		emptyTitle: string;
		emptySubtitleComponent: string;
		emptySubtitleDocument: string;
		incompatibleTooltip: string;
	};
	bindingsPanel: {
		title: string;
		expandTooltip: string;
		collapseTooltip: string;
		filterPlaceholder: string;
		newVariable: string;
		noBindings: string;
		noFilterResults: string;
		deleteTooltip: string;
		deleteConfirm: string;
		confirm: string;
	};
	addBinding: {
		title: string;
		nameLabel: string;
		namePlaceholder: string;
		typeLabel: string;
		create: string;
		errorRequired: string;
		errorFormat: string;
		errorExists: string;
	};
	bindingComplex: {
		title: string;
		desc: string;
		emptyList: string;
		emptyGroup: string;
		editElements: string;
		itemCountOne: string;
		itemCountMany: string;
		fieldCountOne: string;
		fieldCountMany: string;
		componentDefault: string;
	};
	toolbar: {
		add: string;
		duplicate: string;
		delete: string;
		setValue: string;
	};
}
