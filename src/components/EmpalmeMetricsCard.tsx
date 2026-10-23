import React, { useState } from 'react';
import { Activity, BarChart3, RefreshCw, Target } from 'lucide-react';
import { EmpalmeDiaDemo, generarDatosEmpalmeDemo } from '../data/empalmeDemoData';

interface EmpalmeMetricsCardProps {
  nombreCentro: string;
}

const PLOT = { left: 42, top: 18, bottom: 168, width: 580 };
const MAX_VALOR = 30;
const SERIES = [
  { key: 'ordenes', label: 'Órdenes', color: '#8b5cf6' },
  { key: 'resultados', label: 'Con resultado', color: '#0d9488' },
  { key: 'revisados', label: 'Revisados', color: '#3b82f6' },
] as const;

type CampoNumerico = 'ordenes' | 'resultados' | 'revisados' | 'informadosEnTresDias';

function resumir(datos: EmpalmeDiaDemo[], campo: CampoNumerico): number {
  return datos.reduce((total, dia) => total + dia[campo], 0);
}

export const EmpalmeMetricsCard: React.FC<EmpalmeMetricsCardProps> = ({ nombreCentro }) => {
  const [datos, setDatos] = useState<EmpalmeDiaDemo[]>(() => generarDatosEmpalmeDemo());
  const totalOrdenes = resumir(datos, 'ordenes');
  const totalResultados = resumir(datos, 'resultados');
  const totalRevisados = resumir(datos, 'revisados');
  const totalInformados = resumir(datos, 'informadosEnTresDias');
  const porcentajeRevision = totalResultados ? Math.round((totalRevisados / totalResultados) * 100) : 0;
  const porcentajeInformados = totalResultados ? Math.round((totalInformados / totalResultados) * 100) : 0;
  const grupo = PLOT.width / datos.length;
  const escala = (PLOT.bottom - PLOT.top) / MAX_VALOR;

  return (
    <section className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5 space-y-5" aria-labelledby="empalme-card-title">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-100 bg-violet-50 text-violet-700">
            <Activity className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-violet-700">Seguimiento de la ficha de empalme</p>
            <h2 id="empalme-card-title" className="mt-0.5 text-base font-bold text-slate-900 sm:text-lg">Órdenes y resultados de laboratorio</h2>
            <p className="mt-1 text-xs text-slate-500">{nombreCentro} · últimos 7 días</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Datos sintéticos
          </span>
          <button
            type="button"
            onClick={() => setDatos(generarDatosEmpalmeDemo())}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            aria-label="Generar otra muestra de datos sintéticos"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Regenerar muestra</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
          <p className="text-xs font-medium text-slate-500">Pacientes con resultado</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{totalResultados}</p>
          <p className="mt-1 text-[11px] text-slate-500">de {totalOrdenes} órdenes en la muestra</p>
        </article>
        <article className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-slate-500">Resultados revisados</p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${porcentajeRevision > 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
              Meta &gt;80%
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{porcentajeRevision}%</p>
          <p className="mt-1 text-[11px] text-slate-500">{totalRevisados} de {totalResultados} con resultado</p>
        </article>
        <article className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Target className="h-3.5 w-3.5" aria-hidden="true" />
            <p className="text-xs font-medium">Conocimiento en menos de 3 días</p>
          </div>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{porcentajeInformados}%</p>
          <p className="mt-1 text-[11px] text-slate-500">{totalInformados} de {totalResultados} con resultado</p>
        </article>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-3 sm:p-4">
        <div className="mb-2 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-violet-600" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-slate-800">Cruce diario de órdenes y seguimiento</h3>
        </div>
        <svg className="h-auto w-full" viewBox="0 0 640 210" role="img" aria-label="Gráfica semanal de órdenes, resultados disponibles y resultados revisados; datos sintéticos">
          <text x="6" y="12" className="fill-slate-400 text-[10px]">Pacientes</text>
          {[0, 10, 20, 30].map((valor) => {
            const y = PLOT.bottom - valor * escala;
            return (
              <g key={valor}>
                <line x1={PLOT.left} y1={y} x2={PLOT.left + PLOT.width} y2={y} stroke="#e2e8f0" strokeDasharray={valor === 0 ? undefined : '3 4'} />
                <text x={PLOT.left - 8} y={y + 3} textAnchor="end" className="fill-slate-400 text-[10px]">{valor}</text>
              </g>
            );
          })}
          {datos.map((dia, indice) => {
            const anchoBarra = 13;
            const separacion = 4;
            const anchoGrupo = SERIES.length * anchoBarra + (SERIES.length - 1) * separacion;
            const inicio = PLOT.left + indice * grupo + (grupo - anchoGrupo) / 2;
            return (
              <g key={dia.dia}>
                <title>{`${dia.dia}: ${dia.ordenes} órdenes, ${dia.resultados} con resultado, ${dia.revisados} revisados`}</title>
                {SERIES.map((serie, serieIndice) => {
                  const valor = dia[serie.key];
                  const alto = valor * escala;
                  const x = inicio + serieIndice * (anchoBarra + separacion);
                  return <rect key={serie.key} x={x} y={PLOT.bottom - alto} width={anchoBarra} height={alto} rx="3" fill={serie.color} />;
                })}
                <text x={PLOT.left + indice * grupo + grupo / 2} y="194" textAnchor="middle" className="fill-slate-500 text-[11px]">{dia.dia}</text>
              </g>
            );
          })}
        </svg>
        <div className="mt-1 flex flex-wrap justify-center gap-x-5 gap-y-2" aria-label="Leyenda de la gráfica">
          {SERIES.map((serie) => (
            <span key={serie.key} className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: serie.color }} />{serie.label}
            </span>
          ))}
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-slate-400">Cifras agregadas sintéticas: no contienen pacientes ni reflejan reportes reales. Esta vista no clasifica resultados críticos ni envía alertas; la revisión sigue a cargo del profesional.</p>
    </section>
  );
};
