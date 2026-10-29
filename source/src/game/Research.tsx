import React from 'react';
import { ITEM_NAME, KIND_NAME, RECIPES, RESEARCH, costText, recipeText } from './config';
import { available, canPay, has, recipes } from './world';
import type { Item, Kind, ResearchId, World } from './types';

interface Props {
    world: World;
    onResearch: (id: ResearchId) => void;
    onClose: () => void;
}

export function Research({ world, onResearch, onClose }: Props) {
    const stored = (Object.keys(world.stock) as Item[])
        .filter(k => world.stock[k] > 0)
        .map(k => `${world.stock[k]} ${ITEM_NAME[k]}`)
        .join(', ');

    return <div className="panel">
        <div className="panel-box">
            <h2>Investigación</h2>
            <p className="hint">Las investigaciones gastan materiales del almacén. Almacén: {stored || 'vacío'}.</p>
            {RESEARCH.map(r => {
                const done = has(world, r.id);
                const open = available(world, r.id);
                return <div className="research" key={r.id}>
                    <strong>{r.name}</strong>
                    <p className="hint">{r.text}</p>
                    <p className="hint">{done ? 'Hecho' : open ? `Coste: ${costText(r.cost)}` : `Antes: ${RESEARCH.find(x => x.id === r.needs)!.name}`}</p>
                    {open && <button disabled={!canPay(world, r.cost)} onClick={() => onResearch(r.id)}>Investigar</button>}
                </div>;
            })}
            <h2>Recetas</h2>
            <p className="hint">Cada máquina elige sola la receta según los materiales que le llegan. Lleva cada material por una cinta distinta, o junta máquinas para que se pasen la pieza directamente.</p>
            {(Object.keys(RECIPES) as Kind[]).map(k => <p className="hint" key={k}>
                <strong>{KIND_NAME[k]}:</strong> {recipes(world, k).map(recipeText).join('; ')}
            </p>)}
            <p className="hint"><strong>Hormigón:</strong> la piedra minada no cuenta. Llévala por cinta a una Constructora y la salida, por cinta, al almacén.</p>
            <p className="hint"><strong>Despacho:</strong> saca del almacén el material que elijas. Ponlo pegado a una máquina o al inicio de una cinta, apuntando hacia ella, y toca el Despacho para elegir. Usa un Despacho por material.</p>
            <p className="hint"><strong>Fundidora:</strong> mena de hierro o de cobre da lingotes.</p>
            <button className="close" onClick={onClose}>Cerrar</button>
        </div>
    </div>;
}
