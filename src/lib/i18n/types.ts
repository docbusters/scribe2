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
			dots: string;
			corners: string;
			color: string;
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
		color: string;
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
		video: {
			name: string;
			description: string;
			providers: string;
		};
		qr: {
			name: string;
			description: string;
			ariaLabel: string;
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
	colorPicker: {
		title: string;
		more: string;
		automatic: string;
		/** What Automático means, shown when hovering its info icon */
		automaticInfo: string;
		/** A colour of the palette: its name and its hex code */
		swatch: string;
		names: {
			white: string;
			black: string;
			gray: string;
			red: string;
			orange: string;
			yellow: string;
			green: string;
			cyan: string;
			blue: string;
			indigo: string;
			purple: string;
			pink: string;
		};
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
		qrDotsSquare: string;
		qrDotsRounded: string;
		qrDotsCircular: string;
		qrDotsClassy: string;
		qrCornersSquare: string;
		qrCornersRounded: string;
		qrCornersCircular: string;
		qrDotsColor: string;
		qrCornersColor: string;
		qrBackgroundColor: string;
		backgroundLabel: string;
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
		videoEmpty: string;
		videoUnsupported: string;
		qrEmpty: string;
		qrTooLong: string;
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

