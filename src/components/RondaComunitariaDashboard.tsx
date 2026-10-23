import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  ListFilter,
  RefreshCw,
  Search,
  UsersRound,
  Workflow,
} from 'lucide-react';
import { createRondaDemoSnapshot, RondaDemoRecord, RondaDemoSnapshot, RondaEstado } from '../data/rondaDemoData';

interface RondaComunitariaDashboardProps {
  onBack: () => void;
}

type SectionKey = 'resumen' | 'resultados' | 'priorizados' | 'recordatorios' | 'ronda';

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'resultados', label: 'Resultados' },
  { key: 'priorizados', label: 'Priorizados' },
  { key: 'recordatorios', label: 'Recordatorios' },
  { key: 'ronda', label: 'Ronda comunitaria' },
];

const formatNumber = (value: number) => new Intl.NumberFormat('es-CO').format(value);
const formatDate = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });

const statusStyles: Record<RondaEstado, string> = {
  'Pendiente por programar': 'bg-amber-50 text-amber-700 ring-amber-200',
  Programada: 'bg-blue-50 text-blue-700 ring-blue-200',
  'En seguimiento': 'bg-violet-50 text-violet-700 ring-violet-200',
  'Pendiente de resultado': 'bg-rose-50 text-rose-700 ring-rose-200',
  Completada: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

function MetricCard({ label, value, detail, icon: Icon, tone }: {
  label: string;
  value: number;
  detail: string;
  icon: React.ElementType;
  tone: 'violet' | 'teal' | 'amber' | 'emerald';
}) {
  const tones = {
    violet: 'bg-violet-50 text-violet-700',
    teal: 'bg-teal-50 text-teal-700',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm shadow-slate-900/[0.02]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{formatNumber(value)}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}><Icon className="h-5 w-5" /></span>
      </div>
      <p className="mt-3 text-xs text-slate-500">{detail}</p>
    </article>
  );
}

function WeeklyChart({ data }: { data: RondaDemoSnapshot['semanas'] }) {
  const width = 760;
  const height = 260;
  const left = 42;
  const top = 22;
  const plotWidth = 694;
  const plotHeight = 174;
  const baseline = top + plotHeight;
  const max = Math.max(10, Math.ceil(Math.max(...data.map((week) => week.ordenes), 1) / 10) * 10);
  const groupWidth = plotWidth / data.length;
  const barWidth = Math.min(11, groupWidth * 0.22);
  const series = [
    { key: 'ordenes' as const, color: '#7c3aed', label: 'Órdenes' },
    { key: 'enSeguimiento' as const, color: '#0f9b8e', label: 'En seguimiento' },
    { key: 'completadas' as const, color: '#3b82f6', label: 'Completadas' },
  ];

  return (
    <div className="min-w-0">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Gráfica semanal de órdenes, seguimientos y rondas completadas" className="h-auto w-full overflow-visible">
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const y = baseline - fraction * plotHeight;
          return <g key={fraction}>
            <line x1={left} x2={width - 18} y1={y} y2={y} stroke="#e9eaf0" strokeDasharray="4 5" />
            <text x={left - 10} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{Math.round(max * fraction)}</text>
          </g>;
        })}
        {data.map((week, index) => {
          const groupX = left + index * groupWidth + groupWidth / 2;
          return <g key={week.etiqueta}>
            {series.map((item, seriesIndex) => {
              const value = week[item.key];
              const barHeight = (value / max) * plotHeight;
              const x = groupX + (seriesIndex - 1) * (barWidth + 3) - barWidth / 2;
              return <rect key={item.key} x={x} y={baseline - barHeight} width={barWidth} height={Math.max(value ? barHeight : 0, 1)} rx="3" fill={item.color} />;
            })}
            {index % 2 === 0 && <text x={groupX} y={baseline + 22} textAnchor="middle" fontSize="9" fill="#94a3b8">{week.etiqueta}</text>}
          </g>;
        })}
      </svg>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-slate-500">
        {series.map((item) => <span key={item.key} className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm" style={{ backgroundColor: item.color }} />{item.label}</span>)}
      </div>
    </div>
  );
}

function RecordTable({ records }: { records: RondaDemoRecord[] }) {
  if (!records.length) {
    return <div className="px-5 py-12 text-center text-sm text-slate-500">No hay registros de muestra que coincidan con los filtros.</div>;
  }

  return (
    <div className="custom-scrollbar overflow-x-auto">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="border-y border-slate-100 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Registro de prueba</th>
            <th className="px-4 py-3 font-semibold">Sede</th>
            <th className="px-4 py-3 font-semibold">Procedimiento</th>
            <th className="px-4 py-3 font-semibold">Aplica a RC</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Fecha de orden</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {records.map((record) => <tr key={record.id} className="hover:bg-violet-50/40">
            <td className="px-4 py-3.5">
              <p className="font-semibold text-slate-800">{record.paciente}</p>
              <p className="mt-0.5 font-mono text-[10px] text-slate-400">{record.id}</p>
            </td>
            <td className="px-4 py-3.5 text-slate-600">{record.sede}</td>
            <td className="px-4 py-3.5 text-slate-600">{record.procedimiento}</td>
            <td className="px-4 py-3.5">
              <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${record.aplicaRonda ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{record.aplicaRonda ? 'Sí' : 'No'}</span>
            </td>
            <td className="px-4 py-3.5"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${statusStyles[record.estado]}`}>{record.estado}</span></td>
            <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">{formatDate(record.fechaOrden)}</td>
          </tr>)}
        </tbody>
      </table>
    </div>
  );
}

export const RondaComunitariaDashboard: React.FC<RondaComunitariaDashboardProps> = ({ onBack }) => {
  const [snapshot, setSnapshot] = useState(() => createRondaDemoSnapshot(20261021));
  const [seed, setSeed] = useState(20261021);
  const [section, setSection] = useState<SectionKey>('resumen');
  const [search, setSearch] = useState('');
  const [selectedSite, setSelectedSite] = useState('Todas las sedes');
  const [showPreview, setShowPreview] = useState(false);

  const filteredRecords = useMemo(() => {
    let records = snapshot.records;
    if (section === 'resultados') records = records.filter((record) => record.estado === 'Pendiente de resultado');
    if (section === 'priorizados') records = records.filter((record) => record.aplicaRonda);
    if (section === 'recordatorios') records = records.filter((record) => record.recordatorio);
    if (section === 'ronda') records = records.filter((record) => record.aplicaRonda && record.estado !== 'Pendiente por programar');
    const query = search.trim().toLocaleLowerCase('es-CO');
    if (query) records = records.filter((record) => `${record.paciente} ${record.id} ${record.procedimiento}`.toLocaleLowerCase('es-CO').includes(query));
    if (selectedSite !== 'Todas las sedes') records = records.filter((record) => record.sede === selectedSite);
    return section === 'resumen' ? records.slice(0, 7) : records.slice(0, 60);
  }, [section, search, selectedSite, snapshot.records]);

  const preview = useMemo(() => {
    const ready = snapshot.records.filter((record) => record.aplicaRonda && record.estado !== 'Pendiente por programar').length;
    const duplicates = Math.min(ready, Math.max(2, Math.floor(ready * 0.035)));
    return { ready, duplicates, newRows: ready - duplicates };
  }, [snapshot.records]);

  const regenerate = () => {
    const nextSeed = seed + Math.floor(Math.random() * 100000) + 1;
    setSeed(nextSeed);
    setSnapshot(createRondaDemoSnapshot(nextSeed));
    setShowPreview(false);
  };

  const activeCount = (key: SectionKey) => {
    if (key === 'priorizados') return snapshot.priorizados;
    if (key === 'resultados') return snapshot.pendientesResultado;
    if (key === 'recordatorios') return snapshot.recordatorios;
    if (key === 'ronda') return snapshot.elegiblesConsolidacion;
    return snapshot.total;
  };

  return (
    <section className="page-enter mx-auto max-w-[1360px] space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 border-b border-[#ececf1] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700"><Activity className="h-6 w-6" /></div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-700">Ronda comunitaria</p>
              <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200">Muestra sintética</span>
            </div>
            <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">Seguimiento trimestral</h1>
            <p className="mt-1 text-sm text-slate-600">Consolidación, priorización y contacto · T4 2026</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button onClick={regenerate} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-3.5 w-3.5" /> Otra muestra aleatoria</button>
          <button onClick={onBack} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-3.5 w-3.5" /> Centros</button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { title: '1. Importar detalle', detail: 'Filtrar órdenes y quitar duplicados', icon: ClipboardList, value: snapshot.total, color: 'text-violet-700 bg-violet-50' },
          { title: '2. Actualizar resultados', detail: 'Cruzar laboratorio y radiología', icon: Activity, value: snapshot.pendientesResultado, color: 'text-rose-700 bg-rose-50' },
          { title: '3. Revisar priorizados', detail: 'Cruzar claves antes de agregar', icon: ListFilter, value: snapshot.priorizados, color: 'text-blue-700 bg-blue-50' },
          { title: '4. Preparar recordatorios', detail: 'Reconstruir la lista de contacto', icon: CalendarClock, value: snapshot.recordatorios, color: 'text-amber-700 bg-amber-50' },
          { title: '5. Consolidar ronda', detail: 'Revisar filas antes del traslado', icon: ClipboardCheck, value: snapshot.elegiblesConsolidacion, color: 'text-emerald-700 bg-emerald-50' },
        ].map((step) => <article key={step.title} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02]">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${step.color}`}><step.icon className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1"><h2 className="text-xs font-semibold text-slate-800">{step.title}</h2><p className="mt-1 text-[11px] leading-snug text-slate-500">{step.detail}</p></div>
          <span className="text-lg font-bold tabular-nums text-slate-900">{formatNumber(step.value)}</span>
        </article>)}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-violet-700"><Workflow className="h-4 w-4" /></span>
          <div><p className="text-sm font-semibold text-slate-800">Revisión antes de reemplazar o consolidar</p><p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-600">La macro borra resultados y recordatorios al actualizarlos, y elimina del detalle las filas elegibles aunque ya estén en destino. También espera hojas de Laboratorio y Radiología ausentes en este libro; Priorizados incluye varios años sin filtro trimestral. Esta vista previa no ejecuta VBA.</p></div>
        </div>
        <button onClick={() => setShowPreview((current) => !current)} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-violet-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-violet-800">
          {showPreview ? 'Ocultar vista previa' : 'Previsualizar consolidación'}
        </button>
      </div>

      {showPreview && <div className="grid gap-3 rounded-2xl border border-emerald-200 bg-white p-4 sm:grid-cols-3 sm:p-5">
        <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Elegibles en la muestra</p><p className="mt-1 text-2xl font-bold text-slate-900">{formatNumber(preview.ready)}</p></div>
        <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Coincidencias que requieren revisión</p><p className="mt-1 text-2xl font-bold text-amber-700">{formatNumber(preview.duplicates)}</p></div>
        <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Registros nuevos estimados</p><p className="mt-1 text-2xl font-bold text-emerald-700">{formatNumber(preview.newRows)}</p></div>
        <p className="sm:col-span-3 text-xs text-slate-500">Cálculo ilustrativo sobre datos sintéticos. La macro fuente elimina datos del detalle al consolidar; este prototipo conserva todos los registros.</p>
      </div>}

      <div className="flex flex-col gap-3 border-b border-slate-200 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Secciones de ronda comunitaria" className="-mb-px flex max-w-full gap-5 overflow-x-auto">
          {SECTIONS.map((item) => <button key={item.key} onClick={() => setSection(item.key)} className={`inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-0.5 text-xs font-semibold transition-colors ${section === item.key ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {item.label}<span className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${section === item.key ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'}`}>{formatNumber(activeCount(item.key))}</span>
          </button>)}
        </nav>
        <label className="relative mb-2 flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 sm:mb-1 sm:w-56">
          <span className="sr-only">Filtrar por sede</span>
          <select value={selectedSite} onChange={(event) => setSelectedSite(event.target.value)} className="w-full appearance-none bg-transparent pr-5 text-xs text-slate-700 outline-none">
            <option>Todas las sedes</option>
            {['IMAP Bucaramanga', 'IMAP Floridablanca', 'IMAP Girón', 'IMAP Piedecuesta'].map((site) => <option key={site}>{site}</option>)}
          </select><ChevronDown className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-slate-400" />
        </label>
      </div>

      {section === 'resumen' && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Solicitudes en la muestra" value={snapshot.total} detail="Órdenes simuladas del trimestre" icon={ClipboardList} tone="violet" />
        <MetricCard label="Priorizadas para revisión" value={snapshot.priorizados} detail={`${Math.round((snapshot.priorizados / Math.max(snapshot.total, 1)) * 100)}% marcadas para ronda comunitaria`} icon={UsersRound} tone="teal" />
        <MetricCard label="Recordatorios pendientes" value={snapshot.recordatorios} detail="Marcados para preparar contacto (sintético)" icon={CalendarClock} tone="amber" />
        <MetricCard label="Rondas completadas" value={snapshot.completados} detail={`${snapshot.pendientesResultado} pendientes de resultado`} icon={CheckCircle2} tone="emerald" />
      </div>}

      {section === 'resumen' && <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-3 flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-violet-700">Tendencia semanal</p><h2 className="mt-1 text-base font-semibold text-slate-900">Órdenes y seguimiento</h2></div><span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500">Oct–dic 2026</span></div>
          <WeeklyChart data={snapshot.semanas} />
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-violet-700">Distribución</p><h2 className="mt-1 text-base font-semibold text-slate-900">Registros por sede</h2>
          <div className="mt-5 space-y-4">{snapshot.sedes.map((site) => {
            const percent = Math.round((site.total / Math.max(snapshot.total, 1)) * 100);
            return <div key={site.nombre}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="text-slate-600">{site.nombre}</span><span className="font-semibold tabular-nums text-slate-800">{formatNumber(site.total)} <span className="font-normal text-slate-400">({percent}%)</span></span></div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-500" style={{ width: `${percent}%` }} /></div>
            </div>;
          })}</div>
          <div className="mt-6 rounded-xl bg-slate-50 p-3"><div className="flex items-center gap-2 text-xs font-semibold text-slate-700"><FileCheck2 className="h-4 w-4 text-emerald-600" />Fuente de estructura: macro de Excel</div><p className="mt-1 text-[11px] leading-relaxed text-slate-500">Los nombres, documentos y contactos reales no se cargaron en esta demostración.</p></div>
        </article>
      </div>}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div><p className="text-xs font-bold uppercase tracking-wide text-violet-700">{section === 'resumen' ? 'Vista de trabajo' : 'Registros de muestra'}</p><h2 className="mt-1 text-base font-semibold text-slate-900">{section === 'resumen' ? 'Seguimiento reciente' : SECTIONS.find((item) => item.key === section)?.label}</h2></div>
          <label className="relative flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 sm:w-72">
            <Search className="h-4 w-4 shrink-0 text-slate-400" /><span className="sr-only">Buscar en la muestra</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar registro o procedimiento" className="w-full border-0 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400" />
          </label>
        </div>
        <RecordTable records={filteredRecords} />
        <div className="flex flex-col gap-1 border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Se muestran {formatNumber(filteredRecords.length)} registros {section === 'resumen' ? 'recientes' : 'filtrados'}.</span>
          <span>Prototipo local · datos aleatorios sintéticos · sin conexión al libro Excel</span>
        </div>
      </section>

      <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-[11px] leading-relaxed text-slate-500">
        <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-600" />
        <p>Esta interfaz representa el flujo de la macro para revisión. No ejecuta VBA, no envía mensajes y no modifica el archivo fuente. Usa solo registros ficticios.</p>
      </div>
    </section>
  );
};
