import React from 'react';
import { ITEM_COLOR, ITEM_NAME, ITEMS } from './config';
import type { World } from './types';

export function Stock({ world, onClose }: { world: World; onClose: () => void }) {
    const items = ITEMS.filter(k => world.stock[k] > 0);
    return <div className="panel">
        <div className="panel-box">
            <h2>Almacén</h2>
            <p className="hint">Aquí está todo lo que has entregado. Se gasta al construir e investigar. Para usarlo en otra línea, pon un Despacho, toca el Despacho y elige el material.</p>
            {items.length === 0 && <p className="hint">Vacío.</p>}
            {items.map(k => <div className="stock-line" key={k}>
                <span className="dot" style={{ background: ITEM_COLOR[k] }} />
                <span>{ITEM_NAME[k]}</span>
                <strong>{world.stock[k]}</strong>
            </div>)}
            <button className="close" onClick={onClose}>Cerrar</button>
        </div>
    </div>;
}
