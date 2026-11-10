
export interface EmptyContentProps {
    message: string;
    description?: string;
    icon?: string;
    isError?: boolean;
    valueStyle?: string;
    style?: string;
    /** A button drawn right below the message, to do something about the state it describes */
    action?: EmptyContentAction;
}

export interface EmptyContentAction {
    label: string;
    onclick: () => void;
}
