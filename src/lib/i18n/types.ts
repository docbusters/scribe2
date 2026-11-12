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
		value: string;
		add: string;
		unavailable: string;
		showPassword: string;
		hidePassword: string;
		newText: string;
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
		deleteInUse: string;
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
		addLabel: string;
		duplicateLabel: string;
		deleteLabel: string;
		setValueLabel: string;
	};
	sections: {
		defaultTitle: string;
		addFirstSection: string;
		addBelow: string;
		duplicate: string;
		delete: string;
	};
	emptyContent: {
		setValue: string;
		changeValue: string;
	};
	editor: {
		emptySectionPlaceholder: string;
		resizeHeight: string;
		printDocument: string;
	};
	componentToolbar: {
		pressEnter: string;
	};
	topToolbar: {
		groups: {
			component: string;
			data: string;
			alignment: string;
			fit: string;
			controls: string;
			layout: string;
			chartType: string;
			table: string;
			format: string;
			options: string;
		};
		configureLabel: string;
		ariaLabel: string;
	};
	textFormat: {
		bold: string;
		italic: string;
		underline: string;
		strikethrough: string;
	};
	shortcuts: {
		/** Names of the keys that are not drawn as a symbol or a letter */
		keys: {
			ctrl: string;
			alt: string;
			shift: string;
			space: string;
			delete: string;
			backspace: string;
			enter: string;
			escape: string;
			tab: string;
		};
	};
	components: {
		'text-binding': {
			name: string;
			description: string;
		};
		text: {
			name: string;
			description: string;
		};
		'text-input': {
			name: string;
			description: string;
		};
		image: {
			name: string;
			description: string;
		};
		latex: {
			name: string;
			description: string;
		};
		table: {
			name: string;
			description: string;
			deleteRow: string;
			deleteColumn: string;
		};
		map: {
			name: string;
			description: string;
		};
		chart: {
			name: string;
			description: string;
		};
	};
	chartConfig: {
		title: string;
		sourceTitle: string;
		sourceDesc: string;
		xAxis: string;
		seriesTitle: string;
		seriesDesc: string;
		addSeries: string;
		seriesLabel: string;
		noSeries: string;
		noSeriesDesc: string;
		changeColor: string;
		showSeries: string;
		hideSeries: string;
		removeSeries: string;
	};
	map: {
		searchPlaceholder: string;
		noAddressSelected: string;
		noResults: string;
	};
	options: {
		expandWithContent: string;
		alignLeft: string;
		alignCenter: string;
		alignRight: string;
		fitContain: string;
		fitCover: string;
		fitFill: string;
		mapReadOnly: string;
		mapSearchbar: string;
		mapGlobe: string;
		mapZoom: string;
		mapCurrentPosition: string;
		mapDraggableMarker: string;
		chartDataConfig: string;
		chartBar: string;
		chartLine: string;
		chartArea: string;
		chartPie: string;
		chartArc: string;
		tableAddRow: string;
		tableAddColumn: string;
		tableBorders: string;
	};
	errors: {
		componentError: string;
		unknownComponent: string;
		tableConfigMissing: string;
		latexUnrecognised: string;
		latexEmpty: string;
		imageLoadError: string;
		imageEmpty: string;
		chartMissingData: string;
		chartMissingXAxis: string;
		chartMissingXAxisDesc: string;
		chartNoSeries: string;
		chartNoSeriesDesc: string;
		unsupportedValueType: string;
		unsupportedBindingType: string;
		invalidMapValue: string;
		invalidSlotContent: string;
	};
}

