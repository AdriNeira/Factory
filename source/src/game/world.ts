import { COST, DX, DY, EMPTY_COUNTS, GOALS, HEIGHT, KIND_NAME, KIND_NEEDS, MAX_BUILDINGS, RECIPES, RESEARCH, SMELT, WIDTH } from './config';
import type { Building, Counts, Dir, Item, Kind, Recipe, ResearchId, World } from './types';

const IRON: [number, number][] = [[6, 6], [25, 8], [10, 25]];
const COPPER: [number, number][] = [[8, 15], [24, 22], [18, 4]];
const STONE: [number, number][] = [[20, 14], [4, 28], [28, 28]];

export const index = (x: number, y: number) => y * WIDTH + x;
export const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < WIDTH && y < HEIGHT;

function newBuilding(kind: Kind, dir: Dir): Building {
    return { kind, dir, item: null, input: {}, job: null, progress: 0, out: null, outCount: 0, moved: false };
}

function patch(deposits: (Item | null)[], centers: [number, number][], item: Item) {
    for (const [cx, cy] of centers) {
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                if (dx * dx + dy * dy <= 5 && inside(cx + dx, cy + dy) && !deposits[index(cx + dx, cy + dy)]) deposits[index(cx + dx, cy + dy)] = item;
            }
        }
    }
}

export function createWorld(): World {
    const deposits: (Item | null)[] = new Array(WIDTH * HEIGHT).fill(null);
    patch(deposits, IRON, 'menaHierro');
    patch(deposits, COPPER, 'menaCobre');
    patch(deposits, STONE, 'piedra');
    const world: World = {
        deposits,
        cells: new Array(WIDTH * HEIGHT).fill(null),
        stock: { ...EMPTY_COUNTS, lingoteHierro: 40 },
        delivered: { ...EMPTY_COUNTS },
        goal: 0,
        research: [],
        count: 0,
    };
    world.cells[index(13, 11)] = newBuilding('almacen', 0);
    world.count = 1;
    return world;
}

export const has = (world: World, id: ResearchId) => world.research.includes(id);
export const researchName = (id: ResearchId) => RESEARCH.find(r => r.id === id)!.name;

export function canPay(world: World, cost: Partial<Counts>): boolean {
    return (Object.keys(cost) as Item[]).every(k => world.stock[k] >= (cost[k] ?? 0));
}

function pay(world: World, cost: Partial<Counts>) {
    for (const k of Object.keys(cost) as Item[]) world.stock[k] -= cost[k] ?? 0;
}

function refund(world: World, cost: Partial<Counts>) {
    for (const k of Object.keys(cost) as Item[]) world.stock[k] += cost[k] ?? 0;
}

export function available(world: World, id: ResearchId): boolean {
    const def = RESEARCH.find(r => r.id === id)!;
    return !has(world, id) && (!def.needs || has(world, def.needs));
}

export function research(world: World, id: ResearchId): string | null {
    const def = RESEARCH.find(r => r.id === id);
    if (!def || !available(world, id)) return null;
    if (!canPay(world, def.cost)) return 'Faltan materiales en el almacén';
    pay(world, def.cost);
    world.research.push(id);
    return `Investigado: ${def.name}`;
}

export function recipes(world: World, kind: Kind): Recipe[] {
    return (RECIPES[kind] ?? []).filter(r => !r.needs || has(world, r.needs));
}

function inputCap(world: World, kind: Kind, item: Item): number {
    let cap = 0;
    for (const r of recipes(world, kind)) cap = Math.max(cap, (r.ins[item] ?? 0) * 3);
    return Math.max(cap, 6);
}

export function place(world: World, x: number, y: number, kind: Kind, dir: Dir): string | null {
    if (!inside(x, y)) return null;
    const i = index(x, y);
    const current = world.cells[i];
    if (current) {
        if (current.kind === 'almacen') return null;
        current.dir = dir;
        return null;
    }
    if (kind === 'minero' && !world.deposits[i]) return 'El minero va sobre un yacimiento';
    if (kind === 'minero' && world.deposits[i] === 'piedra' && !has(world, 'hormigon')) return 'Investiga Hormigón para minar piedra';
    const needed = KIND_NEEDS[kind];
    if (needed && !has(world, needed)) return `Investiga ${researchName(needed)} para usar ${KIND_NAME[kind]}`;
    if (world.count >= MAX_BUILDINGS) return 'Límite de piezas alcanzado';
    if (!canPay(world, COST[kind])) return 'Faltan materiales';
    pay(world, COST[kind]);
    world.cells[i] = newBuilding(kind, dir);
    world.count++;
    return null;
}

export function remove(world: World, x: number, y: number) {
    if (!inside(x, y)) return;
    const i = index(x, y);
    const current = world.cells[i];
    if (!current) return;
    refund(world, COST[current.kind]);
    world.cells[i] = null;
    world.count--;
}

function accepts(world: World, target: Building | null, item: Item, from: Dir): boolean {
    if (!target) return false;
    switch (target.kind) {
        case 'cinta':
            return target.item === null && (target.dir + 2) % 4 !== from;
        case 'fundidora':
            return SMELT[item] !== undefined && (target.input[item] ?? 0) < 5;
        case 'constructor':
        case 'ensambladora':
            return recipes(world, target.kind).some(r => r.ins[item] !== undefined) && (target.input[item] ?? 0) < inputCap(world, target.kind, item);
        case 'almacen':
            return true;
        default:
            return false;
    }
}

function deliver(world: World, target: Building, item: Item) {
    switch (target.kind) {
        case 'cinta':
            target.item = item;
            target.moved = true;
            break;
        case 'almacen':
            world.stock[item]++;
            world.delivered[item]++;
            break;
        default:
            target.input[item] = (target.input[item] ?? 0) + 1;
    }
}

function push(world: World, x: number, y: number, source: Building, item: Item): boolean {
    const tx = x + DX[source.dir];
    const ty = y + DY[source.dir];
    if (!inside(tx, ty)) return false;
    const target = world.cells[index(tx, ty)];
    if (!accepts(world, target, item, source.dir)) return false;
    deliver(world, target as Building, item);
    return true;
}

function emit(world: World, x: number, y: number, b: Building) {
    if (b.outCount > 0 && b.out && push(world, x, y, b, b.out)) {
        b.outCount--;
        if (b.outCount === 0) b.out = null;
    }
}

function runMiner(world: World, x: number, y: number, b: Building) {
    const ore = world.deposits[index(x, y)];
    if (ore && b.outCount < 5 && ++b.progress >= (has(world, 'mineria') ? 2 : 4)) {
        b.progress = 0;
        b.out = ore;
        b.outCount++;
    }
    emit(world, x, y, b);
}

function runSmelter(world: World, x: number, y: number, b: Building) {
    if (!b.job) {
        const ore = (['menaHierro', 'menaCobre'] as Item[]).find(o => (b.input[o] ?? 0) > 0);
        if (ore && b.outCount < 5) {
            b.input[ore]! -= 1;
            b.job = ore;
            b.progress = 0;
        }
    } else if (++b.progress >= (has(world, 'fundicion') ? 3 : 6)) {
        const result = SMELT[b.job]!;
        if (b.outCount === 0 || b.out === result) {
            b.out = result;
            b.outCount++;
            b.job = null;
        } else {
            b.progress = has(world, 'fundicion') ? 2 : 5;
        }
    }
    emit(world, x, y, b);
}

function runCrafter(world: World, x: number, y: number, b: Building) {
    const list = recipes(world, b.kind);
    if (!b.job) {
        const recipe = list.find(r => (Object.keys(r.ins) as Item[]).every(k => (b.input[k] ?? 0) >= (r.ins[k] ?? 0)));
        if (recipe) {
            for (const k of Object.keys(recipe.ins) as Item[]) b.input[k]! -= recipe.ins[k] ?? 0;
            b.job = recipe.out;
            b.progress = 0;
        }
    } else {
        const recipe = list.find(r => r.out === b.job)!;
        if (++b.progress >= recipe.time) {
            if (b.outCount === 0 || b.out === recipe.out) {
                b.out = recipe.out;
                b.outCount += recipe.amount;
                b.job = null;
            } else {
                b.progress = recipe.time - 1;
            }
        }
    }
    emit(world, x, y, b);
}

function runBelt(world: World, x: number, y: number, b: Building) {
    if (b.item && !b.moved && push(world, x, y, b, b.item)) b.item = null;
}

function updateGoal(world: World) {
    const goal = GOALS[world.goal];
    if (goal && world.delivered[goal.item] >= goal.amount) {
        world.goal++;
        world.stock.lingoteHierro += goal.reward;
    }
}

export function step(world: World) {
    for (const b of world.cells) if (b) b.moved = false;
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const b = world.cells[index(x, y)];
            if (!b) continue;
            if (b.kind === 'minero') runMiner(world, x, y, b);
            else if (b.kind === 'fundidora') runSmelter(world, x, y, b);
            else if (b.kind === 'constructor' || b.kind === 'ensambladora') runCrafter(world, x, y, b);
            else if (b.kind === 'cinta') runBelt(world, x, y, b);
        }
    }
    updateGoal(world);
}
