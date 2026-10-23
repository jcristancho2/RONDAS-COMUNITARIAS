

export type RondaEstado =
  | 'Pendiente por programar'
  | 'Programada'
  | 'En seguimiento'
  | 'Pendiente de resultado'
  | 'Completada';

export interface RondaDemoRecord {
  id: string;
  paciente: string;
  sede: string;
  procedimiento: string;
  fechaOrden: string;
  aplicaRonda: boolean;
  recordatorio: boolean;
  estado: RondaEstado;
}

export interface RondaDemoSnapshot {
  records: RondaDemoRecord[];
  semanas: { etiqueta: string; ordenes: number; enSeguimiento: number; completadas: number }[];
  sedes: { nombre: string; total: number }[];
  total: number;
  priorizados: number;
  recordatorios: number;
  completados: number;
  pendientesResultado: number;
  elegiblesConsolidacion: number;
}

const SEDES = ['IMAP Bucaramanga', 'IMAP Floridablanca', 'IMAP Girón', 'IMAP Piedecuesta'];
const PROCEDIMIENTOS = ['Ronda de morbilidad', 'Perfil lipídico', 'Hemograma', 'Control cardiovascular', 'Seguimiento de laboratorio'];
const ESTADOS: RondaEstado[] = [
  'Pendiente por programar',
  'Programada',
  'En seguimiento',
  'Pendiente de resultado',
  'Completada',
];

function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRondaDemoSnapshot(seed = Date.now()): RondaDemoSnapshot {
  const random = createRandom(seed);
  const count = 168 + Math.floor(random() * 49);
  const startDate = new Date(2026, 9, 1);

  const records = Array.from({ length: count }, (_, index) => {
    const orderDay = Math.floor(random() * 92);
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + orderDay);
    const estado = ESTADOS[Math.floor(random() * ESTADOS.length)];

    return {
      id: `MUE-${String(index + 1).padStart(4, '0')}`,
      paciente: `Persona de prueba ${String(index + 1).padStart(3, '0')}`,
      sede: SEDES[Math.floor(random() * SEDES.length)],
      procedimiento: PROCEDIMIENTOS[Math.floor(random() * PROCEDIMIENTOS.length)],
      fechaOrden: date.toISOString().slice(0, 10),
      aplicaRonda: random() > 0.16,
      recordatorio: random() > 0.79,
      estado,
    } satisfies RondaDemoRecord;
  });

  const semanas = Array.from({ length: 13 }, (_, index) => ({
    etiqueta: `S${index + 1}`,
    ordenes: 0,
    enSeguimiento: 0,
    completadas: 0,
  }));

  const sedeCounts = new Map(SEDES.map((sede) => [sede, 0]));
  records.forEach((record) => {
    const day = Math.floor((new Date(`${record.fechaOrden}T00:00:00`).getTime() - startDate.getTime()) / 86400000);
    const weekIndex = Math.min(12, Math.floor(day / 7));
    const week = semanas[weekIndex];
    week.ordenes += 1;
    if (record.estado === 'En seguimiento' || record.estado === 'Pendiente de resultado') week.enSeguimiento += 1;
    if (record.estado === 'Completada') week.completadas += 1;
    sedeCounts.set(record.sede, (sedeCounts.get(record.sede) ?? 0) + 1);
  });

  return {
    records,
    semanas,
    sedes: SEDES.map((nombre) => ({ nombre, total: sedeCounts.get(nombre) ?? 0 })),
    total: records.length,
    priorizados: records.filter((record) => record.aplicaRonda).length,
    recordatorios: records.filter((record) => record.recordatorio).length,
    completados: records.filter((record) => record.estado === 'Completada').length,
    pendientesResultado: records.filter((record) => record.estado === 'Pendiente de resultado').length,
    elegiblesConsolidacion: records.filter((record) => record.aplicaRonda && record.estado !== 'Pendiente por programar').length,
  };
}
