import type { Counts, Item, Kind, Recipe, ResearchDef, ResearchId } from './types';

export const WIDTH = 32;
export const HEIGHT = 32;
export const TILE = 44;
export const STEP_MS = 250;
export const MAX_BUILDINGS = 700;
export const DX = [0, 1, 0, -1];
export const DY = [-1, 0, 1, 0];

export const KINDS: Kind[] = ['cinta', 'minero', 'fundidora', 'constructor', 'almacen', 'ensambladora', 'despacho'];

export const COST: Record<Kind, Partial<Counts>> = {
    cinta: { lingoteHierro: 1 },
    minero: { lingoteHierro: 8 },
    fundidora: { lingoteHierro: 10 },
    constructor: { lingoteHierro: 15 },
    almacen: { lingoteHierro: 5 },
    ensambladora: { lingoteHierro: 20, placa: 10, cable: 10 },
    despacho: { lingoteHierro: 5 },
};

export const KIND_NAME: Record<Kind, string> = {
    cinta: 'Cinta',
    minero: 'Minero',
    fundidora: 'Fundidora',
    constructor: 'Constructora',
    almacen: 'Almacén',
    ensambladora: 'Montadora',
    despacho: 'Despacho',
};

export const ITEM_NAME: Record<Item, string> = {
    menaHierro: 'mena de hierro',
    menaCobre: 'mena de cobre',
    piedra: 'piedra',
    lingoteHierro: 'lingotes de hierro',
    lingoteCobre: 'lingotes de cobre',
    placa: 'placas',
    cable: 'cables',
    hormigon: 'hormigón',
    circuito: 'circuitos',
    motor: 'motores',
    robot: 'robots',
};

export const ITEM_COLOR: Record<Item, string> = {
    menaHierro: '#8fa3b8',
    menaCobre: '#d9803f',
    piedra: '#b9b2a5',
    lingoteHierro: '#dfe7ef',
    lingoteCobre: '#ffb36b',
    placa: '#7ec8ff',
    cable: '#ffd84d',
    hormigon: '#8c8c8c',
    circuito: '#5de08a',
    motor: '#ff6b6b',
    robot: '#9ad0ff',
};

export const KIND_COLOR: Record<Kind, string> = {
    cinta: '#3b4252',
    minero: '#6b7f3a',
    fundidora: '#a44a3f',
    constructor: '#3f6ea4',
    almacen: '#7a5aa6',
    ensambladora: '#2f8f7a',
    despacho: '#c2802f',
};

export const ITEMS = Object.keys(ITEM_NAME) as Item[];

export const SMELT: Partial<Record<Item, Item>> = { menaHierro: 'lingoteHierro', menaCobre: 'lingoteCobre' };

export const EMPTY_COUNTS: Counts = {
    menaHierro: 0, menaCobre: 0, piedra: 0, lingoteHierro: 0, lingoteCobre: 0,
    placa: 0, cable: 0, hormigon: 0, circuito: 0, motor: 0, robot: 0,
};

export const GOALS: { item: Item; amount: number; text: string; reward: number }[] = [
    { item: 'menaHierro', amount: 20, text: 'Entrega 20 de mena de hierro al almacén', reward: 25 },
    { item: 'lingoteHierro', amount: 15, text: 'Entrega 15 lingotes de hierro', reward: 25 },
    { item: 'placa', amount: 10, text: 'Entrega 10 placas', reward: 25 },
    { item: 'lingoteCobre', amount: 20, text: 'Entrega 20 lingotes de cobre', reward: 25 },
    { item: 'cable', amount: 20, text: 'Entrega 20 cables', reward: 25 },
    { item: 'placa', amount: 40, text: 'Entrega 40 placas en total', reward: 25 },
    { item: 'hormigon', amount: 25, text: 'Investiga Hormigón, convierte piedra en hormigón en una Constructora y entrega 25 al almacén', reward: 40 },
    { item: 'circuito', amount: 25, text: 'Investiga Ensamblaje y entrega 25 circuitos', reward: 40 },
    { item: 'motor', amount: 10, text: 'Investiga Motores y entrega 10 motores', reward: 60 },
    { item: 'circuito', amount: 150, text: 'Entrega 150 circuitos en total', reward: 60 },
    { item: 'robot', amount: 5, text: 'Investiga Robótica y entrega 5 robots', reward: 150 },
    { item: 'motor', amount: 50, text: 'Entrega 50 motores en total', reward: 150 },
    { item: 'robot', amount: 20, text: 'Entrega 20 robots en total', reward: 250 },
];

export const RECIPES: Partial<Record<Kind, Recipe[]>> = {
    constructor: [
        { out: 'placa', amount: 1, ins: { lingoteHierro: 2 }, time: 8 },
        { out: 'cable', amount: 2, ins: { lingoteCobre: 1 }, time: 8 },
        { out: 'hormigon', amount: 1, ins: { piedra: 3 }, time: 8, needs: 'hormigon' },
    ],
    ensambladora: [
        { out: 'robot', amount: 1, ins: { motor: 2, circuito: 3, placa: 4 }, time: 18, needs: 'robotica' },
        { out: 'circuito', amount: 1, ins: { cable: 3, placa: 1 }, time: 10, needs: 'ensamblaje' },
        { out: 'motor', amount: 1, ins: { circuito: 2, placa: 3 }, time: 14, needs: 'motores' },
    ],
};

export const RESEARCH: ResearchDef[] = [
    { id: 'hormigon', name: 'Hormigón', text: 'Permite minar piedra y fabricar hormigón en la Constructora.', cost: { placa: 20, cable: 20 } },
    { id: 'ensamblaje', name: 'Ensamblaje', text: 'Desbloquea la Montadora, que fabrica circuitos con cables y placas.', cost: { placa: 30, cable: 30, hormigon: 15 }, needs: 'hormigon' },
    { id: 'motores', name: 'Motores', text: 'La Montadora también fabrica motores si recibe circuitos y placas.', cost: { circuito: 25, hormigon: 25 }, needs: 'ensamblaje' },
    { id: 'mineria', name: 'Minería avanzada', text: 'Los mineros trabajan el doble de rápido.', cost: { circuito: 40, placa: 40 }, needs: 'ensamblaje' },
    { id: 'fundicion', name: 'Fundición rápida', text: 'Las fundidoras trabajan el doble de rápido.', cost: { motor: 8, circuito: 25 }, needs: 'mineria' },
    { id: 'robotica', name: 'Robótica', text: 'La Montadora fabrica robots si recibe motores, circuitos y placas.', cost: { motor: 10, circuito: 30, hormigon: 30 }, needs: 'motores' },
];

export const KIND_NEEDS: Record<Kind, ResearchId | null> = {
    cinta: null, minero: null, fundidora: null, constructor: null, almacen: null, ensambladora: 'ensamblaje', despacho: null,
};

export const costText = (cost: Partial<Counts>) =>
    (Object.keys(cost) as Item[]).map(k => `${cost[k]} ${ITEM_NAME[k]}`).join(', ');

export const recipeText = (r: Recipe) => `${r.amount} ${ITEM_NAME[r.out]} = ${costText(r.ins)}`;
