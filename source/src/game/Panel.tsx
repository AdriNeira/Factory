import React, { useState } from 'react';
import { decode, deserialize, encode } from './save';
import type { World } from './types';

interface Props {
    stock: string;
    slots: string[];
    active: number;
    message: string;
    current: () => string;
    onSelect: (slot: number) => void;
    onSave: (slot: number) => void;
    onLoad: (slot: number) => void;
    onNew: () => void;
    onImport: (world: World) => void;
    onClose: () => void;
}

export function Panel({ stock, slots, active, message, current, onSelect, onSave, onLoad, onNew, onImport, onClose }: Props) {
    const [code, setCode] = useState('');
    const [note, setNote] = useState('');

    const exportCode = () => {
        setCode(encode(current()));
        setNote('Copia generada. Selecciona el texto, cópialo y guárdalo en tus notas.');
    };

    const importCode = () => {
        try {
            const world = deserialize(decode(code));
            if (!world) throw new Error();
            onImport(world);
            setNote('Copia cargada.');
        } catch {
            setNote('El código no es válido.');
        }
    };

    return <div className="panel">
        <div className="panel-box">
            <h2>Cómo se juega</h2>
            <p className="hint">Toca el mapa para colocar la pieza elegida. Con Cinta, arrastra para trazarla. Tocar una pieza ya puesta la gira. Mover arrastra el mapa. Borrar devuelve el coste. El minero va sobre un yacimiento. Los materiales del almacén sirven para construir y para Investigar (botón Investigar, con las recetas). Almacén guardado: {stock}.</p>
            <h2>Partidas</h2>
            {slots.map((value, i) => <div className="slot" key={i}>
                <button className={i === active ? 'on' : ''} onClick={() => onSelect(i)}>Partida {i + 1}{i === active ? ' (activa)' : ''}</button>
                <span>{value ? `${(value.length / 1024).toFixed(1)} KB de 16` : 'vacía'}</span>
                <button onClick={() => onSave(i)}>Guardar</button>
                <button disabled={!value} onClick={() => onLoad(i)}>Cargar</button>
            </div>)}
            <p className="hint">La partida activa se guarda sola cada pocos segundos. {message}</p>
            <button onClick={onNew}>Nueva partida</button>
            <h2>Copia de seguridad</h2>
            <div className="slot">
                <button onClick={exportCode}>Crear copia</button>
                <button onClick={importCode} disabled={!code}>Cargar copia</button>
            </div>
            <textarea value={code} onChange={e => setCode(e.target.value)} rows={4} placeholder="Aquí aparece el código de la copia. Para recuperar, pégalo aquí." />
            <p className="hint">{note}</p>
            <button className="close" onClick={onClose}>Cerrar</button>
        </div>
    </div>;
}
