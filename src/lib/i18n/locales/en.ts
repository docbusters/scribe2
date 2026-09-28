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
		textPlaceholder: 'Enter text...'
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
		setValue: 'Set value'
	}
};
