import { getSelection } from './selection.js';

export interface FocusNavigationDetail {
    direction: 'up' | 'down' | 'left' | 'right';
    x?: number;
    y?: number;
}

type TextField = HTMLInputElement | HTMLTextAreaElement;

function isTextField(element: HTMLElement): element is TextField {
    return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
}

/** Lazily created canvas context shared by all text measurements */
let measureContext: CanvasRenderingContext2D | null | undefined;

function getMeasureContext(): CanvasRenderingContext2D | null {
    if (measureContext === undefined) {
        measureContext = document.createElement('canvas').getContext('2d');
    }
    return measureContext;
}

/**
 * Returns the metrics needed to measure text inside an input: the horizontal offset where the
 * text starts (relative to the viewport) and the canvas font matching the input's computed style.
 */
function getInputTextMetrics(input: TextField): { textLeft: number; font: string } {
    const rect = input.getBoundingClientRect();
    const style = window.getComputedStyle(input);
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const borderLeft = parseFloat(style.borderLeftWidth) || 0;
    return {
        textLeft: rect.left + paddingLeft + borderLeft,
        font: `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
    };
}

/**
 * Calculates the horizontal caret coordinate in pixels inside an input or textarea
 * using canvas text measurement.
 */
function getInputCaretX(input: TextField): number {
    const { textLeft, font } = getInputTextMetrics(input);
    const ctx = getMeasureContext();
    if (!ctx) return textLeft;
    ctx.font = font;

    const selStart = input.selectionStart ?? input.value.length;
    const measuredWidth = ctx.measureText(input.value.substring(0, selStart)).width;

    return textLeft + measuredWidth - input.scrollLeft;
}

/**
 * Finds the character index in an input or textarea that is closest to targetX.
 * The width of a text prefix grows with its length, so a binary search is enough.
 */
function getInputIndexFromX(input: TextField, targetX: number): number {
    const { textLeft, font } = getInputTextMetrics(input);
    const clickX = targetX - textLeft + input.scrollLeft;

    if (clickX <= 0) return 0;

    const ctx = getMeasureContext();
    if (!ctx) return input.value.length;
    ctx.font = font;

    const text = input.value;
    const widthUpTo = (index: number) => ctx.measureText(text.substring(0, index)).width;

    // Find the first index whose prefix is at least as wide as the click position
    let low = 0;
    let high = text.length;
    while (low < high) {
        const mid = (low + high) >> 1;
        if (widthUpTo(mid) < clickX) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }

    if (low === 0) return 0;
    return Math.abs(widthUpTo(low - 1) - clickX) <= Math.abs(widthUpTo(low) - clickX) ? low - 1 : low;
}

/**
 * Returns the node that bounds the focus navigation of an element: the Scribe document that
 * contains it, so several editors in the same page never navigate into each other.
 */
function getFocusScope(element: HTMLElement): ParentNode {
    return element.closest('.scribe-document') ?? (element.getRootNode() as Document | ShadowRoot);
}

/** Whether the element can currently receive a caret (ignores read only content in view mode) */
function isNavigable(element: HTMLElement): boolean {
    if (isTextField(element)) {
        return !element.disabled && !element.readOnly;
    }
    return element.isContentEditable;
}

/** Whether the user has a non collapsed (range) selection inside the element */
function hasRangeSelection(element: HTMLElement): boolean {
    if (isTextField(element)) {
        return element.selectionStart !== element.selectionEnd;
    }
    const selection = getSelection(element);
    return !!selection && selection.rangeCount > 0 && !selection.isCollapsed;
}

/**
 * Retrieves the current caret position coordinates and bounding lines.
 */
export function getCaretCoordinates(element: HTMLElement): { x: number; top: number; bottom: number; y: number } {
    const rect = element.getBoundingClientRect();
    if (isTextField(element)) {
        const x = getInputCaretX(element);
        return {
            x,
            top: rect.top,
            bottom: rect.bottom,
            y: rect.top + rect.height / 2
        };
    }

    const selection = getSelection(element);
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
    if (isTextField(element)) {
        return element.selectionStart === 0 && element.selectionEnd === 0;
    }
    const selection = getSelection(element);
    if (!selection || selection.rangeCount === 0) return true;
    const range = selection.getRangeAt(0);
    const preRange = range.cloneRange();
    preRange.selectNodeContents(element);
    preRange.setEnd(range.startContainer, range.startOffset);
    // A line break before the caret means there is a previous line, even without any text
    return preRange.toString().length === 0 && !preRange.cloneContents().querySelector('br');
}

/**
 * Checks whether the selection in the element is at the end.
 */
export function isAtEnd(element: HTMLElement): boolean {
    if (isTextField(element)) {
        return element.selectionStart === element.value.length && element.selectionEnd === element.value.length;
    }
    const selection = getSelection(element);
    if (!selection || selection.rangeCount === 0) return true;
    const range = selection.getRangeAt(0);
    const postRange = range.cloneRange();
    postRange.selectNodeContents(element);
    postRange.setStart(range.endContainer, range.endOffset);
    // A single trailing <br> is only the filler browsers add after the last line, so more than one
    // line break after the caret means there is a next line
    return postRange.toString().length === 0 && postRange.cloneContents().querySelectorAll('br').length <= 1;
}

/** Returns the bounding rect of the current selection range, falling back to its first client rect */
function getSelectionRect(element: HTMLElement): DOMRect | null {
    const selection = getSelection(element);
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    let caretRect = range.getBoundingClientRect();
    if (caretRect.height === 0) {
        const clientRects = range.getClientRects();
        if (clientRects.length > 0) caretRect = clientRects[0];
    }
    return caretRect;
}

/**
 * Checks whether the caret is on the first visual line of the element.
 */
export function isAtFirstLine(element: HTMLElement): boolean {
    if (isTextField(element)) {
        return true;
    }
    if (isAtStart(element)) return true;

    const caretRect = getSelectionRect(element);
    if (!caretRect || caretRect.height === 0 || caretRect.top === 0) return true;

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
    if (isTextField(element)) {
        return true;
    }
    if (isAtEnd(element)) return true;

    const caretRect = getSelectionRect(element);
    if (!caretRect || caretRect.height === 0 || caretRect.bottom === 0) return true;

    const elRect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const paddingBottom = parseFloat(style.paddingBottom) || 0;
    const lineHeight = parseFloat(style.lineHeight) || caretRect.height || 20;

    return ((elRect.bottom - paddingBottom) - caretRect.bottom) < lineHeight * 0.9;
}

interface LineRect {
    top: number;
    bottom: number;
    left: number;
    right: number;
    height: number;
    width: number;
}

/**
 * Gets the relevant line box for an element at targetX in the specified direction.
 * For multi-line inline elements, selects the line box covering targetX.
 */
function getRelevantRect(element: HTMLElement, targetX: number, direction: 'up' | 'down'): LineRect {
    const clientRects = Array.from(element.getClientRects());
    if (clientRects.length <= 1) {
        return element.getBoundingClientRect();
    }

    // Filter rects that cover targetX (with a small margin)
    const coveringRects = clientRects.filter(r => targetX >= r.left - 4 && targetX <= r.right + 4);
    const candidateList = coveringRects.length > 0 ? coveringRects : clientRects;

    // Entering from above uses the top-most line, entering from below uses the bottom-most one
    let selected = candidateList[0];
    for (let i = 1; i < candidateList.length; i++) {
        const rect = candidateList[i];
        if (direction === 'down' ? rect.top < selected.top : rect.bottom > selected.bottom) {
            selected = rect;
        }
    }
    return selected;
}

/**
 * Checks whether the element has another visual line in the given direction that the browser
 * can reach from the current caret position.
 *
 * Lines that are shorter than the caret's horizontal coordinate are still reachable: the browser
 * clamps the caret to the end of the line. Only lines that start to the right of the caret are
 * considered unreachable, since the caret would have to leave the element to get there.
 */
export function canMoveVerticallyWithinElement(
    element: HTMLElement,
    direction: 'up' | 'down',
    caretX: number,
    caretTop: number,
    caretBottom: number
): boolean {
    if (isTextField(element)) {
        return false;
    }

    const clientRects = Array.from(element.getClientRects());
    if (clientRects.length <= 1) {
        return false;
    }

    const caretLineCenter = (caretTop + caretBottom) / 2;
    const sign = direction === 'down' ? 1 : -1;

    // Closest line (vertically) that lies in the requested direction
    let closestLine: DOMRect | null = null;
    let minDy = Infinity;

    for (const rect of clientRects) {
        const dy = sign * ((rect.top + rect.bottom) / 2 - caretLineCenter);
        if (dy >= 10 && dy < minDy) {
            minDy = dy;
            closestLine = rect;
        }
    }

    return closestLine !== null && caretX >= closestLine.left - 4;
}

interface LegacyCaretRangeDocument {
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
}

/** Returns the collapsed range under the given viewport point, using whichever API the browser supports */
function getCaretRangeAtPoint(doc: Document, x: number, y: number): Range | null {
    if (typeof doc.caretPositionFromPoint === 'function') {
        const pos = doc.caretPositionFromPoint(x, y);
        if (!pos) return null;

        const range = doc.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.collapse(true);
        return range;
    }

    // Older browsers only implement the legacy API. It is declared in a standalone interface, as the lib
    // typings mark it as deprecated and would flag any access through Document
    const legacyDoc = doc as unknown as LegacyCaretRangeDocument;
    return legacyDoc.caretRangeFromPoint?.(x, y) ?? null;
}

/**
 * Places the caret in a contenteditable at the given viewport point, as a native click would.
 * When the point falls on a visual line that has no text under it (for example a line that only holds
 * a line break), the caret goes to the start of the element for its first line and to the end otherwise.
 */
export function setCaretFromPoint(element: HTMLElement, x: number, y: number): void {
    element.focus();

    const selection = getSelection(element);
    if (!selection) return;

    const rects = Array.from(element.getClientRects());
    if (rects.length > 0) {
        // The line under the point, or else the one vertically closest to it
        let lineIndex = 0;
        let minDistance = Infinity;
        rects.forEach((rect, index) => {
            const distance = y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;
            if (distance < minDistance) {
                minDistance = distance;
                lineIndex = index;
            }
        });

        const line = rects[lineIndex];
        // A point above the first reported line belongs to a leading line that has no box of its own
        const isAboveFirstLine = lineIndex === 0 && y < line.top - 2;
        const range = isAboveFirstLine ? null : getCaretRangeAtPoint(
            element.ownerDocument || document,
            Math.max(line.left + 1, Math.min(line.right - 1, x)),
            (line.top + line.bottom) / 2
        );

        if (range && element.contains(range.startContainer)) {
            selection.removeAllRanges();
            selection.addRange(range);
            return;
        }

        const fallback = document.createRange();
        fallback.selectNodeContents(element);
        // collapse(true) goes to the start of the element, collapse(false) to its end
        fallback.collapse(lineIndex === 0);
        selection.removeAllRanges();
        selection.addRange(fallback);
        return;
    }

    setCaretPosition(element, { direction: 'left' });
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

    if (isTextField(targetElement)) {
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

    const selection = getSelection(targetElement);
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

        const range = getCaretRangeAtPoint(targetElement.ownerDocument || document, clampedX, targetY);

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
 * Returns true if the focus was moved to another component (the event is then prevented),
 * false otherwise, in which case the browser keeps its default behaviour.
 */
export function handleArrowNavigation(event: KeyboardEvent, element: HTMLElement): boolean {
    // Modified arrows (selection extension, word/line jumps) and IME composition belong to the browser
    if (event.defaultPrevented || event.isComposing || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
        return false;
    }
    // With a range selected the arrows must only collapse it
    if (hasRangeSelection(element)) {
        return false;
    }

    let moved = false;

    switch (event.key) {
        case 'ArrowLeft': {
            if (isAtStart(element)) {
                moved = navigateToAdjacentComponent(element, 'left');
            }
            break;
        }
        case 'ArrowRight': {
            if (isAtEnd(element)) {
                moved = navigateToAdjacentComponent(element, 'right');
            }
            break;
        }
        case 'ArrowUp': {
            const caret = getCaretCoordinates(element);
            const staysInside = canMoveVerticallyWithinElement(element, 'up', caret.x, caret.top, caret.bottom)
                && !isAtFirstLine(element);
            if (!staysInside) {
                moved = navigateToAdjacentComponent(element, 'up');
            }
            break;
        }
        case 'ArrowDown': {
            const caret = getCaretCoordinates(element);
            const staysInside = canMoveVerticallyWithinElement(element, 'down', caret.x, caret.top, caret.bottom)
                && !isAtLastLine(element);
            if (!staysInside) {
                moved = navigateToAdjacentComponent(element, 'down');
            }
            break;
        }
    }

    // The focus has already moved, so the default action would be applied to the new target
    if (moved) {
        event.preventDefault();
    }
    return moved;
}

/** Dispatches the cancelable focus event to the target and falls back to placing the caret directly */
function focusTarget(targetElement: HTMLElement, eventName: string, detail: FocusNavigationDetail): void {
    const event = new CustomEvent(eventName, {
        detail,
        cancelable: true,
        bubbles: false
    });

    // A listener (see setupFocusListeners) cancels the event when it already placed the caret
    const eventWasCanceled = !targetElement.dispatchEvent(event);
    if (!eventWasCanceled) {
        setCaretPosition(targetElement, detail);
    }
}

export function navigateToAdjacentComponent(
    currentElement: HTMLElement,
    direction: 'up' | 'down' | 'left' | 'right'
): boolean {
    const focusableElements = (
        Array.from(getFocusScope(currentElement).querySelectorAll('[data-scribe-focusable]')) as HTMLElement[]
    ).filter(isNavigable);

    const currentIndex = focusableElements.indexOf(currentElement);
    if (currentIndex === -1) return false;

    // For Left and Right directions, use linear DOM flow order
    if (direction === 'left' || direction === 'right') {
        const nextIndex = currentIndex + (direction === 'right' ? 1 : -1);
        if (nextIndex < 0 || nextIndex >= focusableElements.length) return false;

        focusTarget(
            focusableElements[nextIndex],
            direction === 'right' ? 'scribe-focus-start' : 'scribe-focus-end',
            { direction }
        );
        return true;
    }

    // For Up and Down, find the closest geometric candidate on another line
    const caret = getCaretCoordinates(currentElement);
    const currentX = caret.x;
    const currentLineTop = caret.top;
    const currentLineBottom = caret.bottom;
    const currentLineCenter = caret.y;

    // Measure each candidate once, keeping only those strictly above or below the current visual line
    const scoredCandidates: { el: HTMLElement; score: number }[] = [];

    for (const el of focusableElements) {
        if (el === currentElement) continue;

        const rect = getRelevantRect(el, currentX, direction);
        if (rect.width === 0 || rect.height === 0) continue; // Ignore invisible elements

        const candidateCenter = (rect.top + rect.bottom) / 2;
        const dyCenter = candidateCenter - currentLineCenter;

        // Check if the candidate's relevant line is on the same visual line
        // (centers aligned within 12px and vertical overlap > 50% of the shorter element)
        const overlapTop = Math.max(rect.top, currentLineTop);
        const overlapBottom = Math.min(rect.bottom, currentLineBottom);
        const verticalOverlap = Math.max(0, overlapBottom - overlapTop);
        const minHeight = Math.min(rect.height, currentLineBottom - currentLineTop);

        const isSameLine = Math.abs(dyCenter) < 12 && (minHeight > 0 && verticalOverlap / minHeight > 0.5);
        if (isSameLine) continue;

        const isInDirection = direction === 'up'
            // Must be distinctly above the current line
            ? dyCenter <= -12 && rect.top < currentLineTop - 4 && rect.bottom <= currentLineBottom
            // Must be distinctly below the current line
            : dyCenter >= 12 && rect.bottom > currentLineBottom + 4 && rect.top >= currentLineTop;
        if (!isInDirection) continue;

        let dx = 0;
        if (currentX < rect.left) {
            dx = rect.left - currentX;
        } else if (currentX > rect.right) {
            dx = currentX - rect.right;
        }

        const verticalDist = Math.abs(dyCenter);

        // Prioritize the nearest line vertically, then horizontal proximity
        scoredCandidates.push({ el, score: verticalDist * 100 + dx });
    }

    // Focus the closest geometric candidate. Do NOT fall back to horizontal DOM neighbors
    // when navigating vertically!
    if (scoredCandidates.length === 0) return false;
    const best = scoredCandidates.reduce((a, b) => (b.score < a.score ? b : a));

    focusTarget(
        best.el,
        direction === 'down' ? 'scribe-focus-start' : 'scribe-focus-end',
        {
            direction,
            x: currentX,
            y: direction === 'down' ? currentLineBottom : currentLineTop
        }
    );
    return true;
}
