import { describe, expect, it } from 'vitest';
import { parseVideoUrl } from './videoEmbed.js';

const YOUTUBE = (id: string) => ({ provider: 'youtube', embedUrl: `https://www.youtube-nocookie.com/embed/${id}` });
const VIMEO = (id: string, hash = '') => ({ provider: 'vimeo', embedUrl: `https://player.vimeo.com/video/${id}${hash ? `?h=${hash}` : ''}` });

describe('parseVideoUrl: YouTube', () => {
    it('reads the watch, short, embed, shorts and live links', () => {
        expect(parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual(YOUTUBE('dQw4w9WgXcQ'));
        expect(parseVideoUrl('https://youtu.be/dQw4w9WgXcQ')).toEqual(YOUTUBE('dQw4w9WgXcQ'));
        expect(parseVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toEqual(YOUTUBE('dQw4w9WgXcQ'));
        expect(parseVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toEqual(YOUTUBE('dQw4w9WgXcQ'));
        expect(parseVideoUrl('https://www.youtube.com/live/dQw4w9WgXcQ')).toEqual(YOUTUBE('dQw4w9WgXcQ'));
    });

    it('reads the mobile, music and nocookie hosts', () => {
        expect(parseVideoUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual(YOUTUBE('dQw4w9WgXcQ'));
        expect(parseVideoUrl('https://music.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual(YOUTUBE('dQw4w9WgXcQ'));
        expect(parseVideoUrl('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')).toEqual(YOUTUBE('dQw4w9WgXcQ'));
    });

    it('ignores the other parameters of the link', () => {
        expect(parseVideoUrl('https://www.youtube.com/watch?list=PL123&v=dQw4w9WgXcQ&t=42s')).toEqual(YOUTUBE('dQw4w9WgXcQ'));
        expect(parseVideoUrl('https://youtu.be/dQw4w9WgXcQ?si=abc')).toEqual(YOUTUBE('dQw4w9WgXcQ'));
    });

    it('rejects a link without a valid id', () => {
        expect(parseVideoUrl('https://www.youtube.com/watch')).toBeNull();
        expect(parseVideoUrl('https://www.youtube.com/')).toBeNull();
        expect(parseVideoUrl('https://www.youtube.com/channel/UC123')).toBeNull();
        expect(parseVideoUrl('https://www.youtube.com/watch?v=short')).toBeNull();
        expect(parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXc"onload=alert(1)')).toBeNull();
    });
});

describe('parseVideoUrl: Vimeo', () => {
    it('reads the plain, channel, group and player links', () => {
        expect(parseVideoUrl('https://vimeo.com/76979871')).toEqual(VIMEO('76979871'));
        expect(parseVideoUrl('https://vimeo.com/channels/staffpicks/76979871')).toEqual(VIMEO('76979871'));
        expect(parseVideoUrl('https://vimeo.com/groups/name/videos/76979871')).toEqual(VIMEO('76979871'));
        expect(parseVideoUrl('https://player.vimeo.com/video/76979871')).toEqual(VIMEO('76979871'));
    });

    it('keeps the hash of an unlisted video', () => {
        expect(parseVideoUrl('https://vimeo.com/76979871/a1b2c3d4e5')).toEqual(VIMEO('76979871', 'a1b2c3d4e5'));
        expect(parseVideoUrl('https://player.vimeo.com/video/76979871?h=a1b2c3d4e5')).toEqual(VIMEO('76979871', 'a1b2c3d4e5'));
    });

    it('drops a hash that is not valid', () => {
        expect(parseVideoUrl('https://vimeo.com/76979871?h=bad%22hash')).toEqual(VIMEO('76979871'));
    });

    it('rejects a link without a numeric id', () => {
        expect(parseVideoUrl('https://vimeo.com/')).toBeNull();
        expect(parseVideoUrl('https://vimeo.com/channels/staffpicks')).toBeNull();
        expect(parseVideoUrl('https://player.vimeo.com/76979871')).toBeNull();
    });
});

describe('parseVideoUrl: Dailymotion', () => {
    // Its player answers 403 Forbidden without a Player ID from Dailymotion Studio, so it is not supported
    it('rejects every Dailymotion link', () => {
        expect(parseVideoUrl('https://www.dailymotion.com/video/xbvs1qy')).toBeNull();
        expect(parseVideoUrl('https://dai.ly/xbvs1qy')).toBeNull();
        expect(parseVideoUrl('https://www.dailymotion.com/embed/video/xbvs1qy')).toBeNull();
        expect(parseVideoUrl('https://geo.dailymotion.com/player.html?video=xbvs1qy')).toBeNull();
    });
});

describe('parseVideoUrl: input', () => {
    it('accepts a link without the protocol and with surrounding spaces', () => {
        expect(parseVideoUrl('youtu.be/dQw4w9WgXcQ')).toEqual(YOUTUBE('dQw4w9WgXcQ'));
        expect(parseVideoUrl('  https://vimeo.com/76979871  ')).toEqual(VIMEO('76979871'));
        expect(parseVideoUrl('HTTPS://WWW.YOUTUBE.COM/watch?v=dQw4w9WgXcQ')).toEqual(YOUTUBE('dQw4w9WgXcQ'));
    });

    it('rejects look-alike hosts', () => {
        expect(parseVideoUrl('https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ')).toBeNull();
        expect(parseVideoUrl('https://notyoutube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
        expect(parseVideoUrl('https://evil.com/youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
        expect(parseVideoUrl('https://evil.com/vimeo.com/76979871')).toBeNull();
        expect(parseVideoUrl('https://youtube.com@evil.com/watch?v=dQw4w9WgXcQ')).toBeNull();
    });

    it('does not read a numeric path of another site as a Vimeo video', () => {
        expect(parseVideoUrl('https://www.youtube.com/watch/76979871')).toBeNull();
    });

    it('rejects anything that is not a http link', () => {
        expect(parseVideoUrl('')).toBeNull();
        expect(parseVideoUrl('   ')).toBeNull();
        expect(parseVideoUrl('not a link')).toBeNull();
        expect(parseVideoUrl('javascript:alert(1)')).toBeNull();
        expect(parseVideoUrl('ftp://youtu.be/dQw4w9WgXcQ')).toBeNull();
        expect(parseVideoUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    });
});
