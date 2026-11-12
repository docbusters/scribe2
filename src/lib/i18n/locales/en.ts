import type { Translations } from '../types.js';

export const en: Translations = {
	common: {
		cancel: 'Cancel',
		apply: 'Apply Changes',
		save: 'Save',
		delete: 'Delete',
		close: 'Close',
		empty: '(empty)',
		loading: 'Loading...',
		addItem: 'Add Item',
		itemIndex: 'Item #{index}',
		removeItem: 'Remove item',
		incompatible: 'Incompatible',
		true: 'Yes',
		false: 'No',
		textPlaceholder: 'Enter text...',
		value: 'Value',
		add: 'Add',
		unavailable: 'Unavailable',
		showPassword: 'Show password',
		hidePassword: 'Hide password',
		newText: 'New text'
	},
	types: {
		string: 'Text',
		stringDesc: 'Static text value',
		number: 'Number',
		numberDesc: 'Numeric value',
		boolean: 'Switch',
		booleanDesc: 'Yes / No toggle',
		array: 'List',
		arrayDesc: 'Collection of items',
		record: 'Data group',
		recordDesc: 'Group of fields',
		date: 'Date',
		dateDesc: 'Calendar date',
		empty: 'Empty',
		emptyDesc: 'No value assigned',
		binding: 'Variable',
		bindingDefault: 'Document variable',
		bindingDefaultDesc: 'Value from this document',
		bindingCustom: 'External variable',
		bindingCustomDesc: 'Connected external source'
	},
	valueSelector: {
		typeTitle: 'Value type',
		typeDesc: 'Select whether this property uses a fixed value or a dynamic variable',
		configTitle: 'Value Configuration',
		configDesc: 'Configure the value or link to a dynamic variable'
	},
	bindingSelector: {
		searchPlaceholder: 'Search variables by name or value...',
		clearSearch: 'Clear search',
		noMatchTitle: 'No matching variables',
		noMatchSubtitle: 'Try searching for a different keyword',
		emptyTitle: 'No variables available',
		emptySubtitleComponent: 'No compatible variables found for this component',
		emptySubtitleDocument: 'Create variables in the document to select them here',
		incompatibleTooltip: 'Incompatible data type for this component'
	},
	bindingsPanel: {
		title: 'Variables',
		expandTooltip: 'Open Variables',
		collapseTooltip: 'Collapse panel',
		filterPlaceholder: 'Filter variables...',
		newVariable: 'New variable',
		noBindings: 'No document variables yet',
		noFilterResults: 'No variables found for "{query}"',
		deleteTooltip: 'Delete variable',
		deleteConfirm: 'Delete variable?',
		deleteInUse: 'In use by {count} component(s). Delete anyway?',
		confirm: 'Confirm'
	},
	addBinding: {
		title: 'New Variable',
		nameLabel: 'Variable Name',
		namePlaceholder: 'Variable name',
		typeLabel: 'Data type',
		create: 'Create',
		errorRequired: 'Variable name is required',
		errorFormat: 'Name can only contain letters, numbers, hyphens, and underscores',
		errorExists: 'Variable "{name}" already exists'
	},
	bindingComplex: {
		title: 'Configure Variable: {id}',
		desc: 'Configure items and properties for variable "{id}"',
		emptyList: 'Empty list',
		emptyGroup: 'Empty data group',
		editElements: 'Edit elements',
		itemCountOne: '{count} item',
		itemCountMany: '{count} items',
		fieldCountOne: '{count} field',
		fieldCountMany: '{count} fields',
		componentDefault: 'Component'
	},
	toolbar: {
		add: 'Add component',
		duplicate: 'Duplicate component',
		delete: 'Delete component',
		setValue: 'Set value',
		addLabel: 'Add',
		duplicateLabel: 'Duplicate',
		deleteLabel: 'Delete',
		setValueLabel: 'Value'
	},
	sections: {
		defaultTitle: 'New Section',
		addFirstSection: 'Add first section',
		addBelow: 'Add section below',
		duplicate: 'Duplicate section',
		delete: 'Delete section'
	},
	emptyContent: {
		setValue: 'Set value',
		changeValue: 'Change value'
	},
	editor: {
		emptySectionPlaceholder: 'Start typing, or press Ctrl + Space to add a component',
		resizeHeight: 'Resize height',
		printDocument: 'Print document (debugging)'
	},
	componentToolbar: {
		pressEnter: 'Press ENTER to add'
	},
	topToolbar: {
		groups: {
			component: 'Component',
			data: 'Data',
			alignment: 'Alignment',
			fit: 'Fit',
			controls: 'Controls',
			layout: 'Layout',
			chartType: 'Chart type',
			table: 'Table',
			format: 'Format',
			options: 'Options'
		},
		configureLabel: 'Configure',
		ariaLabel: 'Component toolbar'
	},
	textFormat: {
		bold: 'Bold',
		italic: 'Italic',
		underline: 'Underline',
		strikethrough: 'Strikethrough'
	},
	shortcuts: {
		keys: {
			ctrl: 'Ctrl',
			alt: 'Alt',
			shift: 'Shift',
			space: 'Space',
			delete: 'Del',
			backspace: 'Backspace',
			enter: 'Enter',
			escape: 'Esc',
			tab: 'Tab'
		}
	},
	components: {
		'text-binding': {
			name: 'Text Binding',
			description: 'Text that can be binded'
		},
		text: {
			name: 'Text',
			description: 'As simple as it gets'
		},
		'text-input': {
			name: 'Text Input',
			description: 'Used to input text'
		},
		image: {
			name: 'Image',
			description: 'Display online images'
		},
		latex: {
			name: 'LaTeX',
			description: 'Render LaTeX formulas'
		},
		table: {
			name: 'Table',
			description: 'Create tables to organize your content',
			deleteRow: 'Delete row',
			deleteColumn: 'Delete column'
		},
		map: {
			name: 'Map',
			description: 'Create interactive maps'
		},
		chart: {
			name: 'Chart',
			description: 'Create charts to visualize your data'
		}
	},
	chartConfig: {
		title: 'Chart Data Configuration',
		sourceTitle: 'Data Source',
		sourceDesc: 'Select the property that will serve as the X-axis for the chart.',
		xAxis: 'X-Axis',
		seriesTitle: 'Data Series',
		seriesDesc: 'Configure the metrics and data series to display on the chart.',
		addSeries: 'Add New Series',
		seriesLabel: 'Series Label',
		noSeries: 'No series defined',
		noSeriesDesc: 'Add a new series below to get started.',
		changeColor: 'Change color',
		showSeries: 'Show series',
		hideSeries: 'Hide series',
		removeSeries: 'Remove series'
	},
	map: {
		searchPlaceholder: 'Search for an address...',
		noAddressSelected: 'No address selected',
		noResults: 'No results found'
	},
	options: {
		expandWithContent: 'Expand with content',
		alignLeft: 'Align Left',
		alignCenter: 'Align Center',
		alignRight: 'Align Right',
		fitContain: 'Set image fit to contain',
		fitCover: 'Set image fit to cover',
		fitFill: 'Set image fit to fill',
		mapReadOnly: 'Toggle Read-only',
		mapSearchbar: 'Toggle Searchbar',
		mapGlobe: 'Toggle Globe Button',
		mapZoom: 'Toggle Zoom Buttons',
		mapCurrentPosition: 'Toggle Current Position Button',
		mapDraggableMarker: 'Toggle Draggable Marker',
		chartDataConfig: 'Data Configuration',
		chartBar: 'Bar Chart',
		chartLine: 'Line Chart',
		chartArea: 'Area Chart',
		chartPie: 'Pie Chart',
		chartArc: 'Arc Chart',
		tableAddRow: 'Add row',
		tableAddColumn: 'Add column',
		tableBorders: 'Toggle Borders'
	},
	errors: {
		componentError: 'Component Error',
		unknownComponent: 'Unknown component type "{type}". This page does not register it.',
		tableConfigMissing: 'Table component is missing configuration',
		latexUnrecognised: 'Unrecognised LaTeX expression',
		latexEmpty: 'Set a LaTeX expression',
		imageLoadError: 'Image failed to load',
		imageEmpty: 'Set an image URL',
		chartMissingData: 'Chart component is missing configuration or data',
		chartMissingXAxis: 'Missing X-Axis',
		chartMissingXAxisDesc: 'Please configure the X-axis in the chart settings.',
		chartNoSeries: 'No Series Defined',
		chartNoSeriesDesc: 'Add at least one data series to visualize the chart.',
		unsupportedValueType: 'Unsupported value type: {type}',
		unsupportedBindingType: 'Unsupported binding value type: {type}',
		invalidMapValue: 'Invalid value for the map component',
		invalidSlotContent: 'Slot "{slot}" must hold components, keyed by their ids'
	}
};

