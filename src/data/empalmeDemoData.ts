import type { FichaEmpalme } from '../types/clinical';

export interface EmpalmeDiaDemo {
  dia: string;
  ordenes: number;
  resultados: number;
  revisados: number;
  informadosEnTresDias: number;
}

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function esFichaDeConciliacionLaboratorios(
  ficha: Pick<FichaEmpalme, 'nombreCentro' | 'camposPrioritarios' | 'alertasPrioritarias'>
): boolean {
  const contenido = [ficha.nombreCentro, ...ficha.camposPrioritarios, ...ficha.alertasPrioritarias]
    .join(' ')
    .toLocaleLowerCase();
  return contenido.includes('laboratorio')
    && contenido.includes('resultado')
    && (contenido.includes('orden') || contenido.includes('procedimiento'));
}

function aleatorioEntre(minimo: number, maximo: number): number {
  return Math.floor(Math.random() * (maximo - minimo + 1)) + minimo;
}

/** Datos agregados ficticios para mostrar el tablero de la ficha de empalme. */
export function generarDatosEmpalmeDemo(): EmpalmeDiaDemo[] {
  return DIAS.map((dia) => {
    const ordenes = aleatorioEntre(14, 28);
    const resultados = aleatorioEntre(Math.ceil(ordenes * 0.68), ordenes);
    const revisados = aleatorioEntre(Math.ceil(resultados * 0.68), resultados);
    const informadosEnTresDias = aleatorioEntre(0, revisados);

    return { dia, ordenes, resultados, revisados, informadosEnTresDias };
  });
}
