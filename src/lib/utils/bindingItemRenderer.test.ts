import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BindingItemProps, BindingItemRenderer } from '../types/ScribeProps.js';
import { createItemHost } from './bindingItemRenderer.js';

// There is no DOM in the tests, and the host never touches the node: it only hands it to the renderer
const node = {} as HTMLElement;

const props: BindingItemProps = {
    id: 'a',
    label: 'Item A',
    type: 'string',
    bindingType: 'mine',
    value: undefined,
    preview: '',
    isLoading: true,
    isDisabled: false,
    isSelected: false
};

afterEach(() => {
    vi.restoreAllMocks();
});

describe('createItemHost', () => {
    it('gives the node and the props to the renderer', () => {
        const renderer = vi.fn<BindingItemRenderer>();
        createItemHost(renderer, node, props, () => {});
        expect(renderer).toHaveBeenCalledWith(node, props);
    });

    it('forwards update and destroy to what the renderer returned', () => {
        const update = vi.fn();
        const destroy = vi.fn();
        const host = createItemHost(() => ({ update, destroy }), node, props, () => {});

        const next = { ...props, isLoading: false, isSelected: true };
        host.update(next);
        host.destroy();

        expect(update).toHaveBeenCalledWith(next);
        expect(destroy).toHaveBeenCalledOnce();
    });

    it('accepts a renderer that returns nothing, or a handle without update and destroy', () => {
        const nothing = createItemHost(() => {}, node, props, () => {});
        const empty = createItemHost(() => ({}), node, props, () => {});

        expect(() => { nothing.update(props); nothing.destroy(); empty.update(props); empty.destroy(); }).not.toThrow();
    });

    it('calls onError and logs when the renderer throws while mounting, and stays safe to use', () => {
        const log = vi.spyOn(console, 'error').mockImplementation(() => {});
        const onError = vi.fn();
        const host = createItemHost(() => { throw new Error('boom'); }, node, props, onError);

        expect(onError).toHaveBeenCalledOnce();
        expect(log).toHaveBeenCalledOnce();
        expect(() => { host.update(props); host.destroy(); }).not.toThrow();
    });

    it('swallows and logs the errors of update and destroy without calling onError', () => {
        const log = vi.spyOn(console, 'error').mockImplementation(() => {});
        const onError = vi.fn();
        const host = createItemHost(() => ({
            update: () => { throw new Error('update'); },
            destroy: () => { throw new Error('destroy'); }
        }), node, props, onError);

        expect(() => { host.update(props); host.destroy(); }).not.toThrow();
        expect(log).toHaveBeenCalledTimes(2);
        expect(onError).not.toHaveBeenCalled();
    });
});
