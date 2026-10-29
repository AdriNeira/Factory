import { HEIGHT, ITEM_COLOR, KIND_COLOR, TILE, WIDTH } from './config';
import { index } from './world';
import type { Building, Dir, Item, World } from './types';

const ORE_COLOR: Partial<Record<Item, string>> = { menaHierro: '#6f8196', menaCobre: '#b86a2e', piedra: '#8d8a80' };
const ORE_LIGHT: Partial<Record<Item, string>> = { menaHierro: '#a9bccf', menaCobre: '#f0a566', piedra: '#c9c4b8' };

const hash = (i: number, k: number) => {
    const n = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
    return n - Math.floor(n);
};

function arrow(ctx: CanvasRenderingContext2D, cx: number, cy: number, dir: Dir, size: number, color: string) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((dir * Math.PI) / 2);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.8, size * 0.7);
    ctx.lineTo(-size * 0.8, size * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function rock(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, seed: number, color: string, light: string) {
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 + seed;
        const rr = r * (0.75 + 0.25 * hash(seed * 100, k));
        ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
}

function gear(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, angle: number, color: string) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    for (let k = 0; k < 6; k++) {
        ctx.rotate(Math.PI / 3);
        ctx.fillRect(-2, -r - 2, 4, 5);
    }
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10161e';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

export function drawItem(ctx: CanvasRenderingContext2D, item: Item, x: number, y: number, s: number) {
    ctx.save();
    ctx.translate(x, y);
    const c = ITEM_COLOR[item];
    switch (item) {
        case 'menaHierro':
        case 'menaCobre':
        case 'piedra':
            rock(ctx, 0, 0, s, 0.7, ORE_COLOR[item]!, ORE_LIGHT[item]!);
            break;
        case 'lingoteHierro':
        case 'lingoteCobre':
            ctx.fillStyle = c;
            ctx.beginPath();
            ctx.moveTo(-s, s * 0.6);
            ctx.lineTo(-s * 0.7, -s * 0.5);
            ctx.lineTo(s * 0.7, -s * 0.5);
            ctx.lineTo(s, s * 0.6);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffffff88';
            ctx.fillRect(-s * 0.55, -s * 0.35, s * 1.1, s * 0.22);
            break;
        case 'placa':
            ctx.fillStyle = c;
            ctx.fillRect(-s * 0.85, -s * 0.85, s * 1.7, s * 1.7);
            ctx.fillStyle = '#2b5f86';
            for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) ctx.fillRect(dx * s * 0.55 - 1.5, dy * s * 0.55 - 1.5, 3, 3);
            break;
        case 'cable':
            ctx.strokeStyle = c;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
            ctx.stroke();
            break;
        case 'hormigon':
            ctx.fillStyle = c;
            ctx.fillRect(-s * 0.9, -s * 0.8, s * 1.8, s * 1.6);
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(-s * 0.9, 0);
            ctx.lineTo(s * 0.9, 0);
            ctx.moveTo(0, -s * 0.8);
            ctx.lineTo(0, 0);
            ctx.stroke();
            break;
        case 'circuito':
            ctx.fillStyle = '#1f9a55';
            ctx.fillRect(-s * 0.9, -s * 0.9, s * 1.8, s * 1.8);
            ctx.fillStyle = '#10361f';
            ctx.fillRect(-s * 0.35, -s * 0.35, s * 0.7, s * 0.7);
            ctx.strokeStyle = '#ffd84d';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(-s * 0.9, -s * 0.5);
            ctx.lineTo(-s * 0.35, -s * 0.5);
            ctx.moveTo(s * 0.9, s * 0.5);
            ctx.lineTo(s * 0.35, s * 0.5);
            ctx.stroke();
            break;
        case 'robot':
            ctx.fillStyle = c;
            ctx.fillRect(-s * 0.7, -s * 0.5, s * 1.4, s * 1.2);
            ctx.fillRect(-s * 0.1, -s * 0.9, s * 0.2, s * 0.4);
            ctx.fillStyle = '#10161e';
            ctx.fillRect(-s * 0.5, -s * 0.3, s, s * 0.35);
            ctx.fillStyle = '#ffd84d';
            ctx.fillRect(-s * 0.35, -s * 0.2, s * 0.25, s * 0.15);
            ctx.fillRect(s * 0.1, -s * 0.2, s * 0.25, s * 0.15);
            break;
        case 'motor':
            ctx.fillStyle = c;
            ctx.fillRect(-s * 0.8, -s * 0.6, s * 1.4, s * 1.2);
            ctx.fillStyle = '#c0c8d0';
            ctx.fillRect(s * 0.6, -s * 0.2, s * 0.4, s * 0.4);
            ctx.fillStyle = '#00000055';
            ctx.fillRect(-s * 0.5, -s * 0.6, s * 0.18, s * 1.2);
            ctx.fillRect(-s * 0.1, -s * 0.6, s * 0.18, s * 1.2);
            break;
    }
    ctx.restore();
}

function drawBelt(ctx: CanvasRenderingContext2D, b: Building, px: number, py: number, t: number, phase: number) {
    const cx = px + TILE / 2;
    const cy = py + TILE / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((b.dir * Math.PI) / 2);
    ctx.fillStyle = '#2a303c';
    ctx.fillRect(-TILE / 2 + 3, -TILE / 2, TILE - 6, TILE);
    ctx.fillStyle = '#566074';
    ctx.fillRect(-TILE / 2 + 3, -TILE / 2, 3, TILE);
    ctx.fillRect(TILE / 2 - 6, -TILE / 2, 3, TILE);
    ctx.strokeStyle = '#6d7a90';
    ctx.lineWidth = 2;
    const shift = (t * 0.03) % 14;
    for (let k = -2; k < 4; k++) {
        const y = TILE / 2 - k * 14 - shift;
        if (y < -TILE / 2 + 2 || y > TILE / 2 - 2) continue;
        ctx.beginPath();
        ctx.moveTo(-8, y + 5);
        ctx.lineTo(0, y - 3);
        ctx.lineTo(8, y + 5);
        ctx.stroke();
    }
    ctx.restore();
    if (b.item) {
        const slide = b.moved ? (1 - phase) * TILE * 0.5 : 0;
        const ix = cx - Math.round(Math.sin((b.dir * Math.PI) / 2)) * slide;
        const iy = cy + Math.round(Math.cos((b.dir * Math.PI) / 2)) * slide;
        drawItem(ctx, b.item, ix, iy, 8);
    }
}

function drawMachine(ctx: CanvasRenderingContext2D, b: Building, px: number, py: number, t: number) {
    const cx = px + TILE / 2;
    const cy = py + TILE / 2;
    const working = b.job !== null || (b.kind === 'minero' && b.outCount > 0) || b.outCount > 0;
    ctx.fillStyle = '#00000044';
    ctx.fillRect(px + 5, py + 6, TILE - 6, TILE - 6);
    ctx.fillStyle = KIND_COLOR[b.kind];
    ctx.fillRect(px + 3, py + 3, TILE - 6, TILE - 6);
    ctx.strokeStyle = '#ffffff33';
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 3, py + 3, TILE - 6, TILE - 6);
    if (b.kind === 'minero') {
        ctx.fillStyle = '#2b3414';
        ctx.fillRect(px + 7, py + 7, TILE - 14, TILE - 14);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(working ? t * 0.012 : 0);
        ctx.fillStyle = '#c8d98a';
        for (let k = 0; k < 3; k++) {
            ctx.rotate((Math.PI * 2) / 3);
            ctx.fillRect(-2, -14, 4, 14);
            ctx.fillRect(-5, -15, 10, 4);
        }
        ctx.restore();
        ctx.fillStyle = '#ffd84d';
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();
    } else if (b.kind === 'fundidora') {
        ctx.fillStyle = '#7b342c';
        ctx.fillRect(cx - 14, cy - 4, 28, 18);
        ctx.fillStyle = '#4a1f1a';
        for (let k = 0; k < 3; k++) ctx.fillRect(cx - 14, cy - 4 + k * 6, 28, 1.5);
        ctx.fillStyle = '#2b1613';
        ctx.fillRect(cx - 12, cy - 16, 9, 14);
        const flick = working ? 0.6 + 0.4 * Math.sin(t * 0.02) : 0;
        ctx.fillStyle = working ? `rgba(255,${140 + Math.round(flick * 80)},50,1)` : '#3a1a16';
        ctx.fillRect(cx + 1, cy + 2, 10, 8);
        if (working) {
            for (let k = 0; k < 3; k++) {
                const ph = ((t * 0.0008 + k / 3) % 1);
                ctx.fillStyle = `rgba(200,200,200,${0.5 * (1 - ph)})`;
                ctx.beginPath();
                ctx.arc(cx - 8 + ph * 5, cy - 16 - ph * 14, 3 + ph * 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    } else if (b.kind === 'constructor') {
        ctx.fillStyle = '#1f3a5c';
        ctx.fillRect(cx - 15, cy - 15, 30, 30);
        ctx.fillStyle = '#2d527f';
        ctx.fillRect(cx - 15, cy + 5, 30, 10);
        ctx.save();
        ctx.translate(cx, cy - 8);
        ctx.rotate(working ? Math.sin(t * 0.01) * 0.7 : 0);
        ctx.fillStyle = '#ffd84d';
        ctx.fillRect(-2, 0, 4, 16);
        ctx.fillStyle = '#d0d8e0';
        ctx.fillRect(-5, 14, 10, 4);
        ctx.restore();
        ctx.fillStyle = working ? '#7ec8ff' : '#4d7aa8';
        ctx.fillRect(cx - 12, cy + 8, 24, 4);
    } else if (b.kind === 'ensambladora') {
        ctx.fillStyle = '#1d4f45';
        ctx.fillRect(cx - 15, cy - 15, 30, 30);
        gear(ctx, cx - 6, cy - 3, 8, working ? t * 0.005 : 0, '#8fe3c8');
        gear(ctx, cx + 8, cy + 7, 6, working ? -t * 0.007 : 0.3, '#ffd84d');
        ctx.fillStyle = working ? '#7dff9a' : '#336655';
        ctx.beginPath();
        ctx.arc(cx + 10, cy - 11, 3, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillStyle = '#5b4580';
        ctx.fillRect(cx - 15, cy - 15, 30, 30);
        ctx.fillStyle = '#7a5aa6';
        ctx.fillRect(cx - 15, cy - 15, 30, 8);
        ctx.strokeStyle = '#d2bff0';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 15, cy - 15, 30, 30);
        ctx.beginPath();
        ctx.moveTo(cx - 15, cy - 7);
        ctx.lineTo(cx + 15, cy - 7);
        ctx.moveTo(cx - 6, cy);
        ctx.lineTo(cx - 6, cy + 15);
        ctx.moveTo(cx + 6, cy);
        ctx.lineTo(cx + 6, cy + 15);
        ctx.stroke();
    }
    if (b.kind !== 'almacen') {
        arrow(ctx, cx + [0, 17, 0, -17][b.dir], cy + [-17, 0, 17, 0][b.dir], b.dir, 5, '#ffffff');
    }
    if (b.out && b.outCount > 0) {
        ctx.fillStyle = '#000000aa';
        ctx.fillRect(px + 4, py + TILE - 17, 15, 13);
        drawItem(ctx, b.out, px + 11.5, py + TILE - 10.5, 4.5);
    }
}

function drawDeposit(ctx: CanvasRenderingContext2D, ore: Item, px: number, py: number, i: number) {
    for (let k = 0; k < 4; k++) {
        const x = px + 8 + hash(i, k) * (TILE - 16);
        const y = py + 8 + hash(i, k + 9) * (TILE - 16);
        rock(ctx, x, y, 5 + hash(i, k + 4) * 4, hash(i, k + 2) * 6, ORE_COLOR[ore]!, ORE_LIGHT[ore]!);
    }
}

export function draw(ctx: CanvasRenderingContext2D, world: World, camX: number, camY: number, width: number, height: number, t: number, phase: number) {
    ctx.fillStyle = '#1b2430';
    ctx.fillRect(0, 0, width, height);
    const x0 = Math.max(0, Math.floor(-camX / TILE));
    const y0 = Math.max(0, Math.floor(-camY / TILE));
    const x1 = Math.min(WIDTH - 1, Math.floor((width - camX) / TILE));
    const y1 = Math.min(HEIGHT - 1, Math.floor((height - camY) / TILE));
    for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
            const px = x * TILE + camX;
            const py = y * TILE + camY;
            const i = index(x, y);
            ctx.fillStyle = (x + y) % 2 ? '#2a3a2e' : '#2d3f32';
            ctx.fillRect(px, py, TILE, TILE);
            if (hash(i, 1) > 0.7) {
                ctx.fillStyle = '#3a5240';
                ctx.fillRect(px + hash(i, 2) * (TILE - 6), py + hash(i, 3) * (TILE - 6), 2, 4);
                ctx.fillRect(px + hash(i, 4) * (TILE - 6), py + hash(i, 5) * (TILE - 6), 2, 3);
            }
            const ore = world.deposits[i];
            const b = world.cells[i];
            if (ore && !b) drawDeposit(ctx, ore, px, py, i);
            if (!b) continue;
            if (b.kind === 'cinta') drawBelt(ctx, b, px, py, t, phase);
            else drawMachine(ctx, b, px, py, t);
        }
    }
}
