export type Item = 'menaHierro' | 'menaCobre' | 'piedra' | 'lingoteHierro' | 'lingoteCobre' | 'placa' | 'cable' | 'hormigon' | 'circuito' | 'motor' | 'robot';
export type ResearchId = 'hormigon' | 'ensamblaje' | 'motores' | 'mineria' | 'fundicion' | 'robotica';
export type Kind = 'cinta' | 'minero' | 'fundidora' | 'constructor' | 'almacen' | 'ensambladora' | 'despacho';
export type Dir = 0 | 1 | 2 | 3;
export type Tool = Kind | 'mover' | 'borrar';
export type Counts = Record<Item, number>;

export interface Building {
    kind: Kind;
    dir: Dir;
    item: Item | null;
    input: Partial<Record<Item, number>>;
    job: Item | null;
    progress: number;
    out: Item | null;
    outCount: number;
    moved: boolean;
    setting: Item | null;
}

export interface World {
    deposits: (Item | null)[];
    cells: (Building | null)[];
    stock: Counts;
    delivered: Counts;
    goal: number;
    research: ResearchId[];
    count: number;
}

export interface Recipe {
    out: Item;
    amount: number;
    ins: Partial<Counts>;
    time: number;
    needs?: ResearchId;
}

export interface ResearchDef {
    id: ResearchId;
    name: string;
    text: string;
    cost: Partial<Counts>;
    needs?: ResearchId;
}
