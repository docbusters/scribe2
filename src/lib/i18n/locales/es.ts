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
		textPlaceholder: 'Escribe un texto...',
		value: 'Valor',
		add: 'Añadir',
		unavailable: 'No disponible',
		showPassword: 'Mostrar contraseña',
		hidePassword: 'Ocultar contraseña',
		newText: 'Texto nuevo'
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
		deleteInUse: 'En uso en {count} componente(s). ¿Eliminar igualmente?',
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
		setValue: 'Asignar valor',
		addLabel: 'Añadir',
		duplicateLabel: 'Duplicar',
		deleteLabel: 'Eliminar',
		setValueLabel: 'Valor'
	},
	sections: {
		defaultTitle: 'Nueva sección',
		addFirstSection: 'Añadir primera sección',
		addBelow: 'Añadir sección debajo',
		duplicate: 'Duplicar sección',
		delete: 'Eliminar sección'
	},
	emptyContent: {
		setValue: 'Establecer valor',
		changeValue: 'Cambiar valor'
	},
	editor: {
		emptySectionPlaceholder: 'Empieza a escribir o pulsa Ctrl + Espacio para añadir un componente',
		resizeHeight: 'Cambiar la altura',
		printDocument: 'Imprimir documento (depuración)'
	},
	componentToolbar: {
		pressEnter: 'Presiona ENTER para añadir'
	},
	topToolbar: {
		groups: {
			component: 'Componente',
			data: 'Datos',
			alignment: 'Alineación',
			fit: 'Ajuste',
			controls: 'Controles',
			layout: 'Diseño',
			chartType: 'Tipo de gráfico',
			format: 'Formato',
			options: 'Opciones'
		},
		configureLabel: 'Configurar',
		ariaLabel: 'Barra de herramientas del componente'
	},
	textFormat: {
		bold: 'Negrita',
		italic: 'Cursiva',
		underline: 'Subrayado',
		strikethrough: 'Tachado'
	},
	shortcuts: {
		keys: {
			ctrl: 'Ctrl',
			alt: 'Alt',
			shift: 'Mayús',
			space: 'Espacio',
			delete: 'Supr',
			backspace: 'Retroceso',
			enter: 'Intro',
			escape: 'Esc',
			tab: 'Tab'
		}
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
	chartConfig: {
		title: 'Configuración de datos del gráfico',
		sourceTitle: 'Origen de datos',
		sourceDesc: 'Selecciona la propiedad que se usará como eje X del gráfico.',
		xAxis: 'Eje X',
		seriesTitle: 'Series de datos',
		seriesDesc: 'Configura las métricas y series de datos que se mostrarán en el gráfico.',
		addSeries: 'Añadir nueva serie',
		seriesLabel: 'Nombre de la serie',
		noSeries: 'No hay series definidas',
		noSeriesDesc: 'Añade una nueva serie abajo para empezar.',
		changeColor: 'Cambiar color',
		showSeries: 'Mostrar serie',
		hideSeries: 'Ocultar serie',
		removeSeries: 'Eliminar serie'
	},
	map: {
		searchPlaceholder: 'Buscar una dirección...',
		noAddressSelected: 'Ninguna dirección seleccionada',
		noResults: 'No se encontraron resultados'
	},
	options: {
		expandWithContent: 'Expandir con el contenido',
		alignLeft: 'Alinear a la izquierda',
		alignCenter: 'Alinear al centro',
		alignRight: 'Alinear a la derecha',
		fitContain: 'Ajustar la imagen para que quepa entera',
		fitCover: 'Ajustar la imagen para cubrir el espacio',
		fitFill: 'Ajustar la imagen para rellenar el espacio',
		mapReadOnly: 'Activar o desactivar solo lectura',
		mapSearchbar: 'Mostrar u ocultar la barra de búsqueda',
		mapGlobe: 'Mostrar u ocultar el botón de globo',
		mapZoom: 'Mostrar u ocultar los botones de zoom',
		mapCurrentPosition: 'Mostrar u ocultar el botón de posición actual',
		mapDraggableMarker: 'Activar o desactivar el marcador arrastrable',
		chartDataConfig: 'Configuración de datos',
		chartBar: 'Gráfico de barras',
		chartLine: 'Gráfico de líneas',
		chartArea: 'Gráfico de áreas',
		chartPie: 'Gráfico circular',
		chartArc: 'Gráfico de arcos'
	},
	errors: {
		componentError: 'Error del componente',
		unknownComponent: 'Tipo de componente desconocido "{type}". Esta página no lo registra.',
		tableConfigMissing: 'El componente de tabla no tiene configuración',
		latexUnrecognised: 'Expresión LaTeX no reconocida',
		latexEmpty: 'Introduce una expresión LaTeX',
		imageLoadError: 'Error al cargar la imagen',
		imageEmpty: 'Introduce la URL de una imagen',
		chartMissingData: 'El componente de gráfico no tiene configuración o datos',
		chartMissingXAxis: 'Falta el eje X',
		chartMissingXAxisDesc: 'Por favor, configura el eje X en los ajustes del gráfico.',
		chartNoSeries: 'No hay series definidas',
		chartNoSeriesDesc: 'Añade al menos una serie de datos para visualizar el gráfico.',
		unsupportedValueType: 'Tipo de valor no admitido: {type}',
		unsupportedBindingType: 'Tipo de valor de variable no admitido: {type}',
		invalidMapValue: 'Valor no válido para el componente de mapa',
		tableCellNotComponent: 'La celda {cell} de la tabla debe ser un componente'
	}
};

