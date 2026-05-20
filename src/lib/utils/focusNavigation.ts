export function navigateToAdjacentComponent(
    currentElement: HTMLElement,
    direction: 'up' | 'down' | 'left' | 'right'
): boolean {
    // Find the focusable elements in the same root (document or shadow root)
    const rootNode = currentElement.getRootNode() as Document | ShadowRoot;
    const focusableElements = Array.from(
        rootNode.querySelectorAll('[data-scribe-focusable]')
    ) as HTMLElement[];

    const currentIndex = focusableElements.indexOf(currentElement);
    if (currentIndex === -1) return false;

    // For Left and Right directions, we ALWAYS navigate using linear DOM flow order
    if (direction === 'left' || direction === 'right') {
        const step = direction === 'right' ? 1 : -1;
        const nextIndex = currentIndex + step;
        if (nextIndex >= 0 && nextIndex < focusableElements.length) {
            const targetElement = focusableElements[nextIndex];
            const eventName = direction === 'right' ? 'scribe-focus-start' : 'scribe-focus-end';
            const event = new CustomEvent(eventName, { 
                cancelable: true,
                bubbles: false
            });
            const eventWasCanceled = !targetElement.dispatchEvent(event);
            if (eventWasCanceled) return true;
            targetElement.focus();
            return true;
        }
        return false;
    }

    // For Up and Down, we try to find the closest element in the given direction based on geometry first
    const currentRect = currentElement.getBoundingClientRect();
    const currentY = currentRect.top + currentRect.height / 2;
    
    // Determine caret horizontal position if possible to align vertical focus
    let currentX = currentRect.left + currentRect.width / 2;
    const selection = ('getSelection' in rootNode) ? (rootNode as Document).getSelection() : window.getSelection();
    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rangeRect = range.getBoundingClientRect();
        if (rangeRect && rangeRect.left > 0) {
            currentX = rangeRect.left;
        }
    }

    // Filter candidates based on geometry
    const candidates = focusableElements.filter(el => {
        if (el === currentElement) return false;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false; // Ignore invisible elements
        
        if (direction === 'up') {
            // Must end above or start above current element
            return rect.top < currentRect.top - 2 || rect.bottom <= currentRect.top + 10;
        } else {
            // Must start below or end below current element
            return rect.bottom > currentRect.bottom + 2 || rect.top >= currentRect.bottom - 10;
        }
    });

    // Score candidates based on weighted 2D distance
    const scoredCandidates = candidates.map(el => {
        const rect = el.getBoundingClientRect();
        const elY = rect.top + rect.height / 2;
        
        // Calculate horizontal distance (dx) to bounding box
        let dx = 0;
        if (currentX < rect.left) {
            dx = rect.left - currentX;
        } else if (currentX > rect.right) {
            dx = currentX - rect.right;
        }
        
        // Calculate vertical distance (dy) to bounding box
        let dy;
        if (direction === 'up') {
            dy = currentRect.top - rect.bottom;
            if (dy < 0) {
                dy = Math.abs(currentY - elY);
            }
        } else {
            dy = rect.top - currentRect.bottom;
            if (dy < 0) {
                dy = Math.abs(elY - currentY);
            }
        }
        
        const score = dx * dx * 3 + dy * dy; // Penalize horizontal offset
        
        return { el, score };
    }).sort((a, b) => a.score - b.score);

    // Try to focus the closest geometric candidate
    for (const candidate of scoredCandidates) {
        const targetElement = candidate.el;
        const eventName = direction === 'down' ? 'scribe-focus-start' : 'scribe-focus-end';
        const event = new CustomEvent(eventName, { 
            cancelable: true,
            bubbles: false
        });

        const eventWasCanceled = !targetElement.dispatchEvent(event);
        if (eventWasCanceled) {
            return true;
        }

        targetElement.focus();
        return true;
    }

    // Fallback: Use standard linear DOM order (same as Left/Right) if no geometric candidate was found
    const step = direction === 'down' ? 1 : -1;
    const nextIndex = currentIndex + step;

    if (nextIndex >= 0 && nextIndex < focusableElements.length) {
        const targetElement = focusableElements[nextIndex];
        const eventName = direction === 'down' ? 'scribe-focus-start' : 'scribe-focus-end';
        const event = new CustomEvent(eventName, { 
            cancelable: true,
            bubbles: false
        });

        const eventWasCanceled = !targetElement.dispatchEvent(event);
        if (eventWasCanceled) {
            return true;
        }

        targetElement.focus();
        return true;
    }

    return false;
}
