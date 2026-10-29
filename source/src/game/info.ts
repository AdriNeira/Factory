import { ITEM_NAME, KIND_NAME, ITEMS, recipeText } from './config';
import { recipes } from './world';
import type { Building, Item, World } from './types';

const held = (b: Building) =>
    (Object.keys(b.input) as Item[]).filter(k => (b.input[k] ?? 0) > 0).map(k => `${b.input[k]} ${ITEM_NAME[k]}`).join(', ');

export function describe(world: World, b: Building, ore: Item | null): string[] {
    const lines: string[] = [];
    switch (b.kind) {
        case 'almacen':
            lines.push('Guarda todo lo que llega. Pon un Despacho pegado a otra máquina o a una cinta para sacar materiales.');
            break;
        case 'minero':
            lines.push(ore ? `Extrae ${ITEM_NAME[ore]} y lo manda hacia la flecha.` : 'No está sobre un yacimiento.');
            if (b.outCount >= 5) lines.push('Salida bloqueada: la flecha debe apuntar a una cinta o máquina.');
            break;
        case 'cinta':
            lines.push(b.item ? `Lleva ${ITEM_NAME[b.item]}.` : 'Cinta vacía.');
            break;
        case 'despacho':
            lines.push(b.setting
                ? `Saca ${ITEM_NAME[b.setting]} del almacén (hay ${world.stock[b.setting]}) y lo manda hacia la flecha.`
                : 'Elige qué material sacar del almacén.');
            if (b.setting && world.stock[b.setting] === 0) lines.push('No queda de ese material en el almacén.');
            break;
        default: {
            if (b.job) lines.push(`Fabricando ${ITEM_NAME[b.job]}.`);
            else lines.push('Esperando ingredientes.');
            const inside = held(b);
            if (inside) lines.push(`Dentro: ${inside}.`);
            if (!b.job) for (const r of recipes(world, b.kind)) lines.push(recipeText(r));
            if (b.outCount > 0 && b.out) lines.push(`${b.outCount} ${ITEM_NAME[b.out]} esperando salir. Revisa que la flecha apunte a una cinta o máquina.`);
        }
    }
    return lines;
}

export const dispatchItems = (world: World) => ITEMS.filter(k => world.stock[k] > 0);

export const title = (b: Building) => KIND_NAME[b.kind];
