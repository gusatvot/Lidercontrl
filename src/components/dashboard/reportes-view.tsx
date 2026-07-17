'use client'

import { useReportes, useExportarCSV, useExportarPDF } from '@/hooks/use-data'
import { useAppStore } from '@/store/app'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import {
  ChartColumn, TrendingUp, TrendingDown, Search, Filter, Download,
  ArrowUpRight, ArrowDownRight, Wallet, PiggyBank, AlertCircle, Loader2,
  FileText, FileSpreadsheet, ChevronDown,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { useState, useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { MESES } from '@/lib/types'
import { useFormatoMoneda } from '@/hooks/use-formato-moneda'

type TipoFiltro = 'todos' | 'ingresos' | 'gastos'

const COLORES_CATEGORIAS = [
  '#6366f1', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b',
  '#06b6d4', '#ec4899', '#84cc16', '#ef4444', '#8b8b94',
]

export function ReportesView() {
  const { data, isLoading } = useReportes()
  const { exportar: exportarCSV, isExporting: isExportingCSV } = useExportarCSV()
  const { exportar: exportarPDF, isExporting: isExportingPDF } = useExportarPDF()
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const formato = useFormatoMoneda()

  const isExporting = isExportingCSV || isExportingPDF
  const fc = (amount: number) => formatCurrency(amount, formato)
  const { mes, anio } = useAppStore()

  // Estados de filtro
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas')
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>('todos')

  // Filtrar movimientos
  const movimientosFiltrados = useMemo(() => {
    if (!data?.movimientos) return []
    return data.movimientos.filter((m: any) => {
      // Filtro por tipo
      if (tipoFiltro === 'ingresos' && m.monto < 0) return false
      if (tipoFiltro === 'gastos' && m.monto > 0) return false
      // Filtro por categoría
      if (categoriaFiltro !== 'todas' && m.categoria !== categoriaFiltro) return false
      // Filtro por texto
      if (busqueda && !m.concepto.toLowerCase().includes(busqueda.toLowerCase())) return false
      return true
    })
  }, [data, tipoFiltro, categoriaFiltro, busqueda])

  // Categorías únicas para el dropdown
  const categorias: string[] = useMemo(() => {
    if (!data?.movimientos) return []
    const cats = new Set<string>()
    for (const m of data.movimientos) {
      if (m && typeof m.categoria === 'string') cats.add(m.categoria)
    }
    return Array.from(cats).sort()
  }, [data])

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-12 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="col-span-12 sm:col-span-6 lg:col-span-3 h-32 rounded-3xl shimmer" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-3xl shimmer" />
      </div>
    )
  }

  const resumen = data?.resumen
  if (!resumen) return null

  // Datos para gráficos
  const gastosPorCategoria = data?.gastosPorCategoria || []
  const ingresosPorCategoria = data?.ingresosPorCategoria || []

  const pieData = [
    { name: 'Ingresos', value: resumen.totalIngresos, color: '#10b981' },
    { name: 'Gastos', value: resumen.totalGastos, color: '#f43f5e' },
    { name: 'Ahorro', value: Math.max(0, resumen.ahorro), color: '#6366f1' },
  ].filter(d => d.value > 0)

  // Stats de filtrado
  const totalFiltradoIngresos = movimientosFiltrados.filter((m: any) => m.monto > 0).reduce((s: number, m: any) => s + m.monto, 0)
  const totalFiltradoGastos = movimientosFiltrados.filter((m: any) => m.monto < 0).reduce((s: number, m: any) => s + Math.abs(m.monto), 0)

  return (
    <div className="space-y-5">
      {/* KPIs con comparativa */}
      <div className="grid grid-cols-12 gap-5">
        <KpiCard
          titulo="Ingresos"
          valor={resumen.totalIngresos}
          variacion={resumen.variacionIngresos}
          icon={TrendingUp}
          color="#10b981"
        />
        <KpiCard
          titulo="Gastos"
          valor={resumen.totalGastos}
          variacion={resumen.variacionGastos}
          icon={TrendingDown}
          color="#f43f5e"
          invertirVariacion
        />
        <KpiCard
          titulo="Ahorro"
          valor={resumen.ahorro}
          variacion={resumen.variacionAhorro}
          icon={PiggyBank}
          color="#6366f1"
        />
        <KpiCard
          titulo="Balance"
          valor={resumen.balance}
          variacion={null}
          icon={Wallet}
          color="#f59e0b"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-12 gap-5">
        {/* Gastos por categoría - Bar chart */}
        <div className="col-span-12 lg:col-span-8 rounded-3xl p-6 glass">
          <div className="flex items-center gap-2 mb-4">
            <ChartColumn className="w-4 h-4 text-[var(--primary)]" />
            <div className="text-base font-semibold">Gastos por categoría</div>
          </div>
          {gastosPorCategoria.length === 0 ? (
            <div className="text-sm text-[var(--muted-foreground)] py-12 text-center">Sin datos de gastos este mes</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gastosPorCategoria} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#8b8b94"
                  fontSize={11}
                  tickFormatter={(v) => formatCurrency(v, true)}
                />
                <YAxis
                  type="category"
                  dataKey="categoria"
                  stroke="#8b8b94"
                  fontSize={11}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15,15,20,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [fc(value), 'Gastos']}
                />
                <Bar dataKey="monto" radius={[0, 8, 8, 0]}>
                  {gastosPorCategoria.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORES_CATEGORIAS[i % COLORES_CATEGORIAS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Distribución - Pie chart */}
        <div className="col-span-12 lg:col-span-4 rounded-3xl p-6 glass">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-4 h-4 text-[var(--chart-2)]" />
            <div className="text-base font-semibold">Distribución</div>
          </div>
          {pieData.length === 0 ? (
            <div className="text-sm text-[var(--muted-foreground)] py-12 text-center">Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15,15,20,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => fc(value)}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  formatter={(value) => <span style={{ color: '#8b8b94' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Ingresos por categoría */}
      <div className="rounded-3xl p-6 glass">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-[var(--chart-3)]" />
          <div className="text-base font-semibold">Ingresos por categoría</div>
        </div>
        {ingresosPorCategoria.length === 0 ? (
          <div className="text-sm text-[var(--muted-foreground)] py-8 text-center">Sin ingresos este mes</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ingresosPorCategoria.map((cat: any, i: number) => {
              const pct = resumen.totalIngresos > 0 ? (cat.monto / resumen.totalIngresos) * 100 : 0
              return (
                <div key={cat.categoria} className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: COLORES_CATEGORIAS[i % COLORES_CATEGORIAS.length] }}
                    />
                    <span className="text-xs text-[var(--muted-foreground)] truncate">{cat.categoria}</span>
                  </div>
                  <div className="text-lg font-bold tabular text-[var(--chart-3)]">
                    +{fc(cat.monto)}
                  </div>
                  <div className="text-[0.7rem] text-[var(--muted-foreground)] mt-1">{pct.toFixed(0)}% del total</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Buscador y filtros */}
      <div className="rounded-3xl p-6 glass">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-4 h-4 text-[var(--primary)]" />
          <div className="text-base font-semibold">Movimientos del mes</div>
          <span className="text-xs text-[var(--muted-foreground)] ml-2">
            {movimientosFiltrados.length} de {data?.movimientos?.length || 0} movimientos
          </span>
          <div className="ml-auto relative">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-br from-[#10b981] to-[#34d399] text-white text-sm font-semibold cursor-pointer hover:from-[#10b981]/80 hover:to-[#34d399]/80 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{isExporting ? 'Exportando...' : 'Exportar'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {exportMenuOpen && !isExporting && (
              <>
                {/* Overlay para cerrar al hacer click fuera */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setExportMenuOpen(false)}
                />

                {/* Menu dropdown */}
                <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-strong border border-[var(--border)] shadow-2xl z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      setExportMenuOpen(false)
                      exportarPDF()
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--secondary)] cursor-pointer transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[rgba(244,63,94,0.15)] flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#f43f5e]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Exportar como PDF</div>
                      <div className="text-xs text-[var(--muted-foreground)]">Reporte formateado para imprimir</div>
                    </div>
                  </button>

                  <div className="border-t border-[var(--border)]" />

                  <button
                    onClick={() => {
                      setExportMenuOpen(false)
                      exportarCSV()
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--secondary)] cursor-pointer transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[rgba(16,185,129,0.15)] flex items-center justify-center">
                      <FileSpreadsheet className="w-4 h-4 text-[#10b981]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Exportar como CSV</div>
                      <div className="text-xs text-[var(--muted-foreground)]">Datos crudos para Excel/Sheets</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Barra de filtros */}
        <div className="flex flex-wrap gap-3 mb-4">
          {/* Búsqueda por texto */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <Input
              type="text"
              placeholder="Buscar por concepto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-[var(--muted)] border-[var(--border)] pl-10"
            />
          </div>

          {/* Filtro por tipo */}
          <div className="flex gap-1 p-1 rounded-xl bg-[var(--muted)]">
            {([
              { id: 'todos', label: 'Todos' },
              { id: 'ingresos', label: 'Ingresos' },
              { id: 'gastos', label: 'Gastos' },
            ] as { id: TipoFiltro; label: string }[]).map((t) => (
              <button
                key={t.id}
                onClick={() => setTipoFiltro(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                  tipoFiltro === t.id
                    ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] text-[var(--foreground)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Filtro por categoría */}
          <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
            <SelectTrigger className="bg-[var(--muted)] border-[var(--border)] w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                <SelectValue placeholder="Categoría" />
              </div>
            </SelectTrigger>
            <SelectContent className="glass-strong border-[var(--border)]">
              <SelectItem value="todas">Todas las categorías</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Limpiar filtros */}
          {(busqueda || categoriaFiltro !== 'todas' || tipoFiltro !== 'todos') && (
            <button
              onClick={() => {
                setBusqueda('')
                setCategoriaFiltro('todas')
                setTipoFiltro('todos')
              }}
              className="px-3 py-2 rounded-lg text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] cursor-pointer transition-all"
            >
              ✕ Limpiar
            </button>
          )}
        </div>

        {/* Resumen filtrado */}
        <div className="flex gap-4 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span className="text-[var(--muted-foreground)]">Ingresos filtrados:</span>
            <span className="font-semibold tabular text-[var(--chart-3)]">+{fc(totalFiltradoIngresos)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f43f5e]" />
            <span className="text-[var(--muted-foreground)]">Gastos filtrados:</span>
            <span className="font-semibold tabular text-[var(--destructive)]">−{fc(totalFiltradoGastos)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
            <span className="text-[var(--muted-foreground)]">Balance:</span>
            <span className="font-semibold tabular text-[var(--primary)]">{fc(totalFiltradoIngresos - totalFiltradoGastos)}</span>
          </div>
        </div>

        {/* Lista de movimientos */}
        <div className="space-y-1 max-h-[500px] overflow-y-auto">
          {movimientosFiltrados.length === 0 ? (
            <div className="text-sm text-[var(--muted-foreground)] py-12 text-center">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No se encontraron movimientos con esos filtros.
            </div>
          ) : (
            movimientosFiltrados.map((m: any, i: number) => {
              const esIngreso = m.monto > 0
              const tipoLabel = m.tipo === 'ingreso' ? 'Ingreso' : m.tipo === 'gasto_fijo' ? 'Gasto Fijo' : 'Gasto Diario'
              const tipoColor = esIngreso ? '#10b981' : m.tipo === 'gasto_fijo' ? '#f43f5e' : '#f59e0b'
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--muted)] transition-all"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${tipoColor}15` }}
                  >
                    {esIngreso ? (
                      <ArrowUpRight className="w-4 h-4" style={{ color: tipoColor }} />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" style={{ color: tipoColor }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{m.concepto}</div>
                    <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-2">
                      <span
                        className="px-1.5 py-0.5 rounded-md text-[0.65rem] font-semibold"
                        style={{ background: `${tipoColor}15`, color: tipoColor }}
                      >
                        {tipoLabel}
                      </span>
                      {m.categoria}
                      <span>·</span>
                      <span>{formatDate(m.fecha)}</span>
                    </div>
                  </div>
                  <div
                    className="text-base font-bold tabular shrink-0"
                    style={{ color: esIngreso ? '#10b981' : '#f43f5e' }}
                  >
                    {esIngreso ? '+' : '−'}{fc(Math.abs(m.monto))}
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

// Componente KPI con variación
function KpiCard({
  titulo,
  valor,
  variacion,
  icon: Icon,
  color,
  invertirVariacion = false,
}: {
  titulo: string
  valor: number
  variacion: number | null
  icon: any
  color: string
  invertirVariacion?: boolean
}) {
  const formato = useFormatoMoneda()
  const fc = (amount: number) => formatCurrency(amount, formato)
  // Para gastos, un aumento es negativo (rojo)
  const esPositivo = variacion !== null && (invertirVariacion ? variacion < 0 : variacion > 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-3xl p-6 glass relative overflow-hidden"
    >
      <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full opacity-50 blur-3xl" style={{ background: color }} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[var(--muted-foreground)] font-medium">{titulo}</span>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${color}15` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color }} />
          </div>
        </div>
        <div className="text-[1.8rem] font-bold tabular" style={{ color: valor < 0 ? '#f43f5e' : '#fff' }}>
          {fc(valor)}
        </div>
        {variacion !== null && variacion !== 0 && (
          <div
            className={`text-xs font-medium mt-2 flex items-center gap-1 ${
              esPositivo ? 'text-[var(--chart-3)]' : 'text-[var(--destructive)]'
            }`}
          >
            {variacion > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(variacion)}% vs mes anterior
          </div>
        )}
        {variacion === 0 && (
          <div className="text-xs text-[var(--muted-foreground)] mt-2">Sin cambios vs mes anterior</div>
        )}
      </div>
    </motion.div>
  )
}
