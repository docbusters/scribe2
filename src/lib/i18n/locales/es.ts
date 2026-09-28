import type { Translations } from '../types.js';

export const es: Translations = {
	common: {
		cancel: 'Cancelar',
		apply: 'Aplicar cambios',
		save: 'Guardar',
		delete: 'Eliminar',
		close: 'Cerrar',
		empty: '(vacío)',
		loading: 'Cargando...',
		addItem: 'Añadir elemento',
		itemIndex: 'Elemento #{index}',
		removeItem: 'Eliminar elemento',
		incompatible: 'No compatible',
		true: 'Sí',
		false: 'No',
		textPlaceholder: 'Escribe un texto...'
	},
	types: {
		string: 'Texto',
		stringDesc: 'Valor de texto fijo',
		number: 'Número',
		numberDesc: 'Valor numérico',
		boolean: 'Interruptor',
		booleanDesc: 'Activador Sí / No',
		array: 'Lista',
		arrayDesc: 'Colección de elementos',
		record: 'Grupo de datos',
		recordDesc: 'Conjunto de campos',
		date: 'Fecha',
		dateDesc: 'Fecha del calendario',
		empty: 'Vacío',
		emptyDesc: 'Sin valor asignado',
		binding: 'Variable',
		bindingDefault: 'Variable del documento',
		bindingDefaultDesc: 'Valor procedente de este documento',
		bindingCustom: 'Variable externa',
		bindingCustomDesc: 'Origen de datos externo conectado'
	},
	valueSelector: {
		typeTitle: 'Tipo de valor',
		typeDesc: 'Elige si esta propiedad usa un valor fijo o una variable dinámica',
		configTitle: 'Ajustes de contenido',
		configDesc: 'Configura el contenido o vincula a una variable dinámica'
	},
	bindingSelector: {
		searchPlaceholder: 'Buscar variables por nombre o valor...',
		clearSearch: 'Limpiar búsqueda',
		noMatchTitle: 'No se encontraron variables',
		noMatchSubtitle: 'Intenta buscar con otra palabra clave',
		emptyTitle: 'No hay variables disponibles',
		emptySubtitleComponent: 'No hay variables compatibles con este componente',
		emptySubtitleDocument: 'Crea variables en el documento para seleccionarlas aquí',
		incompatibleTooltip: 'Tipo de dato no compatible con este componente'
	},
	bindingsPanel: {
		title: 'Variables',
		expandTooltip: 'Abrir Variables',
		collapseTooltip: 'Plegar panel',
		filterPlaceholder: 'Filtrar variables...',
		newVariable: 'Nueva variable',
		noBindings: 'Aún no hay variables en el documento',
		noFilterResults: 'No se encontraron variables para "{query}"',
		deleteTooltip: 'Eliminar variable',
		deleteConfirm: '¿Eliminar variable?',
		confirm: 'Confirmar'
	},
	addBinding: {
		title: 'Nueva Variable',
		nameLabel: 'Nombre de la variable',
		namePlaceholder: 'Nombre de la variable',
		typeLabel: 'Tipo de dato',
		create: 'Crear',
		errorRequired: 'El nombre de la variable es obligatorio',
		errorFormat: 'El nombre solo puede contener letras, números, guiones y guiones bajos',
		errorExists: 'La variable "{name}" ya existe'
	},
	bindingComplex: {
		title: 'Configurar Variable: {id}',
		desc: 'Configura los elementos y propiedades de la variable "{id}"',
		emptyList: 'Lista vacía',
		emptyGroup: 'Grupo de datos vacío',
		editElements: 'Editar elementos',
		itemCountOne: '{count} elemento',
		itemCountMany: '{count} elementos',
		fieldCountOne: '{count} campo',
		fieldCountMany: '{count} campos',
		componentDefault: 'Componente'
	},
	toolbar: {
		add: 'Añadir componente',
		duplicate: 'Duplicar componente',
		delete: 'Eliminar componente',
		setValue: 'Asignar valor'
	},
	sections: {
		defaultTitle: 'Nueva sección',
		addFirstSection: 'Añadir primera sección',
		addBelow: 'Añadir sección debajo',
		duplicate: 'Duplicar sección',
		delete: 'Eliminar sección'
	},
	editor: {
		insertComponentPlaceholder: 'Presiona Ctrl + Espacio para añadir un componente...'
	},
	componentToolbar: {
		pressEnter: 'Presiona ENTER para añadir'
	},
	components: {
		'text-binding': {
			name: 'Texto Vinculado',
			description: 'Texto que se puede vincular a una variable'
		},
		text: {
			name: 'Texto',
			description: 'Tan simple como parece'
		},
		'text-input': {
			name: 'Entrada de texto',
			description: 'Permite introducir texto'
		},
		image: {
			name: 'Imagen',
			description: 'Muestra imágenes en línea'
		},
		latex: {
			name: 'LaTeX',
			description: 'Renderiza fórmulas matemáticas en LaTeX'
		},
		table: {
			name: 'Tabla',
			description: 'Crea tablas para organizar tu contenido'
		},
		map: {
			name: 'Mapa',
			description: 'Crea mapas interactivos'
		},
		chart: {
			name: 'Gráfico',
			description: 'Crea gráficos para visualizar datos'
		}
	},
	errors: {
		componentError: 'Error del componente',
		tableConfigMissing: 'El componente de tabla no tiene configuración',
		latexUnrecognised: 'Expresión LaTeX no reconocida',
		latexEmpty: 'Introduce una expresión LaTeX',
		imageLoadError: 'Error al cargar la imagen',
		imageEmpty: 'Introduce la URL de una imagen',
		chartMissingData: 'El componente de gráfico no tiene configuración o datos',
		chartMissingXAxis: 'Falta el eje X',
		chartMissingXAxisDesc: 'Por favor, configura el eje X en los ajustes del gráfico.',
		chartNoSeries: 'No hay series definidas',
		chartNoSeriesDesc: 'Añade al menos una serie de datos para visualizar el gráfico.'
	}
};

