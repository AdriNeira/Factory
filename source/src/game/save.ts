import { EMPTY_COUNTS, GOALS, ITEMS, KINDS, RESEARCH } from './config';
import { createWorld, index, inside } from './world';
import type { Counts, Dir, ResearchId, World } from './types';

interface Saved {
    s: Counts;
    d: Counts;
    g: number;
    r?: ResearchId[];
    b: string;
}

export function serialize(world: World): string {
    const parts: string[] = [];
    world.cells.forEach((b, i) => {
        if (b) parts.push(`${i % 32},${Math.floor(i / 32)},${KINDS.indexOf(b.kind)},${b.dir},${b.setting ? ITEMS.indexOf(b.setting) : -1}`);
    });
    const data: Saved = { s: world.stock, d: world.delivered, g: world.goal, r: world.research, b: parts.join(';') };
    return JSON.stringify(data);
}

function counts(value: unknown): Counts {
    const result = { ...EMPTY_COUNTS };
    for (const key of Object.keys(result) as (keyof Counts)[]) {
        const n = (value as Counts)?.[key];
        result[key] = Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
    }
    return result;
}

export function deserialize(text: string): World | null {
    try {
        const data = JSON.parse(text) as Saved;
        const world = createWorld();
        world.cells.fill(null);
        world.count = 0;
        world.stock = counts(data.s);
        world.delivered = counts(data.d);
        world.goal = Math.min(Math.max(0, Math.floor(data.g) || 0), GOALS.length);
        world.research = RESEARCH.map(r => r.id).filter(id => Array.isArray(data.r) && data.r.includes(id));
        for (const entry of data.b ? data.b.split(';') : []) {
            const [x, y, k, d, it] = entry.split(',').map(Number);
            if (!inside(x, y) || !KINDS[k] || !(d >= 0 && d <= 3)) return null;
            const i = index(x, y);
            if (world.cells[i]) continue;
            world.cells[i] = {
                kind: KINDS[k], dir: d as Dir, item: null, input: {}, job: null,
                progress: 0, out: null, outCount: 0, moved: false,
                setting: it >= 0 && ITEMS[it] ? ITEMS[it] : null,
            };
            world.count++;
        }
        return world;
    } catch {
        return null;
    }
}

export const encode = (text: string) => btoa(unescape(encodeURIComponent(text)));
export const decode = (code: string) => decodeURIComponent(escape(atob(code.trim())));
