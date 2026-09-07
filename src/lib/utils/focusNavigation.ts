export interface FocusNavigationDetail {
    direction: 'up' | 'down' | 'left' | 'right';
    x?: number;
    y?: number;
}

/**
 * Calculates the horizontal caret coordinate in pixels inside an input or textarea
 * using canvas text measurement.
 */
function getInputCaretX(input: HTMLInputElement | HTMLTextAreaElement): number {
    const rect = input.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(input);
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0;
    const font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return rect.left + paddingLeft + borderLeft;
    ctx.font = font;

    const selStart = input.selectionStart ?? input.value.length;
    const textUpToCaret = input.value.substring(0, selStart);
    const measuredWidth = ctx.measureText(textUpToCaret).width;

    return rect.left + paddingLeft + borderLeft + measuredWidth - input.scrollLeft;
}

/**
 * Finds the character index in an input or textarea that is closest to targetX.
 */
function getInputIndexFromX(input: HTMLInputElement | HTMLTextAreaElement, targetX: number): number {
    const rect = input.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(input);
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0;
    const clickX = targetX - (rect.left + paddingLeft + borderLeft) + input.scrollLeft;

    if (clickX <= 0) return 0;

    const font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return input.value.length;
    ctx.font = font;

    const text = input.value;
    let bestIndex = text.length;
    let minDiff = Infinity;

    for (let i = 0; i <= text.length; i++) {
        const width = ctx.measureText(text.substring(0, i)).width;
        const diff = Math.abs(width - clickX);
        if (diff < minDiff) {
            minDiff = diff;
            bestIndex = i;
        }
    }
    return bestIndex;
}

/**
 * Retrieves the current caret position coordinates and bounding lines.
 */
export function getCaretCoordinates(element: HTMLElement): { x: number; top: number; bottom: number; y: number } {
    const rect = element.getBoundingClientRect();
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        const x = getInputCaretX(element);
        return {
            x,
            top: rect.top,
            bottom: rect.bottom,
            y: rect.top + rect.height / 2
        };
    }

    const rootNode = element.getRootNode() as Document | ShadowRoot;
    const selection = ('getSelection' in rootNode) ? (rootNode as Document).getSelection() : window.getSelection();
    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let rangeRect = range.getBoundingClientRect();
        if ((rangeRect.width === 0 && rangeRect.height === 0) || rangeRect.top === 0) {
            const clientRects = range.getClientRects();
            if (clientRects.length > 0) {
                rangeRect = clientRects[0];
            }
        }
        if (rangeRect && rangeRect.height > 0) {
            return {
                x: rangeRect.left,
                top: rangeRect.top,
                bottom: rangeRect.bottom,
                y: rangeRect.top + rangeRect.height / 2
            };
        }
    }

    return {
        x: rect.left + rect.width / 2,
        top: rect.top,
        bottom: rect.bottom,
        y: rect.top + rect.height / 2
    };
}

/**
 * Checks whether the selection in the element is at the start.
 */
export function isAtStart(element: HTMLElement): boolean {
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        return element.selectionStart === 0 && element.selectionEnd === 0;
    }
    const rootNode = element.getRootNode() as Document | ShadowRoot;
    const selection = ('getSelection' in rootNode) ? (rootNode as Document).getSelection() : window.getSelection();
    if (!selection || selection.rangeCount === 0) return true;
    const range = selection.getRangeAt(0);
    const preRange = range.cloneRange();
    preRange.selectNodeContents(element);
    preRange.setEnd(range.startContainer, range.startOffset);
    return preRange.toString().length === 0;
}

/**
 * Checks whether the selection in the element is at the end.
 */
export function isAtEnd(element: HTMLElement): boolean {
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        return element.selectionStart === element.value.length && element.selectionEnd === element.value.length;
    }
    const rootNode = element.getRootNode() as Document | ShadowRoot;
    const selection = ('getSelection' in rootNode) ? (rootNode as Document).getSelection() : window.getSelection();
    if (!selection || selection.rangeCount === 0) return true;
    const range = selection.getRangeAt(0);
    const postRange = range.cloneRange();
    postRange.selectNodeContents(element);
    postRange.setStart(range.endContainer, range.endOffset);
    return postRange.toString().length === 0;
}

/**
 * Checks whether the caret is on the first visual line of the element.
 */
export function isAtFirstLine(element: HTMLElement): boolean {
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        return true;
    }
    if (isAtStart(element)) return true;

    const rootNode = element.getRootNode() as Document | ShadowRoot;
    const selection = ('getSelection' in rootNode) ? (rootNode as Document).getSelection() : window.getSelection();
    if (!selection || selection.rangeCount === 0) return true;

    const range = selection.getRangeAt(0);
    let caretRect = range.getBoundingClientRect();
    if (caretRect.height === 0) {
        const clientRects = range.getClientRects();
        if (clientRects.length > 0) caretRect = clientRects[0];
    }
    if (caretRect.height === 0 || caretRect.top === 0) return true;

    const elRect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const lineHeight = parseFloat(style.lineHeight) || caretRect.height || 20;

    return (caretRect.top - (elRect.top + paddingTop)) < lineHeight * 0.9;
}

/**
 * Checks whether the caret is on the last visual line of the element.
 */
export function isAtLastLine(element: HTMLElement): boolean {
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        return true;
    }
    if (isAtEnd(element)) return true;

    const rootNode = element.getRootNode() as Document | ShadowRoot;
    const selection = ('getSelection' in rootNode) ? (rootNode as Document).getSelection() : window.getSelection();
    if (!selection || selection.rangeCount === 0) return true;

    const range = selection.getRangeAt(0);
    let caretRect = range.getBoundingClientRect();
    if (caretRect.height === 0) {
        const clientRects = range.getClientRects();
        if (clientRects.length > 0) caretRect = clientRects[0];
    }
    if (caretRect.height === 0 || caretRect.bottom === 0) return true;

    const elRect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const paddingBottom = parseFloat(style.paddingBottom) || 0;
    const lineHeight = parseFloat(style.lineHeight) || caretRect.height || 20;

    return ((elRect.bottom - paddingBottom) - caretRect.bottom) < lineHeight * 0.9;
}

/**
 * Gets the relevant line box for an element at targetX in the specified direction.
 * For multi-line inline elements, selects the line box covering targetX.
 */
function getRelevantRect(
    element: HTMLElement,
    targetX: number,
    direction: 'up' | 'down'
): { top: number; bottom: number; left: number; right: number; height: number; width: number } {
    const clientRects = Array.from(element.getClientRects());
    if (clientRects.length <= 1) {
        return element.getBoundingClientRect();
    }

    // Filter rects that cover targetX (with a small margin)
    const coveringRects = clientRects.filter(r => targetX >= r.left - 4 && targetX <= r.right + 4);
    const candidateList = coveringRects.length > 0 ? coveringRects : clientRects;

    if (direction === 'down') {
        let topMost = candidateList[0];
        for (let i = 1; i < candidateList.length; i++) {
            if (candidateList[i].top < topMost.top) {
                topMost = candidateList[i];
            }
        }
        return topMost;
    } else {
        let bottomMost = candidateList[0];
        for (let i = 1; i < candidateList.length; i++) {
            if (candidateList[i].bottom > bottomMost.bottom) {
                bottomMost = candidateList[i];
            }
        }
        return bottomMost;
    }
}

/**
 * Checks whether the element has another visual line in the given direction
 * that covers the current horizontal coordinate (caretX).
 */
export function canMoveVerticallyWithinElement(
    element: HTMLElement,
    direction: 'up' | 'down',
    caretX: number,
    caretTop: number,
    caretBottom: number
): boolean {
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        return false;
    }

    const clientRects = Array.from(element.getClientRects());
    if (clientRects.length <= 1) {
        return false;
    }

    const caretLineCenter = (caretTop + caretBottom) / 2;

    if (direction === 'down') {
        const linesBelow = clientRects.filter(r => {
            const rCenter = (r.top + r.bottom) / 2;
            return rCenter - caretLineCenter >= 10;
        });

        if (linesBelow.length === 0) return false;

        let closestLine = linesBelow[0];
        let minDy = (closestLine.top + closestLine.bottom) / 2 - caretLineCenter;

        for (let i = 1; i < linesBelow.length; i++) {
            const dy = (linesBelow[i].top + linesBelow[i].bottom) / 2 - caretLineCenter;
            if (dy < minDy) {
                minDy = dy;
                closestLine = linesBelow[i];
            }
        }

        return caretX >= closestLine.left - 4 && caretX <= closestLine.right + 4;
    } else {
        const linesAbove = clientRects.filter(r => {
            const rCenter = (r.top + r.bottom) / 2;
            return caretLineCenter - rCenter >= 10;
        });

        if (linesAbove.length === 0) return false;

        let closestLine = linesAbove[0];
        let minDy = caretLineCenter - (closestLine.top + closestLine.bottom) / 2;

        for (let i = 1; i < linesAbove.length; i++) {
            const dy = caretLineCenter - (linesAbove[i].top + linesAbove[i].bottom) / 2;
            if (dy < minDy) {
                minDy = dy;
                closestLine = linesAbove[i];
            }
        }

        return caretX >= closestLine.left - 4 && caretX <= closestLine.right + 4;
    }
}

/**
 * Sets the caret position in the target element based on direction and horizontal coordinate.
 */
export function setCaretPosition(
    targetElement: HTMLElement,
    options: {
        direction?: 'up' | 'down' | 'left' | 'right';
        x?: number;
        y?: number;
    }
): void {
    targetElement.focus();

    if (targetElement instanceof HTMLInputElement || targetElement instanceof HTMLTextAreaElement) {
        if (options.direction === 'left') {
            targetElement.setSelectionRange(targetElement.value.length, targetElement.value.length);
        } else if (options.direction === 'right') {
            targetElement.setSelectionRange(0, 0);
        } else if (options.x !== undefined) {
            const index = getInputIndexFromX(targetElement, options.x);
            targetElement.setSelectionRange(index, index);
        } else if (options.direction === 'up') {
            targetElement.setSelectionRange(targetElement.value.length, targetElement.value.length);
        } else {
            targetElement.setSelectionRange(0, 0);
        }
        return;
    }

    const rootNode = targetElement.getRootNode() as Document | ShadowRoot;
    const selection = ('getSelection' in rootNode) ? (rootNode as Document).getSelection() : window.getSelection();
    if (!selection) return;

    if (options.direction === 'left') {
        const range = document.createRange();
        range.selectNodeContents(targetElement);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
    }

    if (options.direction === 'right') {
        const range = document.createRange();
        range.setStart(targetElement, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
    }

    if (options.x !== undefined) {
        const targetRect = options.direction === 'down' || options.direction === 'up'
            ? getRelevantRect(targetElement, options.x, options.direction)
            : targetElement.getBoundingClientRect();
        const clampedX = Math.max(targetRect.left + 2, Math.min(targetRect.right - 2, options.x));
        const targetY = (targetRect.top + targetRect.bottom) / 2;

        const doc = targetElement.ownerDocument || document;
        let range: Range | null = null;

        const docWithLegacyRange = doc as Document & {
            caretRangeFromPoint?: (x: number, y: number) => Range | null;
        };

        if (docWithLegacyRange.caretRangeFromPoint) {
            range = docWithLegacyRange.caretRangeFromPoint(clampedX, targetY);
        } else if ('caretPositionFromPoint' in doc && typeof doc.caretPositionFromPoint === 'function') {
            const pos = doc.caretPositionFromPoint(clampedX, targetY);
            if (pos) {
                range = doc.createRange();
                range.setStart(pos.offsetNode, pos.offset);
                range.collapse(true);
            }
        }

        if (range && targetElement.contains(range.startContainer)) {
            selection.removeAllRanges();
            selection.addRange(range);
            return;
        }
    }

    const range = document.createRange();
    if (options.direction === 'up') {
        range.selectNodeContents(targetElement);
        range.collapse(false);
    } else {
        range.setStart(targetElement, 0);
        range.collapse(true);
    }
    selection.removeAllRanges();
    selection.addRange(range);
}

/**
 * Sets up standard scribe focus event listeners on an element.
 */
export function setupFocusListeners(element: HTMLElement): () => void {
    const onFocus = (e: Event) => {
        const customEvent = e as CustomEvent<FocusNavigationDetail>;
        e.preventDefault();
        setCaretPosition(element, customEvent.detail || {});
    };

    element.addEventListener('scribe-focus-start', onFocus);
    element.addEventListener('scribe-focus-end', onFocus);

    return () => {
        element.removeEventListener('scribe-focus-start', onFocus);
        element.removeEventListener('scribe-focus-end', onFocus);
    };
}

/**
 * Handles arrow key navigation on keydown event.
 * Returns true if navigation was executed (and event was prevented), false otherwise.
 */
export function handleArrowNavigation(event: KeyboardEvent, element: HTMLElement): boolean {
    switch (event.key) {
        case 'ArrowLeft': {
            if (isAtStart(element)) {
                event.preventDefault();
                return navigateToAdjacentComponent(element, 'left');
            }
            break;
        }
        case 'ArrowRight': {
            if (isAtEnd(element)) {
                event.preventDefault();
                return navigateToAdjacentComponent(element, 'right');
            }
            break;
        }
        case 'ArrowUp': {
            const caret = getCaretCoordinates(element);
            const canMoveUp = canMoveVerticallyWithinElement(element, 'up', caret.x, caret.top, caret.bottom);
            if (!canMoveUp || isAtFirstLine(element)) {
                event.preventDefault();
                return navigateToAdjacentComponent(element, 'up');
            }
            break;
        }
        case 'ArrowDown': {
            const caret = getCaretCoordinates(element);
            const canMoveDown = canMoveVerticallyWithinElement(element, 'down', caret.x, caret.top, caret.bottom);
            if (!canMoveDown || isAtLastLine(element)) {
                event.preventDefault();
                return navigateToAdjacentComponent(element, 'down');
            }
            break;
        }
    }
    return false;
}

export function navigateToAdjacentComponent(
    currentElement: HTMLElement,
    direction: 'up' | 'down' | 'left' | 'right'
): boolean {
    const rootNode = currentElement.getRootNode() as Document | ShadowRoot;
    const focusableElements = Array.from(
        rootNode.querySelectorAll('[data-scribe-focusable]')
    ) as HTMLElement[];

    const currentIndex = focusableElements.indexOf(currentElement);
    if (currentIndex === -1) return false;

    // For Left and Right directions, use linear DOM flow order
    if (direction === 'left' || direction === 'right') {
        const step = direction === 'right' ? 1 : -1;
        const nextIndex = currentIndex + step;
        if (nextIndex >= 0 && nextIndex < focusableElements.length) {
            const targetElement = focusableElements[nextIndex];
            const eventName = direction === 'right' ? 'scribe-focus-start' : 'scribe-focus-end';
            const detail: FocusNavigationDetail = { direction };
            const event = new CustomEvent(eventName, { 
                detail,
                cancelable: true,
                bubbles: false
            });
            const eventWasCanceled = !targetElement.dispatchEvent(event);
            if (eventWasCanceled) return true;
            setCaretPosition(targetElement, detail);
            return true;
        }
        return false;
    }

    // For Up and Down, find the closest geometric candidate on another line
    const caret = getCaretCoordinates(currentElement);
    const currentX = caret.x;
    const currentLineTop = caret.top;
    const currentLineBottom = caret.bottom;
    const currentLineCenter = caret.y;

    // Filter candidates strictly above or below the current visual line
    const candidates = focusableElements.filter(el => {
        if (el === currentElement) return false;
        const rect = getRelevantRect(el, currentX, direction);
        if (rect.width === 0 || rect.height === 0) return false; // Ignore invisible elements

        const candidateCenter = (rect.top + rect.bottom) / 2;
        const dyCenter = candidateCenter - currentLineCenter;

        // Check if the candidate's relevant line is on the same visual line
        // (centers aligned within 12px and vertical overlap > 50% of the shorter element)
        const overlapTop = Math.max(rect.top, currentLineTop);
        const overlapBottom = Math.min(rect.bottom, currentLineBottom);
        const verticalOverlap = Math.max(0, overlapBottom - overlapTop);
        const minHeight = Math.min(rect.height, currentLineBottom - currentLineTop);

        const isSameLine = Math.abs(dyCenter) < 12 && (minHeight > 0 && verticalOverlap / minHeight > 0.5);
        if (isSameLine) {
            return false;
        }

        if (direction === 'up') {
            // Must be distinctly above the current line
            return dyCenter <= -12 && rect.top < currentLineTop - 4 && rect.bottom <= currentLineBottom;
        } else {
            // Must be distinctly below the current line
            return dyCenter >= 12 && rect.bottom > currentLineBottom + 4 && rect.top >= currentLineTop;
        }
    });

    // Score candidates based on vertical distance to the line followed by horizontal offset
    const scoredCandidates = candidates.map(el => {
        const rect = getRelevantRect(el, currentX, direction);
        const candidateCenter = (rect.top + rect.bottom) / 2;

        let dx = 0;
        if (currentX < rect.left) {
            dx = rect.left - currentX;
        } else if (currentX > rect.right) {
            dx = currentX - rect.right;
        }

        const verticalDist = direction === 'up'
            ? Math.max(0, currentLineCenter - candidateCenter)
            : Math.max(0, candidateCenter - currentLineCenter);

        // Prioritize the nearest line vertically, then horizontal proximity
        const score = verticalDist * 100 + dx;

        return { el, score };
    }).sort((a, b) => a.score - b.score);

    // Try to focus the closest geometric candidate
    for (const candidate of scoredCandidates) {
        const targetElement = candidate.el;
        const eventName = direction === 'down' ? 'scribe-focus-start' : 'scribe-focus-end';
        const detail: FocusNavigationDetail = {
            direction,
            x: currentX,
            y: direction === 'down' ? currentLineBottom : currentLineTop
        };
        const event = new CustomEvent(eventName, { 
            detail,
            cancelable: true,
            bubbles: false
        });

        const eventWasCanceled = !targetElement.dispatchEvent(event);
        if (eventWasCanceled) {
            return true;
        }

        setCaretPosition(targetElement, detail);
        return true;
    }

    // Do NOT fall back to horizontal DOM neighbors when navigating vertically!
    return false;
}

