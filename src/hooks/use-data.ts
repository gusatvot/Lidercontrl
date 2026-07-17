'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/store/app'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'

// Helper para hacer fetch (la auth va por cookie de NextAuth automáticamente)
async function apiFetch(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json'
  return fetch(url, { ...options, headers })
}

// Hook para saber si hay sesión activa - usa fetch directo a /api/auth/me
// Más confiable que useSession() que a veces se queda en 'loading'
export function useSessionActiva() {
  const setUsuario = useAppStore((s) => s.setUsuarioActivo)
  const usuarioActivoId = useAppStore((s) => s.usuarioActivoId)
  const query = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      if (!res.ok) return { usuario: null }
      return res.json()
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const usuario = query.data?.usuario
  const autenticado = !!usuario
  const cargando = query.isLoading

  // Cuando llega el usuario, actualizar el store
  useEffect(() => {
    if (usuario?.id && usuario.id !== usuarioActivoId) {
      setUsuario({
        id: usuario.id,
        nombre: usuario.nombre,
        color: usuario.color,
      })
    }
  }, [usuario, usuarioActivoId, setUsuario])

  return {
    session: usuario ? { user: usuario } : null,
    cargando,
    autenticado,
    refetch: () => query.refetch(),
  }
}

// Hook para obtener info del usuario desde el backend (incluye emailVerificado)
// Reusa el mismo query que useSessionActiva para evitar duplicados
export function useUsuarioActual() {
  return useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      if (!res.ok) return { usuario: null }
      return res.json()
    },
    staleTime: 0,
  })
}

// ============= DASHBOARD =============
export function useDashboard() {
  const { mes, anio } = useAppStore()
  return useQuery({
    queryKey: ['dashboard', mes, anio],
    queryFn: async () => {
      const res = await apiFetch(`/api/dashboard?mes=${mes}&anio=${anio}`)
      if (!res.ok) throw new Error('Error cargando dashboard')
      return res.json()
    },
    staleTime: 30_000,
  })
}

// ============= GASTOS FIJOS =============
export function useGastosFijos() {
  const { mes, anio } = useAppStore()
  return useQuery({
    queryKey: ['gastos-fijos', mes, anio],
    queryFn: async () => {
      const res = await apiFetch(`/api/gastos-fijos?mes=${mes}&anio=${anio}`)
      if (!res.ok) throw new Error('Error cargando gastos fijos')
      return res.json()
    },
  })
}

export function useCreateGastoFijo() {
  const qc = useQueryClient()
  const { mes, anio } = useAppStore()
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/api/gastos-fijos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, mes, anio }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gastos-fijos'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Gasto creado')
    },
    onError: (e: any) => toast.error(e.message),
  })
}

export function useUpdateGastoFijo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiFetch(`/api/gastos-fijos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gastos-fijos'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (e: any) => toast.error(e.message),
  })
}

export function useToggleEstadoGastoFijo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: 'pagado' | 'pendiente' }) => {
      const res = await apiFetch(`/api/gastos-fijos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      })
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
    onMutate: async ({ id, estado }) => {
      // UI optimista
      const { mes, anio } = useAppStore.getState()
      const qcKey = ['gastos-fijos', mes, anio]
      await qc.cancelQueries({ queryKey: qcKey })
      const prev = qc.getQueryData<any[]>(qcKey)
      qc.setQueryData<any[]>(qcKey, (old = []) =>
        old.map((g) => (g.id === id ? { ...g, estado } : g))
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) {
        const { mes, anio } = useAppStore.getState()
        qc.setQueryData(['gastos-fijos', mes, anio], ctx.prev)
      }
      toast.error('No se pudo actualizar')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['gastos-fijos'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteGastoFijo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/gastos-fijos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gastos-fijos'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Gasto eliminado')
    },
    onError: () => toast.error('No se pudo eliminar'),
  })
}

// ============= GASTOS VARIABLES =============
export function useGastosVariables() {
  const { mes, anio } = useAppStore()
  return useQuery({
    queryKey: ['gastos-variables', mes, anio],
    queryFn: async () => {
      const res = await apiFetch(`/api/gastos-variables?mes=${mes}&anio=${anio}`)
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
  })
}

export function useCreateGastoVariable() {
  const qc = useQueryClient()
  const { mes, anio } = useAppStore()
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/api/gastos-variables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, mes, anio }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gastos-variables'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Gasto creado')
    },
    onError: (e: any) => toast.error(e.message),
  })
}

export function useDeleteGastoVariable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/gastos-variables/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gastos-variables'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Gasto eliminado')
    },
  })
}

export function useUpdateGastoVariable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiFetch(`/api/gastos-variables/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gastos-variables'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Gasto actualizado')
    },
    onError: (e: any) => toast.error(e.message),
  })
}

// ============= REPORTES =============
export function useReportes() {
  const { mes, anio } = useAppStore()
  return useQuery({
    queryKey: ['reportes', mes, anio],
    queryFn: async () => {
      const res = await apiFetch(`/api/reportes?mes=${mes}&anio=${anio}`)
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
    staleTime: 30_000,
  })
}

// ============= TENDENCIAS =============
export function useTendencias() {
  return useQuery({
    queryKey: ['tendencias'],
    queryFn: async () => {
      const res = await apiFetch('/api/tendencias')
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
    staleTime: 60_000,
  })
}

// ============= INGRESOS =============
export function useIngresos() {
  const { mes, anio } = useAppStore()
  return useQuery({
    queryKey: ['ingresos', mes, anio],
    queryFn: async () => {
      const res = await apiFetch(`/api/ingresos?mes=${mes}&anio=${anio}`)
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
  })
}

export function useCreateIngreso() {
  const qc = useQueryClient()
  const { mes, anio } = useAppStore()
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/api/ingresos', {
        method: 'POST',
        body: JSON.stringify({ ...data, mes, anio }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingresos'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Ingreso creado')
    },
    onError: (e: any) => toast.error(e.message),
  })
}

export function useDeleteIngreso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/ingresos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingresos'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Ingreso eliminado')
    },
  })
}

export function useUpdateIngreso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiFetch(`/api/ingresos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingresos'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Ingreso actualizado')
    },
    onError: (e: any) => toast.error(e.message),
  })
}

// ============= CUENTA =============
export function useCuenta() {
  return useQuery({
    queryKey: ['cuenta'],
    queryFn: async () => {
      const res = await apiFetch('/api/cuenta')
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
  })
}

export function useUpdateCuenta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/api/cuenta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cuenta'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Cuenta actualizada')
    },
  })
}

// ============= USUARIOS (chat) =============
export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const res = await apiFetch('/api/usuarios')
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
  })
}

// Hook para inicializar el usuario activo al cargar la app
export function useInitUsuarioActivo() {
  const setUsuario = useAppStore((s) => s.setUsuarioActivo)
  const usuarioActivoId = useAppStore((s) => s.usuarioActivoId)
  const query = useQuery({
    queryKey: ['usuario-activo'],
    queryFn: async () => {
      const res = await apiFetch('/api/usuarios/activo')
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
    enabled: !usuarioActivoId, // solo si no hay usuario en el store
    staleTime: Infinity,
    refetchOnMount: true,
  })

  // Cuando llega el dato, actualizar el store
  useEffect(() => {
    if (query.data && !usuarioActivoId) {
      setUsuario({
        id: query.data.id,
        nombre: query.data.nombre,
        color: query.data.color,
      })
    }
  }, [query.data, usuarioActivoId, setUsuario])

  return query
}

export function useSetUsuarioActivo() {
  const qc = useQueryClient()
  const setUsuario = useAppStore((s) => s.setUsuarioActivo)
  return useMutation({
    mutationFn: async (usuarioId: string) => {
      const res = await apiFetch('/api/usuarios/activo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId }),
      })
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
    onSuccess: (data) => {
      setUsuario(data.usuario)
      qc.clear()
      toast.success(`Cambiaste a ${data.usuario.nombre}`)
    },
  })
}

export function useCrearUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { nombre: string; email: string; color: string }) => {
      const res = await apiFetch('/api/usuarios', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Miembro agregado a la familia')
    },
    onError: (e: any) => toast.error(e.message),
  })
}

export function useActualizarUsuario() {
  const qc = useQueryClient()
  const { usuarioActivoId, setUsuarioActivo } = useAppStore()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { nombre?: string; email?: string; color?: string } }) => {
      const res = await apiFetch(`/api/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error')
      }
      return res.json()
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['usuarios'] })
      qc.invalidateQueries({ queryKey: ['usuario-activo'] })
      if (usuarioActivoId === data.id) {
        setUsuarioActivo({ id: data.id, nombre: data.nombre, color: data.color })
      }
      toast.success('Perfil actualizado')
    },
    onError: (e: any) => toast.error(e.message),
  })
}

export function useEliminarUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/usuarios/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] })
      qc.invalidateQueries({ queryKey: ['conversaciones'] })
      toast.success('Miembro eliminado de la familia')
    },
    onError: (e: any) => toast.error(e.message),
  })
}

export function useExportarDatos() {
  return useMutation({
    mutationFn: async () => {
      const res = await apiFetch('/api/export')
      if (!res.ok) throw new Error('Error al exportar')
      return res.text()
    },
    onSuccess: (csv) => {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lidercontrol_export_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Datos exportados correctamente')
    },
    onError: (e: any) => toast.error(e.message),
  })
}

export function useEliminarTodosLosDatos() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await apiFetch('/api/datos/eliminar', {
        method: 'POST',
        body: JSON.stringify({ confirmacion: 'ELIMINAR TODO' }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.clear()
      toast.success('Todos los datos fueron eliminados')
    },
    onError: (e: any) => toast.error(e.message),
  })
}

// ============= MENSAJES =============
export function useConversaciones() {
  return useQuery({
    queryKey: ['conversaciones'],
    queryFn: async () => {
      const res = await apiFetch('/api/mensajes')
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
    refetchInterval: 10_000, // refrescar cada 10s como fallback
  })
}

export function useMensajes(contactoId: string | null) {
  return useQuery({
    queryKey: ['mensajes', contactoId],
    queryFn: async () => {
      const res = await apiFetch(`/api/mensajes?contactoId=${contactoId}`)
      if (!res.ok) throw new Error('Error')
      return res.json()
    },
    enabled: !!contactoId,
    refetchInterval: 5_000, // refrescar cada 5s como fallback
  })
}

export function useEnviarMensaje() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { destinatarioId: string; tipo: string; contenido?: string }) => {
      const res = await apiFetch('/api/mensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error')
      }
      return res.json()
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['mensajes', variables.destinatarioId] })
      qc.invalidateQueries({ queryKey: ['conversaciones'] })
    },
    onError: (e: any) => toast.error(e.message),
  })
}

export function useEnviarAudio() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { destinatarioId: string; audioBase64: string; duracionSeg: number; formato?: string }) => {
      const res = await apiFetch('/api/audios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error')
      }
      return res.json()
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['mensajes', variables.destinatarioId] })
      qc.invalidateQueries({ queryKey: ['conversaciones'] })
      toast.success('Audio enviado y transcrito')
    },
    onError: (e: any) => toast.error(e.message),
  })
}

export function useTransferir() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { destinatarioId: string; monto: number; concepto: string }) => {
      const res = await apiFetch('/api/transferencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error')
      }
      return res.json()
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['mensajes', variables.destinatarioId] })
      qc.invalidateQueries({ queryKey: ['conversaciones'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(`Transferencia de $${variables.monto.toLocaleString('es-AR')} enviada`)
    },
    onError: (e: any) => toast.error(e.message),
  })
}

export function useProcesarTransferencia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, accion }: { id: string; accion: 'aceptar' | 'rechazar' }) => {
      const res = await apiFetch(`/api/transferencias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mensajes'] })
      qc.invalidateQueries({ queryKey: ['conversaciones'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (e: any) => toast.error(e.message),
  })
}

// ============= CATEGORÍAS PERSONALIZADAS =============
export function useCategorias(tipo?: 'gasto-fijo' | 'gasto-variable' | 'ingreso') {
  return useQuery({
    queryKey: ['categorias', tipo],
    queryFn: async () => {
      const url = tipo ? `/api/categorias?tipo=${tipo}` : '/api/categorias'
      const res = await apiFetch(url)
      if (!res.ok) throw new Error('Error cargando categorías')
      return res.json()
    },
  })
}

export function useCrearCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { nombre: string; tipo: 'gasto-fijo' | 'gasto-variable' | 'ingreso'; color?: string; icono?: string }) => {
      const res = await apiFetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error')
      }
      return res.json()
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['categorias', variables.tipo] })
      qc.invalidateQueries({ queryKey: ['categorias'] })
      toast.success('Categoría creada')
    },
    onError: (e: any) => toast.error(e.message),
  })
}

export function useUpdateCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { nombre?: string; color?: string; icono?: string } }) => {
      const res = await apiFetch(`/api/categorias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categorias'] })
      toast.success('Categoría actualizada')
    },
    onError: (e: any) => toast.error(e.message),
  })
}

export function useDeleteCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/categorias/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categorias'] })
      toast.success('Categoría eliminada')
    },
    onError: (e: any) => toast.error(e.message),
  })
}
// ============= EXPORTAR CSV =============
/**
 * Hook para exportar todos los datos del usuario a CSV.
 * Devuelve una función que al llamarla descarga el archivo.
 */
export function useExportarCSV() {
  const [isExporting, setIsExporting] = useState(false)

  const exportar = async () => {
    try {
      setIsExporting(true)
      toast.info('Generando CSV...')

      const res = await apiFetch('/api/export')
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error exportando datos')
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const contentDisposition = res.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/)
      const filename = filenameMatch?.[1] || `lidercontrol_${new Date().toISOString().slice(0, 10)}.csv`
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('CSV descargado correctamente')
    } catch (e: any) {
      console.error('[useExportarCSV]', e)
      toast.error(e.message || 'Error al exportar')
    } finally {
      setIsExporting(false)
    }
  }

  return { exportar, isExporting }
}
// ============= EXPORTAR PDF =============
/**
 * Hook para exportar todos los datos del usuario a PDF.
 * Genera el PDF en el navegador con jsPDF + autotable.
 */
export function useExportarPDF() {
  const [isExporting, setIsExporting] = useState(false)

  const exportar = async () => {
    try {
      setIsExporting(true)
      toast.info('Generando PDF...')

      // Traer todos los datos del dashboard (ya tiene todo lo necesario)
      const res = await apiFetch('/api/dashboard?mes=' + useAppStore.getState().mes + '&anio=' + useAppStore.getState().anio)
      if (!res.ok) throw new Error('Error cargando datos')
      const data = await res.json()

      // Import dinámico para no cargar jsPDF hasta que se use
      const { jsPDF } = await import('jspdf')
      const autoTable = (await import('jspdf-autotable')).default

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      let y = 20

      // ===== HEADER =====
      doc.setFillColor(99, 102, 241)
      doc.rect(0, 0, pageWidth, 25, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('LiderControl', 14, 12)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Reporte financiero - ${data.usuario.nombre}`, 14, 18)
      doc.text(`Periodo: ${data.mes}/${data.anio}`, pageWidth - 50, 18)
      doc.text(`Generado: ${new Date().toLocaleString('es-AR')}`, pageWidth - 50, 12)

      y = 35
      doc.setTextColor(0, 0, 0)

      // ===== RESUMEN =====
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Resumen del periodo', 14, y)
      y += 5

      autoTable(doc, {
        startY: y,
        head: [['Concepto', 'Monto']],
        body: [
          ['Ingreso total', `$${data.resumen.ingresoTotal.toLocaleString('es-AR')}`],
          ['Gastos fijos', `$${data.resumen.totalGastosFijos.toLocaleString('es-AR')}`],
          ['Gastos variables', `$${data.resumen.totalGastosVariables.toLocaleString('es-AR')}`],
          ['Ahorros', `$${data.resumen.totalAhorros.toLocaleString('es-AR')}`],
          ['Saldo', `$${(data.resumen.ingresoTotal - data.resumen.totalGastosFijos - data.resumen.totalGastosVariables).toLocaleString('es-AR')}`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        bodyStyles: { textColor: 50 },
        alternateRowStyles: { fillColor: [245, 245, 250] },
        margin: { left: 14, right: 14 },
      })

      y = (doc as any).lastAutoTable.finalY + 10

      // ===== INGRESOS =====
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Ingresos', 14, y)
      y += 5

      if (data.ingresos && data.ingresos.length > 0) {
        autoTable(doc, {
          startY: y,
          head: [['Fecha', 'Concepto', 'Categoría', 'Monto', 'Tipo']],
          body: data.ingresos.map((i: any) => [
            new Date(i.fecha).toLocaleDateString('es-AR'),
            i.concepto,
            i.categoria,
            `+$${i.monto.toLocaleString('es-AR')}`,
            i.esFijo ? 'Fijo' : 'Extra',
          ]),
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
          bodyStyles: { textColor: 50 },
          alternateRowStyles: { fillColor: [240, 253, 244] },
          margin: { left: 14, right: 14 },
        })
        y = (doc as any).lastAutoTable.finalY + 10
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.text('Sin ingresos en este periodo', 14, y)
        y += 8
      }

      // ===== GASTOS FIJOS =====
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Gastos Fijos', 14, y)
      y += 5

      if (data.gastosFijos && data.gastosFijos.length > 0) {
        autoTable(doc, {
          startY: y,
          head: [['Concepto', 'Categoría', 'Monto', 'Vence', 'Estado']],
          body: data.gastosFijos.map((g: any) => [
            g.concepto,
            g.categoria,
            `-$${g.monto.toLocaleString('es-AR')}`,
            `Día ${g.diaVencimiento}`,
            g.estado === 'pagado' ? '✓ Pagado' : 'Pendiente',
          ]),
          theme: 'striped',
          headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
          bodyStyles: { textColor: 50 },
          alternateRowStyles: { fillColor: [238, 242, 255] },
          margin: { left: 14, right: 14 },
        })
        y = (doc as any).lastAutoTable.finalY + 10
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.text('Sin gastos fijos en este periodo', 14, y)
        y += 8
      }

      // ===== GASTOS VARIABLES =====
      if (y > 240) {
        doc.addPage()
        y = 20
      }

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Gastos Variables', 14, y)
      y += 5

      if (data.gastosVariables && data.gastosVariables.length > 0) {
        autoTable(doc, {
          startY: y,
          head: [['Fecha', 'Concepto', 'Categoría', 'Monto']],
          body: data.gastosVariables.map((g: any) => [
            new Date(g.fecha).toLocaleDateString('es-AR'),
            g.concepto,
            g.categoria,
            `-$${g.monto.toLocaleString('es-AR')}`,
          ]),
          theme: 'striped',
          headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'bold' },
          bodyStyles: { textColor: 50 },
          alternateRowStyles: { fillColor: [255, 251, 235] },
          margin: { left: 14, right: 14 },
        })
        y = (doc as any).lastAutoTable.finalY + 10
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.text('Sin gastos variables en este periodo', 14, y)
        y += 8
      }

      // ===== METAS DE AHORRO =====
      if (y > 240) {
        doc.addPage()
        y = 20
      }

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Metas de Ahorro', 14, y)
      y += 5

      if (data.metas && data.metas.length > 0) {
        autoTable(doc, {
          startY: y,
          head: [['Meta', 'Actual', 'Objetivo', 'Progreso']],
          body: data.metas.map((m: any) => [
            m.titulo,
            `$${m.montoActual.toLocaleString('es-AR')}`,
            `$${m.montoObjetivo.toLocaleString('es-AR')}`,
            `${Math.min(100, (m.montoActual / m.montoObjetivo * 100)).toFixed(0)}%`,
          ]),
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
          bodyStyles: { textColor: 50 },
          alternateRowStyles: { fillColor: [240, 253, 244] },
          margin: { left: 14, right: 14 },
        })
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.text('Sin metas de ahorro en este periodo', 14, y)
      }

      // ===== FOOTER en cada página =====
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.setFont('helvetica', 'normal')
        doc.text(
          `LiderControl - Reporte de ${data.usuario.nombre} - Pagina ${i} de ${pageCount}`,
          14,
          doc.internal.pageSize.getHeight() - 10
        )
      }

      // Guardar
      const filename = `lidercontrol_${data.usuario.nombre}_${data.mes}-${data.anio}.pdf`
      doc.save(filename)
      toast.success('PDF descargado correctamente')
    } catch (e: any) {
      console.error('[useExportarPDF]', e)
      toast.error(e.message || 'Error al exportar PDF')
    } finally {
      setIsExporting(false)
    }
  }

  return { exportar, isExporting }
}