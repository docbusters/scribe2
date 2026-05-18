export function navigateToAdjacentComponent(
    currentElement: HTMLElement,
    direction: 'up' | 'down'
): boolean {
    // Use a data attribute to identify focusable components in the editor
    const focusableElements = Array.from(
        document.querySelectorAll('[data-scribe-focusable]')
    ) as HTMLElement[];

    const currentIndex = focusableElements.indexOf(currentElement);
    if (currentIndex === -1) return false;

    const step = direction === 'down' ? 1 : -1;
    const nextIndex = currentIndex + step;

    // Tries to move focus to a component that accepts it
    while (nextIndex >= 0 && nextIndex < focusableElements.length) {
        const targetElement = focusableElements[nextIndex];
        
        // Trigger a custom event depending on the direction
        const eventName = direction === 'down' ? 'scribe-focus-start' : 'scribe-focus-end';
        
        const event = new CustomEvent(eventName, { 
            cancelable: true,
            bubbles: false
        });

        const eventWasCanceled = !targetElement.dispatchEvent(event);
        
        // If the event was canceled, it means the element handled the focus internally
        if (eventWasCanceled) {
            return true;
        }

        // If the event wasn't canceled, we can try to focus the element directly
        targetElement.focus();
        return true;
    }

    return false;
}

