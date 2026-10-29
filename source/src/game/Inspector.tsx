import React from 'react';
import { ITEM_COLOR, ITEM_NAME } from './config';
import { describe, dispatchItems, title } from './info';
import type { Building, Item, World } from './types';

interface Props {
    world: World;
    building: Building;
    ore: Item | null;
    onPick: (item: Item) => void;
    onTurn: () => void;
    onRemove: () => void;
    onClose: () => void;
}

export function Inspector({ world, building, ore, onPick, onTurn, onRemove, onClose }: Props) {
    const items = dispatchItems(world);
    if (building.setting && !items.includes(building.setting)) items.push(building.setting);
    return <div className="inspector">
        <div className="inspector-head">
            <strong>{title(building)}</strong>
            <button onClick={onClose}>Cerrar</button>
        </div>
        {describe(world, building, ore).map((line, i) => <p className="hint" key={i}>{line}</p>)}
        {building.kind === 'despacho' && <div className="chips">
            {items.length === 0 && <p className="hint">El almacén está vacío.</p>}
            {items.map(k => <button key={k} className={building.setting === k ? 'on' : ''} onClick={() => onPick(k)}>
                <span className="dot" style={{ background: ITEM_COLOR[k] }} />
                {ITEM_NAME[k]}
                <small>{world.stock[k]}</small>
            </button>)}
        </div>}
        {building.kind !== 'almacen' && <div className="row">
            <button onClick={onTurn}>Girar</button>
            <button onClick={onRemove}>Borrar</button>
        </div>}
    </div>;
}
