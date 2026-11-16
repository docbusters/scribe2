/**
 * The element where tooltips, popovers and dialogs are portalled: the `.scribe-portal-target` of the mounted Scribe, so they get its theme and tokens
 * and a click in them keeps the selection. It is a store and not a Svelte context because the top toolbar and the bindings panel can be placed by the
 * host outside Scribe, where there is no context. Scribe sets it when it mounts (one Scribe per page), and it is undefined without one,
 * which makes the portal fall back to the body
 */
class PortalStore {
    target = $state.raw<HTMLElement | null>(null);
}

export const portalStore = new PortalStore();
