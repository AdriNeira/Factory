import { DX, DY, HEIGHT, ITEM_COLOR, KIND_COLOR, TILE, WIDTH } from './config';
import { index, inside } from './world';
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

function feederSide(world: World, x: number, y: number, b: Building): number {
    let side = -1;
    for (let k = 0; k < 4; k++) {
        const nx = x + DX[k];
        const ny = y + DY[k];
        if (!inside(nx, ny)) continue;
        const n = world.cells[index(nx, ny)];
        if (!n || n.kind === 'almacen' || n.dir !== (k + 2) % 4) continue;
        const rel = (k - b.dir + 4) % 4;
        if (rel === 2) return 2;
        if (rel === 1 || rel === 3) side = side === -1 ? rel : -2;
    }
    return side >= 0 ? side : 2;
}

function drawBelt(ctx: CanvasRenderingContext2D, b: Building, px: number, py: number, t: number, phase: number, world: World, x: number, y: number) {
    const cx = px + TILE / 2;
    const cy = py + TILE / 2;
    const half = TILE / 2;
    const side = feederSide(world, x, y, b);
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, TILE, TILE);
    ctx.clip();
    ctx.translate(cx, cy);
    ctx.rotate((b.dir * Math.PI) / 2);
    const point = (u: number): [number, number, number] => {
        if (side === 2) return [0, half - u * TILE, -Math.PI / 2];
        const sign = side === 1 ? 1 : -1;
        const ox = sign * half;
        const oy = -half;
        const a0 = Math.PI / 2;
        const a1 = side === 1 ? Math.PI : 0;
        const a = a0 + (a1 - a0) * u;
        const tangent = a + (side === 1 ? Math.PI / 2 : -Math.PI / 2);
        return [ox + Math.cos(a) * half, oy + Math.sin(a) * half, tangent];
    };
    const trace = (offset: number, width: number, color: string) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        if (side === 2) {
            ctx.moveTo(offset, half);
            ctx.lineTo(offset, -half);
        } else {
            const right = side === 1;
            ctx.arc(right ? half : -half, -half, half + offset, Math.PI / 2, right ? Math.PI : 0, !right);
        }
        ctx.stroke();
    };
    trace(0, 30, '#2a303c');
    trace(-14.5, 3, '#566074');
    trace(14.5, 3, '#566074');
    ctx.strokeStyle = '#6d7a90';
    ctx.lineWidth = 2;
    const flow = (t * 0.0006) % 1;
    for (let k = 0; k < 4; k++) {
        const u = (k / 4 + flow) % 1;
        const [qx, qy, ang] = point(u);
        ctx.save();
        ctx.translate(qx, qy);
        ctx.rotate(ang + Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(-7, 5);
        ctx.lineTo(0, -3);
        ctx.lineTo(7, 5);
        ctx.stroke();
        ctx.restore();
    }
    ctx.restore();
    if (b.item) {
        const u = b.moved ? 0.5 - (1 - phase) * 0.5 : 0.5;
        const [qx, qy] = point(u);
        const c = Math.cos((b.dir * Math.PI) / 2);
        const sn = Math.sin((b.dir * Math.PI) / 2);
        drawItem(ctx, b.item, cx + qx * c - qy * sn, cy + qx * sn + qy * c, 8);
    }
}

function roof(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, dark: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 2, y + h);
    ctx.lineTo(x + 4, y);
    ctx.lineTo(x + w - 4, y);
    ctx.lineTo(x + w + 2, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = dark;
    ctx.fillRect(x - 2, y + h - 3, w + 4, 3);
}

function windowAt(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, lit: boolean) {
    ctx.fillStyle = lit ? '#ffe28a' : '#1a232e';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#0d1218';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
}

function drawMine(ctx: CanvasRenderingContext2D, b: Building, px: number, py: number, t: number, working: boolean) {
    const cx = px + TILE / 2;
    ctx.fillStyle = '#5a5248';
    ctx.beginPath();
    ctx.moveTo(px + 1, py + TILE - 3);
    ctx.lineTo(px + 8, py + 9);
    ctx.lineTo(px + TILE / 2, py + 3);
    ctx.lineTo(px + TILE - 8, py + 9);
    ctx.lineTo(px + TILE - 1, py + TILE - 3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#6f675b';
    ctx.beginPath();
    ctx.moveTo(px + 8, py + 9);
    ctx.lineTo(px + TILE / 2, py + 3);
    ctx.lineTo(px + TILE / 2 - 4, py + TILE - 3);
    ctx.lineTo(px + 1, py + TILE - 3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#0b0d10';
    ctx.beginPath();
    ctx.moveTo(cx - 10, py + TILE - 4);
    ctx.lineTo(cx - 10, py + 22);
    ctx.quadraticCurveTo(cx, py + 10, cx + 10, py + 22);
    ctx.lineTo(cx + 10, py + TILE - 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(cx - 12, py + 20, 3, TILE - 23);
    ctx.fillRect(cx + 9, py + 20, 3, TILE - 23);
    ctx.fillRect(cx - 13, py + 18, 26, 3);
    ctx.strokeStyle = '#9aa3ae';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 5, py + TILE - 4);
    ctx.lineTo(cx - 5, py + 28);
    ctx.moveTo(cx + 5, py + TILE - 4);
    ctx.lineTo(cx + 5, py + 28);
    ctx.stroke();
    if (working) {
        const lift = ((t * 0.002) % 1) * 12;
        ctx.fillStyle = '#c9843b';
        ctx.fillRect(cx - 4, py + TILE - 12 - lift * 0.5, 8, 6);
        ctx.fillStyle = `rgba(255,216,77,${0.6 + 0.4 * Math.sin(t * 0.02)})`;
    } else ctx.fillStyle = '#7a6a2a';
    ctx.beginPath();
    ctx.arc(cx + 13, py + 17, 2.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawSmelterBuilding(ctx: CanvasRenderingContext2D, px: number, py: number, t: number, working: boolean) {
    const cx = px + TILE / 2;
    ctx.fillStyle = '#8b4a3c';
    ctx.fillRect(px + 4, py + 16, TILE - 8, TILE - 20);
    ctx.fillStyle = '#6d372c';
    for (let k = 0; k < 4; k++) ctx.fillRect(px + 4, py + 20 + k * 5, TILE - 8, 1);
    roof(ctx, px + 4, py + 9, TILE - 8, 8, '#3d3a3a', '#262424');
    ctx.fillStyle = '#4a4646';
    ctx.fillRect(px + TILE - 15, py + 1, 7, 12);
    ctx.fillStyle = '#2b2828';
    ctx.fillRect(px + TILE - 16, py, 9, 3);
    ctx.fillStyle = '#1a0f0d';
    ctx.fillRect(cx - 7, py + 25, 14, 13);
    ctx.fillStyle = working ? `rgb(255,${140 + Math.round(60 * Math.sin(t * 0.02))},40)` : '#4a2018';
    ctx.fillRect(cx - 5, py + 28, 10, 8);
    if (working) {
        for (let k = 0; k < 3; k++) {
            const ph = (t * 0.0008 + k / 3) % 1;
            ctx.fillStyle = `rgba(210,210,210,${0.55 * (1 - ph)})`;
            ctx.beginPath();
            ctx.arc(px + TILE - 11.5 + ph * 4, py - ph * 12, 3 + ph * 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawWorkshop(ctx: CanvasRenderingContext2D, px: number, py: number, t: number, working: boolean) {
    const cx = px + TILE / 2;
    ctx.fillStyle = '#3f6ea4';
    ctx.fillRect(px + 4, py + 14, TILE - 8, TILE - 18);
    ctx.fillStyle = '#2f5584';
    ctx.fillRect(px + 4, py + 14, TILE - 8, 4);
    roof(ctx, px + 4, py + 7, TILE - 8, 7, '#d8dde3', '#9aa3ae');
    ctx.fillStyle = '#ffd84d';
    ctx.fillRect(px + 8, py + 18, 3, TILE - 22);
    ctx.fillRect(px + TILE - 11, py + 18, 3, TILE - 22);
    windowAt(ctx, px + 13, py + 21, 8, 7, working);
    windowAt(ctx, px + 24, py + 21, 8, 7, working);
    ctx.fillStyle = '#1f3a5c';
    ctx.fillRect(cx - 8, py + 30, 16, 8);
    ctx.save();
    ctx.translate(px + TILE - 9, py + 8);
    ctx.rotate(working ? Math.sin(t * 0.01) * 0.6 : 0.2);
    ctx.fillStyle = '#ffd84d';
    ctx.fillRect(-2, -10, 3, 14);
    ctx.fillRect(-7, -11, 9, 3);
    ctx.restore();
}

function drawFabBuilding(ctx: CanvasRenderingContext2D, px: number, py: number, t: number, working: boolean) {
    const cx = px + TILE / 2;
    ctx.fillStyle = '#2f8f7a';
    ctx.fillRect(px + 4, py + 15, TILE - 8, TILE - 19);
    ctx.fillStyle = '#c9f0e2';
    ctx.fillRect(px + 4, py + 15, TILE - 8, 3);
    ctx.fillStyle = '#1d4f45';
    ctx.beginPath();
    ctx.moveTo(px + 3, py + 15);
    ctx.lineTo(px + 14, py + 5);
    ctx.lineTo(px + TILE - 3, py + 5);
    ctx.lineTo(px + TILE - 3, py + 15);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8fe3c8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px + TILE - 8, py + 5);
    ctx.lineTo(px + TILE - 8, py - 2);
    ctx.stroke();
    ctx.fillStyle = working && Math.sin(t * 0.01) > 0 ? '#ff6b6b' : '#7a3a3a';
    ctx.beginPath();
    ctx.arc(px + TILE - 8, py - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10161e';
    ctx.fillRect(px + 8, py + 20, 16, 14);
    gear(ctx, px + 13, py + 27, 5, working ? t * 0.005 : 0, '#8fe3c8');
    gear(ctx, px + 20, py + 29, 3.5, working ? -t * 0.007 : 0.3, '#ffd84d');
    ctx.fillStyle = working ? '#7dff9a' : '#336655';
    ctx.fillRect(px + 28, py + 21, 8, 4);
    ctx.fillStyle = '#e8f7f1';
    ctx.fillRect(cx + 4, py + 29, 10, 8);
}

function drawWarehouse(ctx: CanvasRenderingContext2D, px: number, py: number) {
    ctx.fillStyle = '#7a5aa6';
    ctx.fillRect(px + 3, py + 13, TILE - 6, TILE - 16);
    ctx.fillStyle = '#4e3a72';
    ctx.beginPath();
    ctx.moveTo(px + 2, py + 13);
    ctx.lineTo(px + TILE / 2, py + 3);
    ctx.lineTo(px + TILE - 2, py + 13);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d2bff0';
    ctx.fillRect(px + 9, py + 20, TILE - 18, TILE - 23);
    ctx.strokeStyle = '#7a5aa6';
    ctx.lineWidth = 1.5;
    for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        ctx.moveTo(px + 9, py + 24 + k * 4);
        ctx.lineTo(px + TILE - 9, py + 24 + k * 4);
        ctx.stroke();
    }
    ctx.fillStyle = '#ffd84d';
    ctx.fillRect(px + TILE / 2 - 3, py + 8, 6, 3);
}

function drawDock(ctx: CanvasRenderingContext2D, b: Building, px: number, py: number) {
    ctx.fillStyle = '#5b4220';
    ctx.fillRect(px + 4, py + 14, TILE - 8, TILE - 18);
    ctx.fillStyle = '#c2802f';
    ctx.fillRect(px + 3, py + 8, TILE - 6, 8);
    ctx.fillStyle = '#ffd9a0';
    for (let k = 0; k < 4; k++) ctx.fillRect(px + 5 + k * 9, py + 8, 4, 8);
    ctx.fillStyle = '#2a1d0c';
    ctx.fillRect(px + 9, py + 22, TILE - 18, 14);
    ctx.fillStyle = '#e0b070';
    if (b.setting) {
        drawItem(ctx, b.setting, px + TILE / 2, py + 29, 8);
    } else {
        ctx.font = 'bold 14px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('?', px + TILE / 2, py + 34);
    }
}

function drawMachine(ctx: CanvasRenderingContext2D, b: Building, px: number, py: number, t: number) {
    const cx = px + TILE / 2;
    const cy = py + TILE / 2;
    const working = b.job !== null || b.outCount > 0;
    ctx.fillStyle = '#00000055';
    ctx.beginPath();
    ctx.ellipse(cx + 2, py + TILE - 3, TILE / 2 - 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    if (b.kind === 'minero') drawMine(ctx, b, px, py, t, working);
    else if (b.kind === 'fundidora') drawSmelterBuilding(ctx, px, py, t, working);
    else if (b.kind === 'constructor') drawWorkshop(ctx, px, py, t, working);
    else if (b.kind === 'ensambladora') drawFabBuilding(ctx, px, py, t, working);
    else if (b.kind === 'despacho') drawDock(ctx, b, px, py);
    else drawWarehouse(ctx, px, py);
    if (b.kind !== 'almacen') {
        ctx.fillStyle = '#000000aa';
        ctx.beginPath();
        ctx.arc(cx + [0, 19, 0, -19][b.dir], cy + [-19, 0, 19, 0][b.dir], 7, 0, Math.PI * 2);
        ctx.fill();
        arrow(ctx, cx + [0, 19, 0, -19][b.dir], cy + [-19, 0, 19, 0][b.dir], b.dir, 5, '#ffd84d');
    }
    if (b.out && b.outCount > 0) {
        ctx.fillStyle = '#000000aa';
        ctx.fillRect(px + 4, py + TILE - 17, 15, 13);
        drawItem(ctx, b.out, px + 11.5, py + TILE - 10.5, 4.5);
    }
}

const MOUNTAIN: Partial<Record<Item, [string, string, string]>> = {
    menaHierro: ['#8796a8', '#5c6b7d', '#c6d3e2'],
    menaCobre: ['#a8683a', '#74421f', '#f0a566'],
    piedra: ['#aaa392', '#7a7466', '#e2dccd'],
};

function drawDeposit(ctx: CanvasRenderingContext2D, ore: Item, px: number, py: number, i: number) {
    const [light, dark, fleck] = MOUNTAIN[ore]!;
    const peaks = 1 + (hash(i, 7) > 0.5 ? 1 : 0);
    ctx.fillStyle = '#00000044';
    ctx.beginPath();
    ctx.ellipse(px + TILE / 2, py + TILE - 5, TILE / 2 - 3, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let k = 0; k < peaks; k++) {
        const bx = px + 8 + k * 17 + hash(i, k) * 6;
        const w = 12 + hash(i, k + 3) * 6;
        const h = 18 + hash(i, k + 5) * 12 - k * 4;
        const base = py + TILE - 6;
        ctx.fillStyle = dark;
        ctx.beginPath();
        ctx.moveTo(bx, base);
        ctx.lineTo(bx + 1, base - h);
        ctx.lineTo(bx + w, base);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = light;
        ctx.beginPath();
        ctx.moveTo(bx - w, base);
        ctx.lineTo(bx + 1, base - h);
        ctx.lineTo(bx + 1, base);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = fleck;
        ctx.beginPath();
        ctx.moveTo(bx + 1, base - h);
        ctx.lineTo(bx - w * 0.28, base - h * 0.7);
        ctx.lineTo(bx + 2, base - h * 0.78);
        ctx.lineTo(bx + w * 0.25, base - h * 0.7);
        ctx.closePath();
        ctx.fill();
        for (let m = 0; m < 3; m++) {
            ctx.fillRect(bx - w * 0.6 + hash(i, m + k * 3 + 11) * w * 1.3, base - 3 - hash(i, m + 20) * h * 0.5, 2.5, 2.5);
        }
    }
}

export function draw(ctx: CanvasRenderingContext2D, world: World, camX: number, camY: number, width: number, height: number, t: number, phase: number, selected = -1) {
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
            if (b.kind === 'cinta') drawBelt(ctx, b, px, py, t, phase, world, x, y);
            else drawMachine(ctx, b, px, py, t);
            if (i === selected) {
                ctx.strokeStyle = '#ffd84d';
                ctx.lineWidth = 3;
                ctx.strokeRect(px + 1.5, py + 1.5, TILE - 3, TILE - 3);
            }
        }
    }
}
