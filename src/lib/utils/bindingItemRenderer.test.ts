import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BindingItemProps, BindingItemRenderer } from '../types/ScribeProps.js';
import { createRendererHost } from './bindingItemRenderer.js';

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

describe('createRendererHost', () => {
    it('gives the node and the props to the renderer', () => {
        const renderer = vi.fn<BindingItemRenderer>();
        createRendererHost(renderer, node, props, () => {}, 'rows');
        expect(renderer).toHaveBeenCalledWith(node, props);
    });

    it('forwards update and destroy to what the renderer returned', () => {
        const update = vi.fn();
        const destroy = vi.fn();
        const host = createRendererHost(() => ({ update, destroy }), node, props, () => {}, 'rows');

        const next = { ...props, isLoading: false, isSelected: true };
        host.update(next);
        host.destroy();

        expect(update).toHaveBeenCalledWith(next);
        expect(destroy).toHaveBeenCalledOnce();
    });

    it('accepts a renderer that returns nothing, or a handle without update and destroy', () => {
        const nothing = createRendererHost(() => {}, node, props, () => {}, 'rows');
        const empty = createRendererHost(() => ({}), node, props, () => {}, 'rows');

        expect(() => { nothing.update(props); nothing.destroy(); empty.update(props); empty.destroy(); }).not.toThrow();
    });

    it('calls onError and logs when the renderer throws while mounting, and stays safe to use', () => {
        const log = vi.spyOn(console, 'error').mockImplementation(() => {});
        const onError = vi.fn();
        const host = createRendererHost(() => { throw new Error('boom'); }, node, props, onError, 'rows');

        expect(onError).toHaveBeenCalledOnce();
        expect(log).toHaveBeenCalledOnce();
        expect(() => { host.update(props); host.destroy(); }).not.toThrow();
    });

    it('swallows and logs the errors of update and destroy without calling onError', () => {
        const log = vi.spyOn(console, 'error').mockImplementation(() => {});
        const onError = vi.fn();
        const host = createRendererHost(() => ({
            update: () => { throw new Error('update'); },
            destroy: () => { throw new Error('destroy'); }
        }), node, props, onError, 'rows');

        expect(() => { host.update(props); host.destroy(); }).not.toThrow();
        expect(log).toHaveBeenCalledTimes(2);
        expect(onError).not.toHaveBeenCalled();
    });

    it('says it is the picker that threw, and that the list takes its place', () => {
        const log = vi.spyOn(console, 'error').mockImplementation(() => {});
        const onError = vi.fn();
        createRendererHost(() => { throw new Error('boom'); }, node, props, onError, 'picker');

        expect(onError).toHaveBeenCalledOnce();
        expect(String(log.mock.calls[0][0])).toContain('the picker of the custom binding "mine"');
        expect(String(log.mock.calls[0][0])).toContain('the list is shown instead');
    });
});
