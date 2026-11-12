export type VideoProvider = 'youtube' | 'vimeo';

export interface ParsedVideo {
    provider: VideoProvider;
    /** The URL of the player to put in an iframe. It is built here from the id, never copied from the link */
    embedUrl: string;
}

const YOUTUBE_ID = /^[\w-]{11}$/;
const NUMERIC_ID = /^\d+$/;
/** The hash of an unlisted Vimeo video */
const VIMEO_HASH = /^[a-z0-9]{6,32}$/i;

const hasScheme = (value: string) => /^[a-z][a-z0-9+.-]*:\/\//i.test(value);

function toUrl(input: string): URL | null {
    let value = input.trim();
    if (!value) return null;

    // A link pasted without the protocol is fine, but any other scheme (ftp://, file://) is not
    if (!/^https?:\/\//i.test(value)) {
        if (hasScheme(value)) return null;
        value = `https://${value}`;
    }

    try {
        const url = new URL(value);
        return url.hostname ? url : null;
    } catch {
        return null;
    }
}

function parseYoutube(host: string, parts: string[], url: URL): string | null {
    let id: string | null | undefined;
    if (host === 'youtu.be') {
        id = parts[0];
    } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
        if (parts[0] === 'watch') id = url.searchParams.get('v');
        else if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') id = parts[1];
    } else if (host === 'youtube-nocookie.com' && parts[0] === 'embed') {
        id = parts[1];
    }
    // The nocookie domain does not set tracking cookies until the video is played
    return id && YOUTUBE_ID.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

function parseVimeo(host: string, parts: string[], url: URL): string | null {
    if (host !== 'vimeo.com' && host !== 'player.vimeo.com') return null;

    // vimeo.com/ID, vimeo.com/channels/name/ID, vimeo.com/groups/name/videos/ID, player.vimeo.com/video/ID
    const idIndex = host === 'player.vimeo.com'
        ? (parts[0] === 'video' ? 1 : -1)
        : parts.findIndex(part => NUMERIC_ID.test(part));
    if (idIndex === -1 || !NUMERIC_ID.test(parts[idIndex] ?? '')) return null;

    const id = parts[idIndex];
    // An unlisted video carries a hash, as a query parameter or as the segment after the id
    const hash = url.searchParams.get('h') ?? parts[idIndex + 1];
    return `https://player.vimeo.com/video/${id}${hash && VIMEO_HASH.test(hash) ? `?h=${hash}` : ''}`;
}

/**
 * Reads a link to a YouTube or Vimeo video. Returns the provider and the URL of its embeddable player, or null when the link is not
 * from one of them or has no valid video id. The hosts are compared whole, so look-alikes are rejected.
 * Dailymotion is not supported: its player now answers 403 without a Player ID created in Dailymotion Studio
 */
export function parseVideoUrl(input: string): ParsedVideo | null {
    const url = toUrl(input);
    if (!url) return null;

    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const parts = url.pathname.split('/').filter(Boolean);

    const candidates: [VideoProvider, string | null][] = [
        ['youtube', parseYoutube(host, parts, url)],
        ['vimeo', parseVimeo(host, parts, url)],
    ];
    // Each parser only knows its own hosts, so at most one of them answers
    const found = candidates.find(([, embedUrl]) => embedUrl !== null);
    return found ? { provider: found[0], embedUrl: found[1]! } : null;
}
