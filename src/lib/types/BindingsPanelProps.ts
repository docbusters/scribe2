export interface BindingsPanelProps {
	class?: string;
	style?: string;
	/** If true, panel floats in the top-right corner. If false, fits naturally into its parent container. Defaults to false. */
	floating?: boolean;
	/** Bindable state indicating whether the panel is expanded */
	isExpanded?: boolean;
	/** Whether the user can collapse the panel into a chip */
	collapsible?: boolean;
	/** Optional language override ('en' | 'es') when used outside Scribe */
	lang?: 'en' | 'es' | string;
}
