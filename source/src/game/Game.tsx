import React, { useCallback, useEffect, useRef, useState } from 'react';
import { COST, DX, DY, GOALS, HEIGHT, ITEM_NAME, KINDS, KIND_NAME, KIND_NEEDS, STEP_MS, TILE, WIDTH, costText } from './config';
import { draw } from './draw';
import { Panel } from './Panel';
import { Inspector } from './Inspector';
import { Research } from './Research';
import { Stock } from './Stock';
import { deserialize, serialize } from './save';
import type { Dir, Item, Kind, Tool, World } from './types';
import { createWorld, has, index, inside, place, remove, research, step } from './world';

const ARROWS = ['↑', '→', '↓', '←'];

export type Store = <T>(key: string, initial: T) => [T, (value: T) => void, { ready: boolean; message: string }];

export function Game({ useStore }: { useStore: Store }) {
    const [s0, setS0, r0] = useStore('fabrica.p1.v1', '');
    const [s1, setS1, r1] = useStore('fabrica.p2.v1', '');
    const [s2, setS2, r2] = useStore('fabrica.p3.v1', '');
    const [active, setActive, ra] = useStore('fabrica.activa.v1', 0);
    const ready = r0.ready && r1.ready && r2.ready && ra.ready;
    const slots = [s0, s1, s2];
    const setters = [setS0, setS1, setS2];
    const message = r0.message || '';

    const canvas = useRef<HTMLCanvasElement>(null);
    const holder = useRef<HTMLDivElement>(null);
    const world = useRef<World>(createWorld());
    const cam = useRef({ x: -2 * TILE, y: -4 * TILE });
    const toolRef = useRef<Tool>('mover');
    const dirRef = useRef<Dir>(1);
    const loaded = useRef(false);
    const stepAt = useRef(performance.now());
    const [tool, setTool] = useState<Tool>('mover');
    const [dir, setDir] = useState<Dir>(1);
    const [, setTick] = useState(0);
    const [toast, setToast] = useState('');
    const [panel, setPanel] = useState(false);
    const [labPanel, setLabPanel] = useState(false);
    const [stockPanel, setStockPanel] = useState(false);
    const [sel, setSel] = useState(-1);
    const selRef = useRef(-1);
    selRef.current = sel;

    toolRef.current = tool;
    dirRef.current = dir;

    const notify = useCallback((text: string | null) => {
        if (text) {
            setToast(text);
            window.setTimeout(() => setToast(''), 2000);
        }
    }, []);

    const saveTo = (slot: number) => setters[slot](serialize(world.current));
    const autosave = useRef(saveTo);
    autosave.current = saveTo;
    const activeRef = useRef(active);
    activeRef.current = active;

    useEffect(() => {
        if (!ready || loaded.current) return;
        loaded.current = true;
        const stored = slots[active as number];
        const restored = stored ? deserialize(stored) : null;
        if (restored) world.current = restored;
    }, [ready]);

    useEffect(() => {
        const timer = window.setInterval(() => {
            step(world.current);
            stepAt.current = performance.now();
            setTick(t => t + 1);
        }, STEP_MS);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!ready) return;
        const timer = window.setInterval(() => autosave.current(activeRef.current as number), 6000);
        return () => window.clearInterval(timer);
    }, [ready]);

    const clampCam = useCallback((w: number, h: number) => {
        cam.current.x = Math.min(0, Math.max(w - WIDTH * TILE, cam.current.x));
        cam.current.y = Math.min(0, Math.max(h - HEIGHT * TILE, cam.current.y));
    }, []);

    useEffect(() => {
        let frame = 0;
        const render = () => {
            const el = canvas.current;
            const box = holder.current;
            if (el && box) {
                const ratio = window.devicePixelRatio || 1;
                const w = box.clientWidth;
                const h = box.clientHeight;
                if (el.width !== Math.round(w * ratio) || el.height !== Math.round(h * ratio)) {
                    el.width = Math.round(w * ratio);
                    el.height = Math.round(h * ratio);
                }
                clampCam(w, h);
                const ctx = el.getContext('2d');
                if (ctx) {
                    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
                    const now = performance.now();
                    draw(ctx, world.current, cam.current.x, cam.current.y, w, h, now, Math.min(1, (now - stepAt.current) / STEP_MS), selRef.current);
                }
            }
            frame = requestAnimationFrame(render);
        };
        frame = requestAnimationFrame(render);
        return () => cancelAnimationFrame(frame);
    }, [clampCam]);

    const gesture = useRef({ id: -1, sx: 0, sy: 0, cx: 0, cy: 0, moved: false, last: -1 });

    const cellAt = (clientX: number, clientY: number) => {
        const rect = canvas.current!.getBoundingClientRect();
        return {
            x: Math.floor((clientX - rect.left - cam.current.x) / TILE),
            y: Math.floor((clientY - rect.top - cam.current.y) / TILE),
        };
    };

    const apply = (x: number, y: number) => {
        const t = toolRef.current;
        if (t === 'mover') {
            setSel(inside(x, y) && world.current.cells[index(x, y)] ? index(x, y) : -1);
            return;
        }
        if (t === 'borrar') remove(world.current, x, y);
        else {
            notify(place(world.current, x, y, t, dirRef.current));
            const built = inside(x, y) ? world.current.cells[index(x, y)] : null;
            if (t === 'despacho' && built && !built.setting) setSel(index(x, y));
        }
    };

    const paintBelt = (x: number, y: number) => {
        const g = gesture.current;
        const i = index(x, y);
        if (i === g.last) return;
        if (g.last >= 0) {
            const lx = g.last % WIDTH;
            const ly = Math.floor(g.last / WIDTH);
            const d = [0, 1, 2, 3].find(k => lx + DX[k] === x && ly + DY[k] === y);
            if (d === undefined) {
                g.last = i;
                return;
            }
            const prev = world.current.cells[g.last];
            if (prev && prev.kind === 'cinta') prev.dir = d as Dir;
            dirRef.current = d as Dir;
            setDir(d as Dir);
        }
        if (!world.current.cells[i]) notify(place(world.current, x, y, 'cinta', dirRef.current));
        g.last = i;
    };

    const onDown = (e: React.PointerEvent) => {
        const g = gesture.current;
        e.currentTarget.setPointerCapture(e.pointerId);
        g.id = e.pointerId;
        g.sx = g.cx = e.clientX;
        g.sy = g.cy = e.clientY;
        g.moved = false;
        g.last = -1;
        if (toolRef.current === 'cinta') {
            const c = cellAt(e.clientX, e.clientY);
            if (inside(c.x, c.y)) {
                const existing = world.current.cells[index(c.x, c.y)];
                if (!existing) notify(place(world.current, c.x, c.y, 'cinta', dirRef.current));
                g.last = index(c.x, c.y);
            }
        }
    };

    const onMove = (e: React.PointerEvent) => {
        const g = gesture.current;
        if (e.pointerId !== g.id) return;
        if (toolRef.current === 'cinta') {
            const c = cellAt(e.clientX, e.clientY);
            if (inside(c.x, c.y) && Math.hypot(e.clientX - g.sx, e.clientY - g.sy) > 8) {
                g.moved = true;
                paintBelt(c.x, c.y);
            }
            return;
        }
        if (!g.moved && Math.hypot(e.clientX - g.sx, e.clientY - g.sy) < 8) return;
        g.moved = true;
        cam.current.x += e.clientX - g.cx;
        cam.current.y += e.clientY - g.cy;
        g.cx = e.clientX;
        g.cy = e.clientY;
    };

    const onUp = (e: React.PointerEvent) => {
        const g = gesture.current;
        if (e.pointerId !== g.id) return;
        g.id = -1;
        if (g.moved) return;
        const c = cellAt(e.clientX, e.clientY);
        if (toolRef.current === 'cinta') {
            const existing = inside(c.x, c.y) ? world.current.cells[index(c.x, c.y)] : null;
            if (existing) notify(place(world.current, c.x, c.y, 'cinta', dirRef.current));
            return;
        }
        apply(c.x, c.y);
    };

    const w = world.current;
    const goal = GOALS[w.goal];
    const buttons: Tool[] = ['mover', ...KINDS.filter(k => KIND_NEEDS[k] === null || has(w, KIND_NEEDS[k]!)), 'borrar'];
    const selected = sel >= 0 ? world.current.cells[sel] : null;
    const costLabel = (k: Kind) => `${COST[k].lingoteHierro ?? 0}${Object.keys(COST[k]).length > 1 ? '+' : ''}`;
    const choose = (t: Tool) => {
        setTool(t);
        if (t !== 'mover' && t !== 'borrar') notify(`${KIND_NAME[t as Kind]}: ${costText(COST[t as Kind])}`);
    };

    return <div className="game">
        <div className="map" ref={holder}>
            <canvas
                ref={canvas}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
            />
            {toast && <div className="toast">{toast}</div>}
        </div>
        {selected && <Inspector
            world={w}
            building={selected}
            ore={w.deposits[sel]}
            onPick={item => { selected.setting = item; setTick(t => t + 1); }}
            onTurn={() => { selected.dir = ((selected.dir + 1) % 4) as Dir; setTick(t => t + 1); }}
            onRemove={() => { remove(world.current, sel % WIDTH, Math.floor(sel / WIDTH)); setSel(-1); }}
            onClose={() => setSel(-1)}
        />}
        <div className="hud">
            <div className="goal">
                {goal ? `${goal.text}: ${Math.min(w.delivered[goal.item], goal.amount)}/${goal.amount}` : 'Todos los objetivos cumplidos. Sigue ampliando.'}
            </div>
            <div className="stock">
                <button className="wide" onClick={() => setStockPanel(true)}>Almacén · hierro {w.stock.lingoteHierro}</button>
                <div className="row">
                    <button onClick={() => setLabPanel(true)}>Investigar</button>
                    <button onClick={() => setPanel(true)}>Partidas</button>
                </div>
            </div>
        </div>
        <div className="bar">
            {buttons.map(t => <button key={t} className={tool === t ? 'on' : ''} onClick={() => choose(t)}>
                {t === 'mover' ? 'Mover' : t === 'borrar' ? 'Borrar' : KIND_NAME[t as Kind]}
                {t !== 'mover' && t !== 'borrar' && <small>{costLabel(t as Kind)}</small>}
            </button>)}
            <button onClick={() => setDir(((dir + 1) % 4) as Dir)}>Girar {ARROWS[dir]}</button>
        </div>
        {labPanel && <Research
            world={w}
            onResearch={id => notify(research(world.current, id))}
            onClose={() => setLabPanel(false)}
        />}
        {stockPanel && <Stock world={w} onClose={() => setStockPanel(false)} />}
        {panel && <Panel
            stock={Object.keys(w.stock).filter(k => k !== 'lingoteHierro' && w.stock[k as keyof typeof w.stock] > 0).map(k => `${w.stock[k as keyof typeof w.stock]} ${ITEM_NAME[k as keyof typeof w.stock]}`).join(', ') || 'nada más'}
            slots={slots}
            active={active as number}
            message={message}
            current={() => serialize(world.current)}
            onSelect={n => setActive(n)}
            onSave={n => saveTo(n)}
            onLoad={n => {
                const restored = deserialize(slots[n]);
                if (restored) {
                    world.current = restored;
                    setSel(-1);
                    setActive(n);
                    setPanel(false);
                }
            }}
            onNew={() => {
                world.current = createWorld();
                setSel(-1);
                setPanel(false);
            }}
            onImport={restored => {
                world.current = restored;
                setSel(-1);
                setPanel(false);
            }}
            onClose={() => setPanel(false)}
        />}
    </div>;
}
